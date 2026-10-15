from pathlib import Path
import json,copy,random,re,hashlib
pack=Path(__file__).resolve().parent;public=pack.parent/'cosmic-kin-studio/public';private=pack/'seadrop-private';private.mkdir(exist_ok=True)
manifest=json.loads((pack/'manifest-7777.json').read_text());settings=json.loads((public/'launch-settings.json').read_text());reserve=settings['reserve_ids'];reserved=set(reserve)
mapping_path=pack/'seadrop-token-map.json'
if mapping_path.exists():mapping=json.loads(mapping_path.read_text())
else:
 others=[i for i in range(1,7778) if i not in reserved];random.SystemRandom().shuffle(others);mapping=reserve+others;mapping_path.write_text(json.dumps(mapping)+'\n')
assert len(set(mapping))==7777 and set(mapping[:200])==reserved
new=[]
for i,source in enumerate(mapping,1):
 m=copy.deepcopy(manifest[source-1]);m['source_edition_id']=source;m['token_id']=i;m['name']=re.sub(r'#\d+',f'#{i}',m['name'],count=1)
 for a in m['attributes']:
  if a['trait_type']=='Initial Allocation':a['value']='House Reserve' if i<=200 else 'Public Mint'
 new.append(m)
(pack/'manifest-seadrop.json').write_text(json.dumps(new,indent=2)+'\n')
rank=json.loads((public/'edition-rarity.json').read_text());byid={r['id']:r for r in rank['editions']}
rank['editions']=[dict(byid[source],id=i) for i,source in enumerate(mapping,1)]
(private/'edition-rarity-seadrop.json').write_text(json.dumps(rank,indent=2)+'\n')
rarity=json.loads((public/'rarity.json').read_text());inv={source:i for i,source in enumerate(mapping,1)}
for g in rarity['celestial_twelve']:g['token_id']=inv[g['token_id']]
(private/'rarity-seadrop.json').write_text(json.dumps(rarity,indent=2)+'\n')
(private/'seadrop-token-map.json').write_text(json.dumps(mapping)+'\n')
print('Mapped House #1–200 and public #201–7777; all twelve zodiac art editions remain public.')
