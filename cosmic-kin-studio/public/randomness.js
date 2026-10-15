import {Contract,getAddress,keccak256} from '/ethers.js';
export const randomnessSettings=await fetch('/randomness-settings.json').then(r=>r.json());
const slot='0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
export async function verifyRandomnessNetwork(provider,network){
 const config=randomnessSettings[network];if(!config||Number((await provider.getNetwork()).chainId)!==Number(config.chainId))throw Error('Randomness network mismatch.');
 for(const key of ['coordinator','registry']){const storage=await provider.getStorage(config[key],slot),implementation=getAddress('0x'+storage.slice(-40));if(implementation.toLowerCase()!==config[key+'Implementation'].toLowerCase())throw Error('Randomness provider upgraded. Review deployment manifest before minting.');const code=await provider.getCode(implementation);if(keccak256(code)!==config[key+'ImplementationCodeHash'])throw Error('Randomness implementation hash mismatch.');}
 return config;
}
export async function quoteRandomness(provider,c){const network=await provider.getNetwork(),key=Number(network.chainId)===5042?'mainnet':Number(network.chainId)===5042002?'testnet':null;if(!key)throw Error('Unsupported randomness network.');const config=await verifyRandomnessNetwork(provider,key);if((await c.rng()).toLowerCase()!==config.coordinator.toLowerCase())throw Error('Collection randomness coordinator mismatch.');const rng=new Contract(config.coordinator,['function quoteFeeAt(uint32,uint256) view returns(uint256)'],provider),block=await provider.getBlock('latest');if(block.baseFeePerGas==null)throw Error('Network base fee unavailable.');const fee=await rng.quoteFeeAt(await c.CALLBACK_GAS(),block.baseFeePerGas);return {fee,budget:(fee*125n+99n)/100n};}
