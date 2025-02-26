// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// @custom:security-contact hi@ggrow.io
// The YearFactory contract manages the deployment of Year contracts.
contract YearFactory is Initializable, OwnableUpgradeable {
	address public implementation; // Address of the Year contract implementation
	mapping(uint256 => address) public deployedYears; // Mapping of year to contract address

	event YearDeployed(uint256 year, address contractAddress);
	event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	// implement is the template contract that will be used to deploy new Year contracts
	// It must be an implementation and not a proxy.
	function initialize(address initialOwner, address _implementation) public initializer {
		  console.log("YearFactory initialized with owner:", initialOwner);
        console.log("Implementation address set to:", _implementation);
		__Ownable_init(initialOwner);
		implementation = _implementation;
	}

	// function deployYear(uint256 year, uint256 cost, uint256 withdrawalLimit) public onlyOwner returns (address) { 
	function deployYear() public onlyOwner returns (address) { 
		 console.log("Deploying new Year contract");
		// fixme: require(year >= 2017 && year <= 2060, "Invalid year");
		// fixme: require(deployedYears[year] == address(0), "Year already deployed");
		// emit YearParams(year, cost, withdrawalLimit);

		// bytes memory data = abi.encodeWithSignature("initialize(address,uint256,uint256,uint256)", owner(), year, cost, withdrawalLimit);
				bytes memory data = abi.encodeWithSignature("initialize(address)", owner());

		ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), data);

		// deployedYears[year] = address(proxy);
		// emit YearDeployed(year, address(proxy));
		emit YearDeployed(0, address(proxy));

// return address(proxy);
return implementation;
	}

	// returns the contract address for a given year
	// can be used to interact with the contract or upgrade it
	function getYearContract(uint256 year) public view returns (address) {
		return deployedYears[year];
	}

	// Optional: Function to update the implementation contract (important for upgrades)
	// Allows the owner of the factory to update the implementation contract.
	// This is how you upgrade the Year contract logic.
	function setImplementation(address _implementation) public onlyOwner {
		implementation = _implementation;
	}

	function getImplementation() public view returns (address) {
		return implementation;
	}

	function getOwner() public view returns (address) {
		return owner();
	}
}
