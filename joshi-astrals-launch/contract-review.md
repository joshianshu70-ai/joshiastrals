# Joshi Astrals contract review

Passed: full 7,777 supply (7,577 randomly assigned public plus 200 reserves), no duplicate/public-reserved IDs, phase caps/prices, first-50 wallet reservations with 2 protected seats each, open general mint, service-fee handling, FIFO, callback authentication, timeout refunds and seat restoration, no rerolls, rejecting NFT receiver retry, reentrancy, ownership and random-ID holder discovery. Randomness callbacks used a local mock; live service proof delivery has not yet been rehearsed.

- Public mint stays open to everyone; Phase 1 initially holds 100 seats for up to 50 wallets, 2 protected seats each.
- Listed wallets may also use general availability. Owner may permanently release unused protected seats.
- Authenticated D20DAO callback supplies randomness. FIFO assignment draws unique IDs without replacement, excluding the 200 House reserve IDs.
- Mint payment is escrowed until assignment; buyer then claims fixed assigned NFTs. No rerolls or buyer-selected IDs.
- Expired, unfulfilled requests can recover the NFT payment as withdrawable credit, with seat/supply restoration; the service separately refunds its fee under its rules.
- Buyer pays randomness service fee and gas in addition to 25 / 35 / 45 USDC; the designated wallet remains NFT-price exempt.
- ERC-721 Enumerable supports random-ID owner lookup, transfers and owner-only wallpapers/banners/PFPs.
- House reserve stays 200 NFTs, all 12 zodiac IDs stay public, ERC-2981 royalty stays 7%, treasury and metadata base URI remain immutable.

Source SHA-256: 544e577b6c3054532fec49f7c66f97fdadb9b0b7cbac628aa19cdb171f1f0fc4

Artifact SHA-256: 4efe2b2cae8f96825a2ee78f3463a8043958573df1e8f9c9b357a0f2e6ca0b18

Independent security audit, final terms, IPFS pinning and official deployment remain pending.
