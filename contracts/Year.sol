// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @custom:security-contact hi@ggrow.io
contract Year is Initializable, OwnableUpgradeable {
	uint256 YEAR;
	mapping(address => uint256) public contributions; // keep track of contributions

	event FundsReceived(address indexed sender, uint256 amount, uint256 year);
	event FundsTransferred(address indexed sender, uint256 amount, address indexed recipient, uint256 year);

	uint256 public constant COST = 1000 * (10 ** 18); // is 1000 tfuel
	uint256 public constant WITHDRAWAL_LIMIT = 5000 * (10 ** 18); // Set your limit here

	// Add an initializer function
	function initialize(address initialOwner) public initializer {
		__Ownable_init(initialOwner); // Initialize Ownable
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	// create function to set year
	function setYear(uint256 _year) public onlyOwner {
		YEAR = _year;
	}

	// create function that returns the balance of the contract
	function getBalance() public view returns (uint256) {
		return address(this).balance;
	}

	// create function that returns the year
	function getYear() public view returns (uint256) {
		return YEAR;
	}
	
	// create function that returns the contribution of the sender
	function getContribution(address contributorAddress) public view returns (uint256) {
		return contributions[contributorAddress];
	}

	function withdraw() public onlyOwner {
		// When balance is 0, revert the transaction with an error message
		if (address(this).balance == 0) {
			revert("Contract balance is zero, nothing to transfer.");
		}

		emit FundsTransferred(msg.sender, address(this).balance, owner(), YEAR);
		// Transfer the balance to the owner
		payable(owner()).transfer(address(this).balance);
	}

	// This function is triggered when a contract receives plain tfuel (without data).
	receive() external payable {
		// validate the amount received
		if (msg.value != COST) revert(string.concat("Amount is not correct."));

		// Record the contribution and sum the amount of earlier contributions
		contributions[msg.sender] += msg.value;

		// Emit the FundsReceived event
		emit FundsReceived(msg.sender, msg.value, YEAR);

		// Check if the balance has reached the withdrawal limit
		if (address(this).balance >= WITHDRAWAL_LIMIT) {
			emit FundsTransferred(address(this), address(this).balance, owner(), YEAR);
			// Transfer the balance to the owner
			payable(owner()).transfer(address(this).balance);
		}
	}
}


// The YearFactory contract manages the deployment of Year contracts.
contract YearFactory is Initializable, OwnableUpgradeable {

    address public implementation; // Address of the Year contract implementation
    mapping(uint256 => address) public deployedYears; // Mapping of year to contract address

    event YearDeployed(uint256 year, address contractAddress);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, address _implementation) public initializer {
        __Ownable_init(initialOwner);
        implementation = _implementation;
    }

    function deployYear(uint256 year) public onlyOwner {
		// check if year is year like YYYY
		require(year >= 2017 && year <= 2060, "Invalid year");


        require(deployedYears[year] == address(0), "Year already deployed");

        // Deploy a new proxy contract pointing to the implementation
        bytes memory data = abi.encodeWithSignature("initialize(address)", owner()); // Initialize with the factory owner as the year contract owner.
		// Proxy Pattern: The factory deploys proxy contracts. Each proxy points to the same Year implementation contract.
		// This is how upgrades work: you deploy a new implementation, and then tell the proxies to point to it.
        ERC1967Proxy proxy = new ERC1967Proxy(implementation, data);

        deployedYears[year] = address(proxy);
        emit YearDeployed(year, address(proxy));
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

   

}