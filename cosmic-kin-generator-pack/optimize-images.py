"""Create lightweight NFT upload copies without modifying original PNG masters."""
from pathlib import Path
from PIL import Image
import concurrent.futures,hashlib,json,io,datetime,os,shutil
PROFILE="webp-1024-q65-v2"
p=Path(__file__).resolve().parent;out=p/'images-webp-staging';out.mkdir(exist_ok=True);records=json.loads((p/'image-hashes.json').read_text());prior={r['token_id']:r for r in json.loads((p/'optimization-staging-report.json').read_text())['records']} if (p/'optimization-staging-report.json').exists() else {}
def optimize(record):
 id=record['token_id'];source=p/'images'/f'{id}.png'
 old=prior.get(id);dest=out/f'{id}.webp'
 if old and old.get('profile')==PROFILE and old['source_sha256']==record['file_sha256'] and dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==old['file_sha256']:return old
 assert hashlib.sha256(source.read_bytes()).hexdigest()==record['file_sha256'],'Source changed; regenerate image hashes first'
 with Image.open(source) as original:
  im=original.convert('RGBA');im=im.resize((1024,1024),Image.Resampling.LANCZOS);alpha=im.getchannel('A').tobytes();q=65
  while True:
   b=io.BytesIO();im.save(b,format='WEBP',quality=q,method=4,exact=True)
   if len(b.getvalue())<=300*1024 or q<=65:break
   q-=5
  data=b.getvalue();dest=out/f'{id}.webp';dest.write_bytes(data)
  with Image.open(dest) as decoded:
   decoded.load();decoded=decoded.convert('RGBA');assert decoded.size==(1024,1024);assert decoded.getchannel('A').tobytes()==alpha,'Transparency changed'
   digest=hashlib.sha256(decoded.tobytes()).hexdigest()
  return {'profile':PROFILE,'token_id':id,'source_sha256':record['file_sha256'],'file_sha256':hashlib.sha256(data).hexdigest(),'decoded_pixel_sha256':digest,'bytes':len(data),'quality':q}
result=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for i,r in enumerate(pool.map(optimize,records),1):
  result.append(r)
  if i%250==0:
   (p/'optimization-staging-report.json').write_text(json.dumps({'records':result}))
   print(f'Optimized and verified {i}/7777 · {sum(x["bytes"] for x in result)/1e6:.1f} MB',flush=True)
assert len(result)==7777 and len({r['decoded_pixel_sha256'] for r in result})==7777,'Duplicate compressed images'
original=sum((p/'images'/f'{r["token_id"]}.png').stat().st_size for r in result);total=sum(r['bytes'] for r in result)
report={'profile':PROFILE,'created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'format':'WebP','dimensions':[1024,1024],'count':len(result),'unique_decoded_images':len({r['decoded_pixel_sha256'] for r in result}),'transparency':'Verified lossless alpha after resize for all images','original_bytes':original,'optimized_bytes':total,'reduction_percent':round((1-total/original)*100,2),'average_KB':round(total/len(result)/1024,1),'maximum_KB':round(max(r['bytes'] for r in result)/1024,1),'status':'passed','records':result}
metadata_bytes=sum(x.stat().st_size for x in (p/'metadata-webp-draft').glob('*.json'))
report['metadata_bytes']=metadata_bytes;report['upload_bytes']=total+metadata_bytes;report['budget_bytes']=1_000_000_000
assert report['upload_bytes']<950_000_000,'Collection exceeds conservative 950 MB budget'
# Promote only after all images pass uniqueness, alpha and size validation.
backup=p/'images-webp-previous';assert not backup.exists(),'Previous promotion backup needs review'
if (p/'images-webp').exists():os.rename(p/'images-webp',backup)
os.rename(out,p/'images-webp')
(p/'optimization-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='records'},indent=2))
# Keep optimized metadata separate until real pinned image CIDs are available.
m=p/'metadata-webp-draft';m.mkdir(exist_ok=True)
for r in result:
 d=json.loads((p/'metadata-draft'/f'{r["token_id"]}.json').read_text());d['image']=f'REPLACE_WITH_IPFS_IMAGE_DIRECTORY/{r["token_id"]}.webp';(m/f'{r["token_id"]}.json').write_text(json.dumps(d,indent=2)+'\n')

(p.parent/'joshi-astrals-launch'/'optimization-summary.json').write_text(json.dumps({k:v for k,v in report.items() if k!='records'},indent=2)+'\n')
if backup.exists():shutil.rmtree(backup)
(p/'optimization-staging-report.json').unlink(missing_ok=True)
