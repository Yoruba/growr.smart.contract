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

	event FundsReceived(address indexed sender, uint256 amount, uint256 year);

	// create const for amount to pay for one year
	uint256 public constant ONE_YEAR_COST = 1000;
	uint256 public constant YEAR = 2024;

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

	// create function that returns the contribution of the sender
	function getContribution(address contributorAddress) public view returns (uint256) {
		return contributions[contributorAddress];
	}

	//  function transferToOwner() public onlyOwner {
		
	// 	// Transfer the balance to the owner
	// 	payable(owner()).transfer(address(this).balance);
    // }


	// Fallback function to receive Ether and validate the amount
	receive() external payable {
		// validate the amount received
		if(msg.value != ONE_YEAR_COST)
		revert(string.concat("Amount is too low. Please send ", uintToString(ONE_YEAR_COST)));
		
		// Check if the sender has already contributed
		if (contributions[msg.sender] >= ONE_YEAR_COST) {
			// Handle the case where the same wallet sends funds again (e.g., revert the transaction)
			// because state is reverted, no events are emitted
			revert("Sender has already contributed");
		}
		else {
		// Record the contribution and sum the amount of earlier contributions
		contributions[msg.sender] += msg.value;
		}


		// the receive function doesn't return anything, therefore we need the read the logs
		emit FundsReceived(msg.sender, msg.value, YEAR);
		 //	todo: sent, transfer to other wallet
	}
}

// https://shishirsingh66g.medium.com/solidity-part-2-payable-fallback-and-receive-42c00cb75108#:~:text=The%20receive%20the%20function%20is,without%20any%20additional%20data%20or
