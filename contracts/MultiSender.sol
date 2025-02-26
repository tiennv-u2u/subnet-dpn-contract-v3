// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title MultiSender
 * @dev Contract for sending native tokens to multiple recipients in a single transaction
 * Uses the UUPS upgradeable pattern from OpenZeppelin and can act as its own master wallet
 */
contract MultiSender is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    address public masterWallet;
    mapping(address => bool) public authorizedSenders;
    
    // Events
    event MultiSend(address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event AuthorizedSenderAdded(address indexed sender);
    event AuthorizedSenderRemoved(address indexed sender);
    event MasterWalletUpdated(address indexed oldWallet, address indexed newWallet);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initializes the contract with the master wallet and owner
     * @param _masterWallet The wallet that holds the funds to be distributed
     * @param _initialAuthorizedSenders Array of addresses authorized to call multiSend
     */
    function initialize(
        address _masterWallet, 
        address[] memory _initialAuthorizedSenders
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        // Use a temporary value that will be updated after deployment
        // The contract should ultimately be its own master wallet
        masterWallet = _masterWallet;
        
        for (uint i = 0; i < _initialAuthorizedSenders.length; i++) {
            require(_initialAuthorizedSenders[i] != address(0), "Authorized sender cannot be zero address");
            authorizedSenders[_initialAuthorizedSenders[i]] = true;
            emit AuthorizedSenderAdded(_initialAuthorizedSenders[i]);
        }
    }
    
    /**
     * @dev Sends tokens to multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send to each recipient
     */
    function multiSend(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(authorizedSenders[msg.sender], "Caller is not authorized");
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        require(recipients.length > 0, "Must provide at least one recipient");
        
        uint256 totalAmount = 0;
        
        // Calculate total amount to be sent
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        // Check if there are sufficient funds
        require(address(this).balance >= totalAmount, "Insufficient funds in contract");
        
        // Send tokens to recipients
        bool allSuccess = true;
        for (uint i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot send to zero address");
            
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            if (!success) {
                allSuccess = false;
                break;
            }
        }
        
        require(allSuccess, "One or more transfers failed");
        
        emit MultiSend(msg.sender, totalAmount, recipients.length);
    }
    
    /**
     * @dev Add an address to the authorized senders list
     * @param sender Address to authorize
     */
    function addAuthorizedSender(address sender) external onlyOwner {
        require(sender != address(0), "Cannot authorize zero address");
        require(!authorizedSenders[sender], "Address already authorized");
        
        authorizedSenders[sender] = true;
        emit AuthorizedSenderAdded(sender);
    }
    
    /**
     * @dev Remove an address from the authorized senders list
     * @param sender Address to remove authorization from
     */
    function removeAuthorizedSender(address sender) external onlyOwner {
        require(authorizedSenders[sender], "Address not authorized");
        
        authorizedSenders[sender] = false;
        emit AuthorizedSenderRemoved(sender);
    }
    
    /**
     * @dev Update the master wallet address
     * @param newMasterWallet New master wallet address
     */
    function updateMasterWallet(address newMasterWallet) external onlyOwner {
        require(newMasterWallet != address(0), "Cannot set zero address as master wallet");
        address oldMasterWallet = masterWallet;
        masterWallet = newMasterWallet;
        
        emit MasterWalletUpdated(oldMasterWallet, newMasterWallet);
    }
    
    /**
     * @dev Allows the contract to receive funds
     */
    receive() external payable {}
    
    /**
     * @dev Required by the UUPS module
     * Only the owner can upgrade the implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    /**
     * @dev Withdraw funds from the contract (only owner)
     * @param recipient Address to receive the funds
     * @param amount Amount to withdraw
     */
    function withdraw(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Check the contract's balance
     * @return The contract's balance in native token
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}