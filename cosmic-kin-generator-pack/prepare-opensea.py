"""Prepare a local OpenSea Studio upload candidate. Never uploads or shuffles artwork."""
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, csv, io
root=Path(__file__).resolve().parent
out=root/'opensea-upload';media=out/'media';media.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'manifest-seadrop.json').read_text())
assert len(manifest)==7777
# PNG colors quantized to 256; alpha remains exact. Opaque artwork uses JPEG.
def prepare(record):
 i=record['token_id'];source_id=record['source_edition_id'];source=root/'images-webp'/f'{source_id}.webp'
 with Image.open(source) as opened:
  im=opened.convert('RGBA').resize((768,768),Image.Resampling.LANCZOS);transparent=im.getchannel('A').getextrema()[0]<255
  dst=media/f'{i}.png' if transparent else media/f'{i}.jpg'
  if transparent:
   alpha=im.getchannel('A');im=im.convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT).convert('RGBA');im.putalpha(alpha);im.save(dst,'PNG',optimize=True)
  else:
   im.convert('RGB').save(dst,'JPEG',quality=75,optimize=True,subsampling=0)
 return {'token_id':i,'source_edition_id':source_id,'file_name':dst.name,'transparent':transparent,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':dst.stat().st_size}
with ThreadPoolExecutor(max_workers=6) as pool:
 records=[]
 for k,r in enumerate(pool.map(prepare,manifest),1):
  records.append(r)
  if k%1000==0:print(f'Prepared {k}/7777',flush=True)
# Keep total media + metadata below the user's 1 GB ceiling, without changing PNG alpha.
png_bytes=sum(r['bytes'] for r in records if r['transparent']);opaque=[r for r in records if not r['transparent']]
metadata_budget=20_000_000;budget=950_000_000-metadata_budget
if png_bytes>=budget:raise RuntimeError('Lossless transparent PNGs exceed budget; no upload-ready report issued.')
print(f'Transparent PNG total: {png_bytes/1e6:.1f} MB',flush=True)
per_jpg=(budget-png_bytes)//max(1,len(opaque))
def fit(r):
 if not r['transparent'] and r['bytes']>per_jpg:
  with Image.open(root/'images-webp'/f"{r['source_edition_id']}.webp") as im:
   im=im.convert('RGB').resize((768,768),Image.Resampling.LANCZOS)
   for q in [72,68,64,60,56,52,48,44,40]:
    buf=io.BytesIO();im.save(buf,'JPEG',quality=q,optimize=True,subsampling=0)
    if len(buf.getvalue())<=per_jpg:break
   (media/r['file_name']).write_bytes(buf.getvalue());r['quality']=q;r['bytes']=len(buf.getvalue())
 return r
with ThreadPoolExecutor(max_workers=6) as pool:records=list(pool.map(fit,records))
traits=sorted({a['trait_type'] for m in manifest for a in m['attributes']})
with (out/'joshi-astrals-opensea.csv').open('w',newline='') as f:
 writer=csv.DictWriter(f,fieldnames=['tokenID','name','description','file_name']+[f'attributes[{t}]' for t in traits]);writer.writeheader()
 for m,r in zip(manifest,records):
  writer.writerow({'tokenID':m['token_id'],'name':m['name'],'description':m['description'],'file_name':r['file_name'],**{f"attributes[{a['trait_type']}]":str(a['value']) for a in m['attributes']}})
expected={r['file_name'] for r in records}
for stale in media.iterdir():
 if stale.name not in expected and stale.suffix in {'.jpg','.png'}:stale.unlink()
seen=set()
for k,r in enumerate(records,1):
 path=media/r['file_name']
 with Image.open(path) as im:
  im.load();assert im.size==(768,768)
  pixels=im.convert('RGBA');digest=hashlib.sha256(pixels.tobytes()).hexdigest()
  if digest in seen:raise RuntimeError(f"Duplicate decoded artwork: {r['token_id']}")
  seen.add(digest)
  if r['transparent']:
   with Image.open(root/'images-webp'/f"{r['source_edition_id']}.webp") as src:assert pixels.getchannel('A').tobytes()==src.convert('RGBA').resize((768,768),Image.Resampling.LANCZOS).getchannel('A').tobytes()
 r['sha256']=hashlib.sha256(path.read_bytes()).hexdigest();r['decoded_pixel_sha256']=digest
 if k%1000==0:print(f'Verified {k}/7777',flush=True)
total=sum(r['bytes'] for r in records)+(out/'joshi-astrals-opensea.csv').stat().st_size
assert total<1_000_000_000, f'Budget exceeded: {total} bytes'
report={'status':'validated local upload candidate; not uploaded','count':7777,'unique_decoded_images':len(seen),'total_bytes':total,'transparent_png_count':len(records)-len(opaque),'opaque_jpg_count':len(opaque),'alpha':'exactly preserved after Lanczos resize for all transparent PNGs','dimensions':[768,768],'metadata_schema':'tokenID,name,description,file_name,attributes[Trait]','token_mapping':'House tokens 1–200 mapped to fixed non-zodiac reserve artwork; public 201–7777 locally shuffled once. Not VRF randomness.','records':records}
(out/'validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='records'},indent=2),flush=True)
