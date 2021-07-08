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
  it.only("Rewards investors for staking mDai tokens", async function () {
    const {DaiToken, TokenFarm, DappToken} = await loadFixture(fixture);

    const [owner, investor] = await ethers.getSigners();

    //Check investor balance before staking
    let result: BigNumber;
    const balance: BigNumber = await DaiToken.balanceOf(investor.address);
    const formatedBalance = ethers.utils.formatUnits(balance.toString(), 18);
    expect(formatedBalance).to.equal(
      "100.0",
      "Incorrect balance before staking"
    );

    // Stake Mock Dai Tokens
    await DaiToken.connect(investor).approve(TokenFarm.address, tokens("100"));
    await TokenFarm.connect(investor).stakeTokens(tokens("100"));

    //Check staking result
    result = await DaiToken.balanceOf(investor.address);
    assert.strictEqual(
      result.toString(),
      "0",
      "investor Mock Dai wallet balance correct after staking"
    );

    result = await DaiToken.balanceOf(TokenFarm.address);
    assert.strictEqual(
      result.toString(),
      tokens("100").toString(),
      "Token Farm Mock Dai balance correct after staking"
    );

    result = await TokenFarm.stakingBalance(investor.address);
    assert.strictEqual(
      result.toString(),
      tokens("100").toString(),
      "investor staking balance correct after staking"
    );

    result = await TokenFarm.isStaking(investor.address);
    assert.strictEqual(
      result.toString(),
      "true",
      "investor staking status correct after staking"
    );

    // Issue tokens
    await TokenFarm.connect(owner).issueTokens();

    // Check balances after issuance
    result = await DappToken.connect(owner).balanceOf(investor.address);
    assert.strictEqual(
      result.toString(),
      tokens("100").toString(),
      "Investor Dapp token wallet balance after issuance"
    );

    // Ensure that only owner can issue tokens
    await expect(TokenFarm.connect(investor).issueTokens()).to.be.reverted;

    //Unstake tokens
    await TokenFarm.connect(investor).unstakeTokens();

    //Check results after unstaking
    result = await DaiToken.connect(investor).balanceOf(investor.address);
    assert.strictEqual(
      result.toString(),
      tokens("100").toString(),
      "Investor Mock Dai wallet balance correct after staking"
    );

    result = await DaiToken.connect(investor).balanceOf(TokenFarm.address);
    assert.strictEqual(
      result.toString(),
      tokens("0").toString(),
      "Token farm mock dai correct after staking"
    );

    result = await TokenFarm.connect(investor).stakingBalance(investor.address);
    assert.strictEqual(
      result.toString(),
      tokens("0").toString(),
      "Investor staking balance correct after staking"
    );
  });
});
