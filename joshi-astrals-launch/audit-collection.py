"""Audit the locally rendered Joshi Astrals collection. No uploads or transactions."""
from pathlib import Path
from PIL import Image
import json,hashlib,collections,argparse
parser=argparse.ArgumentParser();parser.add_argument('--verify-final-files',action='store_true');args=parser.parse_args()
p=Path(__file__).resolve().parent.parent/'cosmic-kin-generator-pack';rows=json.loads((p/'manifest-7777.json').read_text());cat=json.loads((p/'trait-catalog.json').read_text());cfg=json.loads((p/'generator-config.json').read_text());errors=[];counts=collections.defaultdict(collections.Counter)
for t in cat:
 f=p/t['file']
 if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=t['sha256']:errors.append('Asset hash mismatch: '+t['file'])
 elif Image.open(f).size!=(1536,1536):errors.append('Asset canvas mismatch: '+t['file'])
for r in rows:
 attrs={a['trait_type']:a['value'] for a in r['attributes']}
 for k,v in attrs.items():counts[k][v]+=1
 d=json.loads((p/'metadata-draft'/f"{r['token_id']}.json").read_text())
 if d['name']!=r['name'] or d['attributes']!=r['attributes'] or d['description']!=r['description']:errors.append('Metadata mismatch '+str(r['token_id']))
 if not r['name'].startswith('Joshi Astral #'):errors.append('Name mismatch '+str(r['token_id']))
 if not r.get('identity',{}).get('story'):errors.append('Missing story '+str(r['token_id']))
 if attrs['Mouth']!='Neutral Bar' or attrs['Ears']!='Royal Gold':errors.append('Missing mouth/ears '+str(r['token_id']))
 if '/02_Frame/' not in r['layers'][-1]:errors.append('Frame not topmost '+str(r['token_id']))
 if r['layers'].index('layers/11_Ears/Royal Gold.png')!=next(i for i,f in enumerate(r['layers']) if '/03_Body_Material/' in f)+1:errors.append('Ears order '+str(r['token_id']))
 if attrs['Zodiac']!='None' and attrs['Family Emblem']!='None':errors.append('Chest slot collision '+str(r['token_id']))
if counts['Zodiac']['None']!=7765 or any(n!=1 for k,n in counts['Zodiac'].items() if k!='None'):errors.append('Zodiac allocation incorrect')
reserve=json.loads((Path(__file__).parent/'reserve-plan.json').read_text());reserved=set(reserve['token_ids'])
if len(reserved)!=200 or reserved!={i for i in range(7577,7778) if i!=7655}:errors.append('Reserve IDs incorrect')
if any(next(a['value'] for a in rows[i-1]['attributes'] if a['trait_type']=='Zodiac')!='None' for i in reserved):errors.append('Reserved zodiac ID')
if counts['Initial Allocation']['House Reserve']!=200 or counts['Initial Allocation']['Public Mint']!=7577:errors.append('Initial allocation counts incorrect')
images=list((p/'images').glob('*.png'));hashfile=p/'image-hashes.json';full='pending';verified=0
if hashfile.is_file():
 records=json.loads(hashfile.read_text())
 if len(records)!=7777 or len({r['pixel_sha256'] for r in records})!=7777:errors.append('Final pixel uniqueness/count failure')
 elif args.verify_final_files:
  for r in records:
   f=p/'images'/f"{r['token_id']}.png"
   if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=r['file_sha256']:errors.append('Final file mismatch '+str(r['token_id']))
   else:verified+=1
  if verified==7777:full='verified'
 else:full='hash_manifest_present; use --verify-final-files'
qa=json.loads((p/'render-validation.json').read_text());report={'collection':'Joshi Astrals','editions':len(rows),'assets':len(cat),'stories':sum(bool(r.get('identity')) for r in rows),'metadata_drafts':7777,'zodiac_counts':dict(counts['Zodiac']),'qa_unique_visible_renders_256px':qa['unique_visible_renders'],'final_images_on_disk':len(images),'final_render_status':full,'final_files_verified':verified,'identity_and_layer_checks':'passed' if not errors else 'failed','errors':errors,'human_art_approval':'pending','ipfs_upload':'pending','official_arc_deployment':'pending','rights':'draft; creator approval pending'}
(Path(__file__).parent/'collection-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='zodiac_counts'},indent=2));raise SystemExit(bool(errors))
