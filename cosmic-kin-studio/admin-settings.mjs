import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export function adminSettings(root,pack){
 const pub=path.join(root,'public'),launch=path.resolve(root,'../joshi-astrals-launch'),file=path.join(root,'admin-settings.json');
 const read=n=>JSON.parse(fs.readFileSync(path.join(pub,n+'.json'),'utf8'));
 const current=()=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{profile:read('collection-profile'),deployment:read('deployment'),contractDraft:{settings:read('launch-settings'),source:fs.readFileSync(path.join(root,'contracts/JoshiAstrals.sol'),'utf8')}};
 const version=()=>createHash('sha256').update(JSON.stringify(current())).digest('hex');
 return {get:()=>({data:current(),revision:version()}),save(body){
 if(body.revision!==version())throw Error('Settings changed in another tab. Reload before saving.');
 const old=current(),d=body.data;
 if(!d||!d.profile||!d.deployment||!d.contractDraft)throw Error('Missing settings sections');
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid text field');return v.trim();};
 const profile={...old.profile};for(const k of ['name','creator','symbol','tagline','description','legal_licensor','public_contact','website','opensea_url','discord_url','x_url'])profile[k]=text(d.profile[k]??'',k==='description'?10000:500);
 if(!profile.name||!profile.symbol||!profile.description)throw Error('Name, symbol and description are required.');
 const deployment={...old.deployment};for(const k of ['testnet','mainnet']){const v=text(d.deployment[k]??'',42);if(v&&!/^0x[0-9a-fA-F]{40}$/.test(v))throw Error('Invalid '+k+' address');deployment[k]=v||null;}
 for(const k of ['termsURL','licenseURL']){const v=text(d.deployment[k]??'',2000);if(v&&!/^https:\/\//.test(v))throw Error(k+' must use HTTPS');deployment[k]=v||null;}
 const draft=d.contractDraft;if(typeof draft.settings!=='object'||!draft.settings||Array.isArray(draft.settings))throw Error('Contract settings must be a JSON object');draft.source=text(draft.source,100000);if(!draft.source.includes('contract JoshiAstrals'))throw Error('Contract source must define JoshiAstrals');
 const incoming=d.opensea||old.opensea||{},opensea={};
 for(const k of ['name','description','secondary_currency','slug','category','display_style','logo_url','banner_url','telegram_url','payout_address'])opensea[k]=text(incoming[k]??'',2000);
 if(!opensea.name||opensea.description.length>1000)throw Error('OpenSea name required; description maximum is 1,000 characters');
 if(!['ETH/WETH','USDC'].includes(opensea.secondary_currency))throw Error('Invalid secondary currency');
 if(!/^[a-z0-9-]+$/.test(opensea.slug))throw Error('OpenSea slug must contain lowercase letters, numbers or hyphens');
 if(!['contained','covered','padded'].includes(opensea.display_style))throw Error('Invalid display style');
 if(!Array.isArray(incoming.recipients)||incoming.recipients.length>10)throw Error('Maximum 10 payout recipients');
 opensea.recipients=incoming.recipients.map(r=>{if(!/^0x[0-9a-fA-F]{40}$/.test(r.address)||/^0x0{40}$/i.test(r.address))throw Error('Invalid earnings payout address');const percent=Number(r.percent);if(!Number.isFinite(percent)||percent<0||percent>10)throw Error('Invalid recipient percentage');return {address:r.address,percent};});
 if(new Set(opensea.recipients.map(r=>r.address.toLowerCase())).size!==opensea.recipients.length)throw Error('Duplicate payout recipient');
 opensea.creator_earnings_percent=opensea.recipients.reduce((sum,r)=>sum+r.percent,0);if(opensea.creator_earnings_percent>10.000001)throw Error('Total creator earnings cannot exceed 10%');
 opensea.payout_address=opensea.recipients[0]?.address||'';
 if(!Array.isArray(incoming.collaborators)||incoming.collaborators.length>50||incoming.collaborators.some(v=>typeof v!=='string'||!/^0x[0-9a-fA-F]{40}$/.test(v)))throw Error('Collaborators must be wallet addresses, one per line');
 for(const k of ['explicit_content','trait_offers','openrarity'])opensea[k]=incoming[k]===true;
 opensea.collaborators=incoming.collaborators;opensea.earnings_mode='optional';opensea.sync_status='Local draft; not published to OpenSea';
 const data={profile,deployment,opensea,contractDraft:draft,updated_at:new Date().toISOString(),contract_draft_status:'Draft only; compile, review and tests required. Deployed contracts are unchanged.'};
 const writes=[[file,data],[path.join(pub,'collection-profile.json'),profile],[path.join(launch,'collection-profile.json'),profile],[path.join(pub,'deployment.json'),deployment]];
 fs.mkdirSync(path.join(root,'admin-backups'),{recursive:true});const stamp=Date.now();fs.writeFileSync(path.join(root,'admin-backups',stamp+'.json'),JSON.stringify(old,null,2));
 for(const [target,value] of writes){fs.writeFileSync(target+'.tmp',JSON.stringify(value,null,2)+'\n');fs.renameSync(target+'.tmp',target);}
 return {revision:version(),saved_at:data.updated_at,contract_draft_status:data.contract_draft_status};
 }};
}
