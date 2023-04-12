# Escrow MarketPlace Contract

This project demonstrates a smart contract-based escrow system for secure and automated payments in a peer-to-peer marketplace. The system should include features such as dispute resolution and multi-signature transactions.

Steps to Deploy in Mumbai Polygon

1. Create env file from sample env. Make sure to keep minimum balance in admin wallet.
2. Run `npx hardhat test` to run the test cases.
3. Run `npx hardhat run .\scripts\1-deployEscrow.js --network mumbai` to deploy contract to Mumbai Polygon.
4. Make sure to update the seller, arbitor and the amount in helper/arguments file
