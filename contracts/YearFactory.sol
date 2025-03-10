// create factory
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the year contract
import "./Year.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// Create year factory contract
contract YearFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable {
	// Create a public array of year contracts
	Year[] public yearContractAddresses;
	address public yearImplementationAddress;

	struct YearInfo {
		uint256 year;
		address contractAddress;
	}

	YearInfo[] public deployedYearInfos; // Array to store years with their addresses
	mapping(uint256 => address) public deployedYears; // Mapping of year to contract address
	event YearDeployed(uint256 year, address contractAddress, address beneficiary, address implementation);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	// implement is the template contract that will be used to deploy new Year contracts
	// It must be an implementation and not a proxy.
	function initialize(address _owner, address _implementation) public initializer {
		require(_owner != address(0), "Owner cannot be the zero address");
		__Ownable_init(_owner);
		__UUPSUpgradeable_init();
		yearImplementationAddress = _implementation;
	}

	// --- getters ---

	// returns the contract address for a given year
	// can be used to interact with the contract or upgrade it
	function getYearContractAddress(uint256 year) public view returns (address) {
		return deployedYears[year];
	}

	function getImplementation() public view returns (address) {
		return yearImplementationAddress;
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
		yearImplementationAddress = _implementation;
	}

	// Function to create a new year contract
	function createYear(uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public {
		require(_year >= 2000 && _year <= 2060, "Invalid year");
		require(deployedYears[_year] == address(0), "Year already deployed");
		// Deploy a new proxy contract pointing to the year implementation
		ERC1967Proxy proxy = new ERC1967Proxy(
			yearImplementationAddress,
			abi.encodeWithSelector(Year.initialize.selector, owner(), _year, _cost, _withdrawalLimit, _beneficiary)
		);
		// Cast the proxy address to the Year type and add it to the array
		Year newYear = Year(payable(address(proxy)));
		yearContractAddresses.push(newYear);

		deployedYearInfos.push(YearInfo({year: _year, contractAddress: address(proxy)}));
		deployedYears[_year] = address(proxy);

		emit YearDeployed(_year, address(proxy), _beneficiary, yearImplementationAddress);
	}
}
