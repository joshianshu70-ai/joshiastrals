# Joshi Astrals

One deployable Vercel application at the repository root. The Python art generator is an offline tool, not a separate web service.

## Deploy
Import joshianshu70-ai/joshiastrals. Root Directory: repository root (blank or .). Framework: Other. Install: npm ci --include=dev. Build: npm run build. Output: dist. These are also defined in vercel.json. Disable any old Services or subdirectory project overrides and deploy the latest main commit.

## Local
Node 22. Run npm ci, then npm run build or npm start. Local admin is http://127.0.0.1:4180/admin. Admin and generator jobs are excluded from the Vercel output.

## Current collection
Arc ERC721SeaDrop: 0x402f4ead8909145a57a45eeb27446111e6738c48. One planned public sale at 25 USDC, no buyer whitelist, planned limit two per wallet. Complete the 200 NFT House allocation before the 7,577 public mints. The Drop is not marked published; owner exports remain locked until verified reveal.

See joshi-astrals-launch/VERCEL.md for server-only owner-download settings and reveal requirements. No credentials or private token map are published. The offline image generator uses cosmic-kin-generator-pack/requirements-generator.txt.

Offline Python source is preserved losslessly in .py.gz archives to keep it out of app detection. Use `npm run generator -- --qa` to run the generator locally. The local admin entrypoint is local-studio.mjs; Vercel deploys only the root static site and api/holder.js.
