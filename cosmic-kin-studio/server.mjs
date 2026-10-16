import http from 'node:http';
import {validateDropPlan} from './seadrop-plan.mjs';
import {ownedTokens} from './owned-tokens.mjs';
import {Contract,JsonRpcProvider,isAddress} from 'ethers';
import {holderAccess} from './holder-access.mjs';
import {adminSettings} from './admin-settings.mjs';
import {randomBytes} from 'node:crypto';
const productionOrigin='https://joshiastrals.thehouseofjoshi.com';
const adminEnabled=process.env.JOSHI_PUBLIC_ONLY!=='1',adminToken=randomBytes(32).toString('hex');
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url)),pack=path.resolve(root,'../cosmic-kin-generator-pack');
const settingsStore=adminSettings(root,pack);
const holder=holderAccess({deployment:()=>JSON.parse(fs.readFileSync(path.join(root,'public/deployment.json'),'utf8')),origin:productionOrigin,ownerOf:async({network,address,id})=>new Contract(address,['function ownerOf(uint256) view returns(address)'],new JsonRpcProvider(network==='mainnet'?'https://rpc.mainnet.arc.io':'https://rpc.testnet.arc.io')).ownerOf(id)});
let job={status:'idle',log:''};
const port=Number(process.env.PORT||4180);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.sol':'text/plain'};
http.createServer(async(req,res)=>{
 const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
 try {
 if(![`127.0.0.1:${port}`,`localhost:${port}`,...(!adminEnabled?['joshiastrals.thehouseofjoshi.com']:[])].includes(req.headers.host))return send({error:'Host rejected'},403);
 const url=new URL(req.url,'http://localhost');
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
 if(url.pathname==='/healthz')return send({status:'ok',mode:adminEnabled?'local-admin':'public'});
 if(!adminEnabled&&(/^\/(admin(?:[/.]|$)|api\/(admin|job)|opensea-drop\.(html|js)$)/.test(url.pathname)))return send({error:'Admin disabled'},404);
 if(req.headers.origin && ![`http://127.0.0.1:${port}`,`http://localhost:${port}`,...(!adminEnabled?[productionOrigin]:[])].includes(req.headers.origin))return send({error:'Origin rejected'},403);
 if(['/admin/opensea','/api/admin/opensea'].includes(url.pathname)&&!adminEnabled)return send({error:'Admin disabled'},404);
 if(url.pathname==='/admin/opensea'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(root,'public/opensea-drop.html'),'utf8').replace('<head>','<head><meta name="admin-token" content="'+adminToken+'">'));}
 if(url.pathname==='/api/admin/opensea'){
  if(req.headers['x-admin-token']!==adminToken)return send({error:'Admin token required'},403);
  if(req.method!=='POST')return send({error:'Method not allowed'},405);
  let body='',size=0;req.on('data',chunk=>{size+=chunk.length;if(size>10000){req.destroy();return;}body+=chunk;});
  req.on('end',()=>{try{const target=path.join(root,'public/opensea-drop-plan.json'),previous=JSON.parse(fs.readFileSync(target,'utf8')),plan=validateDropPlan(JSON.parse(body),previous),backups=path.join(root,'admin-backups');fs.mkdirSync(backups,{recursive:true});if(fs.existsSync(target))fs.copyFileSync(target,path.join(backups,'opensea-drop-'+Date.now()+'.json'));fs.writeFileSync(target,JSON.stringify(plan,null,2)+'\n');send({saved:true});}catch(error){send({error:error.message},400);}});return;
 }
 if(['/admin','/admin/','/admin.html','/api/job','/api/admin/settings'].includes(url.pathname)&&!adminEnabled)return send({error:'Admin disabled'},404);
 if(['/admin','/admin/','/admin.html'].includes(url.pathname)){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(root,'public/admin.html'),'utf8').replace('<head>','<head><meta name="admin-token" content="'+adminToken+'">'));}
 if(url.pathname==='/api/admin/settings'){
 if(req.headers['x-admin-token']!==adminToken)return send({error:'Admin token required'},403);
 if(req.method==='GET')return send(settingsStore.get());
 if(req.method!=='POST')return send({error:'Method not allowed'},405);
 let body='',size=0;req.on('data',chunk=>{size+=chunk.length;if(size>250000){req.destroy();return;}body+=chunk;});
 req.on('end',()=>{try{send(settingsStore.save(JSON.parse(body)));}catch(e){send({error:e.message},400);}});return;
 }
 if(url.pathname==='/api/holder/owned'){
 if(req.method!=='GET')return send({error:'Method not allowed'},405);
 const wallet=url.searchParams.get('wallet'),network=url.searchParams.get('network'),deployment=JSON.parse(fs.readFileSync(path.join(root,'public/deployment.json'),'utf8'));
 if(!isAddress(wallet||'')||!['testnet','mainnet'].includes(network))return send({error:'Invalid wallet or network'},400);
 if(deployment.revealed!==true)return send({error:'Astral Studio opens after the official OpenSea artwork reveal.'},409);
 const address=deployment[network];if(!isAddress(address||''))return send({error:'Owner studio opens after the official contract is deployed.'},409);
 const provider=new JsonRpcProvider(network==='mainnet'?'https://rpc.mainnet.arc.io':'https://rpc.testnet.arc.io');
 try{const block=await provider.getBlockNumber(),c=new Contract(address,['function name() view returns(string)','function balanceOf(address) view returns(uint256)','function tokenOfOwnerByIndex(address,uint256) view returns(uint256)','function supportsInterface(bytes4) view returns(bool)','function getMintStats(address) view returns(uint256,uint256,uint256)','function ownerOf(uint256) view returns(address)'],provider);const ids=await ownedTokens(c,wallet,block);res.setHeader('Cache-Control','no-store');return send({wallet,network,contract:address,block,ids});}finally{provider.destroy();}
 }
 if(['/api/holder/challenge','/api/holder/art'].includes(url.pathname)){
 if(req.method!=='POST')return send({error:'Method not allowed'},405);
 let body='',size=0;req.on('data',chunk=>{size+=chunk.length;if(size>10000){req.destroy();return;}body+=chunk;});
 req.on('end',async()=>{try{const input=JSON.parse(body);if(url.pathname.endsWith('/challenge'))return send(holder.challenge(input));const grant=await holder.authorize(input),reveal=JSON.parse(fs.readFileSync(path.join(root,'public/deployment.json'),'utf8'));if(reveal.revealed!==true)throw Error('Artwork has not been revealed.');const mapping=JSON.parse(fs.readFileSync(path.join(pack,'seadrop-token-map.json'),'utf8')),sourceId=mapping[grant.id-1],file=path.join(pack,'images-webp',sourceId+'.webp');if(!fs.existsSync(file))throw Error('Official artwork is not ready.');res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);}catch(e){send({error:e.message},403);}});return;
 }
 if(url.pathname==='/api/job'){
 if(req.method==='POST'){
 if(req.headers['x-admin-token']!==adminToken)return send({error:'Admin token required'},403);
 if(job.status==='running')return send(job,409);
 job={status:'running',log:'Rendering 7,777 full-resolution images…\n'};
 const p=spawn('python3',['-u',path.join(pack,'generate.py'),'--render-all']);
 p.stdout.on('data',d=>job.log=(job.log+d).slice(-6000));p.stderr.on('data',d=>job.log=(job.log+d).slice(-6000));
 p.on('error',e=>{job.status='failed';job.log+=e.message;});p.on('close',c=>job.status=c===0?'complete':'failed');
 }return send(job);
 }
 const revealed=JSON.parse(fs.readFileSync(path.join(root,'public/deployment.json'),'utf8')).revealed===true;
 const routes={'/rarity.json':path.join(root,revealed?'../cosmic-kin-generator-pack/seadrop-private/rarity-seadrop.json':'public/rarity.json'),'/edition-rarity.json':path.join(root,revealed?'../cosmic-kin-generator-pack/seadrop-private/edition-rarity-seadrop.json':'public/edition-rarity.json'),'/catalog.json':path.join(pack,'trait-catalog.json'),'/manifest.json':path.join(pack,revealed?'manifest-seadrop.json':'manifest-7777.json'),'/ethers.js':path.join(root,'../node_modules/ethers/dist/ethers.min.js')};
 let file=routes[url.pathname];if(url.pathname==='/terms')file=path.join(root,'public/terms.html');if(url.pathname==='/license')file=path.join(root,'public/license.html');
 if(url.pathname.startsWith('/assets/')){const asset=decodeURIComponent(url.pathname.slice(8));if(asset!=='generator-config.json'&&!/^layers\/[^.][^\\]*\.(png|webp)$/.test(asset))return send({error:'Asset not public'},404);}
 if(!file){const base=url.pathname.startsWith('/assets/')?pack:path.join(root,'public');const rel=decodeURIComponent(url.pathname.startsWith('/assets/')?url.pathname.slice(8):url.pathname==='/'?'index.html':url.pathname.slice(1));file=path.resolve(base,rel);if(!file.startsWith(base+path.sep))return send({error:'Forbidden'},403);}
 if(!adminEnabled&&file===path.join(root,'public/admin.html'))return send({error:'Admin disabled'},404);
 if(!fs.existsSync(file)||!fs.statSync(file).isFile())return send({error:'Not found'},404);
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
 }catch(e){send({error:e.message},400);}
}).listen(port,'127.0.0.1',()=>console.log(`Joshi Astrals Studio: http://127.0.0.1:${port} (${adminEnabled?'local admin':'public only'})`));
