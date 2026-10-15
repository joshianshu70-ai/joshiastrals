import {randomBytes} from 'node:crypto';
import {verifyMessage,isAddress} from 'ethers';
export function holderAccess({deployment,ownerOf,origin,now=()=>Date.now()}){
 const challenges=new Map();
 function target(input){const d=deployment(),id=Number(input.id),network=input.network,address=d[network];if(!['testnet','mainnet'].includes(network)||!isAddress(address||''))throw Error('No official contract configured for this network.');if(!Number.isInteger(id)||id<1||id>7777||!isAddress(input.wallet||''))throw Error('Invalid edition or wallet.');return {id,network,address,wallet:input.wallet.toLowerCase()};}
 return {
 challenge(input){for(const [key,c] of challenges)if(c.expires<=now())challenges.delete(key);if(challenges.size>=1000)throw Error('Please try again shortly.');const t=target(input),nonce=randomBytes(24).toString('hex'),expires=now()+120000;const message=`Joshi Astrals holder artwork download\nWebsite: ${origin}\nNetwork: ${t.network}\nContract: ${t.address}\nToken ID: ${t.id}\nWallet: ${t.wallet}\nNonce: ${nonce}\nExpires: ${new Date(expires).toISOString()}\nThis signature authorizes one artwork download. No transaction or payment.`;challenges.set(nonce,{...t,message,expires});return {nonce,message};},
 async authorize({nonce,signature}){const c=challenges.get(nonce);challenges.delete(nonce);if(!c||c.expires<=now())throw Error('Download request expired. Verify again.');if(verifyMessage(c.message,signature).toLowerCase()!==c.wallet)throw Error('Wallet signature does not match.');if(deployment()[c.network]?.toLowerCase()!==c.address.toLowerCase())throw Error('Official contract changed. Verify again.');if((await ownerOf(c)).toLowerCase()!==c.wallet)throw Error('This wallet does not currently own this minted NFT.');return c;}
 };
}
