import assert from 'node:assert/strict';import {fixture,parseEther} from './test/fixture.mjs';
const f=await fixture(),{c,buyer,other,owner,book,deliver,settle,provider}=f,w=await buyer.getAddress();
assert.equal(await c.reservedSeatsRemaining(),100n);assert.equal(await c.whitelistWalletCount(),0n);
await assert.rejects(c.connect(buyer).setWhitelistAllowances.staticCall([w],[2]));await assert.rejects(c.setWhitelistAllowances.staticCall([w],[3]));await assert.rejects(c.setWhitelistAllowances.staticCall([],[]));await assert.rejects(c.setWhitelistAllowances.staticCall([w],[]));
await(await c.setWhitelistAllowances([w],[2])).wait();assert.equal(await c.reservedSeatsRemaining(),100n);assert.equal(await c.whitelistWalletAt(0),w);
await(await c.activatePhase(1,true)).wait();assert.equal(await c.mintableQuantity(await other.getAddress()),5n);const publicId=await book(other,5);assert.equal(await c.reservedSeatsRemaining(),100n);
const reservedId=await book(buyer,2);assert.equal(await c.whitelistRemaining(w),0n);assert.equal(await c.reservedSeatsRemaining(),98n);
await deliver(reservedId);await settle();assert.equal((await c.mintRequests(reservedId)).settled,false);await deliver(publicId);await settle();assert.equal((await c.mintRequests(reservedId)).settled,true);
const extras=Array.from({length:49},(_,i)=>'0x'+(1000+i).toString(16).padStart(40,'0'));await(await c.setWhitelistAllowances(extras,Array(49).fill(2))).wait();assert.equal(await c.whitelistWalletCount(),50n);await assert.rejects(c.setWhitelistAllowances.staticCall([await owner.getAddress()],[2]));await assert.rejects(c.setWhitelistAllowances.staticCall([w],[0]));
// Public users can buy only general seats; outstanding wallet seats stay protected.
let minted=7;while(minted<679){const q=Math.min(5,679-minted);const id=await book(other,q);await deliver(id);await settle();minted+=q;}
assert.equal(await c.mintableQuantity(await other.getAddress()),0n);assert.equal(await c.reservedSeatsRemaining(),98n);await assert.rejects(c.connect(other).mint.staticCall(1,{value:parseEther('25.02')}));
await assert.rejects(c.activatePhase.staticCall(2,true));await(await c.releaseWhitelistSeats()).wait();assert.equal(await c.reservedSeatsRemaining(),0n);assert.equal(await c.mintableQuantity(await other.getAddress()),5n);await assert.rejects(c.setWhitelistAllowances.staticCall([w],[2]));
console.log('PASS reservations: public mint always available, 100 seats protected, first 50 wallets listed, 2 seats each, used seats consumed, FIFO allocation, owner release opens leftover seats.');process.exit(0);
