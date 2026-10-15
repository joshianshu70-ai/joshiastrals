"""Cosmic Kin manifest-driven generator. Requires Python 3 + Pillow.

python3 generate.py --qa
python3 generate.py --render-all
python3 generate.py --finalize-metadata --image-base-uri ipfs://YOUR_REAL_IMAGE_DIRECTORY_CID
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import argparse,json,hashlib,functools,collections,re
P=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--qa',action='store_true')
parser.add_argument('--render-all',action='store_true')
parser.add_argument('--finalize-metadata',action='store_true')
parser.add_argument('--image-base-uri')
parser.add_argument('--image-format',choices=['png','webp'],default='png')
config=json.loads((P/'generator-config.json').read_text())
args=parser.parse_args();rows=json.loads((P/'manifest-7777.json').read_text())
@functools.lru_cache(maxsize=None)
def asset(path,size):
 im=Image.open(P/path).convert('RGBA')
 if im.size!=(size,size):im=im.resize((size,size),Image.Resampling.LANCZOS)
 box=im.getchannel('A').getbbox()
 return (im.crop(box),(box[0],box[1])) if box else (None,None)
def compose(row,size):
 im=Image.new('RGBA',(size,size))
 for path in row['layers']:
    layer,position=asset(path,size)
    if layer is not None:
       transform=config.get('trait_render_transforms',{}).get(path)
       if transform:
          scale=transform['scale'];anchor=[v*size/1536 for v in transform['anchor']]
          position=(round(anchor[0]+(position[0]-anchor[0])*scale),round(anchor[1]+(position[1]-anchor[1])*scale))
          layer=layer.resize((round(layer.width*scale),round(layer.height*scale)),Image.Resampling.LANCZOS)
       offset=config.get('asset_render_offsets',{}).get(path,config.get('render_offsets',{}).get(path.split('/')[1],[0,0]))
       position=(position[0]+round(offset[0]*size/1536),position[1]+round(offset[1]*size/1536))
       if '/11_Ears/' in path:
          body=next(a['value'] for a in row['attributes'] if a['trait_type']=='Body Material')
          dx=config['ear_attachment_offsets'][body];split=round(size/2)-position[0]
          im.alpha_composite(layer.crop((0,0,split,layer.height)),(position[0]+round(dx[0]*size/1536),position[1]))
          im.alpha_composite(layer.crop((split,0,layer.width,layer.height)),(round(size/2)+round(dx[1]*size/1536),position[1]))
       else:im.alpha_composite(layer,position)
 return im
def display(im):
 bg=Image.new('RGBA',im.size,'#30283f');bg.alpha_composite(im);return bg.convert('RGB')
def attrs(row):return {a['trait_type']:a['value'] for a in row['attributes']}
if args.qa:
 out=P/'previews';out.mkdir(exist_ok=True);contacts=out/'all-7777';contacts.mkdir(exist_ok=True)
 hashes={};records=[]
 for i,row in enumerate(rows):
    im=compose(row,256);h=hashlib.sha256(im.tobytes()).hexdigest()
    assert h not in hashes,('duplicate visible render',row['token_id'],hashes.get(h))
    hashes[h]=row['token_id'];records.append({'token_id':row['token_id'],'rgba_sha256_256px':h})
    if i%400==0:sheet=Image.new('RGB',(2560,2960),'#30283f')
    x=i%400%20*128;y=i%400//20*148
    sheet.paste(display(im.resize((128,128),Image.Resampling.LANCZOS)),(x,y))
    ImageDraw.Draw(sheet).text((x+3,y+130),str(row['token_id']),fill='#efdfbd')
    if i%400==399 or i==len(rows)-1:
        sheet.save(contacts/f'{i//400+1:02}.jpg',quality=90);print(f'Checked {i+1}/7777',flush=True)
 chosen=[r for r in rows if attrs(r)['Edition']=='Zodiac Genesis']
 chosen.sort(key=lambda r:attrs(r)['Zodiac'])
 for body in ['Lavender Stone','Sea Glass','Iridescent Pearl','Obsidian']:
    chosen.extend([r for r in rows if attrs(r)['Body Material']==body and attrs(r)['Edition']=='Core'][:2])
 sheet=Image.new('RGB',(1920,1680),'#30283f')
 for i,row in enumerate(chosen):
    x=i%5*384;y=i//5*420
    sheet.paste(display(compose(row,384)),(x,y))
    a=attrs(row);label=f'#{row["token_id"]} | '+(a['Zodiac'] if a['Zodiac']!='None' else a['Family'])
    ImageDraw.Draw(sheet).text((x+10,y+390),label,fill='#efdfbd')
 sheet.save(out/'collection-preview.jpg',quality=95)
 # Larger originals of all Genesis items and eight Core samples.
 for row in chosen:compose(row,768).save(out/f'{row["token_id"]}.png')
 (P/'render-validation.json').write_text(json.dumps({'checked':7777,'unique_visible_renders':len(hashes),'resolution':256,'records':records},indent=2))
if args.render_all:
 out=P/'images';out.mkdir(exist_ok=True);hashes={};records=[]
 for i,row in enumerate(rows):
    im=compose(row,1536);h=hashlib.sha256(im.tobytes()).hexdigest()
    assert h not in hashes,('duplicate',row['token_id'],hashes.get(h));hashes[h]=row['token_id']
    path=out/f'{row["token_id"]}.png';im.save(path)
    records.append({'token_id':row['token_id'],'pixel_sha256':h,'file_sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    if i%100==99:print(f'Rendered {i+1}/7777',flush=True)
 (P/'image-hashes.json').write_text(json.dumps(records,indent=2))
if args.finalize_metadata:
 uri=args.image_base_uri or ''
 if not uri.startswith('ipfs://') or any(x in uri.upper() for x in ['YOUR_','REPLACE','EXAMPLE']):parser.error('Supply a real pinned image-directory URI: ipfs://<CID>')
 image_dir=P/('images-webp' if args.image_format=='webp' else 'images')
 if any(not (image_dir/f'{row["token_id"]}.{args.image_format}').is_file() for row in rows):parser.error('Prepare all 7777 selected-format images before finalizing metadata.')
 if args.image_format=='webp':
    optimized=json.loads((P/'optimization-report.json').read_text());masters={r['token_id']:r['file_sha256'] for r in json.loads((P/'image-hashes.json').read_text())}
    if optimized['status']!='passed' or len(optimized['records'])!=7777:parser.error('Optimized verification is incomplete.')
    for r in optimized['records']:
       if r['source_sha256']!=masters[r['token_id']] or hashlib.sha256((image_dir/f'{r["token_id"]}.webp').read_bytes()).hexdigest()!=r['file_sha256']:parser.error('Optimized images are stale or modified; rerun optimize-images.py.')
 out=P/'metadata';out.mkdir(exist_ok=True)
 for row in rows:
    draft=json.loads((P/'metadata-draft'/f'{row["token_id"]}.json').read_text())
    draft['image']=uri.rstrip('/')+f'/{row["token_id"]}.{args.image_format}'
    (out/f'{row["token_id"]}.json').write_text(json.dumps(draft,indent=2))
 print('Finalized 7777 metadata JSON files with the supplied image URI.')
if not(args.qa or args.render_all or args.finalize_metadata):parser.print_help()
