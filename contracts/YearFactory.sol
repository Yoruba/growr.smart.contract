// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// @custom:security-contact hi@ggrow.io
// The YearFactory contract manages the deployment of Year contracts.
contract YearFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable {
	address public implementation; // Address of the Year contract implementation

	struct YearInfo {
		uint256 year;
		address contractAddress;
	}

	YearInfo[] public deployedYearInfos; // Array to store years with their addresses
	mapping(uint256 => address) public deployedYears; // Mapping of year to contract address
	event YearDeployed(uint256 year, address contractAddress, address beneficiary, address implementation);
	event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit, address beneficiary);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

	// implement is the template contract that will be used to deploy new Year contracts
	// It must be an implementation and not a proxy.
	function initialize(address initialOwner, address _implementation) public initializer {
		__Ownable_init(initialOwner);
		__UUPSUpgradeable_init();
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
		implementation = _implementation;
	}

	function deployYear(uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public onlyOwner returns (address) {
		require(_year >= 2000 && _year <= 2060, "Invalid year");
		require(deployedYears[_year] == address(0), "Year already deployed");
		emit YearParams(_year, _cost, _withdrawalLimit, _beneficiary);

		bytes memory data = abi.encodeWithSignature(
			"initialize(address, uint256, uint256, uint256, address)",
			msg.sender,
			_year,
			_cost,
			_withdrawalLimit,
			_beneficiary
		);
		ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);

		deployedYears[_year] = address(proxy);
		deployedYearInfos.push(YearInfo({year: _year, contractAddress: address(proxy)}));
		emit YearDeployed(_year, address(proxy), _beneficiary, implementation);
		return address(proxy);
	}
}
