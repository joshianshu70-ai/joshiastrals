// Shared quote rules for the website; the official SeaDrop contract enforces the sale onchain.
export const ARC={chainId:5042n,rpc:'https://rpc.mainnet.arc.io',explorer:'https://explorer.arc.io',nft:'0x402f4ead8909145a57a45eeb27446111e6738c48',seaDrop:'0x00005EA00Ac477B1030CE78506496e8C2dE24bf5',seaDropHash:'0x49ac1def6aee7ea8fcafc434b9c4c723caa850027a143fa0f9d5be02275b5539',nftHash:'0x91c55594edf43ce950a4cc6ceca98db754b0c680897f7498021b29f9d3b057a6'};
export const SD_ABI=['function getPublicDrop(address) view returns(tuple(uint80 mintPrice,uint48 startTime,uint48 endTime,uint16 maxTotalMintableByWallet,uint16 feeBps,bool restrictFeeRecipients))','function getAllowedFeeRecipients(address) view returns(address[])','function getCreatorPayoutAddress(address) view returns(address)','function mintPublic(address nftContract,address feeRecipient,address minterIfNotPayer,uint256 quantity) payable'];
export const NFT_ABI=['function name() view returns(string)','function getMintStats(address) view returns(uint256 minterNumMinted,uint256 currentTotalSupply,uint256 maxSupply)','event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)'];
const zero='0x0000000000000000000000000000000000000000';
export function mintQuote(snapshot,quantity=1){
 const {drop,stats,timestamp,payout,feeRecipients}=snapshot;
 const price=BigInt(drop.mintPrice),start=BigInt(drop.startTime),end=BigInt(drop.endTime),limit=BigInt(drop.maxTotalMintableByWallet),minted=BigInt(stats[1]),supply=BigInt(stats[2]),used=BigInt(stats[0]),now=BigInt(timestamp);
 if(!Number.isInteger(quantity)||quantity<1||quantity>2)throw Error('Choose one or two Astrals.');
 if(!start||!end||!limit)throw Error('Public mint has not been configured on Arc yet.');
 if(now<start)throw Error('Public mint has not started yet.');if(now>end)throw Error('Public mint has ended.');
 if(price!==25n*10n**18n)throw Error('The live mint price differs from the approved 25 USDC. Please check the official Drop.');
 if(limit!==2n)throw Error('The public wallet limit must be configured as two before website minting opens.');
 if(supply!==7777n||minted<0n||minted>supply||used<0n)throw Error('Collection supply settings need review.');
 if(minted<200n)throw Error('The House allocation must be completed before public minting opens.');
 if(!payout||payout.toLowerCase()===zero)throw Error('The creator payout is not configured.');
 if(minted===supply)throw Error('All Astrals have been minted.');
 const remaining=limit>used?limit-used:0n,available=supply-minted;
 if(BigInt(quantity)>remaining)throw Error('This wallet has reached its mint limit across the collection.');
 if(BigInt(quantity)>available)throw Error('Not enough Astrals remain for this quantity.');
 // Never invent a fee address or divert the OpenSea fee. Use its configured recipient.
 if(!Array.isArray(feeRecipients)||feeRecipients.length!==1||!/^0x[0-9a-fA-F]{40}$/.test(feeRecipients[0])||feeRecipients[0].toLowerCase()===zero)throw Error('The OpenSea fee recipient needs review before website minting opens.');
 return {quantity,value:price*BigInt(quantity),feeRecipient:feeRecipients[0],remaining:Number(remaining<available?remaining:available),available:Number(available),minted:Number(minted),supply:Number(supply)};
}
