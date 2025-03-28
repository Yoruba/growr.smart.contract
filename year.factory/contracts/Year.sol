// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:security-contact hi@ggrow.io
contract Year is Initializable, OwnableUpgradeable, UUPSUpgradeable {
	uint256 private year;
	uint256 private cost;
	uint256 private withdrawalLimit;
	address private beneficiary;
	mapping(address => uint256) private contributions; // keep track of contributions

	event FundsReceived(address indexed sender, uint256 amount, uint256 year);
	event Withdrawal(address indexed sender, uint256 amount, address recipient, uint256 year);
	event Trace(string functionCall, string message);
	event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit, address beneficiary);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	// Add an initializer function. It is a function that is only called once and can be used to set initial values for variables.
	function initialize(address _owner, uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public initializer {
		require(_owner != address(0), "Owner cannot be the zero address");
		require(_beneficiary != address(0), "Beneficiary cannot be the zero address");

		__Ownable_init(_owner); // Initialize Ownable
		__UUPSUpgradeable_init();

		if (_year == 0) {
			year = 2016;
		} else {
			year = _year;
		}

		if (_cost == 0) {
			cost = 1000 ether;
		} else {
			cost = _cost;
		}

		if (_withdrawalLimit == 0) {
			withdrawalLimit = 10000 ether;
		} else {
			withdrawalLimit = _withdrawalLimit;
		}

		if (_beneficiary == address(0)) {
			beneficiary = 0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4;
		} else {
			beneficiary = _beneficiary;
		}

		emit YearParams(year, cost, withdrawalLimit, beneficiary);
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
		require(_beneficiary != address(0), "Beneficiary cannot be the zero address");
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

	function getOwner() public view returns (address) {
		return OwnableUpgradeable.owner();
	}

	// --- functions ---

	function withdraw() public onlyOwner {
		uint256 balance = address(this).balance; // Store to avoid repeated calls to balance
		if (balance >= withdrawalLimit) {
			emit Withdrawal(msg.sender, balance, beneficiary, year);
			payable(beneficiary).transfer(balance);
		}
	}

	function drain() public onlyOwner {
		uint256 balance = address(this).balance;
		emit Withdrawal(msg.sender, balance, beneficiary, year);
		payable(beneficiary).transfer(balance);
	}

	// --- receive functions ---

	// This function is triggered when a contract receives plain tfuel (without data). msg.data must be empty
	receive() external payable {
		// PPif sender is owner, then allow to deposit any amount and do track the contribution
		if (msg.sender == owner()) {
			contributions[msg.sender] += msg.value;
			emit FundsReceived(msg.sender, msg.value, year);
			return;
		}

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
}
