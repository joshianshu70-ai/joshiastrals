from pathlib import Path
from PIL import Image,ImageChops,ImageFilter
import json
p=Path(__file__).resolve().parent.parent/'cosmic-kin-generator-pack';cat=json.loads((p/'trait-catalog.json').read_text());cfg=json.loads((p/'generator-config.json').read_text());dx,dy=cfg['render_offsets']['08_Zodiac'];checks=[]
for body in [t for t in cat if t['category']=='Body Material']:
 mask=Image.open(p/body['file']).getchannel('A').point(lambda a:255 if a>128 else 0)
 # Require visible glyph pixels inside the body, with a 10px inset from its silhouette.
 inset=mask.filter(ImageFilter.MinFilter(21))
 for sign in [t for t in cat if t['category']=='Zodiac' and t['value']!='None']:
  glyph=Image.open(p/sign['file']).getchannel('A');transform=cfg.get('trait_render_transforms',{}).get(sign['file'])
  if transform:
   x,y,x2,y2=transform['source_bounds'];scale=transform['scale'];ax,ay=transform['anchor'];crop=glyph.crop((x,y,x2,y2));crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.LANCZOS);glyph=Image.new('L',mask.size);glyph.paste(crop,(round(ax+(x-ax)*scale),round(ay+(y-ay)*scale)))
  glyph=glyph.point(lambda a:255 if a>32 else 0);shifted=Image.new('L',mask.size);shifted.paste(glyph,(dx,dy));bbox=shifted.getbbox();spill=ImageChops.subtract(shifted,inset).getbbox();checks.append({'body':body['value'],'sign':sign['value'],'inside_body_with_10px_margin':spill is None,'below_collar_zone':bbox[1]>=1240,'bounds':bbox})
failed=[c for c in checks if not c['inside_body_with_10px_margin'] or not c['below_collar_zone']];report={'combinations_checked':len(checks),'offset':[dx,dy],'failures':failed,'checks':checks,'status':'passed' if not failed else 'failed'};(Path(__file__).parent/'zodiac-layout-check.json').write_text(json.dumps(report,indent=2)+'\n');print('Zodiac fit:',len(checks),'body/sign combinations; failures:',len(failed));raise SystemExit(bool(failed))
