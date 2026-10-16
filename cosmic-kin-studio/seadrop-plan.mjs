export const HOUSE='0x6736d2eA9807297F0e56967361B9410854B86a5f';
export function validateDropPlan(input,previous={}){
 if(!input||typeof input!=='object')throw Error('Invalid drop plan');
 const dropURL=String(input.dropURL??previous.dropURL??'').trim();
 if(dropURL&&!/^https:\/\/opensea\.io\/collection\/[a-z0-9-]+\/?$/.test(dropURL))throw Error('Use an official OpenSea collection URL');
 if(String(input.allowlist||'').trim())throw Error('Buyer allowlists are disabled for this public sale.');
 const launchStatus=input.launchStatus??previous.launchStatus??'preparation';
 if(!['preparation','published','ended'].includes(launchStatus))throw Error('Invalid launch status');
 if(launchStatus==='published'&&previous.launchStatus!=='published'&&input.publicationConfirmed!==true)throw Error('Confirm that the Drop is actually published on OpenSea before enabling the mint link.');
 if(launchStatus==='published'&&!dropURL)throw Error('Set the official OpenSea collection URL first.');
 return {...previous,version:2,mode:'opensea-drop',collection:'Joshi Astrals',symbol:'ASTRAL',supply:7777,houseWallet:HOUSE,royaltyBps:700,primaryFeeBps:1000,currency:'native USDC on Arc; 18 decimals for SeaDrop msg.value',dropURL:dropURL||null,allowlist:'',allowlistLimit:0,perWalletLimit:2,teamSupply:200,publicSupply:7577,phases:[{name:'Public mint',priceUSDC:'25',targetQuantity:7577}],launchStatus,workflowApproved:true,blockingDecisions:previous.blockingDecisions||[],randomness:'Locally shuffled public artwork, private upload manifest, delayed OpenSea reveal. Not verified randomness. Owner knows the mapping.'};
}
