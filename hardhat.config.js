require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    nexus: {
      url: process.env.NEXUS_RPC_URL || "https://rpc.nexus.xyz/http",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 30000  // 30 seconds timeout (default is 20 seconds)
    },
  },
  etherscan: {
    apiKey: {
      nexus: "empty",
    },
    customChains: [
      {
        network: "nexus",
        chainId: 393,
        urls: {
          apiURL: "https://explorer.nexus.xyz/api",
          browserURL: "https://explorer.nexus.xyz",
        },
      },
    ],
  },
};