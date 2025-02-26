import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DPNDeployModule = buildModule("DPNDeploy", (m) => {
  // Deploy MultiSender as a proxy implementation
  const multiSenderImplementation = m.contract("MultiSender");
  
  // Deploy the initializer contract
  const initializer = m.contractAt("MultiSender", multiSenderImplementation);
  
  // Get the current deployer account
  const deployer = m.getAccount(0);
  
  // Deploy the proxy
  const multiSenderProxy = m.proxy(initializer, [
    m.staticAddress("0x0000000000000000000000000000000000000000"), // Temporary address
    [deployer], // Initial authorized sender is the deployer
  ]);
  
  // Deploy MasterWallet
  const masterWallet = m.contract("MasterWallet", [
    deployer,
    multiSenderProxy
  ]);
  
  // Update the master wallet address in the MultiSender contract
  const updateTx = m.call(multiSenderProxy, "updateMasterWallet", [masterWallet]);
  
  // Return the deployed contracts
  return {
    multiSenderProxy,
    masterWallet,
  };
});

export default DPNDeployModule;