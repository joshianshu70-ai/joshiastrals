import {BrowserProvider,JsonRpcProvider,Contract,Interface,ZeroAddress,formatUnits,keccak256} from '/ethers.js';
import {walletAddress,openWallet,walletProvider} from '/vendor/wallet.js';
import {ARC,SD_ABI,NFT_ABI,mintQuote} from '/seadrop-mint-core.js';
const $=id=>document.getElementById(id),button=$('siteMintButton');
if(button){
 const read=new JsonRpcProvider(ARC.rpc);
 let busy=false,revision=0,timer;
 const status=text=>$('siteMintStatus').textContent=text;
 const explain=e=>e.code==='ACTION_REJECTED'?'Wallet request cancelled.':e.reason||e.shortMessage||e.message||'Mint could not be completed. Please refresh and try again.';
 async function snapshot(wallet=ZeroAddress,provider=read){
  const net=await provider.getNetwork();if(net.chainId!==ARC.chainId)throw Error('Switch your wallet to Arc mainnet.');
  const block=await provider.getBlock('latest');if(!block)throw Error('Arc sale settings are temporarily unavailable.');
  const options={blockTag:block.number},sea=new Contract(ARC.seaDrop,SD_ABI,provider),collection=new Contract(ARC.nft,NFT_ABI,provider);
  const [seaCode,nftCode,name,drop,payout,feeRecipients,stats]=await Promise.all([provider.getCode(ARC.seaDrop,block.number),provider.getCode(ARC.nft,block.number),collection.name(options),sea.getPublicDrop(ARC.nft,options),sea.getCreatorPayoutAddress(ARC.nft,options),sea.getAllowedFeeRecipients(ARC.nft,options),collection.getMintStats(wallet,options)]);
  if(keccak256(seaCode)!==ARC.seaDropHash||keccak256(nftCode)!==ARC.nftHash||name!=='Joshi Astrals')throw Error('Official collection verification failed.');
  return {drop,payout,feeRecipients:Array.from(feeRecipients),stats,timestamp:block.timestamp};
 }
 async function refresh(){
  if(busy)return;const version=++revision;button.disabled=true;status('Checking the live Arc mint settings…');
  try{const wallet=walletAddress(),data=await snapshot(wallet||ZeroAddress);if(version!==revision||busy)return;
   $('siteMintSupply').textContent=`${Number(data.stats[1]).toLocaleString()} / ${Number(data.stats[2]).toLocaleString()} minted · one supply shared with OpenSea`;
   const q=mintQuote(data,Number($('siteMintQuantity').value));
   $('siteMintTotal').textContent=`${formatUnits(q.value,18)} USDC + network gas`;
   $('siteMintQuantity').querySelector('option[value="2"]').disabled=q.remaining<2;
   button.textContent=wallet?'Mint on this website':'Connect wallet to mint';button.disabled=false;
   status(wallet?`Public mint is open. This wallet can mint ${q.remaining} more across both mint pages.`:'Public mint is open. Connect an Arc wallet to mint here, or use OpenSea.');
  }catch(e){if(version===revision&&!busy){$('siteMintTotal').textContent='25 USDC each + network gas';status(explain(e));}}
 }
 $('siteMintConnect').onclick=()=>openWallet().catch(e=>status(explain(e)));
 $('siteMintRefresh').onclick=refresh;$('siteMintQuantity').onchange=refresh;
 window.addEventListener('astral-wallet-change',()=>{revision++;clearTimeout(timer);if(!busy)timer=setTimeout(refresh,250);});
 button.onclick=async()=>{
  if(busy)return;if(!walletAddress()){await openWallet().catch(e=>status(explain(e)));return;}
  busy=true;revision++;button.disabled=true;$('siteMintQuantity').disabled=true;$('siteMintRefresh').disabled=true;
  let submitted=false;
  try{
   const provider=new BrowserProvider(await walletProvider('mainnet')),signer=await provider.getSigner(),wallet=await signer.getAddress(),quantity=Number($('siteMintQuantity').value);
   const data=await snapshot(wallet,provider),q=mintQuote(data,quantity),writer=new Contract(ARC.seaDrop,SD_ABI,signer);
   const args=[ARC.nft,q.feeRecipient,ZeroAddress,quantity];
   await writer.mintPublic.staticCall(...args,{value:q.value});
   const accounts=await provider.send('eth_accounts',[]),chain=BigInt(await provider.send('eth_chainId',[]));
   if(accounts[0]?.toLowerCase()!==wallet.toLowerCase()||walletAddress()?.toLowerCase()!==wallet.toLowerCase()||chain!==ARC.chainId)throw Error('Wallet or network changed. Review the mint again.');
   status(`Review ${quantity} Astral${quantity===1?'':'s'} for ${formatUnits(q.value,18)} USDC plus gas in your wallet.`);
   const tx=await writer.mintPublic(...args,{value:q.value});submitted=true;
   const link=$('siteMintTransaction');link.href=ARC.explorer+'/tx/'+tx.hash;link.textContent='View mint transaction';link.hidden=false;
   status('Transaction submitted. Waiting for Arc confirmation…');
   let receipt;try{receipt=await tx.wait();}catch(e){if(e.code==='TRANSACTION_REPLACED'&&!e.cancelled&&e.receipt){receipt=e.receipt;link.href=ARC.explorer+'/tx/'+receipt.hash;}else throw e;}
   if(receipt.status!==1)throw Error('The transaction did not complete.');
   const iface=new Interface(NFT_ABI),ids=[];for(const log of receipt.logs){if(log.address.toLowerCase()!==ARC.nft.toLowerCase())continue;try{const event=iface.parseLog(log);if(event.name==='Transfer'&&event.args.from===ZeroAddress&&event.args.to.toLowerCase()===wallet.toLowerCase())ids.push(event.args.tokenId.toString());}catch{}}
   status(ids.length?`Mint confirmed. Your token${ids.length===1?'':'s'}: #${ids.join(', #')}.`:'Mint confirmed. Your Astrals are in your wallet.');
   window.dispatchEvent(new CustomEvent('astral-minted'));$('siteMintQuantity').value='1';
  }catch(e){status(explain(e)+(submitted?' Check your transaction on Arc before retrying.':''));}
  finally{busy=false;$('siteMintQuantity').disabled=false;$('siteMintRefresh').disabled=false;button.disabled=true;button.textContent='Refresh availability to mint again';}
 };
 const plan=await fetch('/opensea-drop-plan.json').then(r=>r.json()).catch(()=>null),link=$('openSeaMintLink');
 if(link){link.href='https://opensea.io/collection/joshi-astrals';link.hidden=false;link.textContent=plan?.launchStatus==='published'?'Mint on OpenSea':'View collection on OpenSea';}
 await refresh();
}
