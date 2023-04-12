/* eslint-disable no-undef */
"use strict";
require("dotenv").config();

module.exports = {
    
  ADMIN_PRIVATE_KEY:process.env.ADMIN_PRIVATE_KEY,

  MUMBAI_RPC_URL:
    // "https://polygon-mumbai.infura.io/v3/0b591ea62011424abd2eea847009da12",
    "https://polygon-mumbai.g.alchemy.com/v2/BvqFQ0B6dKG3Jjst0KTFmOfwiCtI5rP2",

  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
};
