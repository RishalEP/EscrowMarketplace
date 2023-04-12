const { ethers, network } = require('hardhat');
const saveToConfig = require('../utils/saveToConfig')

const {
    amount,
    sellerAddress,
    arbitorAddress
} = require('../helper/arguments')


async function main() {

    const ESCROW = await ethers.getContractFactory("Escrow");
    const EscrowABI = (await artifacts.readArtifact('Escrow')).abi
    await saveToConfig('Escrow', 'ABI', EscrowABI)
    const valueToSend = ethers.utils.parseEther(amount); 

    const escrow = await ESCROW.deploy(
        sellerAddress,
        arbitorAddress,
        { value: valueToSend }
        );

    await saveToConfig('Escrow', 'ADDRESS', escrow.address)
    await saveToConfig('Escrow', 'CHAINID', network.config.chainId)
    console.log(`Escrow:- ${escrow.address} `);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

