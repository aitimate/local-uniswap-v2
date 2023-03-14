# UniswapV2 本地部署流程

```shell
# 1 初始阶段，只用执行一次，以后都不用执行(在项目根目录下打开命令行窗口)
npm i
npx hardhat compile
npx hardhat run --network local scripts/init.ts
# 2 部署 UniswapV2
# (1)单独开一个命令行窗口
npx hardhat node
# (2)单独再开一个命令行窗口
npx hardhat run --network local scripts/deploy.ts
```

# Hardhat知识点框架总结
## 测试的三种方法
### 合约层测试
合约也是可以调试的，调试输出信息将展示在hardhat本地网络，使用语法如下: 
```solidity
import "hardhat/console.log";
...
console.log(字符串1，字符串2...);
```
### 单元测试
合约开发完成之后，往往需要逐个函数编写测试脚本进行测试，这种逐个测试的过程叫做单元测试，hardhat提供了我们单元测试的文件夹`test/`，具体使用方法如下:
```ts
// `describe`函数 的回调函数内有`it`|`before`|`each`|`describe`四个测试相关的函数，大致作用描述如下: 
- `it` 测试单元，一般用来模拟一次测试行为，测试单元之间相互独立，状态不传递，每次执行完即区块链恢复
- `before` 在测试单元执行之前执行，一般用来初始化，状态维持到所处describe函数结束，比如: 读取部署账号，加载loadFixture函数
- `beforeeach` 在每个单元测试执行前执行一次，状态随it同生共死，一般用来执行loadFixture函数
- `aftereeach` 在每个单元测试执行后执行一次，状态随it同生共死，很少使用
说明: loadFixture函数是区块链网络闪存函数，在每次执行时直接基于闪存快速恢复区块链网络到闪存时刻，从而免去大量合约的部署过程，节约时间
describe("Transfers", function () {
  it("Should transfer the funds to the owner", async function () {
    const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
      deployOneYearLockFixture
    );

    await time.increaseTo(unlockTime);

    await expect(lock.withdraw()).to.changeEtherBalances(
      [owner, lock],
      [lockedAmount, -lockedAmount]
    );
  });
});
```
### 项目测试
项目测试一般涉及多端联调，因此需要保证区块链网络状态时维持的，持久的，hardhat给我们提供了`scripts/`文件夹，我们可以在这个文件夹下编写部署脚本及持久状态的测试脚本


# 补充
1. `hardhat-abi-exporter` 额外导出ABI接口，详情看配置文件
2. `控制挖块速度`，详情看配置文件
3. 脚本目录新增监听交易池的模拟脚本: mockTrader*.ts
4. 在`Jetbrains`编辑器一键运行`ts`的方法: (1) npm全局安装`ts-node`(2)`IDE`插件: `Run Configuration for TypeScrip`
# 资料
> 说明: 下文的资料是个人一年之前开发的笔记，近年来未曾有详尽的使用和即时的纠正，或有错误之处，请以官方文档为准

## ethers。js
<font style="color:red">**2022/04/07 [警告]：`new ethers.Contract()`会堆积占用内存，不适合大规模实例化，暂时无法解决。**</font>

```js
// 1- 节点实例
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
let accounts = await provider.listAccounts();
// 1.1 - 读取本币
const address = '0x73BCEb1Cd57C711feaC4224D062b0F6ff338501e';
const balance = await provider.getBalance(address);
// 1.2 - 转移本币
const wallet = new ethers.Wallet(privateKey, provider);
const tx = await wallet.sendTransaction({
    to: account2,
    value: ethers.utils.parseEther("0.025")
});
const newBalance = await provider.getBalance(address);
```

```js
// 2- 合约实例
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
];
const contract = new ethers.Contract(address, ERC20_ABI, provider);

// 2.1- 读取合约
const contract = new ethers.Contract(address, ERC20_ABI, provider);
const name = await contract.name()
const symbol = await contract.symbol()
const totalSupply = await contract.totalSupply()
const balance = await contract.balanceOf(address);
// 2.2- [私钥]写入合约
const wallet = new ethers.Wallet(privateKey1, provider)
const contract = new ethers.Contract(address, ERC20_ABI, provider)
const contractWithWallet = contract.connect(wallet)
const tx = await contractWithWallet.transfer(account2, balance)
await tx.wait()
// 2.3- [钱包]写入合约
await window.etherum.request({method:"eht_requestAccounts"});
provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(address, ERC20_ABI, signer);
```

```js
// 3- 事件监听
const contract = new ethers.Contract(address, ERC20_ABI, provider)
const block = await provider.getBlockNumber()
const transferEvents = await contract.queryFilter('Transfer', block - 1, block)

```

