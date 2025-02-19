// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @custom:security-contact hi@ggrow.io
contract Growr is Initializable, OwnableUpgradeable {
	mapping(address => uint256) public contributions; // keep track of contributions

	// todo: indexed
	event FundsReceived(address sender, uint256 amount, bytes32 txHash);
	// event InCorrectAmount(address sender, uint256 amount); // Event for low value
	// event AlreadyKnown(address sender); // Event for already known sender

	// create const for amount to pay for one year
	uint256 public constant ONE_YEAR_COST = 1000;
	uint256 public constant YEAR = 2024;
	bytes32 public txHash;

	// Add an initializer function
	function initialize(address initialOwner) public initializer {
		__Ownable_init(initialOwner); // Initialize Ownable
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function uintToString(uint256 value) public pure returns (string memory) {
		return Strings.toString(value);
	}

	// create function that returns the balance of the contract
	function getBalance() public view returns (uint256) {
		return address(this).balance;
	}

	// create function that returns the year
	function getYear() public pure returns (uint256) {
		return YEAR;
	}

	// Fallback function to receive Ether and validate the amount
	receive() external payable {
		// // validate the amount received
		// require(msg.value == ONE_YEAR_COST, string.concat("Amount is too low. Please send ", uintToString(ONE_YEAR_COST)));
		// emit InCorrectAmount(msg.sender, msg.value);

		// // Check if the sender has already contributed
		// if (contributions[msg.sender] > 0) {
		// 	// Handle the case where the same wallet sends funds again (e.g., revert the transaction)
		// 	emit AlreadyKnown(msg.sender);
		// 	revert("Sender has already contributed");
		// 	// todo: handle if the sender adds more funds for more years
		// }
		// // Record the contribution
		// contributions[msg.sender] = msg.value;

		// create a hash of the transaction for tracking and emit an event
		// to trigger the event, we need to pass the hash of the transaction
		// the receive function doesn't return anything
		// to get the hash of the transaction, read to logs
		txHash = keccak256(abi.encodePacked(block.timestamp, msg.sender, msg.value, YEAR));
		emit FundsReceived(msg.sender, msg.value, txHash);
		// //		todo: sent, transfer to other wallet
	}
}

// https://shishirsingh66g.medium.com/solidity-part-2-payable-fallback-and-receive-42c00cb75108#:~:text=The%20receive%20the%20function%20is,without%20any%20additional%20data%20or
