# Production release

The local website is ready for review at http://127.0.0.1:4180. It has not been deployed to the domain by this work.

## Host requirements
Use a persistent Node.js server, not static-only hosting: signed holder exports require the backend. Install dependencies with `npm ci` at the repository root and build wallet assets with `npm run build:wallet`. Place the studio beside cosmic-kin-generator-pack. Supply the private pack (layers, manifest-7777.json, trait-catalog.json, generator-config.json, images-webp, manifest-seadrop.json, seadrop-token-map.json and seadrop-private rarity files) using private file transfer. These original artworks and private mapping files are not in GitHub and must not be uploaded to a public static bucket before reveal.

Start the public service with `JOSHI_PUBLIC_ONLY=1 PORT=4180 node server.mjs`. It listens on localhost; place an HTTPS reverse proxy in front. `/admin`, admin APIs, generator jobs and the direct OpenSea admin page are disabled in public mode. Keep the local admin server private. Do not expose admin mode through a public tunnel. Use a single process: download nonces are short-lived and held in memory.

## Domain
Point the DNS A/AAAA records for joshiastrals.thehouseofjoshi.com to the chosen host. Proxy HTTPS traffic to 127.0.0.1:4180; preserve Host and Origin. The server only accepts this production hostname and localhost. A sample Caddyfile is supplied; Caddy obtains HTTPS certificates after DNS is correct. Allow outbound RPC access to rpc.mainnet.arc.io. Configure the Reown project domain allowlist for https://joshiastrals.thehouseofjoshi.com (project ID 1060f60c4700494e247f69d8b7b5a86f). No secret API key belongs in client JavaScript.

## Before enabling mint
Use the existing OpenSea collection and existing deployed Arc contract. Upload and preview media + CSV, set House payout and 7% creator earnings, configure the House-only 200 free stage, then one public sale at 25 USDC and wallet limit 2. Complete the House stage first. Review date and wallet confirmations in OpenSea. Saving local site settings does not perform these actions.

Only after OpenSea publication: mark the local launch status Published in /admin/opensea, confirm the checkbox, and deploy the updated plan file. This enables the website mint link without creating a separate mint flow.

## Reveal and owner rehearsal
Keep deployment.revealed=false until the OpenSea artwork reveal is finished. Compare tokenURI and IPFS art against the private mapping for sampled public tokens, House tokens and all twelve zodiac tokens. Then set revealed=true through a reviewed deployment file update. Test with a real holder wallet: fetch holdings, preview PFP/banner/wallpaper, sign and download each. Test a non-holder and transfer a test token to verify the former owner loses access. Automated tests already cover ownerOf checks, transfer revocation, expiry and replay rejection; they do not substitute for this live rehearsal. No wallet transactions were submitted during site preparation.

## Release checks
GET /healthz should report public mode. /admin and /api/job must return 404. Test at 390px and desktop width, check all family/mint/holder links and terms, check HTTPS and preview tags, and verify the correct contract address. Keep the backend and private pack backed up. Publish the supplied terms after creator review; the supplied creator name does not itself assert a registered legal entity.
