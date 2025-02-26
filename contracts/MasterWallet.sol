// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MasterWallet
 * @dev Contract to manage funds for the MultiSender contract
 */
contract MasterWallet is Ownable {
    address public multiSenderContract;
    
    event FundsSent(uint256 amount);
    event MultiSenderContractUpdated(address indexed oldContract, address indexed newContract);
    
    /**
     * @dev Constructor that sets the owner and the initial MultiSender contract
     * @param initialOwner The owner of this contract
     * @param _multiSenderContract The address of the MultiSender contract
     */
    constructor(address initialOwner, address _multiSenderContract) Ownable(initialOwner) {
        require(_multiSenderContract != address(0), "MultiSender cannot be zero address");
        multiSenderContract = _multiSenderContract;
    }
    
    /**
     * @dev Update the MultiSender contract address
     * @param newMultiSenderContract New MultiSender contract address
     */
    function updateMultiSenderContract(address newMultiSenderContract) external onlyOwner {
        require(newMultiSenderContract != address(0), "Cannot set zero address as MultiSender");
        address oldMultiSenderContract = multiSenderContract;
        multiSenderContract = newMultiSenderContract;
        
        emit MultiSenderContractUpdated(oldMultiSenderContract, newMultiSenderContract);
    }
    
    /**
     * @dev Send funds to the MultiSender contract
     * @param amount Amount of native token to send
     */
    function fundMultiSender(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(multiSenderContract).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsSent(amount);
    }
    
    /**
     * @dev Allows this contract to receive native tokens
     */
    receive() external payable {}
}