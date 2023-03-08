import {ethers} from "hardhat";
import {Token, UniswapV2Factory, UniswapV2Router02, WETH9} from "../typechain-types";

/*
* 代码流程：
* 1- 代币部署：[WETH9, USDT, TOKN]
* 2- 交易所部署：Uniswap x 2
* 3- 交易对部署：[WETH-TOKN, USDT-TOKN, WETH-USDT] x 2
* */
async function main() {
    const {weth, usdt, tokn} = await deployTokens();
    const {router: router1, factory: factory1} = await deployUniswap(weth);
    const {router: router2, factory: factory2} = await deployUniswap(weth);
    const {weth_usdt} = await createPairs(weth, usdt, tokn, router1, factory1);
    await createPairs(weth, usdt, tokn, router2, factory2);
    // TODO 部署自己的合约
}



async function deployTokens() {
    console.log(`\n${"-".repeat(32) + deployTokens.name + "-".repeat(32)}`);
    const Token = await ethers.getContractFactory("Token");

    const [weth, usdt, tokn] = await Promise.all([
        (await (await ethers.getContractFactory('WETH9')).deploy()).deployed(),
        (await Token.deploy(`USDT TOKEN`, `USDT`)).deployed(),
        (await Token.deploy(`TOKN TOKEN`, `TOKN`)).deployed()
    ])
    console.log(`${"WETH9 deployed to : ".padStart(28)}${weth.address}`);
    console.log(`${"USDT deployed to : ".padStart(28)}${usdt.address}`);
    console.log(`${"TOKN deployed to : ".padStart(28)}${tokn.address}`);

    return {weth, usdt, tokn};
}

async function deployUniswap(weth: WETH9) {
    console.log(`${"-".repeat(32) + deployUniswap.name + "-".repeat(32)}`);

    const factory = await (await (await ethers.getContractFactory('UniswapV2Factory')).deploy((await ethers.getSigners())[0].address)).deployed();
    const router = await (await (await ethers.getContractFactory('UniswapV2Router02')).deploy(factory.address, weth.address)).deployed();
    console.log(`${"Factory deployed to : ".padStart(28)}${factory.address}`);
    console.log(`${"Pair init code is : ".padStart(28)}${await factory.pairCodeHash()}`);
    console.log(`${"Router deployed to : ".padStart(28)}${router.address}`);

    return {factory, router};
}

async function createPairFactory(router: UniswapV2Router02, factory: UniswapV2Factory) {
    const deadline = Math.floor((new Date()).getTime() / 1000) + 20 * 60;
    const amountOf = (num: number) => (10n ** 18n * BigInt(num)).toString();
    const toAddress = (await ethers.getSigners())[0].address;
    return async (tokenA: string, tokenB: string, numA: number, numB: number) => {
        let tx = await router.addLiquidity(tokenA, tokenB, amountOf(numA), amountOf(numB), amountOf(numA), amountOf(numB), toAddress, deadline);
        let receipt = await tx.wait();
        let log = receipt.logs.filter((log) => log.address === factory.address)[0];
        return factory.interface.decodeFunctionResult("createPair", log.data).pair;
    }
}


async function createPairs(weth: WETH9, usdt: Token, tokn: Token, router: UniswapV2Router02, factory: UniswapV2Factory) {
    console.log(`${"-".repeat(11) + createPairs.name + `[${router.address}]` + "-".repeat(11)}`);
    // 1- Approve router
    const MAX = 2n ** 256n - 1n;
    await Promise.all([
        weth.approve(router.address, MAX),
        usdt.approve(router.address, MAX),
        tokn.approve(router.address, MAX)
    ]);
    // 2- Add Liquidity
    const createPair = await createPairFactory(router, factory);
    const [weth_tokn, usdt_tokn, weth_usdt] = await Promise.all([
        createPair(weth.address, tokn.address, 10, 100),
        createPair(usdt.address, tokn.address, 10, 100),
        createPair(weth.address, usdt.address, 100, 100)
    ]);
    console.log(`${"WETH-TOKN Liquidity : ".padStart(28)}${weth_tokn}`);
    console.log(`${"USDT-TOKN Liquidity : ".padStart(28)}${usdt_tokn}`);
    console.log(`${"WETH-USDT Liquidity : ".padStart(28)}${weth_usdt}`);

    return {weth_tokn, usdt_tokn, weth_usdt};
}

main().then(() => console.log(" ")).catch(console.error);
