// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import {Contract, ContractFactory} from "ethers";
import * as hre from "hardhat";
import {ethers} from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");
  const signers = await ethers.getSigners();

  //Get contract factory instances of both tokens
  const DaiTokenFactory: ContractFactory = await hre.ethers.getContractFactory(
    "DaiToken"
  );
  const DappTokenFactory: ContractFactory = await hre.ethers.getContractFactory(
    "DappToken"
  );
  const TokenFarmFactory: ContractFactory = await hre.ethers.getContractFactory(
    "TokenFarm"
  );

  //Deploy each token
  const DaiToken: Contract = await DaiTokenFactory.deploy();
  const DappToken: Contract = await DappTokenFactory.deploy();
  const TokenFarm: Contract = await TokenFarmFactory.deploy(
    <string>DappToken.address,
    <string>DaiToken.address
  );

  //Wait until they are deployed
  await greeter.deployed();
  const deployedDaiToken: Contract = await DaiToken.deployed();
  const deployedDappToken: Contract = await DappToken.deployed();
  const deployedTokenFarm: Contract = await TokenFarm.deployed();

  // Transfer all tokens to TokenFarm (1 million)
  await deployedDappToken.transfer(
    <string>deployedTokenFarm.address,
    "1000000000000000000000000"
  );

  // Transfer 100 Mock DAI tokens to investor
  await deployedDaiToken.transfer(signers[1].address, "100000000000000000000");

  console.log("Greeter deployed to:", greeter.address);
  console.log(`Dai Token deployed to: ${deployedDaiToken.address}`);
  console.log(`Dapp Token deployed to: ${deployedDappToken.address}`);
  console.log(`Token Farm deployed to: ${deployedTokenFarm.address}`);

  console.log(
    `The list of accounts is: ${await ethers.provider.listAccounts()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
