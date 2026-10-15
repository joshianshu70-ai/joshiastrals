# Joshi Astrals · proposed launch plan
Approved phase plan; final legal and launch review pending. No sale is open and no launch date is announced.

## Identity
The House of Joshi presents Joshi Astrals: 7,777 cosmic companions, four elemental families, The Celestial Twelve, mathematical overlays and messages of belonging. Tagline: Rooted in Earth. Written in the stars.

## What we can demonstrate now
Local layer customization, numbered editions, individual identities and affirmations, exact trait frequency, profile/wallpaper/banner preview exports, a configured-contract ownership-check workflow, and a staged paid ERC-721 mint contract tested on a local EVM. All 7,777 full-resolution images are rendered and their final file hashes are verified in collection-audit.json. Official Arc deployment, IPFS pinning and live holder verification are not complete.

## Gate 1 · art and integrity
Complete all 7,777 full-resolution files. Verify final image hashes against the latest assets and layout configuration. Review all contact sheets, all 12 zodiac editions, each body with/without its element overlay, all frames and badge/message designs. Confirm mouths are present, ears attach, chest emblems clear collars and footers, and frames remain on top. Keep crowns excluded unless separately redesigned and approved. Resolve every flagged composition before freezing the collection.

## Gate 2 · terms and infrastructure
Approve the holder license and identify the legal creator. Confirm distribution model, optional creator earnings, and any price. Pin the final images and finalized metadata with durable storage; verify multiple gateways. Pin a versioned license and collection provenance files. Configure a public host and official contract address. No private keys should be stored in the app or supplied in chat.

## Gate 3 · Arc Testnet
Test at least the 12 zodiac IDs, two Core IDs from each body and four edge cases (24 tests; avoid counting the same ID twice). Test duplicate mint failure, owner-only minting, transfers, tokenURI retrieval, correct artwork and ownership check. Check avatar 1024², wallpaper 1080×1920 and banner 1500×500 exports. Verify that a non-holder cannot obtain a verified-holder result and that account/network/edition changes invalidate previous verification. Local preview exports intentionally remain public.

## Selected launch model: paid public mint on the website
The paid ERC-721 mint implementation is prepared and locally tested. It accepts native USDC with 18 decimals on Arc, requires exact payment, limits each transaction to 1–5 NFTs, and allocates next unused edition IDs sequentially. It is not randomized. No official deployment exists and the website is disabled until a verified contract is configured.

## Approved release phases
Phase 1: 777 NFTs at 25 USDC (total cap 777). Phase 2: 2,000 NFTs at 35 USDC (total cap 2,777). Phase 3: 4,800 NFTs at 45 USDC (public total cap 7,577).
Prices and total caps are fixed in the contract. The owner activates Phase 1, then each following phase only once the previous phase is fully minted. The owner can open or pause the active phase. The owner cannot skip phases, decrease supply caps, or change phase prices. A purchase cannot cross a phase boundary; buyers must choose a quantity that fits the remaining allocation.
Creator mints can select unused IDs and count toward the active phase cap. Fully minted does not necessarily mean every NFT was purchased publicly. The Celestial Twelve retain their fixed IDs and may appear in different phases. Public assignment is sequential, not random.

## Treasury, royalty and ownership
Owner/deployer and treasury: 0x6736d2eA9807297F0e56967361B9410854B86a5f. The royalty is fixed at 7% (700 basis points) to the treasury. ERC-2981 communicates this setting; it does not force marketplaces to pay it. Metadata base URI, treasury, phase prices, phase caps and royalty are not owner-editable.
Ownership transfers require two steps: proposal by current owner and acceptance by the proposed wallet. Ownership cannot be renounced, preventing accidental loss of phase controls or withdrawals. A change of owner does not change treasury or royalty recipient. Only the owner can withdraw funds, and they go solely to the immutable treasury. Public mint and creator mint use reentrancy protection.

Sources: https://docs.openzeppelin.com/contracts/5.x/access-control and https://docs.openzeppelin.com/contracts/5.x/api/token/common

## Communication rhythm
Preview the art and studio before requesting funds. Share the four families, mathematical patterns, the exact zodiac allocation and a usable demo. Publish final rights, official addresses, supply and distribution details before launch. Then explain how to verify the collection and use the studio. Do not imply partners, marketplace endorsement, audited security, guaranteed future benefits, profit, floor support, staking yields or scarcity beyond the fixed facts.

## Support and accountability
Publish an official support channel, a clear impersonation warning containing verified addresses, and a status page. Keep support promises proportional to the team's actual capacity. No unsolicited messages to prospective buyers. Announce only features already delivered or explicitly approved and funded.

## Approved launch settings
Mint prices: 25 / 35 / 45 USDC by phase, plus network gas. Secondary royalty: 7% (700 basis points; not an extra mint fee). Owner, primary-sale treasury and royalty recipient: 0x6736d2eA9807297F0e56967361B9410854B86a5f. Sale remains closed; these settings do not deploy a contract or submit a transaction. The deployment UI requires the configured owner wallet to sign so the contract owner is correct.


200 editions are reserved within the fixed 7,777 supply: 100 for The House of Joshi, 50 for community giveaways and 50 for collaborations/exhibitions. These intended uses are not transfer locks or vesting. Reserved IDs are #7577–#7777 excluding Capricorn #7655; all twelve zodiac editions remain public. Reserve minting is owner-only, capped at 200, sent to the configured immutable reserve wallet, and does not consume public phase allocations. Public supply is 7,577.


Wallet 0x6736d2eA9807297F0e56967361B9410854B86a5f is exempt from public mint price in all phases. Its public mints count against the same public allocation and require an open sale, with 1–5 per transaction. Gas is additional. Other wallets pay the fixed phase price. This exemption is separate from the 200 reserve NFTs.
