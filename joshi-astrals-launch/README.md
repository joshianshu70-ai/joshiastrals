# Joshi Astrals · launch preparation
Presented by The House of Joshi
Rooted in Earth. Written in the stars.

This package prepares the identity, holder experience, exact rarity disclosure, draft rights, and launch communication. Nothing here has been posted publicly, uploaded to IPFS, or deployed onchain. Draft terms and suggested release phases are not live commitments.

- `collection-profile.json`: marketplace-ready identity fields; price and royalty configured; launch date unset.
- `rarity-report.json` / `.csv`: exact 7,777-edition trait counts, including one per zodiac sign.
- `rights-draft.md`: proposed holder license for review; not a present license grant.
- `launch-plan.md`: staged release and practical launch gates.
- `marketing-kit.md`: ready-to-edit collection description, announcement, seven posts, FAQ and creative briefs.
- `review-checklist.md`: visual acceptance and testnet checks.

The app remains at http://127.0.0.1:4180. The existing studio and generator directories retain their original folder names to preserve links. Public naming and new contract bytecode use Joshi Astrals / ASTRAL. The new active source is `contracts/JoshiAstrals.sol`.

Next decisions requiring the creator: legal licensor identity and final rights approval; launch date; official deployment address and hosting. Paid public minting is implemented and locally tested. Official deployment and website launch remain pending.

Full-resolution render: complete, 7,777 unique pixel hashes and 7,777 file hashes verified. See collection-audit.json and layout-regression-check.json. Current screenshots and sample exports are in this package. Cleanup removed obsolete drafts to recoverable Trash; cleanup-report.json records every path. Mainnet public mint additionally requires final HTTPS termsURL and licenseURL in deployment.json.

## Approved launch settings
Mint price: 25 USDC per NFT plus network gas. Secondary royalty: 7% (700 basis points; not an extra mint fee). Owner, primary-sale treasury and royalty recipient: 0x6736d2eA9807297F0e56967361B9410854B86a5f. Sale remains closed; these settings do not deploy a contract or submit a transaction. The deployment UI requires the configured owner wallet to sign so the contract owner is correct.


200 editions are reserved within the fixed 7,777 supply: 100 for The House of Joshi, 50 for community giveaways and 50 for collaborations/exhibitions. These intended uses are not transfer locks or vesting. Reserved IDs are #7577–#7777 excluding Capricorn #7655; all twelve zodiac editions remain public. Reserve minting is owner-only, capped at 200, sent to the configured immutable reserve wallet, and does not consume public phase allocations. Public supply is 7,577.

Zodiac placement correction: zodiac layer offset is now [0,24], leaving family placement unchanged. zodiac-layout-check.py validates all 48 sign/body pairings with a 10px silhouette inset; zodiac-placement-fix.json records changed editions. Exact final image uniqueness and visible preview uniqueness both remain 7,777.
