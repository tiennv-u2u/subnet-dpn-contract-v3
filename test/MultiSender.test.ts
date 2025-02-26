import { expect } from "chai";
import { ethers } from "hardhat";

describe("MultiSender", function () {
  let multiSender: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;
  let addrs: any;

  // Deploy the contract before each test
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    const MultiSender = await ethers.getContractFactory("MultiSender");
    multiSender = await MultiSender.deploy();
    await multiSender.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await multiSender.owner()).to.equal(owner.address);
    });

    it("Should set the default max batch size", async function () {
      expect(await multiSender.maxBatchSize()).to.equal(200);
    });
  });

  describe("Ownership", function () {
    it("Should allow ownership transfer", async function () {
      await multiSender.transferOwnership(addr1.address);
      expect(await multiSender.owner()).to.equal(addr1.address);
    });

    it("Should prevent non-owners from transferring ownership", async function () {
      await expect(
        multiSender.connect(addr1).transferOwnership(addr2.address)
      ).to.be.reverted; // Using more generic revert check
    });
  });

  describe("Receive Funds", function () {
    it("Should accept native tokens", async function () {
      const amount = ethers.parseEther("1.0");
      await owner.sendTransaction({
        to: multiSender.address,
        value: amount
      });
      
      const contractBalance = await ethers.provider.getBalance(multiSender.address);
      expect(contractBalance.toString()).to.equal(amount.toString());
    });
  });

//   describe("MultiSend", function () {
//     beforeEach(async function () {
//       // Fund the contract with some ETH
//       await owner.sendTransaction({
//         to: multiSender.address,
//         value: ethers.parseEther("10.0"),
//       });
//     });

//     it("Should distribute tokens to multiple addresses", async function () {
//       const recipients = [addr1.address, addr2.address, addr3.address];
//       const amounts = [
//         ethers.parseEther("1.0"),
//         ethers.parseEther("2.0"),
//         ethers.parseEther("3.0"),
//       ];

//       // Check initial balances
//       const initialBalances = await Promise.all(
//         recipients.map((addr) => ethers.provider.getBalance(addr))
//       );

//       // Execute multi-send
//       await expect(multiSender.multiSend(recipients, amounts))
//         .to.emit(multiSender, "TokensDistributed")
//         .withArgs(
//           owner.address,
//           ethers.parseEther("6.0"),
//           recipients.length
//         );

//       // Check final balances
//       for (let i = 0; i < recipients.length; i++) {
//         const finalBalance = await ethers.provider.getBalance(recipients[i]);
//         expect(finalBalance).to.equal(initialBalances[i] + amounts[i]);
//       }
//     });

//     it("Should fail if arrays length mismatch", async function () {
//       const recipients = [addr1.address, addr2.address, addr3.address];
//       const amounts = [
//         ethers.parseEther("1.0"),
//         ethers.parseEther("2.0"),
//       ];

//       await expect(
//         multiSender.multiSend(recipients, amounts)
//       ).to.be.revertedWith("Arrays length mismatch");
//     });

//     it("Should fail if recipients array is empty", async function () {
//       await expect(
//         multiSender.multiSend([], [])
//       ).to.be.revertedWith("Empty recipients array");
//     });

//     it("Should fail if batch is too large", async function () {
//       // Create arrays larger than maxBatchSize
//       const maxSize = await multiSender.maxBatchSize();
//       const recipients = Array(maxSize.add(1).toNumber()).fill(addr1.address);
//       const amounts = Array(maxSize.add(1).toNumber()).fill(
//         ethers.parseEther("0.1")
//       );

//       await expect(
//         multiSender.multiSend(recipients, amounts)
//       ).to.be.revertedWith("Batch too large");
//     });

//     it("Should fail if contract has insufficient balance", async function () {
//       // Deploy new contract without funding it
//       const MultiSender = await ethers.getContractFactory("MultiSender");
//       const newMultiSender = await MultiSender.deploy();
//       await newMultiSender.waitForDeployment();

//       const recipients = [addr1.address];
//       const amounts = [ethers.parseEther("1.0")];

//       await expect(
//         newMultiSender.multiSend(recipients, amounts)
//       ).to.be.revertedWith("Insufficient balance");
//     });

//     it("Should fail if recipient is zero address", async function () {
//       const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
//       const recipients = [ZERO_ADDRESS];
//       const amounts = [ethers.parseEther("1.0")];

//       await expect(
//         multiSender.multiSend(recipients, amounts)
//       ).to.be.revertedWith("Zero address recipient");
//     });

//     it("Should fail if called by non-owner", async function () {
//       const recipients = [addr2.address];
//       const amounts = [ethers.parseEther("1.0")];

//       await expect(
//         multiSender.connect(addr1).multiSend(recipients, amounts)
//       ).to.be.revertedWith("Ownable: caller is not the owner");
//     });
//   });

//   describe("Withdraw Funds", function () {
//     beforeEach(async function () {
//       // Fund the contract with some ETH
//       await owner.sendTransaction({
//         to: multiSender.address,
//         value: ethers.parseEther("5.0"),
//       });
//     });

//     it("Should allow owner to withdraw all funds", async function () {
//       const contractBalance = await ethers.provider.getBalance(multiSender.address);
//       const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

//       // Withdraw all funds
//       const tx = await multiSender.withdrawAll();
//       const receipt = await tx.wait();
//       const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

//       // Check owner's new balance
//       const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
//       expect(finalOwnerBalance).to.equal(
//         initialOwnerBalance + contractBalance -gasUsed
//       );

//       // Check contract balance is zero
//       const finalContractBalance = await ethers.provider.getBalance(multiSender.address);
//       expect(finalContractBalance).to.equal(0);
//     });

//     it("Should emit FundsWithdrawn event", async function () {
//       const contractBalance = await ethers.provider.getBalance(multiSender.address);

//       await expect(multiSender.withdrawAll())
//         .to.emit(multiSender, "FundsWithdrawn")
//         .withArgs(owner.address, contractBalance);
//     });

//     it("Should fail if no balance to withdraw", async function () {
//       // Deploy new contract without funding it
//       const MultiSender = await ethers.getContractFactory("MultiSender");
//       const newMultiSender = await MultiSender.deploy();
//       await newMultiSender.waitForDeployment();

//       await expect(newMultiSender.withdrawAll()).to.be.revertedWith(
//         "No balance to withdraw"
//       );
//     });

//     it("Should fail if called by non-owner", async function () {
//       await expect(
//         multiSender.connect(addr1).withdrawAll()
//       ).to.be.revertedWith("Ownable: caller is not the owner");
//     });
//   });

//   describe("Max Batch Size", function () {
//     it("Should allow owner to update max batch size", async function () {
//       const newMaxBatchSize = 100;
      
//       await expect(multiSender.setMaxBatchSize(newMaxBatchSize))
//         .to.emit(multiSender, "MaxBatchSizeUpdated")
//         .withArgs(200, newMaxBatchSize);
      
//       expect(await multiSender.maxBatchSize()).to.equal(newMaxBatchSize);
//     });

//     it("Should fail if new max batch size is zero", async function () {
//       await expect(multiSender.setMaxBatchSize(0)).to.be.revertedWith(
//         "Max batch size must be > 0"
//       );
//     });

//     it("Should fail if called by non-owner", async function () {
//       await expect(
//         multiSender.connect(addr1).setMaxBatchSize(100)
//       ).to.be.revertedWith("Ownable: caller is not the owner");
//     });
//   });
});