# Joshi Astrals — NFT generator pack

104 full-canvas PNG assets in 11 named trait folders, all 1536×1536 RGBA. This is the current clean-body collection, with normal and royal frames combined in ONE Frame folder and badges/messages combined in ONE Badge or Message folder. Earlier artwork packages are preserved separately.

## Layer folders, in back-to-front order

| Folder | Metadata trait | PNG choices |
|---|---|---:|
| 00_Environment | Environment | 17 |
| 01_Mathematical_Pattern | Mathematical Pattern | 7 |
| 02_Frame | Frame | 11 |
| 03_Body_Material | Body Material | 4 |
| 04_Element_Overlay | Element Overlay | 5 |
| 05_Eyes | Eyes | 11 |
| 06_Mouth | Mouth | 2 |
| 07_Family_Emblem | Family Emblem | 5 |
| 08_Zodiac | Zodiac | 13 |
| 09_Celestial_Body | Celestial Body | 12 |
| 10_Badge_or_Message | Badge or Message | 17 |

File names are readable trait names. `trait-catalog.json` and `.csv` map each PNG to its metadata name and value, and record actual use counts in the supplied edition plan. Do not infer rarity from PNG filenames; there are no filename weight suffixes.

Every category except Body Material includes one transparent None option. Environment images are opaque except None. Body PNGs have blank visors and no eyes, mouth, ears or headphones. Exact eyes and mouth are applied in their own folders. All named mouth files from the prior reference expression pack were identical: the active folder contains just Neutral Bar and None. Paired face PNGs are excluded from the active folders so they cannot accidentally duplicate the separate eyes and mouth.

## Import settings

Canvas 1536×1536. Origin (0,0), scale 100%, rotation 0. Disable trimming, auto-centering and independent resizing. Pick one PNG per folder, in the numbered order. Use these matched files together; do not mix earlier 1254×1254 or 2048×2048 versions.

Frames sit above environments/patterns and below the character, floating celestial body and footer text. Pick a normal frame OR royal frame OR None from the one Frame folder. Pick a badge OR positive message OR None from the one Badge or Message folder. Crowns are excluded because their fit was rejected and that work was stopped.

## Compatibility rules

Body material determines element/family:

| Body Material | Element | Family |
|---|---|---|
| Lavender Stone | Earth | Rooted |
| Sea Glass | Water | Flowing |
| Iridescent Pearl | Air | Soaring |
| Obsidian | Fire | Radiant |

Element Overlay must match that element or be None. A rich 3D environment must match it; plain colors, gradients and transparent None are unrestricted. Family Emblem must match the family or be None. Zodiac and Family Emblem use the same chest slot: NEVER show both.

The invisible metadata label Family is still inferred from body material when the visible Family Emblem is None. Element similarly describes the body family even when Element Overlay is None. Metadata labels are not extra visual layers.

Eyes, mouth, mathematical patterns, frames, allowed celestial accessories, and Badge or Message are otherwise interchangeable at their fixed positions. Current element overlays already contain their own head decorations.

## Exact edition plan: 7,777

`manifest-7777.json` supplies exact PNG selections and token IDs. It contains 7,765 Core NFTs with Zodiac=None and exactly 12 Zodiac Genesis NFTs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces occur once each. Each Genesis NFT uses Family Emblem=None and the sign's matching element body. Celestial associations on those twelve follow the chosen astrology motif; that relationship is symbolic.

Element-family totals: Earth 1,944; Water 1,944; Air 1,944; Fire 1,945. Every selected visible combination is unique in the plan. QA additionally checks actual rendered pixel uniqueness at 256px resolution. Token IDs are deterministically shuffled with seed 7777; this is a generation procedure, not proof of fair random mint assignment.

There are no imposed rarity quotas for frames, badges, messages, patterns or celestial bodies. Their actual counts are in the catalog. Do not use unrestricted random folder selection if you want to preserve the supplied compatibility rules and the twelve-only zodiac allocation. A generator with only independent filename weights cannot guarantee this edition.

## Included files

- `layers/`: 104 individually named PNGs in 11 trait folders.
- `trait-catalog.json` and `trait-catalog.csv`: asset/trait mapping, metadata labels and edition use counts.
- `generator-config.json`: canvas, stack order and compatibility rules.
- `manifest-7777.json`: exact composition recipe per token.
- `metadata-traits-7777.csv`: all traits for every token in one table.
- `metadata-draft/1.json` through `7777.json`: LOCAL DRAFT metadata, pointing to `../images/<id>.png`.
- `generate.py`: included manifest-driven renderer and metadata finalizer.
- `validation.json`: layer count, size/path checks and zodiac quotas.
- `render-validation.json`: 7,777 actual QA render hashes.
- `previews/`: sample NFTs and contact sheets covering the full edition.

The draft JSON is not ready to upload as public marketplace metadata because its image links are local. Finalize those links only after rendering and pinning the image directory.

## Generate NFTs

Requires Python 3 and Pillow. The PNGs themselves need no dependencies to import into another compatible generator.

```sh
# Install the image library if necessary.
python3 -m pip install -r requirements.txt

# Verify all combinations and regenerate review sheets.
python3 generate.py --qa

# Export images/1.png through images/7777.png at 1536×1536.
python3 generate.py --render-all

# After pinning images/, supply the real directory CID.
python3 generate.py --finalize-metadata --image-base-uri ipfs://YOUR_REAL_IMAGE_DIRECTORY_CID
```

The final command writes `metadata/1.json` through `7777.json` with public IPFS image links and attributes using `trait_type` and `value`. Pin that metadata directory afterward. Never upload metadata-draft as final metadata. Token numbering begins at 1.

This package includes the layer library, plan, draft metadata and QA images. It does not contain 7,777 full-resolution final PNG exports; use the render command for those. Full rendering may require substantial time and disk space. No blockchain contract, wallet transaction, IPFS upload, mint or marketplace listing has been performed.

Layout update: Frame renders last, above all other layers. Zodiac is translated down 24px on the 1536px canvas by the studio and generator, clearing the gold collar. Original transparent source PNGs remain unchanged; other generators must apply the render_offsets in generator-config.json.

Face/ear update: 105 layers in 12 folders. Every official edition uses Royal Gold Ears and Neutral Bar Mouth. Random studio designs also always include both. None Mouth is only an explicit custom draft choice.

Ear attachment correction: ears render immediately after Body Material and before Element Overlay. Each capsule moved 20px inward to overlap the head edge.

Smooth ears v2: simple champagne-gold capsules replace the rejected ringed headphones. Apply ear_attachment_offsets in generator-config.json separately to the left and right half of the ear layer according to Body Material. Studio and generate.py both apply these offsets, since the four head widths differ.

Family emblem placement: render_offsets now moves family emblems down 64px to clear the neck, matching zodiac placement. Edition #44 uses Rooted.

Lightweight upload set: run `python3 optimize-images.py` to create 1024px WebP copies in images-webp, preserving originals in images. optimization-report.json records sizes, source/file/decoded hashes and uniqueness. After pinning the WebP set, finalize using `python3 generate.py --finalize-metadata --image-format webp --image-base-uri ipfs://REAL_CID`. PNG remains the default unless --image-format webp is supplied.

The upload profile is 1024 × 1024 WebP, quality 65. The optimizer builds a resumable staging set and promotes it only after checking all source hashes, decoded image uniqueness, exact resized alpha and a conservative 950 MB images-plus-metadata budget. PNG masters remain unchanged. Final totals are recorded in optimization-report.json.
