require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
require("ethereum-waffle");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-ethers");

const {
  CUSTOM_RPC_URL,
  MUMBAI_RPC_URL,
  ADMIN_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  CUSTOM_CHAIN_ID
} = require("./config/index");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: MUMBAI_RPC_URL,
        blockNumber: 32898798
      }
    },
    custom: {
      url: CUSTOM_RPC_URL || "",
      accounts: [ADMIN_PRIVATE_KEY.custom],
      chainId: CUSTOM_CHAIN_ID
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [ADMIN_PRIVATE_KEY.testnet],
      chainId: 80001
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
};
