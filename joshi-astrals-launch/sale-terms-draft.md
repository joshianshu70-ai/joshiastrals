# Joshi Astrals · sale disclosure draft
Not effective; creator/legal review and final publication required before opening the sale.

Creator brand: The House of Joshi. Legal seller and public contact: pending actual identity confirmation.

Product: an ERC-721 token associated with a numbered Joshi Astral artwork and metadata. Final artwork-use license must be linked separately; purchasing a token does not automatically convey copyright ownership.

Payment: the exact current onchain mint price multiplied by quantity, in native USDC on Arc, plus wallet-estimated network gas. The website displays the price before opening the wallet transaction. No ERC-20 token approval is used. A phase change before execution causes a transaction with an outdated payment amount to revert; failed transactions may still incur network costs.

Assignment: next unused edition IDs in order, not a selected preview or random draw. One to five NFTs per transaction. Public assignment skips the fixed reserve IDs. All 7,777 identities and the twelve zodiac IDs are publicly disclosed in the manifest.

Availability: new deployments start with sale closed and no released supply. The owner activates phases sequentially after the previous allocation is fully minted and can pause the active phase. Phase prices and caps are fixed in code. Metadata base URI and treasury are immutable; hosting availability still depends on the storage arrangements.

Utility: personalized artwork export is working locally; official holder verification needs the configured Arc deployment. A public host and final support policy must exist before describing the service as live. No future benefits or resale returns are guaranteed.

Before publication: identify seller and jurisdiction; approve final price, royalty, treasury and release policy; review refund/consumer-rights obligations, taxes and dispute terms with counsel. Do not waive statutory rights through this draft. Publish final terms, license version, official contract and support details before opening the sale.

## Approved launch settings
Mint prices: 25 / 35 / 45 USDC by phase, plus network gas. Secondary royalty: 7% (700 basis points; not an extra mint fee). Owner, primary-sale treasury and royalty recipient: 0x6736d2eA9807297F0e56967361B9410854B86a5f. Sale remains closed; these settings do not deploy a contract or submit a transaction. The deployment UI requires the configured owner wallet to sign so the contract owner is correct.

## Phase allocation
Phase 1: 777 NFTs at 25 USDC (total cap 777). Phase 2: 2,000 NFTs at 35 USDC (total cap 2,777). Phase 3: 4,800 NFTs at 45 USDC (public total cap 7,577). Network gas is additional. Reserve mints do not count toward public phase allocation. Public purchases cannot cross a phase boundary.


200 editions are reserved within the fixed 7,777 supply: 100 for The House of Joshi, 50 for community giveaways and 50 for collaborations/exhibitions. These intended uses are not transfer locks or vesting. Reserved IDs are #7577–#7777 excluding Capricorn #7655; all twelve zodiac editions remain public. Reserve minting is owner-only, capped at 200, sent to the configured immutable reserve wallet, and does not consume public phase allocations. Public supply is 7,577.


Wallet 0x6736d2eA9807297F0e56967361B9410854B86a5f is exempt from public mint price in all phases. Its public mints count against the same public allocation and require an open sale, with 1–5 per transaction. Gas is additional. Other wallets pay the fixed phase price. This exemption is separate from the 200 reserve NFTs.
