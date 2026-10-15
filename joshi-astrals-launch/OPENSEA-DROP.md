# Joshi Astrals — OpenSea Drop launch

The approved primary mint destination is OpenSea Studio. No drop has been created, deployed or published. The public website now shows the OpenSea prelaunch destination, and earlier custom mint actions are retired.

## Prepared

- Official SeaDrop source pinned at commit 757590f11babfd81f4608f736e79e388469377f2, original pinned dependencies, Solidity 0.8.17; no mint logic modifications.
- JoshiAstralsSeaDrop initializes Joshi Astrals / ASTRAL, maxSupply 7777 and 700-bps ERC-2981 royalties to the House wallet. Ownership also starts at the House wallet. The base contract retains owner-controlled metadata, supply, royalties and SeaDrop configuration; these are not immutable promises.
- Tested using actual upstream SeaDrop, not a mocked mint implementation: 7777 supply, free House-only team Merkle stage (200), invalid proof/payment rejection, public mint, 25/35/45 native prices, 10% fee distribution, 7% royalty, metadata, transfers, unauthorized calls, and sold-out rejection.
- Local setup: http://127.0.0.1:4180/admin/opensea . Saves only a local draft; it does not change OpenSea or onchain settings.
- Public artwork is shuffled once locally. Private token mapping and upload bundle must not be committed or publicly served before reveal. This is not VRF; creator knows the mapping. Prior verified request-and-claim flow has been retired as part of the approved standard Drop migration.

## Stage plan

1. House-only free team stage: 200, wallet 0x6736d2eA9807297F0e56967361B9410854B86a5f. Complete all 200 before any public or allowlist mint. The private manifest maps these first 200 token IDs to the original non-zodiac reserve artwork. SeaDrop has no separate reserved-supply lock: incorrect stage configuration can let the public consume team supply.
2. Up to 50 allowlist wallets, two mints each at 25 USDC, early access during First Light. Allowlist mints must be included in the intended 777 First Light target, not added as an extra 100 supply. Native SeaDrop tracks lifetime wallet mint counts; later allowances must account for earlier mints.
3. Public targets: First Light 777 at 25; Rising Orbit 2000 at 35; Full Constellation 4800 at 45. Total public 7577. These are planned allocations, not automatic quantity caps. Standard SeaDrop stores one public-drop configuration at a time; verify how Studio schedules/prices each stage. Do not raise collection supply during sales to emulate phase caps.

Current OpenSea Studio primary fee: 10% (separate from 7% secondary royalty). Gross prices 25/35/45 correspond to net 22.50/31.50/40.50 before other costs. Confirm live checkout fees before publication.

## Next steps on OpenSea

1. Open https://opensea.io/studio , connect the House wallet, choose Create a Drop. Verify Arc is available for Drop deployment (marketplace support is separately confirmed).
2. Either use the standard Studio deployment or the prepared custom SeaDrop subclass; do not deploy both for the same collection. Owner must review and sign deployment.
3. Set 7777 total supply, payout to House, creator earnings initially 7%, and the collection details/logo/banner already prepared in public/branding.
4. Upload the local opensea-upload/media files and joshi-astrals-opensea.csv. Confirm the example CSV/schema and that all 7777 filenames, names and string traits match in Studio's preview. Do not upload the original WebP set through a UI that only lists JPG/PNG/SVG/GIF.
5. Configure the stages above with actual dates. Check the 200 team stage, allowlist limits, public prices and lifetime wallet limits before publishing. All twelve zodiac artwork editions must remain in the public mapping.
6. Review and publish rights/license, final terms, dates and drop page. Owner performs final wallet transactions and publication.
7. After the sale, use Studio Reveal to upload the managed media/metadata to IPFS and sign Complete Reveal. A separate Pinata account is not needed for that managed workflow. Do not finalize metadata both through Studio and a conflicting external baseURI process.
8. Verify tokenURI and NFT images for the deployed contract, then configure deployment.json with that official address and revealed=true. Astral Studio remains locked before reveal, because it must use the same mapped artwork as the minted NFT. Its signatures and fresh ownerOf checks remain required.

## Chain checks (2026-10-15, read-only)

Canonical SeaDrop address 0x00005EA00Ac477B1030CE78506496e8C2dE24bf5 has 21081 code bytes on Arc mainnet (chain 5042), keccak256 0x49ac1def6aee7ea8fcafc434b9c4c723caa850027a143fa0f9d5be02275b5539. It has no code on Arc Testnet 5042002. Code presence is not a completed Studio compatibility check or independent code verification. No funds or real transactions were sent.

References:
- https://docs.opensea.io/docs/seadrop
- https://docs.opensea.io/reference/upload_drop_collection_manifest
- https://support.opensea.io/en/articles/8867060-preparing-metadata-for-your-drop
- https://support.opensea.io/en/articles/8867061-drops-faq
