// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./Year.sol";

// @custom:security-contact hi@ggrow.io
// The YearFactory contract manages the deployment of Year contracts.
contract YearFactory is Ownable {
	address public implementation; // Address of the Year contract implementation

	struct YearInfo {
		uint256 year;
		address contractAddress;
	}

	YearInfo[] public deployedYearInfos; // Array to store years with their addresses
	mapping(uint256 => address) public deployedYears; // Mapping of year to contract address
	event YearDeployed(uint256 year, address contractAddress, address beneficiary, address implementation);

	constructor(address _owner, address _implementation) Ownable(msg.sender) {
		require(_owner != address(0), "Owner cannot be the zero address");
		require(_implementation != address(0), "Implementation cannot be the zero address");
		implementation = _implementation;
	}

	// --- getters ---

	// returns the contract address for a given year
	// can be used to interact with the contract or upgrade it
	function getYearContract(uint256 year) public view returns (address) {
		return deployedYears[year];
	}

	function getImplementation() public view returns (address) {
		return implementation;
	}

	function getOwner() public view returns (address) {
		return owner();
	}

	function getAllDeployedYears() public view returns (YearInfo[] memory) {
		return deployedYearInfos;
	}

	// --- setters ---

	// Optional: Function to update the implementation contract (important for upgrades)
	// Allows the owner of the factory to update the implementation contract.
	// This is how you upgrade the Year contract logic.
	function setImplementation(address _implementation) public onlyOwner {
		require(_implementation != address(0), "Implementation cannot be the zero address");
		implementation = _implementation;
	}

	function deployYear(uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public onlyOwner {
		// require(_year >= 2000 && _year <= 2060, "Invalid year");
		// require(deployedYears[_year] == address(0), "Year already deployed");

		Year newYear = new Year();
		newYear.initialize(msg.sender, _year, _cost, _withdrawalLimit, _beneficiary);
		// deployedYearInfos.push(YearInfo({year: _year, contractAddress: address(newYear)}));

		// deployedYears[_year] = address(newYear);

		// emit YearDeployed(_year, address(newYear), _beneficiary, implementation);
	}
}