```js
// 4- 区块审查
const block = await provider.getBlockNumber()
const blockInfo = await provider.getBlock(block)
const { transactions } = await provider.getBlockWithTransactions(block)
```

## web3.js
> web3.js的笔记过于陈旧和杂乱，部分摘录了较为精华的部分(建议按照ethers.js的纲要自己整理一份，较为清晰)，如下:

```js
const Web3 = require("web3"); // import Web3 from 'web3'

// 网络id
// const chainId = await new web3.eth.getChainId();
// 网络最新区块
// web3.eth.getBlockNumber().then{}
// 交易详情
// web3.eth.getTransaction(交易哈希).then{}

// 0- 节点实例：`infura.io`网站创建项目以获取接入ropsten区块链网络的API
const web3 = new Web3("<rpc地址>");
// const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// 1- 账户余额(网络主代币余额)
web3.eth.getBalance("0xcB7419533E5470fA00Edf05dC46Dee44586010d2")
// + 调用某代币合约接口，查询合约内指定账户的ERC20余额
let tokenContract = await new web3.eth.Contract(ERC20.abi, token.address);
tokenContract.methods.balanceOf("0x123...3080").call();

// 2- 新建账户
let account1 = web3.eth.accounts.create();			// (1) 无密码
console.log(account1)
let account2 = web3.eth.accounts.create("123456");	// (2) 带密码
console.log(account2)
web3.eth.defaultAccount = web3.eth.accounts[0];	// 默认账户，部分函数省略from时使用默认账户，如：
	// web3.eth.sendTransaction()
	// web3.eth.call()

// 3- 查询钱包中的账户列表(异步)
web3.eth.getAccounts((err, accounts) => {
    if (typeof accounts == 'undefined') throw new Error("连接失败，请检查`web3`参数!")
    console.log(accounts)
}).catch(err => {
    console.log(err)
})
web3.isAddress(eth.account[0])	// 检测地址有效性

// 4- 通过私钥获取账户地址
let account3 = web3.eth.accounts.privateKeyToAccount("<私钥>")
console.log(account3)

// 5- 内存钱包添加账户：0xcB7419533E5470fA00Edf05dC46Dee44586010d2
web3.eth.accounts.wallet.add("<私钥>")

// 6- 本币转账交易：web3.eth
let options = {
    from: "..",
    to: "..",
    value: 1000000000000000000,
    gas: 21000,
    gasPrice: 4
}
web3.eth.sendTransaction(options)

// 7- 合约实例
// const contract1json = require('./build/contracts/Xxx.json')
// 参数一为合约的abi 参数二为合约地址，获取已经部署的合约对象
const contract1 = new web3.eth.Contract(contract1json.abi, "地址")
// 合约函数：https://web3js.readthedocs.io/en/v1.5.2/web3-eth-contract.html#id28
// 交易参数：https://web3js.readthedocs.io/en/v1.5.2/web3-eth-contract.html#id14
contract1.methods.xxx(实参).call({交易参数}, 回调函数);  				// 调用view或pure函数
contract1.methods.xxx(实参).send({交易参数(至少from)}, 回调函数);	   // 调用函数
// 部署合约
// contract1.deploy(options)
```
#### 合约实例

```js
// 格式：new web3.eth.Contract(jsonInterface[, address][, options])
	- jsonInterface：[必选]合约abi
	- address：[可选]合约地址
	- options: [可选]交易时的默认参数
let myContract = new web3.eth.Contract([...], '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',	// 可选
    {
        from: '0x1234567890123456789012345678901234567891',
        gasPrice: '20000000000'
    }
);
```

#### 合约属性

##### myContract.options

- <font color="red">**address- String：读取或修改合约地址（返回值为 null 则表示address参数缺省）**</font>
- **jsonInterface- Array：合同的 json 接口，请参见 options.jsonInterface**
- **data- String：合同的字节代码，用于部署合约**
- **from**- String：地址交易应该来自
- **gasPrice**- String：用于交易的天然气价格
- **gas**- Number：为交易提供的最大气体（气体限制）

#### 合约方法

- clone：合约实例克隆
- deploy..send：合约部署(完成后自动解析设置address参数)，返回交易对象
- methods.myMethod.call：合约函数调用(不修改合约状态，不需要Gas费)
- methods.myMethod.send：合约函数调用(改变合约状态，需要Gas费)
- methods.myMethod.estimateGas：合约函数调用时的预计Gas费
- methods.myMethod.encodeABI：合约函数的调用签名

```js
格式： myContract.methods.myMethod(123)
带参数的名称： myContract.methods['myMethod(uint256)'](123)
签名： myContract.methods['0x58cf5f10'](123)
```

- once：单次指定事件监听
- events.MyEvent：指定事件监听
- events.allEvents：任意事件监听
- getPastEvents：历史事件检索