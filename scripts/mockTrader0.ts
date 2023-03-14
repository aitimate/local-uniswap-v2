import {BigNumber, ethers} from "ethers";
import UniswapV2Router02Abi
    from "../abi/ethers/contracts/uniswap-v2-periphery/UniswapV2Router02.sol/UniswapV2Router02.json";
import TokenAbi from "../abi/ethers/contracts/Token.sol/Token.json";
import {UniswapV2Router02, Token} from "../typechain-types"

// 0号账户: 抢跑机器人 n倍GasPrice
// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
(async () => {
    console.log("0 account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, listener...")
    const RouterAddr = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    const WETHAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const USDTAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const provider = new ethers.providers.JsonRpcProvider(" http://127.0.0.1:8545/");
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
    const UniswapV2Router02 = new ethers.Contract(RouterAddr, UniswapV2Router02Abi, provider) as UniswapV2Router02;
    const WETH = new ethers.Contract(WETHAddr, TokenAbi, provider) as Token;
    const USDT = new ethers.Contract(USDTAddr, TokenAbi, provider) as Token;
    console.log("1- WETH balance of " + wallet.address, (await WETH.balanceOf(wallet.address)).toString())
    console.log("2- USDT balance of " + wallet.address, (await USDT.balanceOf(wallet.address)).toString())

    provider.on("pending", async (tx) => {
        if (tx.data.slice(2, 10) === "38ed1739" && tx.from !== "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") {
            let receipt = await (await UniswapV2Router02.connect(wallet).swapExactTokensForTokens(10n ** 18n, 0, [WETHAddr, USDTAddr], wallet.address, new Date().getTime() + 30 * 60, {
                gasLimit: 30000000,
                gasPrice: (tx.gasPrice as BigNumber).mul(5)
            })).wait();
            console.log("3- WETH balance of " + wallet.address, (await WETH.balanceOf(wallet.address)).toString())
            console.log("4- USDT balance of " + wallet.address, (await USDT.balanceOf(wallet.address)).toString())
            console.log(receipt)
        }
    })
})()
