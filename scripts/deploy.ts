// This script is designed to work with Hardhat
import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the MultiSender implementation with UUPS proxy
  const MultiSender = await ethers.getContractFactory("MultiSender");
  
  // Define authorized senders - these addresses can execute the multiSend function
  const authorizedSenders = [
    "0x39F2b8b6B7c772A218fB1a1c438e375047f72d88"
  ];
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  console.log("Deploying MultiSender...");
  
  // Deploy proxy and initialize in one step
  // We'll set the contract itself as its own master wallet after deployment
  const multiSender = await upgrades.deployProxy(
    MultiSender, 
    [
      ZERO_ADDRESS, // Temporary placeholder for master wallet
      authorizedSenders
    ],
    {
      kind: "uups",
      initializer: "initialize",
    }
  );
  await multiSender.waitForDeployment();
  const multiSenderAddress = await multiSender.getAddress();
  console.log("MultiSender proxy deployed to:", multiSenderAddress);

  // Update the master wallet in the MultiSender contract to be the contract itself
  console.log("Updating master wallet to be the contract itself...");
  const updateTx = await multiSender.updateMasterWallet(multiSenderAddress);
  await updateTx.wait();
  console.log("Master wallet updated successfully");

  // Fund the MultiSender contract with 100 U2U
  console.log("Funding MultiSender contract with 100 U2U...");
  const fundTx = await deployer.sendTransaction({
    to: multiSenderAddress,
    value: ethers.parseEther("100"),
  });
  await fundTx.wait();
  console.log("Contract funded successfully");

  // Verify the balance
  const contractBalance = await ethers.provider.getBalance(multiSenderAddress);
  console.log("MultiSender contract balance:", ethers.formatEther(contractBalance), "U2U");

  console.log("Deployment completed");
  console.log("-------------------");
  console.log("MultiSender Proxy:", multiSenderAddress);
  console.log("Contract is its own master wallet");
  console.log("Authorized Senders:", authorizedSenders.join(", "));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });