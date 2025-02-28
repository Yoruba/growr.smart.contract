// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:security-contact hi@ggrow.io
contract Year is Initializable, OwnableUpgradeable, UUPSUpgradeable {
	uint256 public year;
	uint256 public cost;
	uint256 public withdrawalLimit;
	address public beneficiary;
	mapping(address => uint256) public contributions; // keep track of contributions

	event FundsReceived(address indexed sender, uint256 amount, uint256 year);
	event Withdrawal(address indexed sender, uint256 amount, address indexed recipient, uint256 year);
	event Trace(string functionCall, string message);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	// Add an initializer function
	function initialize(address _initialOwner, uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public initializer {
		__Ownable_init(_initialOwner); // Initialize Ownable
		__UUPSUpgradeable_init();
		year = _year;
		cost = _cost == 0 ? 1000 ether : _cost;
		withdrawalLimit = _withdrawalLimit == 0 ? 10000 ether : _withdrawalLimit;
		beneficiary = _beneficiary == address(0) ? 0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4 : _beneficiary;
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	// --- setters ---

	function setCost(uint256 _cost) public onlyOwner {
		require(_cost >= 10 ether, "Cost must be greater than 10 Tfuel.");
		cost = _cost;
	}

	function setWithdrawalLimit(uint256 _withdrawalLimit) public onlyOwner {
		require(_withdrawalLimit >= 100 ether, "Withdrawal limit must be greater than 100 Tfuel.");
		withdrawalLimit = _withdrawalLimit;
	}

	function setBeneficiary(address _beneficiary) public onlyOwner {
		beneficiary = _beneficiary;
	}

	// --- getters ---

	function getBalance() public view returns (uint256) {
		return address(this).balance;
	}

	function getYear() public view returns (uint256) {
		return year;
	}

	function getCost() public view returns (uint256) {
		return cost;
	}

	function getWithdrawalLimit() public view returns (uint256) {
		return withdrawalLimit;
	}

	function getContribution(address _contributorAddress) public view returns (uint256) {
		return contributions[_contributorAddress];
	}

	function getBeneficiary() public view returns (address) {
		return beneficiary;
	}

	// --- functions ---

	function withdraw() public onlyOwner {
		uint256 balance = address(this).balance; // Store to avoid repeated calls to balance
		if (balance >= withdrawalLimit) {
			emit Withdrawal(msg.sender, balance, beneficiary, year);
			payable(beneficiary).transfer(balance);
		}
	}

	// create a function to paydirectly to the beneficiary if there is enough balance to pay the cast
	function payDirectly() public onlyOwner {
		uint256 balance = address(this).balance; // Store to avoid repeated calls to balance
		if (balance >= 1 ether) {
			emit Withdrawal(msg.sender, balance, beneficiary, year);
			payable(beneficiary).transfer(balance);
		}
	}

	// This function is triggered when a contract receives plain tfuel (without data). msg.data must be empty
	receive() external payable {
		// validate the amount received
		if (msg.value != cost) revert("Amount is not correct.");

		// an address cannot deposit twice
		require(contributions[msg.sender] == 0);
		// Record the contribution and sum the amount of earlier contributions
		contributions[msg.sender] += msg.value;

		// Emit the FundsReceived event
		emit FundsReceived(msg.sender, msg.value, year);

		withdraw();
	}

	// This function is called when no other function matches the call
	// or when msg.data is not empty
	fallback() external payable {
		emit Trace("fallback", string(msg.data));
		emit FundsReceived(msg.sender, msg.value, year);
	}

	// Function to reset contributions by address for testing only
	function resetContribution(address _contributorAddress) public onlyOwner {
		contributions[_contributorAddress] = 0;
	}
}
