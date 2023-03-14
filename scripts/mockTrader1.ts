import {ethers} from "ethers";
import UniswapV2Router02Abi
    from "../abi/ethers/contracts/uniswap-v2-periphery/UniswapV2Router02.sol/UniswapV2Router02.json";
import {UniswapV2Router02, Token} from "../typechain-types"
import TokenAbi from "../abi/ethers/contracts/Token.sol/Token.json";

// 1号账户: 普通用户
// Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
// Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
(async () => {
    const RouterAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    const WETHAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const USDTAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const provider = new ethers.providers.JsonRpcProvider(" http://127.0.0.1:8545/");
    const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const UniswapV2Router02 = new ethers.Contract(RouterAddr, UniswapV2Router02Abi, provider) as UniswapV2Router02;
    const WETH = new ethers.Contract(WETHAddr, TokenAbi, provider) as Token;
    const USDT = new ethers.Contract(USDTAddr, TokenAbi, provider) as Token;
    console.log("1- WETH balance of " + wallet.address, (await WETH.balanceOf(wallet.address)).toString())
    console.log("2- USDT balance of " + wallet.address, (await USDT.balanceOf(wallet.address)).toString())

    let receipt =  await (await UniswapV2Router02.connect(wallet).swapExactTokensForTokens(10n ** 18n, 0, [WETHAddr, USDTAddr], wallet.address, new Date().getTime() + 30 * 60)).wait();

    console.log("3- WETH balance of " + wallet.address, (await WETH.balanceOf(wallet.address)).toString())
    console.log("4- USDT balance of " + wallet.address, (await USDT.balanceOf(wallet.address)).toString())
    console.log(receipt)
})();