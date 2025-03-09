// create factory
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the car contract
import "./Car.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Create car factory contract
contract CarFactory {
    // Create a public array of car contracts
    Car[] public cars;
      address public carImplementation;

    // Constructor to set the car implementation address
    constructor(address _carImplementation) {
        carImplementation = _carImplementation;
    }

    // Function to create a new car contract
    function createCar(address _owner, string memory _make, string memory _model, uint256 _year) public {
        // // Create a new car contract
        // Car newCar = new Car();
        // // Initialize the new car contract
        // newCar.initialize(_make, _model, _year);
        // // Add the new car contract to the array
        // cars.push(newCar);
          // Deploy a new proxy contract pointing to the car implementation
        ERC1967Proxy proxy = new ERC1967Proxy(
            carImplementation,
            abi.encodeWithSelector(Car.initialize.selector, _owner, _make, _model, _year)
        );
        // Cast the proxy address to the Car type and add it to the array
        Car newCar = Car(address(proxy));
        cars.push(newCar);
    }

    // Function to get the car contract at a specific index
    function getCar(uint256 index) public view returns (Car) {
        return cars[index];
    }

    // Function to get the number of car contracts
    function getNumberOfCars() public view returns (uint256) {
        return cars.length;
    }
}