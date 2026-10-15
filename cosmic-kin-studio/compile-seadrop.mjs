import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc-seadrop';
import {createHash} from 'node:crypto';
const vendor='contracts/vendor/seadrop/';
const sources={};
function add(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())add(p);else if(p.endsWith('.sol'))sources[p.slice(vendor.length)]={content:fs.readFileSync(p,'utf8')};}}
add(vendor);
sources['JoshiAstralsSeaDrop.sol']={content:fs.readFileSync('contracts/JoshiAstralsSeaDrop.sol','utf8').replace('./vendor/seadrop/','')};
const input={language:'Solidity',sources,settings:{evmVersion:'london',optimizer:{enabled:true,runs:200},outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object']}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input)));
for(const e of output.errors||[])console.log(e.formattedMessage);
if(output.errors?.some(e=>e.severity==='error'))throw Error('SeaDrop compilation failed');
for(const [file,name,out] of [['JoshiAstralsSeaDrop.sol','JoshiAstralsSeaDrop','public/seadrop-contract.json'],['src/SeaDrop.sol','SeaDrop','test/seadrop-protocol.json']]){
 const c=output.contracts[file][name],artifact={contractName:name,compiler:solc.version(),evmVersion:'london',abi:c.abi,bytecode:'0x'+c.evm.bytecode.object,deployedBytecode:'0x'+c.evm.deployedBytecode.object};
 if(c.evm.deployedBytecode.object.length/2>24576)throw Error('Contract exceeds EIP-170');
 fs.writeFileSync(out,JSON.stringify(artifact,null,2)+'\n');console.log(`${name}: ${c.evm.deployedBytecode.object.length/2} runtime bytes`);
}
fs.writeFileSync('public/seadrop-build.json',JSON.stringify({source_sha256:createHash('sha256').update(fs.readFileSync('contracts/JoshiAstralsSeaDrop.sol')).digest('hex'),compiler:solc.version(),upstream:JSON.parse(fs.readFileSync(vendor+'PROVENANCE.json')).commit,minting:'Unmodified upstream ERC721SeaDrop and SeaDrop',status:'Candidate; not deployed or published'},null,2)+'\n');
fs.copyFileSync('contracts/JoshiAstralsSeaDrop.sol','public/JoshiAstralsSeaDrop.sol');
