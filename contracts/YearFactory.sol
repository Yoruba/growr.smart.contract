// create factory
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the year contract
import "./Year.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Create year factory contract
contract YearFactory {
    // Create a public array of year contracts
    Year[] public yearContracts;
    address public yearImplementation;

  

    // Constructor to set the year implementation address
    constructor(address _yearImplementation) {
        yearImplementation = _yearImplementation;
    }

    // Function to create a new year contract
    function createYear(address _owner, uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary) public {
        // require(_year >= 2000 && _year <= 2060, "Invalid year");
        // require(deployedYears[_year] == address(0), "Year already deployed");
        // Deploy a new proxy contract pointing to the year implementation
        ERC1967Proxy proxy = new ERC1967Proxy(
            yearImplementation,
            abi.encodeWithSelector(Year.initialize.selector, _owner, _year, _cost, _withdrawalLimit, _beneficiary)
        );
        // Cast the proxy address to the Year type and add it to the array
        Year newYear = Year(address(proxy));
        yearContracts.push(newYear);
    }

    // Function to get the year contract at a specific index
    function getYear(uint256 index) public view returns (Year) {
        return yearContracts[index];
    }

    // Function to get the number of year contracts
    function getNumberOfYears() public view returns (uint256) {
        return yearContracts.length;
    }
}