import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MasterWallet, MultiSenderMock } from "../typechain-types";

describe("MasterWallet Contract", function () {
  let MasterWallet: any;
  let masterWallet: MasterWallet;
  let MultiSenderMock: any;
  let multiSender: MultiSenderMock;
  let newMultiSender: MultiSenderMock;
  let owner: HardhatEthersSigner;
  let nonOwner: HardhatEthersSigner;
  let multiSenderAccount: HardhatEthersSigner;
  let newMultiSenderAccount: HardhatEthersSigner;
  let multiSenderAddress: string;
  let newMultiSenderAddress: string;
  
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    // Get signers
    [owner, nonOwner, multiSenderAccount, newMultiSenderAccount] = await ethers.getSigners();
    
    // Deploy MultiSender mock for testing
    MultiSenderMock = await ethers.getContractFactory("MultiSenderMock");
    multiSender = await MultiSenderMock.deploy() as MultiSenderMock;
    newMultiSender = await MultiSenderMock.deploy() as MultiSenderMock;
    
    multiSenderAddress = await multiSender.getAddress();
    newMultiSenderAddress = await newMultiSender.getAddress();
    
    // Deploy MasterWallet contract
    MasterWallet = await ethers.getContractFactory("MasterWallet");
    masterWallet = await MasterWallet.deploy(owner.address, multiSenderAddress) as MasterWallet;
    
    // Fund the MasterWallet contract
    await owner.sendTransaction({
      to: await masterWallet.getAddress(),
      value: ethers.parseEther("10.0")
    });
  });

  describe("Initialization", function () {
    it("Should initialize with the correct owner", async function () {
      expect(await masterWallet.owner()).to.equal(owner.address);
    });

    it("Should initialize with the correct MultiSender contract", async function () {
      expect(await masterWallet.multiSenderContract()).to.equal(multiSenderAddress);
    });

    it("Should revert if initialized with zero address as MultiSender", async function () {
      await expect(
        MasterWallet.deploy(owner.address, ZERO_ADDRESS)
      ).to.be.revertedWith("MultiSender cannot be zero address");
    });
  });

  describe("MultiSender Contract Management", function () {
    it("Should allow owner to update MultiSender contract", async function () {
      await masterWallet.updateMultiSenderContract(newMultiSenderAddress);
      expect(await masterWallet.multiSenderContract()).to.equal(newMultiSenderAddress);
    });

    it("Should emit event when updating MultiSender contract", async function () {
      await expect(masterWallet.updateMultiSenderContract(newMultiSenderAddress))
        .to.emit(masterWallet, "MultiSenderContractUpdated")
        .withArgs(multiSenderAddress, newMultiSenderAddress);
    });

    it("Should revert when non-owner tries to update MultiSender contract", async function () {
      await expect(
        masterWallet.connect(nonOwner).updateMultiSenderContract(newMultiSenderAddress)
      ).to.be.revertedWithCustomError(masterWallet, "OwnableUnauthorizedAccount");
    });

    it("Should revert when trying to set zero address as MultiSender contract", async function () {
      await expect(
        masterWallet.updateMultiSenderContract(ZERO_ADDRESS)
      ).to.be.revertedWith("Cannot set zero address as MultiSender");
    });
  });
});