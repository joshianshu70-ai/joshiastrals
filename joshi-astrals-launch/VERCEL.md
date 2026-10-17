# Vercel deployment

Use the existing Vercel project for joshiastrals.thehouseofjoshi.com. Set its Root Directory to the repository root (not cosmic-kin-studio). The repository now has one root package.json and package-lock.json. The Python generator requirements file is named requirements-generator.txt to avoid treating the offline tool as a deployable service. The repository vercel.json selects a public-only static build and a Node.js holder function. Build is `npm run build`; install is `npm ci --include=dev`; output is dist. No local admin or generator jobs are included.

Before revealing artwork, deployment.revealed remains false. The site and collection explorer can deploy without a database. Owner Studio returns a locked status until reveal.

Owner downloads after reveal require a shared Redis REST store (for example an existing Upstash Redis database) and three server-only environment variables: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, HOLDER_CHALLENGE_SECRET (at least 32 random bytes). Never put these in public files or GitHub. Use the Vercel environment settings or an authorized secret connector; do not send credentials in chat. Database creation or paid upgrades were not performed by this work.

The HMAC-signed challenge works across function instances; a Redis atomic SET NX prevents reuse and concurrent double redemption. A fresh ownerOf check is performed before and after fetching official art. Tests cover cross-instance use, replay/race, wrong wallet, transfers, expiry, tampering, reveal gating and unavailable storage.

Exports fetch the revealed tokenURI and its ipfs:// image through https://ipfs.io. Only bounded IPFS resources are fetched; redirects and arbitrary HTTP targets are rejected. API artwork responses are capped at 4 MB to stay below Vercel's documented 4.5 MB payload limit. Exports use the published NFT image; the 1024-pixel archival original is not hosted by this Vercel deployment. 640-pixel media can be composed into the existing wallpaper/banner layouts, but is not a high-resolution original. Future archival delivery can use a separately configured private asset store.

Before deployment.revealed=true, supply the verified token-ID-mapped manifest and mapped rarity files expected by build-vercel.mjs. They remain private until the official OpenSea reveal; after reveal they can be included in the deployment source. Build fails if revealed=true without the files. Do not publish the pre-reveal token map. Verify sample tokenURI art against the mapped manifest and perform real holder/non-holder/transfer checks before opening owner exports.

The connected Vercel session on 16 October 2026 showed houseofjoshi888-1063s-projects paused until 31 October for Fast Origin Transfer allowance; a Joshi Astrals project was not yet identified there. No production deployment was performed. Confirm the correct project/account, then review its repository link and domain configuration. No billing changes were made.

References:
https://vercel.com/docs/functions/limitations
https://vercel.com/docs/project-configuration/vercel-json

Website and OpenSea public minting share the existing official SeaDrop contract and onchain wallet usage. See joshi-astrals-launch/DUAL-MINT.md (DUAL-MINT.md from this launch folder) for verified sale gating and remaining launch actions.
