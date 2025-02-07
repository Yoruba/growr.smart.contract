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

	event FundsReceived(address sender, uint256 amount, bytes32 txHash);
	 event LowValueReceived(address sender, uint256 amount); // Event for low value


	// create const for amount to pay for one year
	uint256 public constant ONE_YEAR_COST = 1000;
	uint256 public yearsToTrack;
	bytes32 public txHash;


	// Add an initializer function
	function initialize(address initialOwner) public initializer {
		__Ownable_init(initialOwner); // Initialize Ownable
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	// enum with low, high, between and ok
	enum PaymentStatus {
		Low, // 0
		High, // 1
		Between, // 2
		Ok, // 3
		Multiply, // 4
		Unknown // 5
	}

	function multiplier(uint256 value) public pure returns (bool) {
		return value % ONE_YEAR_COST == 0;
	}

	function validateValue(uint256 value) public pure returns (PaymentStatus) {
		if (value == ONE_YEAR_COST) return PaymentStatus.Ok;
		if (value < ONE_YEAR_COST) return PaymentStatus.Low;
		if (multiplier(value)) return PaymentStatus.Multiply;
		if (!multiplier(value)) return PaymentStatus.Between;
		// todo: check if the amount is too high
		if (value > ONE_YEAR_COST) return PaymentStatus.High;
		return PaymentStatus.Unknown;
	}

	function uintToString(uint256 value) public pure returns (string memory) {
		return Strings.toString(value);
	}

	// Fallback function to receive Ether and validate the amount
	receive() external payable {
		// validate the amount received
		// PaymentStatus status = validateValue(msg.value);
		// // when status if low reject the transaction with a message
		//  if (status == PaymentStatus.Low) {
        //     emit LowValueReceived(msg.sender, msg.value);
        //     revert(string.concat("Amount is too low. Please send ", uintToString(ONE_YEAR_COST), " wei"));
        // }
		// // get the number of years to track
		// yearsToTrack = msg.value / ONE_YEAR_COST;
		// // Check if the sender has already contributed
		// if (contributions[msg.sender] > 0) {
		// 	// Handle the case where the same wallet sends funds again (e.g., revert the transaction)
		// 	revert("Sender has already contributed");
		// 	// todo: handle if the sender adds more funds for more years
		// }
		// // Record the contribution
		// contributions[msg.sender] = msg.value;
		// // todo: web3 current year can be found by the tx timestamp
		// // todo: web3 add which year to track
		// // create a hash of the transaction for tracking and emit an event
		// // to trigger the event, we need to pass the hash of the transaction
		txHash = keccak256(abi.encodePacked(block.timestamp, msg.sender, msg.value));
		emit FundsReceived(msg.sender, msg.value, txHash);
		// todo: sent, transfer to other wallet

	}
}

// https://shishirsingh66g.medium.com/solidity-part-2-payable-fallback-and-receive-42c00cb75108#:~:text=The%20receive%20the%20function%20is,without%20any%20additional%20data%20or
