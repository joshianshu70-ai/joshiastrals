// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {D20VRFConsumer} from "@d20dao/vrf-sdk/contracts/D20VRFConsumer.sol";
import {ID20VRF} from "@d20dao/vrf-sdk/contracts/interfaces/ID20VRF.sol";
import {D20VRFRequests} from "@d20dao/vrf-sdk/contracts/libraries/D20VRFRequests.sol";
interface IRecovery {function refundRequest(uint256 id) external; function retryCallback(uint256 id) external;}
/// @notice Paid mint requests receive random, non-repeating public IDs after verified randomness.
/// @dev Provider callbacks only store results. FIFO allocation and buyer claims are separate transactions.
contract JoshiAstrals is ERC721Enumerable, ERC2981, Ownable2Step, ReentrancyGuard, D20VRFConsumer {
    using D20VRFRequests for ID20VRF;
    uint256 public constant MAX_SUPPLY=7777;
    uint256 public constant PUBLIC_SUPPLY=7577;
    uint256 public constant RESERVE_SUPPLY=200;
    uint256 public constant MAX_PER_TX=5;
    uint256 public constant MAX_RESERVE_PER_TX=50;
    uint256 public constant MAX_WHITELIST_WALLETS=50;
    uint256 public constant MAX_WHITELIST_PER_WALLET=2;
    uint32 public constant CALLBACK_GAS=120000;
    uint96 public constant ROYALTY_BPS=700;
    address public constant FREE_MINT_WALLET=0x6736d2eA9807297F0e56967361B9410854B86a5f;
    ID20VRF public immutable rng;
    address payable public immutable treasury;
    address public immutable reserveWallet;
    string private metadataBase;
    uint8 public currentPhase;
    uint256 public mintPrice=25 ether;
    uint256 public releasedSupply;
    bool public saleOpen;
    // publicMinted counts booked public seats, including awaiting randomness/claim.
    uint256 public publicMinted;
    uint256 public reserveMinted;
    uint256 public nextReserveTokenId=7577;
    uint256 public publicAssigned;
    uint256 public pendingRequests;
    uint256 public requestCount;
    uint256 public nextRequestToSettle=1;
    uint256 public escrowedMintPayments;
    uint256 public withdrawableProceeds;
    uint256 public refundLiability;
    mapping(address=>uint256) public refundCredits;
    mapping(uint256=>uint256) private pool;
    struct MintRequest {address buyer;uint32 quantity;uint8 phase;uint32 seats;uint256 paid;uint256 serviceId;bytes32 word;bool ready;bool settled;bool claimed;bool failed;bool cancelled;}
    mapping(uint256=>MintRequest) public mintRequests;
    mapping(uint256=>uint256) public serviceToMint;
    mapping(uint256=>uint256[]) private requestTokens;
    mapping(address=>uint256[]) private walletRequests;
    address[] private seatWallets;
    mapping(address=>bool) public whitelistRegistered;
    mapping(address=>uint256) public whitelistAllowance;
    mapping(address=>uint256) public whitelistMinted;
    uint256 public reservedSeatsRemaining=100;
    bool public reservationsReleased;
    event PhaseActivated(uint8 indexed phase,uint256 cap,uint256 price,bool open);
    event SaleStatusChanged(bool open);
    event WhitelistAllowanceChanged(address indexed wallet,uint256 allowance);
    event ReservationsReleased(uint256 seats);
    event MintRequested(uint256 indexed id,address indexed buyer,uint256 quantity,uint256 paid,uint256 serviceId,uint256 serviceFee);
    event RandomnessReady(uint256 indexed id,uint256 indexed serviceId);
    event RandomIdsAssigned(uint256 indexed id,address indexed buyer,uint256[] tokenIds);
    event MintClaimed(uint256 indexed id,address indexed buyer,address indexed recipient);
    event MintCancelled(uint256 indexed id,uint256 mintRefund);
    event ReserveMint(uint256 indexed firstId,uint256 quantity);
    constructor(string memory baseURI,address payable payout,address coordinator)
        ERC721("Joshi Astrals","ASTRAL") Ownable(msg.sender) D20VRFConsumer(coordinator) {
        require(bytes(baseURI).length>7,"Metadata URI required");require(payout!=address(0),"Payout required");
        metadataBase=baseURI;treasury=payout;reserveWallet=payout;rng=ID20VRF(coordinator);_setDefaultRoyalty(payout,ROYALTY_BPS);
    }
    function _baseURI() internal view override returns(string memory){return metadataBase;}
    function tokenURI(uint256 id) public view override returns(string memory){return string.concat(super.tokenURI(id),".json");}
    function supportsInterface(bytes4 id) public view override(ERC721Enumerable,ERC2981) returns(bool){return super.supportsInterface(id);}
    function priceForPhase(uint8 phase) public pure returns(uint256){require(phase>=1&&phase<=3,"Invalid phase");return phase==1?25 ether:phase==2?35 ether:45 ether;}
    function capForPhase(uint8 phase) public pure returns(uint256){require(phase>=1&&phase<=3,"Invalid phase");return phase==1?777:phase==2?2777:PUBLIC_SUPPLY;}
    function mintPriceFor(address buyer) public view returns(uint256){return buyer==FREE_MINT_WALLET?0:mintPrice;}
    function activatePhase(uint8 phase,bool open) external onlyOwner {
        require(phase>=1&&phase<=3&&phase==currentPhase+1,"Activate next phase only");
        require(currentPhase==0||(publicMinted==releasedSupply&&pendingRequests==0),"Previous phase incomplete");
        currentPhase=phase;releasedSupply=capForPhase(phase);mintPrice=priceForPhase(phase);saleOpen=open;emit PhaseActivated(phase,releasedSupply,mintPrice,open);
    }
    function setSaleOpen(bool open) external onlyOwner {require(currentPhase!=0,"Activate phase first");saleOpen=open;emit SaleStatusChanged(open);}
    function renounceOwnership() public view override onlyOwner {revert("Renouncing disabled; use two-step transfer");}
    function whitelistWalletCount() public view returns(uint256){return seatWallets.length;}
    function whitelistWalletAt(uint256 index) external view returns(address){return seatWallets[index];}
    function whitelistRemaining(address wallet) public view returns(uint256){if(currentPhase>1||reservationsReleased)return 0;uint256 a=whitelistAllowance[wallet];uint256 m=whitelistMinted[wallet];return a>m?a-m:0;}
    function setWhitelistAllowances(address[] calldata wallets,uint256[] calldata allowances) external onlyOwner {
        require(currentPhase<=1&&!reservationsReleased,"Phase 1 reservations closed");
        require(wallets.length>0&&wallets.length<=50&&wallets.length==allowances.length,"Invalid whitelist batch");
        for(uint256 i;i<wallets.length;i++){
            address w=wallets[i];require(w!=address(0),"Zero wallet");require(allowances[i]<=2,"Whitelist maximum 2 per wallet");
            require(allowances[i]>=whitelistMinted[w],"Below used seats");
            bool fresh=allowances[i]>0&&!whitelistRegistered[w];
            if(fresh){require(seatWallets.length<50,"Whitelist 50 wallet limit");whitelistRegistered[w]=true;seatWallets.push(w);}
            uint256 oldRemaining=whitelistRemaining(w);whitelistAllowance[w]=allowances[i];
            reservedSeatsRemaining=reservedSeatsRemaining-oldRemaining+whitelistRemaining(w)-(fresh?2:0);
            require(currentPhase==0||publicMinted+reservedSeatsRemaining<=777,"Not enough Phase 1 seats");
            emit WhitelistAllowanceChanged(w,allowances[i]);
        }
    }
    function releaseWhitelistSeats() external onlyOwner {
        require(currentPhase<=1&&!reservationsReleased,"Reservations already closed");uint256 seats=reservedSeatsRemaining;
        reservationsReleased=true;reservedSeatsRemaining=0;emit ReservationsReleased(seats);
    }
    function mintableQuantity(address wallet) public view returns(uint256){
        if(!saleOpen||publicMinted>=releasedSupply)return 0;
        uint256 available=releasedSupply-publicMinted;
        if(currentPhase==1&&!reservationsReleased)available=available-reservedSeatsRemaining+whitelistRemaining(wallet);
        return available>MAX_PER_TX?MAX_PER_TX:available;
    }
    function requestIdsOf(address wallet) external view returns(uint256[] memory){return walletRequests[wallet];}
    function assignedIds(uint256 id) external view returns(uint256[] memory){return requestTokens[id];}
    function mint(uint256 quantity) external payable nonReentrant returns(uint256 id){
        require(saleOpen,"Sale closed");require(quantity>0&&quantity<=MAX_PER_TX,"Quantity 1 to 5");
        require(quantity<=mintableQuantity(msg.sender),"Available seats exceeded");
        uint256 paid=mintPriceFor(msg.sender)*quantity;uint256 fee=rng.quoteFee(CALLBACK_GAS);
        require(msg.value>=paid+fee,"Mint price plus randomness fee required");
        uint256 seats=currentPhase==1?whitelistRemaining(msg.sender):0;if(seats>quantity)seats=quantity;
        if(seats>0){whitelistMinted[msg.sender]+=seats;reservedSeatsRemaining-=seats;}
        publicMinted+=quantity;escrowedMintPayments+=paid;pendingRequests++;
        id=++requestCount;
        // Fixed collection, buyer, quantity and FIFO order before requesting the word.
        uint256 serviceId=rng.numberRange(0,type(uint256).max,D20VRFRequests.Options(keccak256(abi.encode(address(this),block.chainid,id,msg.sender,quantity)),CALLBACK_GAS,msg.sender));
        require(serviceToMint[serviceId]==0,"Duplicate service request");
        serviceToMint[serviceId]=id;mintRequests[id]=MintRequest(msg.sender,uint32(quantity),currentPhase,uint32(seats),paid,serviceId,bytes32(0),false,false,false,false,false);
        walletRequests[msg.sender].push(id);_credit(msg.sender,msg.value-paid-fee);
        emit MintRequested(id,msg.sender,quantity,paid,serviceId,fee);
    }
    function _fulfillRandomness(uint256 serviceId,bytes32 word) internal override {
        uint256 id=serviceToMint[serviceId];MintRequest storage r=mintRequests[id];
        require(id!=0&&!r.ready&&!r.failed&&!r.cancelled,"Invalid randomness callback");
        r.word=word;r.ready=true;emit RandomnessReady(id,serviceId);
    }
    function _onRefund(uint256 serviceId) internal override {
        uint256 id=serviceToMint[serviceId];MintRequest storage r=mintRequests[id];
        require(id!=0&&!r.ready&&!r.settled,"Invalid refund callback");r.failed=true;
    }
    function _draw(bytes32 word,uint256 nonce) private returns(uint256){
        uint256 remaining=PUBLIC_SUPPLY-publicAssigned;
        uint256 sample=uint256(keccak256(abi.encode(word,nonce)));uint256 limit=type(uint256).max-(type(uint256).max%remaining);
        while(sample>=limit)sample=uint256(keccak256(abi.encode(sample)));
        uint256 index=sample%remaining;uint256 value=pool[index];if(value==0)value=index+1;
        uint256 last=pool[remaining-1];pool[index]=last==0?remaining:last;delete pool[remaining-1];publicAssigned++;
        // Public ordinal 7577 maps to Capricorn #7655; the other final IDs are House reserve.
        return value==PUBLIC_SUPPLY?7655:value;
    }
    function settleMints(uint256 maxRequests) external nonReentrant {
        require(maxRequests>0&&maxRequests<=5,"Settle 1 to 5 requests");
        for(uint256 n;n<maxRequests&&nextRequestToSettle<=requestCount;n++){
            uint256 id=nextRequestToSettle;MintRequest storage r=mintRequests[id];
            if(r.failed&&!r.cancelled)_cancel(id);
            if(r.cancelled){nextRequestToSettle++;continue;}
            if(!r.ready)break;
            for(uint256 i;i<r.quantity;i++)requestTokens[id].push(_draw(r.word,i));
            r.settled=true;pendingRequests--;escrowedMintPayments-=r.paid;withdrawableProceeds+=r.paid;
            nextRequestToSettle++;emit RandomIdsAssigned(id,r.buyer,requestTokens[id]);
        }
    }
    function claimMint(uint256 id,address recipient) external nonReentrant {
        MintRequest storage r=mintRequests[id];require(msg.sender==r.buyer,"Only mint buyer");
        require(r.settled&&!r.claimed&&!r.cancelled,"Mint not claimable");require(recipient!=address(0),"Zero recipient");
        r.claimed=true;uint256[] storage ids=requestTokens[id];for(uint256 i;i<ids.length;i++)_safeMint(recipient,ids[i]);emit MintClaimed(id,r.buyer,recipient);
    }
    function recoverExpiredMint(uint256 id) external nonReentrant {
        MintRequest storage r=mintRequests[id];require(r.buyer!=address(0)&&!r.ready&&!r.cancelled,"Mint not recoverable");
        if(!r.failed)IRecovery(vrfCoordinator).refundRequest(r.serviceId);
        require(r.failed,"Retry provider refund notification");_cancel(id);
    }
    function retryRandomnessDelivery(uint256 id) external {require(mintRequests[id].buyer!=address(0),"Unknown mint");IRecovery(vrfCoordinator).retryCallback(mintRequests[id].serviceId);}
    function _cancel(uint256 id) private {
        MintRequest storage r=mintRequests[id];require(r.failed&&!r.cancelled&&!r.settled,"Mint not refundable");
        r.cancelled=true;pendingRequests--;publicMinted-=r.quantity;escrowedMintPayments-=r.paid;
        if(r.seats>0){whitelistMinted[r.buyer]-=r.seats;if(!reservationsReleased)reservedSeatsRemaining+=r.seats;}
        _credit(r.buyer,r.paid);emit MintCancelled(id,r.paid);
    }
    function _credit(address wallet,uint256 amount) private {if(amount>0){refundCredits[wallet]+=amount;refundLiability+=amount;}}
    function withdrawRefund(address payable recipient) external nonReentrant {uint256 amount=refundCredits[msg.sender];require(amount>0&&recipient!=address(0),"No refund or zero recipient");refundCredits[msg.sender]=0;refundLiability-=amount;(bool ok,)=recipient.call{value:amount}("");require(ok,"Refund transfer failed");}
    function isReserved(uint256 id) public pure returns(bool){return id>=7577&&id<=MAX_SUPPLY&&id!=7655;}
    function mintReserve(uint256 quantity) external onlyOwner nonReentrant {
        require(quantity>0&&quantity<=50&&reserveMinted+quantity<=200,"Reserve limit");uint256 first=nextReserveTokenId;
        for(uint256 i;i<quantity;i++){if(nextReserveTokenId==7655)nextReserveTokenId++;uint256 id=nextReserveTokenId++;reserveMinted++;_safeMint(reserveWallet,id);}emit ReserveMint(first,quantity);
    }
    function withdraw() external onlyOwner nonReentrant {uint256 amount=withdrawableProceeds;withdrawableProceeds=0;(bool ok,)=treasury.call{value:amount}("");require(ok,"Payout failed");}
}
