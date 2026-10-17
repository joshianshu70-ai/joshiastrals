# Website and OpenSea minting

Both entry points use the existing Arc ERC721SeaDrop collection 0x402f4ead8909145a57a45eeb27446111e6738c48 and canonical SeaDrop 0x00005EA00Ac477B1030CE78506496e8C2dE24bf5. No new collection is deployed and no contract bytecode changes.

The website reads the latest Arc block, verifies chain ID and both runtime hashes, reads the public stage, allowed fee recipients, payout and getMintStats. It accepts only the approved 25 USDC native price (18 decimals), wallet limit two and total supply 7,777, with at least 200 already minted for the House allocation. This last check cannot prove the House allocation was correctly distributed; the creator must complete it before opening the public stage. A single configured fee recipient is required; the UI never substitutes its own fee recipient.

Before submission, the connected wallet switches to Arc, the site reads fresh settings, simulates mintPublic, rechecks account/chain and requests a wallet transaction for exact price times quantity. Recipient is the paying wallet. After confirmation, minted Transfer events supply the token IDs and owner holdings can refresh. Gas is additional. Wallet usage is SeaDrop's cumulative number minted, including any prior stages, across both entry points. A transfer does not reset it. The House wallet's 200 prior mints exceed the public limit; it does not have unlimited free public minting.

The website can be deployed before the sale is ready: its mint button stays disabled until the verified public settings are active. The OpenSea collection link remains accessible. The site does not publish or configure a Drop onchain.

Read-only Arc check during implementation: public price/start/end/wallet limit all zero, payout zero address, allowed fee recipients empty, total minted zero. Thus neither live paid website mint nor a live OpenSea sale was verified by this work. No wallet transaction was submitted.

Remaining creator actions: upload and review media/metadata; configure creator payout, royalties and fee recipient in OpenSea; complete the House-only 200 allocation; set public price 25 USDC, wallet limit two, launch time and end time; publish the Drop. Deploy the latest site. Perform a real mint with a wallet you control and verify token ownership/artwork; that financial action remains with the owner. OpenSea reveal and owner Studio setup remain separate.

Tests: exact payment and quote guards; actual official SeaDrop local protocol accepts one mint using website quote parameters plus one marketplace-style mint for the same buyer, then rejects a third across the shared limit. Local browser reads the real inactive Arc sale and keeps minting disabled. Phone/tablet/desktop widths checked. These checks are not an independent audit.
