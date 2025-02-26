// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MultiSenderMock
 * @dev Simple mock contract for testing MasterWallet
 */
contract MultiSenderMock {
    // Simple mock that can receive funds
    receive() external payable {}
}