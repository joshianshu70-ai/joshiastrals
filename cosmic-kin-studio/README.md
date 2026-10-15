# Joshi Astrals Studio

The House of Joshi's 7,777-edition ERC-721 collection on Arc. Local public mint interface, creator administration, layered art generator and owner-only Astral Studio. No official contract is deployed and no sale is live.

## Run

Requires Node 22.13+, npm and Python 3/Pillow for image generation. Run `npm ci`, then `npm start`. Open http://127.0.0.1:4180/; creator controls are at /admin. `npm run build:wallet` bundles Reown AppKit locally. Its public project ID and intended production domain, https://joshiastrals.thehouseofjoshi.com, are in public/wallet-settings.json. Allow that origin and localhost in the Reown dashboard. Hosting/DNS are not deployed.

Run production behind an HTTPS reverse proxy with `JOSHI_PUBLIC_ONLY=1 npm start`. The server binds loopback and public-only mode disables admin endpoints. Do not expose the creator server. No wallet secrets belong in source, browser code or GitHub.

## Mint model

7,577 public NFTs plus 200 fixed House reserve NFTs. Phase quantities/prices: 777 at 25 USDC, 2,000 at 35 USDC, 4,800 at 45 USDC. Native USDC on Arc uses 18 decimals. The payout/free-price wallet is 0x6736d2eA9807297F0e56967361B9410854B86a5f. It pays no NFT price but still pays the randomness-service fee and network gas. Royalties signal 7% via ERC-2981; marketplace enforcement is not implemented.

Public minting is open to everyone while the sale is open. Phase 1 initially protects 100 seats for up to 50 distinct registered wallets, with at most 2 protected seats each. The initial 677 general seats remain public. Owner adds addresses as received in Creator setup; the registered list, used seats and remaining seats appear on Public mint. Listed wallets can also buy general seats. Up to 5 NFTs per request. These reservations concern supply, not specific NFT IDs. Removing an unused allowance releases its protected seats but does not reclaim a lifetime wallet slot. Allowances cannot be reduced below already-used seats. Owner can permanently release all remaining protected seats; thereafter the list is closed. Release unneeded/unassigned seats to sell out Phase 1.

## Verified random assignment

Uses @d20dao/vrf-sdk 0.6.2 with its D20VRFConsumer callback authentication and request helper. Buyer books seats and pays NFT price plus a buffered service-fee quote. Same-transaction quoteFee pays the exact service fee; unused budget becomes buyer refund credit. Offchain quotes use quoteFeeAt with the latest base fee, never quoteFee through eth_call. Callback gas is 120,000. The callback stores the accepted word only. Permissionless settleMints processes requests in order, drawing unique random public IDs from a sparse Fisher–Yates pool using rejection sampling. The public pool is 1–7576 plus Capricorn #7655; fixed House reserve IDs are excluded. Anyone may advance ready assignment, but only each buyer may claim their assigned NFTs to a chosen receiver. Claims/settlement require separate transactions and gas. No rerolls, buyer-selected IDs or onchain timestamp/prevrandao fallback.

The service coordinator is immutable in our contract; its own proxies are upgradeable and its operators/beacon have documented trust assumptions. Before deployment and mint quotes, the UI verifies coordinator and registry implementation addresses and code hashes against the pinned SDK data. `npm run verify:randomness` performs read-only Arc mainnet/testnet checks. An upgrade mismatch blocks new UI requests until reviewed. Local tests mock callback delivery; a real Arc Testnet request/receipt/proof rehearsal and independent contract review are still required. Verified provider bytecode is not an independent audit or proof of future service uptime.

Request payment is escrowed until assignment; treasury withdrawals cannot take escrow/refund liabilities. An expired, unfulfilled service request can be recovered with recoverExpiredMint: the NFT payment becomes withdrawable buyer credit and seats/counters are restored. The service returns its fee separately to the buyer under its refund rules. Accepted randomness is final; retry failed delivery with the same result. The Public mint page lists wallet requests (with pagination), assignment/claim actions and refund withdrawal. Failed NFT receivers may claim again to another receiver without rerolling. A stalled queue must resolve its expired head before later requests can be assigned; no owner bypass can reorder outcomes.

## Owner-only artwork studio

Connected wallets discover actual minted/claimed NFTs using ERC-721 Enumerable at one block snapshot, with ownerOf checks. Transfers and House reserve NFTs are included. Non-owners cannot access the studio creator tools. Owners select their NFT and create a PFP (1024²), wallpaper (1080×1920) or banner (1800×600), in Lavender, Champagne or Midnight. Wallet/network changes revoke the cached session. Downloads require an expiring one-use EOA wallet signature and a fresh server ownership check. ERC-1271 smart-contract signature verification is not implemented. Public NFT artwork remains publicly viewable; this gate cannot prevent copying or screenshots.

## Artwork, storage and rarity

The sibling cosmic-kin-generator-pack contains aligned RGBA trait layers and the fixed 7,777 manifest. PNG masters and optimized image sets are local build/upload outputs, not application source. Rebuild using `python3 generate.py --render-all` followed by `python3 optimize-images.py` in that folder, or supply the already-verified local WebP directory on the production server for owner downloads. Upload WebPs to public IPFS, finalize metadata with their real image directory CID, then pin metadata before deploying: the contract base URI is immutable. The optimized local set is 843,906,306 image bytes + 13,510,263 metadata bytes = 857,416,569 bytes; 1024² WebP, all 7,777 unique, resized alpha verified lossless.

Rarity ranks sum log2(7777/trait count) across the 12 artwork categories, including None, excluding derived Family/Element/Edition/allocation. Ties share rank; correlated traits affect scores. Tiers: top 1% Legendary, to 5% Epic, to 20% Rare, to 50% Uncommon, remaining Common (ceil cutoffs). This is collection frequency ranking, not OpenSea ranking or financial valuation. `npm run build:rarity` rebuilds the report after manifest changes. Random mint assignment does not change artwork, metadata identities or rarity.

## Validation and launch

`npm run compile` uses solc 0.8.28 and Shanghai-compatible output (runs on Arc). `npm test` covers all 7,777 public/reserve IDs, full phase sell-through, random non-repetition, reservation/public availability boundaries, expiry/refund/accounting, callback/claim security, free NFT-price wallet, ownership enumeration and signed download access. Tests use a local mock randomness coordinator, never as a production deployment default.

Finish artwork approval, legal creator/contact and final sale/rights terms, durable IPFS pinning, Arc Testnet rehearsal, independent review, production hosting and official contract configuration before opening the sale. OpenSea can index the deployed ERC-721 after minted/claimed tokens exist. No SeaDrop direct OpenSea minting or enforced royalties is implemented.

References: https://d20dao.org/docs, https://docs.arc.io/arc/references/connect-to-arc, https://docs.reown.com/appkit/javascript/core/installation.
