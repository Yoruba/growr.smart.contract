// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Make Box inherit from the Ownable contract
contract Box is Initializable, OwnableUpgradeable {
    uint256 private _value;

    event ValueChanged(uint256 value);

    // Add an initializer function
    function initialize(address initialOwner) public initializer {
          __Ownable_init(initialOwner); // Initialize Ownable
    }

/// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}
    
    function store(uint256 value) public onlyOwner {
        _value = value;
        emit ValueChanged(value);
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }
}

