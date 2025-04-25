import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ChainSOS contract...");

  const ChainSOS = await ethers.getContractFactory("ChainSOS");
  const chainSOS = await ChainSOS.deploy();

  await chainSOS.waitForDeployment();
  const address = await chainSOS.getAddress();

  console.log(`ChainSOS deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });