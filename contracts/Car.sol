// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Car is Initializable, UUPSUpgradeable, OwnableUpgradeable {
	string public make;
	string public model;
	uint256 public year;

	event CarCreated(string make, string model, uint256 year);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	// Initializer function to set car properties
	function initialize(address _owner, string memory _make, string memory _model, uint256 _year) public initializer {
		__Ownable_init(_owner);
		__UUPSUpgradeable_init();
		make = _make;
		model = _model;
		year = _year;
		emit CarCreated(_make, _model, _year);
	}

	// Function to set car make
	function setMake(string memory _make) public {
		make = _make;
	}

	// Function to set car model
	function setModel(string memory _model) public {
		model = _model;
	}

	// Function to set car year
	function setYear(uint256 _year) public {
		year = _year;
	}

	// Function to get car details
	function getCarDetails() public view returns (string memory, string memory, uint256) {
		return (make, model, year);
	}

	// Function required by UUPSUpgradeable
	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	function getOwner() public view returns (address) {
		return OwnableUpgradeable.owner();
	}
}
