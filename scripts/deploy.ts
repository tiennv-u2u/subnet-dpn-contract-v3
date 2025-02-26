// This script is designed to work with Hardhat
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MultiSender contract...");

  // Get the contract factory
  const MultiSender = await ethers.getContractFactory("MultiSender");
  
  // Deploy the contract
  const multiSender = await MultiSender.deploy();
  
  // Wait for deployment to finish
  await multiSender.waitForDeployment();
  
  console.log("MultiSender deployed to:", multiSender.getAddress());
  console.log("Owner address:", await multiSender.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });