import fs from 'node:fs';
import path from 'node:path';
import {Contract,JsonRpcProvider,isAddress} from '../cosmic-kin-studio/serverless-chain.mjs';
import {ownedTokens} from '../cosmic-kin-studio/owned-tokens.mjs';
import {serverlessHolder,redisConsume} from '../cosmic-kin-studio/serverless-holder.mjs';
const origin='https://joshiastrals.thehouseofjoshi.com';
const deployment=()=>JSON.parse(fs.readFileSync(path.join(process.cwd(),'cosmic-kin-studio/public/deployment.json'),'utf8'));
const abi=['function name() view returns(string)','function balanceOf(address) view returns(uint256)','function supportsInterface(bytes4) view returns(bool)','function getMintStats(address) view returns(uint256,uint256,uint256)','function ownerOf(uint256) view returns(address)','function tokenURI(uint256) view returns(string)'];
function ipfs(uri){if(typeof uri!=='string'||!/^ipfs:\/\/[a-zA-Z0-9]+(?:\/[^\s?#]*)?$/.test(uri)||uri.includes('..'))throw Error('Official artwork must use an IPFS URI.');return 'https://ipfs.io/ipfs/'+uri.slice(7);}
async function boundedFetch(uri,max){const r=await fetch(ipfs(uri),{redirect:'error',signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Official artwork storage unavailable.');const reader=r.body.getReader();let size=0;const chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('Official artwork exceeds the download limit.');}chunks.push(Buffer.from(value));}return {bytes:Buffer.concat(chunks),type:r.headers.get('content-type')?.split(';')[0]};}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(status,data)=>res.status(status).json(data);
 const action=req.query.action;
 if(req.headers.origin&&req.headers.origin!==origin)return send(403,{error:'Origin rejected'});
 if(!['owned','challenge','art'].includes(action))return send(404,{error:'Not found'});
 if(req.method!==(action==='owned'?'GET':'POST'))return send(405,{error:'Method not allowed'});
 const d=deployment();if(d.revealed!==true)return send(409,{error:'Astral Studio opens after the official OpenSea artwork reveal.'});
 const provider=new JsonRpcProvider('https://rpc.mainnet.arc.io'),contract=new Contract(d.mainnet,abi,provider);
 try{
  if(action==='owned'){const {wallet,network}=req.query;if(network!=='mainnet'||!isAddress(wallet||''))return send(400,{error:'Invalid wallet or network'});const block=await provider.getBlockNumber();return send(200,{wallet,network,contract:d.mainnet,block,ids:await ownedTokens(contract,wallet,block)});}
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!body||Buffer.byteLength(JSON.stringify(body))>10000)return send(400,{error:'Invalid request body'});
  const gate=serverlessHolder({secret:process.env.HOLDER_CHALLENGE_SECRET,consume:redisConsume({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN}),ownerOf:({id})=>contract.ownerOf(id),deployment});
  if(action==='challenge')return send(200,gate.challenge(body));
  const grant=await gate.authorize(body),metadata=JSON.parse((await boundedFetch(await contract.tokenURI(grant.id),200000)).bytes.toString());
  const art=await boundedFetch(metadata.image,4000000);
  if(!['image/png','image/jpeg','image/webp'].includes(art.type))throw Error('Unsupported official artwork format.');
  // Recheck after fetching, so a transfer while storage is loading revokes the export.
  if((await contract.ownerOf(grant.id)).toLowerCase()!==grant.wallet)throw Error('Ownership changed.');
  res.setHeader('Content-Type',art.type);return res.status(200).send(art.bytes);
 }catch(error){console.error('Holder request failed:',error.code||error.name);return send(403,{error:'Could not verify or download this Astral. Reconnect and try again; contact support if it continues.'});}finally{provider.destroy();}
}
