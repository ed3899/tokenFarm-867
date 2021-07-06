import {expect, assert} from "chai";
import {BigNumber, Contract, ContractFactory, Wallet} from "ethers";
import {MockProvider} from "ethereum-waffle";
import {ethers, waffle} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
const {loadFixture, deployContract} = waffle;

//DAI token ABI
import * as DaiTokenJSON from "../artifacts/contracts/DaiToken.sol/DaiToken.json";

//DappToken ABI
import * as DappTokenJSON from "../artifacts/contracts/DappToken.sol/DappToken.json";

//TokenFarm ABI
import * as TokenFarmJSON from "../artifacts/contracts/TokenFarm.sol/TokenFarm.json";

const tokens = function (n: string): BigNumber {
  return ethers.utils.parseUnits(n, 18);
};
describe.only("TokenFarm suite", function () {
  async function fixture(_wallets: Wallet[], _mockProvider: MockProvider) {
    const signers = await ethers.getSigners();

    const _DaiToken: Contract = await deployContract(signers[0], DaiTokenJSON);
    const _DappToken: Contract = await deployContract(
      signers[0],
      DappTokenJSON
    );
    const _TokenFarm: Contract = await deployContract(
      signers[0],
      TokenFarmJSON,
      [_DappToken.address, _DaiToken.address]
    );

    const DaiToken = await _DaiToken.deployed();
    const DappToken = await _DappToken.deployed();
    const TokenFarm = await _TokenFarm.deployed();

    // Transfer all tokens to TokenFarm (1 million)
    await DappToken.transfer(<string>TokenFarm.address, tokens("1000000"));
    //"1000000000000000000000000"

    // Transfer 100 Mock DAI tokens to investor
    await DaiToken.transfer(signers[1].address, tokens("100"));
    //"100000000000000000000"

    return {
      DaiToken,
      DappToken,
      TokenFarm,
    };
  }

  it("Second account must hold 100000000000000000000 mDai tokens", async function () {
    const {DaiToken, DappToken, TokenFarm} = await loadFixture(fixture);
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const secondAccDaiTokenBalance: BigNumber = await DaiToken.balanceOf(
      signers[1].address
    );
    const formattedBalance: string = ethers.utils.formatUnits(
      secondAccDaiTokenBalance.toString(),
      18
    );

    expect(secondAccDaiTokenBalance.toString()).to.equal(
      tokens("100").toString()
    );
    expect(formattedBalance).to.equal("100.0");
  });

  it("Dai Token has the right name", async function () {
    const {DaiToken} = await loadFixture(fixture);
    assert.strictEqual(await DaiToken.name(), "Mock DAI Token");
  });
});
