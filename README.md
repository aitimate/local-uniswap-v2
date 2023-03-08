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
