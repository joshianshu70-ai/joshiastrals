// OpenSea is the chosen primary mint destination. No legacy direct-mint transactions.
const plan=await fetch('/opensea-drop-plan.json').then(r=>r.json());
const link=document.getElementById('openSeaMintLink'),status=document.getElementById('openSeaMintStatus');
if(link&&status){if(plan.launchStatus==='published'&&/^https:\/\/opensea\.io\/collection\/[a-z0-9-]+\/?$/.test(plan.dropURL||'')){link.href=plan.dropURL;link.hidden=false;status.textContent='Open the official drop on OpenSea to see current availability, mint terms and price.';}else{link.hidden=true;status.textContent=plan.launchStatus==='ended'?'The public sale has ended. Visit the official collection on OpenSea for current listings.':'The official OpenSea Drop is being prepared. Minting has not opened.';}}
