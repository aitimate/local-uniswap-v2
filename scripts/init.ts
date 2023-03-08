import {keccak256} from "@ethersproject/solidity";
import UniswapV2PairMeta from "../artifacts/contracts/uniswap-v2-core/UniswapV2Pair.sol/UniswapV2Pair.json";
import path from "path";
import fs from "fs";

init()

function init() {
    const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [UniswapV2PairMeta.bytecode])
    console.log("[CHECK] init code in UniswapV2Library.sol : " + COMPUTED_INIT_CODE_HASH)
    let libPath = path.resolve(__dirname, "../contracts/uniswap-v2-periphery/libraries/UniswapV2Library.sol")
    fs.writeFileSync(libPath, fs.readFileSync(libPath).toString().replace("10703f189e744d7346631411acd7d5e40a023a5036d4fde2e541403216fe5586", COMPUTED_INIT_CODE_HASH.substring(2)))
}