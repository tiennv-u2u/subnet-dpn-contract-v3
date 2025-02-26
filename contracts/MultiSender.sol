// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiSender
 * @dev Contract for sending native tokens to multiple addresses in a single transaction
 */
contract MultiSender is Ownable {
    constructor() Ownable(msg.sender) {
    }
    
    // Events
    event TokensDistributed(address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event FundsWithdrawn(address indexed withdrawer, uint256 amount);
    event MaxBatchSizeUpdated(uint256 oldSize, uint256 newSize);
    
    // Maximum batch size to prevent gas limit issues
    uint256 public maxBatchSize = 200;
    
    // Function to receive native tokens
    receive() external payable {}
    
    /**
     * @dev Distribute native tokens from contract balance to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send to each recipient
     */
    function multiSend(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty recipients array");
        require(recipients.length <= maxBatchSize, "Batch too large");
        
        uint256 totalAmount = 0;
        
        // Calculate total amount needed
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        // Check if the contract has enough balance
        require(address(this).balance >= totalAmount, "Insufficient balance");
        
        // Send tokens to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            
            require(recipient != address(0), "Zero address recipient");
            
            (bool success, ) = payable(recipient).call{value: amount}("");
            require(success, "Transfer failed");
        }
        
        emit TokensDistributed(msg.sender, totalAmount, recipients.length);
    }
    
    /**
     * @dev Withdraw all tokens from the contract
     */
    function withdrawAll() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Update the maximum batch size
     * @param newMaxBatchSize New maximum batch size
     */
    function setMaxBatchSize(uint256 newMaxBatchSize) external onlyOwner {
        require(newMaxBatchSize > 0, "Max batch size must be > 0");
        
        uint256 oldSize = maxBatchSize;
        maxBatchSize = newMaxBatchSize;
        
        emit MaxBatchSizeUpdated(oldSize, newMaxBatchSize);
    }
}