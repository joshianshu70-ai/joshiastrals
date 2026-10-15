# Joshi Astrals · The House of Joshi

7,777 cosmic companions on Arc. A layered-art customizer, public random-mint request interface, creator admin, exact trait rarity and an owner-only wallpaper/banner/PFP studio.

**Prelaunch:** no official contract, paid sale or IPFS collection has been deployed. No private keys or Pinata credentials are included.

## Run locally

Requires Node 22.13+. From this repository:

```sh
npm run setup
npm start
```

Open http://127.0.0.1:4180/ and http://127.0.0.1:4180/admin. Local creator controls require the configured owner wallet to sign contract transactions. Configure Reown allowed origins for localhost and https://joshiastrals.thehouseofjoshi.com. DNS and hosting are separate deployment steps.

## Minting

- 777 NFTs at 25 USDC; then 2,000 at 35 USDC; then 4,800 at 45 USDC. Randomness-service fee and network gas are additional.
- 200 fixed House reserve NFTs are separate from 7,577 public NFTs. All twelve zodiac editions remain public.
- Everyone may mint from general availability. Phase 1 initially protects 100 seats for up to 50 wallet addresses, 2 protected seats each. Listed wallets may also buy general seats. Owner adds addresses as received and can permanently release unused seats. The public mint page displays the onchain list and remaining seats.
- D20DAO verified randomness supplies a word through an authenticated callback. Permissionless ordered settlement assigns unique random public token IDs. Buyers then claim their assigned NFTs. No browser RNG, selectable outcomes or rerolls.
- Mint-price escrow, expired-request recovery, fee-buffer refund credit, retry of accepted results, safe receiver retries and two-step ownership are implemented. 7% ERC-2981 royalty signaling is optional at marketplace level.

## Source layout

- `cosmic-kin-studio/`: app, contracts, compiled ABI/bytecode, admin controls and tests.
- `cosmic-kin-generator-pack/`: aligned PNG trait layers, fixed manifest and rendering/optimization scripts.
- `joshi-astrals-launch/`: reports, configuration, branding and launch materials.

The 19.62 GB original PNG masters and 857 MB optimized upload package are intentionally excluded from Git. They remain in the local working project and belong in durable media/IPFS storage. To rebuild, install Python Pillow, run `python3 generate.py --render-all` in the generator folder, then `python3 optimize-images.py`. Put the verified WebP directory on the app host for owner-download exports. Never use placeholder metadata URIs for a deployed contract.

## Validate

```sh
npm test
npm run build
npm --prefix cosmic-kin-studio run verify:randomness
```

Tests cover all 7,777 public/reserve IDs, non-repeating random assignment, phase/price limits, reserved seats without excluding the public, authenticated callbacks, FIFO, refunds, claim retries/reentrancy, free NFT-price wallet, transfers and owner downloads. Local callbacks use a mock coordinator; production deployment uses the pinned official D20DAO coordinator. Arc mainnet/testnet implementation code hashes were checked read-only. Real Arc Testnet proof-delivery rehearsal and independent contract review remain pending.

See [Studio documentation](cosmic-kin-studio/README.md) for the request/claim lifecycle, deployment, service trust/upgrade checks, storage, rarity, public-only hosting and launch requirements.
