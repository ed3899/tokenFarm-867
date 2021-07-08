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

  //Get contract factory instances of both tokens
  const [owner] = await ethers.getSigners();
  const TokenFarm: Contract = await ethers.getContractAt(
    "TokenFarm",
    "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  );

  await TokenFarm.connect(owner).issueTokens();

  console.log("Tokens Issued!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
