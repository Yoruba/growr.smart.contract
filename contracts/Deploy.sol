// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact hi@ggrow.io
contract Deploy is Ownable {
    uint256 private _value;

    event ValueChanged(uint256 value);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function store(uint256 value) public onlyOwner {
        _value = value;
        emit ValueChanged(value);
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }
}
