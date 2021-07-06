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

async function fixture(_wallets: Wallet[], _mockProvider: MockProvider) {
  const [owner, investor] = await ethers.getSigners();

  const _DaiToken: Contract = await deployContract(owner, DaiTokenJSON);
  const _DappToken: Contract = await deployContract(owner, DappTokenJSON);
  const _TokenFarm: Contract = await deployContract(owner, TokenFarmJSON, [
    _DappToken.address,
    _DaiToken.address,
  ]);

  const DaiToken = await _DaiToken.deployed();
  const DappToken = await _DappToken.deployed();
  const TokenFarm = await _TokenFarm.deployed();

  // Transfer all tokens to TokenFarm (1 million)
  await DappToken.transfer(<string>TokenFarm.address, tokens("1000000"));
  //"1000000000000000000000000"

  // Transfer 100 Mock DAI tokens to investor
  await DaiToken.transfer(investor.address, tokens("100"), {
    from: owner.address,
  });
  //"100000000000000000000"

  return {
    DaiToken,
    DappToken,
    TokenFarm,
  };
}

describe("TokenFarm suite", function () {
  it("Contract has the tokens", async function () {
    const {DappToken, TokenFarm} = await loadFixture(fixture);
    const balance: BigNumber = await DappToken.balanceOf(TokenFarm.address);
    assert.equal(balance.toString(), tokens("1000000").toString());
  });

  it("Dai Token has the right name", async function () {
    const {DaiToken} = await loadFixture(fixture);
    assert.strictEqual(await DaiToken.name(), "Mock DAI Token");
  });
});

describe.only("Farming tokens", async function () {
  it("Rewards investors for staking mDai tokens", async function () {
    const {DaiToken} = await loadFixture(fixture);
    const [owner, investor] = await ethers.getSigners();

    //Check investor balance before staking
    const balance: BigNumber = await DaiToken.balanceOf(investor.address);
    const formatedBalance = ethers.utils.formatUnits(balance.toString(), 18);
    expect(formatedBalance).to.equal("100.0", "Incorrect balance before staking");
  });
});
