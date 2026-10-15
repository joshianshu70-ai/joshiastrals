// Discover original random-ID contracts and standard sequential ERC721A SeaDrop contracts.
export async function ownedTokens(contract,wallet,blockTag){
 const opts={blockTag},[balance,name]=await Promise.all([contract.balanceOf(wallet,opts),contract.name(opts)]);
 if(name!=='Joshi Astrals')throw Error('Official contract identity mismatch.');
 if(balance<0n||balance>7777n)throw Error('Unexpected collection bounds.');
 const ids=[];
 const enumerable=typeof contract.supportsInterface!=='function'||await contract.supportsInterface('0x780e9d63',opts);
 if(enumerable){for(let i=0;i<Number(balance);i+=24){const batch=await Promise.all(Array.from({length:Math.min(24,Number(balance)-i)},(_,j)=>contract.tokenOfOwnerByIndex(wallet,i+j,opts)));ids.push(...batch.map(Number));}}
 else if(balance>0n){
  const stats=await contract.getMintStats(wallet,opts),minted=Number(stats[1]);
  if(!Number.isInteger(minted)||minted<0||minted>7777)throw Error('Unexpected collection bounds.');
  for(let i=1;i<=minted;i+=24){
   const batch=await Promise.all(Array.from({length:Math.min(24,minted-i+1)},async(_,j)=>{const id=i+j;try{return {id,owner:await contract.ownerOf(id,opts)};}catch(e){if(e.code==='CALL_EXCEPTION')return null;throw e;}}));
   for(const item of batch)if(item&&item.owner.toLowerCase()===wallet.toLowerCase())ids.push(item.id);
  }
  if(ids.length!==Number(balance))throw Error('Wallet holdings could not be fully verified.');
 }

 if(ids.some(id=>!Number.isInteger(id)||id<1||id>7777)||new Set(ids).size!==ids.length)throw Error('Wallet holdings could not be fully verified.');
 for(let i=0;i<ids.length;i+=24){const owners=await Promise.all(ids.slice(i,i+24).map(id=>contract.ownerOf(id,opts)));if(owners.some(owner=>owner.toLowerCase()!==wallet.toLowerCase()))throw Error('Wallet holdings could not be fully verified.');}
 return ids.sort((a,b)=>a-b);
}
