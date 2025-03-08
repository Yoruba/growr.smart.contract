// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Car {
    string public make;
    string public model;
    uint256 public year;
    bool private initialized;

    event CarCreated(string make, string model, uint256 year);

    // Modifier to check if the contract is not initialized
    modifier notInitialized() {
        require(!initialized, "Contract is already initialized");
        _;
    }

    // Initializer function to set car properties
    function initialize(string memory _make, string memory _model, uint256 _year) public notInitialized {
        make = _make;
        model = _model;
        year = _year;
        initialized = true;
        emit CarCreated(_make, _model, _year);
    }

    // Function to set car make
    function setMake(string memory _make) public {
        make = _make;
    }

    // Function to set car model
    function setModel(string memory _model) public {
        model = _model;
    }

    // Function to set car year
    function setYear(uint256 _year) public {
        year = _year;
    }

    // Function to get car details
    function getCarDetails() public view returns (string memory, string memory, uint256) {
        return (make, model, year);
    }
}