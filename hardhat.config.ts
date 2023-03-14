import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-abi-exporter";

const settings = {optimizer: {enabled: true, runs: 200}};
const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  abiExporter: [{ // 额外导出ABI接口: web3和ethers
    runOnCompile: true,
    clear: true,
    path: './abi/web3',
    format: "json"
  }, {
    runOnCompile: true,
    clear: true,
    path: './abi/ethers',
    format: "fullName"
  }],
  networks: {
    hardhat: { // 控制区块挖出速度，默认情况下有交易才挖块
      mining: {
        auto: false,
        interval: 1000
      }
    },
    local: {
      url: "http://127.0.0.1:8545/",
    }
  },
  solidity: {
    compilers: [{
      // For uniswap-v2-core
      version: '0.5.16',
      settings
    }, {
      // For uniswap-v2-periphery
      version: '0.6.6',
      settings
    }, {
      // For arbitrage
      version: '0.8.15',
      settings
    }],
    overrides: {
      "@uniswap/lib/contracts/libraries/FullMath.sol": {
        version: "0.6.6",
        settings
      },
      "@uniswap/lib/contracts/libraries/BitMath.sol": {
        version: "0.6.6",
        settings
      },
      "@uniswap/lib/contracts/libraries/FixedPoint.sol": {
        version: "0.6.6",
        settings
      },
      "contracts/uniswap-v2-periphery/libraries/UniswapV2OracleLibrary.sol": {
        version: "0.6.6",
        settings
      },
    }
  },
  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
};

export default config;