import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),studio=path.join(root,'cosmic-kin-studio'),pub=path.join(studio,'public'),pack=path.join(root,'cosmic-kin-generator-pack'),out=path.join(root,'dist');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const files=['index.html','favicon.ico','responsive.js','style.css','app.js','experience.js','public-mint.js','seadrop-mint-core.js','site-content.js','holder-design.js','randomness.js','randomness-settings.json','wallet-settings.json','collection-profile.json','deployment.json','launch-settings.json','opensea-drop-plan.json','terms.html','license.html','faq.html','risks.html','privacy.html','contact.html','security.html','how-to-mint.html','about.html','robots.txt','sitemap.xml'];
for(const name of files)fs.copyFileSync(path.join(pub,name),path.join(out,name));
// Keep local administration and retired mint code out of the public browser module.
let app=fs.readFileSync(path.join(pub,'app.js'),'utf8');
app=app.slice(0,app.indexOf('\nasync function ownerContract()'));
app=app.split('\n').filter(line=>!line.startsWith("import {randomnessSettings")&&!line.startsWith("if($('deploy'))")&&!line.startsWith("if($('mintButton'))")&&!line.startsWith('function transaction(')&&!line.startsWith('let poll;')&&!line.startsWith("if($('generate'))")).join('\n');
fs.writeFileSync(path.join(out,'app.js'),app);
for(const name of ['branding','vendor'])fs.cpSync(path.join(pub,name),path.join(out,name),{recursive:true});
fs.copyFileSync(path.join(root,'node_modules/ethers/dist/ethers.min.js'),path.join(out,'ethers.js'));
fs.copyFileSync(path.join(pack,'trait-catalog.json'),path.join(out,'catalog.json'));
const d=JSON.parse(fs.readFileSync(path.join(pub,'deployment.json'))),revealed=d.revealed===true;
const data={ 'manifest.json':revealed?path.join(pack,'manifest-seadrop.json'):path.join(pack,'manifest-7777.json'),'rarity.json':revealed?path.join(pack,'seadrop-private/rarity-seadrop.json'):path.join(pub,'rarity.json'),'edition-rarity.json':revealed?path.join(pack,'seadrop-private/edition-rarity-seadrop.json'):path.join(pub,'edition-rarity.json')};
for(const [name,source] of Object.entries(data)){if(!fs.existsSync(source))throw Error('Missing revealed artwork data. Do not enable reveal until the verified mapped manifests are supplied.');fs.copyFileSync(source,path.join(out,name));}
fs.mkdirSync(path.join(out,'assets'),{recursive:true});fs.copyFileSync(path.join(pack,'generator-config.json'),path.join(out,'assets/generator-config.json'));fs.cpSync(path.join(pack,'layers'),path.join(out,'assets/layers'),{recursive:true});
console.log('Built Vercel public site. Admin, jobs, private token map and original artwork files excluded.');
