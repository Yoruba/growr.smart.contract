// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Upgradeable.sol";

/// @custom:security-contact hi@ggrow.io
contract Upgrade is Upgradeable {
    uint256 private _value;

    function valueTimesTwo() public view returns (uint256) {
        return _value * 2;
    }
}
