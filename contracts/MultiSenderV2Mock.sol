// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MultiSender.sol";

/**
 * @title MultiSenderV2Mock
 * @dev Mock V2 implementation for testing upgradeability
 */
contract MultiSenderV2Mock is MultiSender {
    /**
     * @dev Returns the version of the contract
     * @return A string indicating the version
     */
    function version() public pure returns (string memory) {
        return "V2";
    }
}