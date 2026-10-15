import ganache from 'ganache';import solc from 'solc';import fs from 'node:fs';
import {BrowserProvider,ContractFactory,parseEther,keccak256,toUtf8Bytes} from 'ethers';
export {parseEther,keccak256,toUtf8Bytes};
const source=`// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
struct Spec {uint8 operation;uint256 lower;uint256 upper;uint32 count;uint32 population;}
contract MockCoordinator {
 uint256 public count;uint256 public fee=0.02 ether;
 struct R {address consumer;address refund;uint256 deadline;bytes32 word;bool fulfilled;bool delivered;bool refunded;}
 mapping(uint256=>R) public requests;
 function quoteFee(uint32) external view returns(uint256){return fee;}
 function quoteFeeAt(uint32,uint256) external view returns(uint256){return fee;}
 function requestMappedRandomness(bytes32,uint32,address refund,Spec calldata) external payable returns(uint256 id){require(msg.value==fee,"fee");id=++count;requests[id]=R(msg.sender,refund,block.timestamp+60,0,false,false,false);}
 function fulfill(uint256 id,bytes32 word) external {R storage r=requests[id];require(!r.fulfilled&&!r.refunded&&block.timestamp<=r.deadline,"invalid fulfillment");r.fulfilled=true;r.word=word;(r.delivered,)=r.consumer.call(abi.encodeWithSignature("rawFulfillRandomness(uint256,bytes32)",id,word));}
 function fulfillWithGas(uint256 id,bytes32 word,uint256 gasAmount) external {R storage r=requests[id];require(!r.fulfilled&&!r.refunded&&block.timestamp<=r.deadline,"invalid fulfillment");r.fulfilled=true;r.word=word;(r.delivered,)=r.consumer.call{gas:gasAmount}(abi.encodeWithSignature("rawFulfillRandomness(uint256,bytes32)",id,word));}
 function repeat(uint256 id,bytes32 word) external returns(bool ok){(ok,)=requests[id].consumer.call(abi.encodeWithSignature("rawFulfillRandomness(uint256,bytes32)",id,word));}
 function retryCallback(uint256 id) external {R storage r=requests[id];require(r.fulfilled&&!r.delivered,"not retryable");(r.delivered,)=r.consumer.call(abi.encodeWithSignature("rawFulfillRandomness(uint256,bytes32)",id,r.word));}
 function refundRequest(uint256 id) external {R storage r=requests[id];require(!r.fulfilled&&!r.refunded&&block.timestamp>r.deadline,"not expired");r.refunded=true;(bool paid,)=r.refund.call{value:fee}("");require(paid,"refund");(bool notified,)=r.consumer.call(abi.encodeWithSignature("onRefund(uint256)",id));require(notified,"notification");}
}
contract Receiver {
 bool public reject;bool public attack;bool public reentered;
 constructor(bool r,bool a){reject=r;attack=a;}
 function onERC721Received(address,address,uint256,bytes calldata) external returns(bytes4){require(!reject,"reject");if(attack){(reentered,)=msg.sender.call(abi.encodeWithSignature("settleMints(uint256)",1));}return 0x150b7a02;}
}`;
const input={language:'Solidity',sources:{'Mocks.sol':{content:source}},settings:{evmVersion:'shanghai',optimizer:{enabled:true,runs:200},outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}};
const out=JSON.parse(solc.compile(JSON.stringify(input)));if(out.errors?.some(e=>e.severity==='error'))throw Error(JSON.stringify(out.errors));
export async function fixture(){const raw=ganache.provider({logging:{quiet:true},chain:{hardfork:'shanghai'},wallet:{defaultBalance:1000000,unlockedAccounts:['0x6736d2eA9807297F0e56967361B9410854B86a5f']}}),provider=new BrowserProvider(raw);provider.pollingInterval=10;
 const owner=await provider.getSigner(0),buyer=await provider.getSigner(1),other=await provider.getSigner(2),treasury=await provider.getSigner(3),free=await provider.getSigner('0x6736d2eA9807297F0e56967361B9410854B86a5f');await provider.send('evm_setAccountBalance',[await free.getAddress(),'0x3635c9adc5dea00000']);
 const mock=out.contracts['Mocks.sol'].MockCoordinator,rng=await new ContractFactory(mock.abi,'0x'+mock.evm.bytecode.object,owner).deploy();await rng.waitForDeployment();
 const artifact=JSON.parse(fs.readFileSync('public/contract.json')),c=await new ContractFactory(artifact.abi,artifact.bytecode,owner).deploy('ipfs://test/',await treasury.getAddress(),await rng.getAddress());await c.waitForDeployment();
 async function book(signer,q,extra=0n){const fee=await rng.fee(),price=await c.mintPriceFor(await signer.getAddress());const tx=await c.connect(signer).mint(q,{value:price*BigInt(q)+fee+extra,gasLimit:1500000}),receipt=await tx.wait();for(const log of receipt.logs){try{const e=c.interface.parseLog(log);if(e?.name==='MintRequested')return Number(e.args.id);}catch{}}throw Error('Missing request event');}
 async function deliver(id,word){const r=await c.mintRequests(id);await(await rng.fulfill(r.serviceId,word||keccak256(toUtf8Bytes('random-word-'+id)),{gasLimit:500000})).wait();}
 async function settle(){await(await c.settleMints(5,{gasLimit:5000000})).wait();}
 async function claim(signer,id,to){await(await c.connect(signer).claimMint(id,to||await signer.getAddress(),{gasLimit:2500000})).wait();return (await c.assignedIds(id)).map(Number);}
 async function receiver(reject,attack){const a=out.contracts['Mocks.sol'].Receiver,r=await new ContractFactory(a.abi,'0x'+a.evm.bytecode.object,owner).deploy(reject,attack);await r.waitForDeployment();return r;}
 return {provider,raw,owner,buyer,other,treasury,free,c,rng,book,deliver,settle,claim,receiver};
}
