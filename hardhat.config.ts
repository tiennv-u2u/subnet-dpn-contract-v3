import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const U2U_MAINNET_RPC_URL = process.env.U2U_MAINNET_RPC_URL || "https://rpc-mainnet.u2u.xyz";
const U2U_TESTNET_RPC_URL = process.env.U2U_TESTNET_RPC_URL || "https://rpc-nebulas-testnet.uniultra.xyz";


const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10000 ETH
      }
    },
    nebulas: {
      chainId: 2484,
      url: U2U_TESTNET_RPC_URL,
      accounts: [`${PRIVATE_KEY}`],
      // gas: 21000,
    },
    solaris: {
      chainId: 39,
      url: U2U_MAINNET_RPC_URL,
      accounts: [`${PRIVATE_KEY}`],
      // gas: 21000,
    }
  },
  etherscan: {
    apiKey: {
      solaris: process.env.ETHERSCAN_API_KEY || "", // arbitrary string
      nebulas: process.env.ETHERSCAN_API_KEY || "", // arbitrary string
    },
    customChains: [
      {
        network: "nebulas",
        chainId: 2484,
        urls: {
          apiURL: "https://testnet.u2uscan.xyz/api",
          browserURL: "https://testnet.u2uscan.xyz"
        }
      },
      {
        network: "solaris",
        chainId: 39,
        urls: {
          apiURL: "https://u2uscan.xyz/api",
          browserURL: "https://u2uscan.xyz"
        }
      },
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  },
  solidity: "0.8.28",
};

export default config;
