// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/access/Ownable.sol";

// Make Box inherit from the Ownable contract
// contract Box is Ownable {
//     uint256 private _value;

//     event ValueChanged(uint256 value);

//     constructor(address initialOwner) Ownable(initialOwner) {}

    
//     function store(uint256 value) public onlyOwner {
//         _value = value;
//         emit ValueChanged(value);
//     }

//     function retrieve() public view returns (uint256) {
//         return _value;
//     }
// }

contract Box {
    uint256 private _value;

    // Emitted when the stored value changes
    event ValueChanged(uint256 value);

    // Stores a new value in the contract
    function store(uint256 value) public {
        _value = value;
        emit ValueChanged(value);
    }

    // Reads the last stored value
    function retrieve() public view returns (uint256) {
        return _value;
    }
}