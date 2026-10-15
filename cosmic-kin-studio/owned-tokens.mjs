// ERC-721 Enumerable is required because random IDs are not a sequential minted range.
export async function ownedTokens(contract,wallet,blockTag){
 const opts={blockTag},[balance,name]=await Promise.all([contract.balanceOf(wallet,opts),contract.name(opts)]);
 if(name!=='Joshi Astrals')throw Error('Official contract identity mismatch.');
 if(balance<0n||balance>7777n)throw Error('Unexpected collection bounds.');
 const ids=[];for(let i=0;i<Number(balance);i+=24){const batch=await Promise.all(Array.from({length:Math.min(24,Number(balance)-i)},(_,j)=>contract.tokenOfOwnerByIndex(wallet,i+j,opts)));ids.push(...batch.map(Number));}
 if(ids.some(id=>!Number.isInteger(id)||id<1||id>7777)||new Set(ids).size!==ids.length)throw Error('Wallet holdings could not be fully verified.');
 for(let i=0;i<ids.length;i+=24){const owners=await Promise.all(ids.slice(i,i+24).map(id=>contract.ownerOf(id,opts)));if(owners.some(owner=>owner.toLowerCase()!==wallet.toLowerCase()))throw Error('Wallet holdings could not be fully verified.');}
 return ids.sort((a,b)=>a-b);
}
