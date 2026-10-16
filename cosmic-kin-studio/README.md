# Joshi Astrals website

Current launch: standard OpenSea Drop on Arc. Contract `0x402f4ead8909145a57a45eeb27446111e6738c48` is deployed. The Drop is in preparation, not published.

One public sale: 25 USDC, no buyer whitelist, planned two public mints per wallet. Complete the House-only 200 NFT allocation first; 7,577 public mints remain. These settings must be configured in OpenSea, not merely saved locally.

Run `npm start` for localhost admin (4180). Production: `npm run start:public` behind an HTTPS reverse proxy on joshiastrals.thehouseofjoshi.com. Never expose the admin-mode process externally.

Owner Studio stays locked until the actual OpenSea reveal and mapped token artwork have been verified. Download checks use fresh ownerOf plus one-use wallet signatures. Public art is not private. The full original artwork and private token mapping must be supplied privately to the server, not committed or served as static files.

Use /admin/opensea to save local launch-link status. Only mark published after confirming publication on OpenSea. The deployed contract is not modified by this form. Older custom contract controls are disabled historical reference and must not be deployed.

Checks: `node test-drop-plan.mjs`, `npm run test:holder`, `npm run test:owned`, `npm run test:seadrop`, `npm run build:wallet`.

See ../joshi-astrals-launch/PRODUCTION.md for hosting and release instructions. Published terms and license pages use the creator-supplied name and contact; they do not assert registration or a legal jurisdiction.
