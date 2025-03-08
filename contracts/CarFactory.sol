

// create factory
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the car contract
import "./Car.sol";

// Create car factory contract
contract CarFactory {
    // Create a public array of car contracts
    Car[] public cars;

    // Function to create a new car contract
    function createCar() public {
        // Create a new car contract
        Car newCar = new Car();
        // Add the new car contract to the array
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