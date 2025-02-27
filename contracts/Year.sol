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
	function initialize(address initialOwner, uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public initializer {
		__Ownable_init(initialOwner); // Initialize Ownable
		__UUPSUpgradeable_init();
		year = _year;
		cost = _cost == 0 ? 1000 : _cost; 
		withdrawalLimit = _withdrawalLimit == 0 ? 10000 : _withdrawalLimit; 
		// 										   0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4
		beneficiary = _beneficiary == address(0) ? 0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4 : _beneficiary; 
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function setYear(uint256 _year) public onlyOwner {
		year = _year;
	}

	function setCost(uint256 _cost) public onlyOwner {
		cost = _cost;
	}

	function setWithdrawalLimit(uint256 _withdrawalLimit) public onlyOwner {
		withdrawalLimit = _withdrawalLimit;
	}

	function setBeneficiary(address _beneficiary) public onlyOwner {
		beneficiary = _beneficiary;
	}

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

	function getContribution(address contributorAddress) public view returns (uint256) {
		return contributions[contributorAddress];
	}

	function getBeneficiary() public view returns (address) {
		return beneficiary;
	}

	function withdraw() public onlyOwner {
		if (address(this).balance >= withdrawalLimit) {
			uint256 balance = address(this).balance; // Store to avoid repeated calls to balance
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
	function resetContribution(address contributorAddress) public onlyOwner {
		contributions[contributorAddress] = 0;
	}
}
