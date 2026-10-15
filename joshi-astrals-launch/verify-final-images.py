from pathlib import Path
from PIL import Image
import json,hashlib,concurrent.futures,datetime,collections
p=Path(__file__).resolve().parent.parent/'cosmic-kin-generator-pack';records=json.loads((p/'image-hashes.json').read_text());rows=json.loads((p/'manifest-7777.json').read_text());cat={t['file']:t for t in json.loads((p/'trait-catalog.json').read_text())};errors=[];warnings=[]
ids=[r['token_id'] for r in rows]
if ids!=list(range(1,7778)):errors.append('Manifest ID sequence incorrect')
expected={str(i)+'.png' for i in ids};actual={f.name for f in (p/'images').glob('*.png')}
if actual!=expected:errors.append('Missing or unexpected final image filenames')
families={'Lavender Stone':('Earth','Rooted'),'Sea Glass':('Water','Flowing'),'Iridescent Pearl':('Air','Soaring'),'Obsidian':('Fire','Radiant')}
for r in rows:
 a={a['trait_type']:a['value'] for a in r['attributes']};el,fam=families[a['Body Material']]
 if a['Element Overlay'] not in ['None',el] or a['Family Emblem'] not in ['None',fam]:errors.append(f'Incompatible traits #{r["token_id"]}')
 for layer in r['layers']:
  t=cat.get(layer)
  if not t or a.get(t['category'])!=t['value']:errors.append(f'Layer metadata mismatch #{r["token_id"]}: {layer}')
 env=next(cat[f] for f in r['layers'] if cat[f]['category']=='Environment')
 if env.get('family') and env['family']!=el:errors.append(f'Environment mismatch #{r["token_id"]}')
def check(r):
 try:
  f=p/'images'/f'{r["token_id"]}.png'
  with Image.open(f) as im:
   im.load()
   if im.format!='PNG' or im.size!=(1536,1536) or im.mode!='RGBA':return r['token_id'],'format/size/mode mismatch',None
   digest=hashlib.sha256(im.tobytes()).hexdigest()
   if digest!=r['pixel_sha256']:return r['token_id'],'decoded pixel hash mismatch',None
   if not im.getchannel('A').getbbox():return r['token_id'],'blank image',None
  return r['token_id'],None,digest
 except Exception as e:return r['token_id'],str(e),None
hashes=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,(id,error,h) in enumerate(pool.map(check,records),1):
  if error:errors.append(f'#{id}: {error}')
  else:hashes.append(h)
  if i%1000==0:print(f'Decoded and verified {i}/7777',flush=True)
if len(set(hashes))!=7777:errors.append('Final decoded pixel uniqueness/count failure')
report={'checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'editions_checked':len(rows),'full_resolution_images_decoded':len(hashes),'unique_decoded_images':len(set(hashes)),'canvas':'1536 x 1536 RGBA PNG','trait_and_environment_compatibility':'passed' if not errors else 'see errors','errors':errors,'status':'passed' if not errors else 'failed','metadata_status':'Draft image URIs; IPFS publication and final metadata still pending','visual_review_scope':'Contact sheet overview and selected full-resolution compositions; not individual full-resolution aesthetic approval of every edition.'}
(Path(__file__).parent/'nft-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2));raise SystemExit(bool(errors))
