// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @custom:security-contact hi@ggrow.io
contract Growr is Initializable, OwnableUpgradeable {
    mapping(address => uint256) public contributions; // keep track of contributions

    event FundsReceived(address sender, uint256 amount, bytes32 txHash);

    // create const for amount to pay for one year
    uint256 public constant ONE_YEAR_COST = 1000;
    uint256 public yearsToTrack;
    bytes32 public txHash;

    // Add an initializer function
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner); // Initialize Ownable
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

     function validateValue(uint256 value) public pure  {
            // check if the amount sent is enough to track for at least one year

            string memory costs =  uintToString(ONE_YEAR_COST);
            require(
                value >= ONE_YEAR_COST,
                string.concat(
                    "You need to send at least ",
                    costs,
                    " wei to track for a year"
                )
            );

            // check if the amount is divisible by the cost of one year
            require(
                value % ONE_YEAR_COST == 0,
                "You need to send a multiple of 1 ether to track for a year"
            );

        }

         function uintToString(uint256 value) public pure returns (string memory) {
        return Strings.toString(value); 
    }

    // Fallback function to receive Ether and validate the amount
    receive() external payable {
       
        // validate the amount sent
        validateValue(msg.value);

            // get the number of years to track
            yearsToTrack = msg.value / ONE_YEAR_COST;
        // Check if the sender has already contributed
        if (contributions[msg.sender] > 0) {
            // Handle the case where the same wallet sends funds again (e.g., revert the transaction)
            revert("Sender has already contributed");
            // todo: handle if the sender adds more funds for more years
        }

        // Record the contribution
        contributions[msg.sender] = msg.value;

        // todo: web3 current year can be found by the tx timestamp
        // todo: web3 add which year to track

        // create a hash of the transaction for tracking and emit an event
        // to trigger the event, we need to pass the hash of the transaction
        txHash = keccak256(
            abi.encodePacked(block.timestamp, msg.sender, msg.value)
        );
        emit FundsReceived(msg.sender, msg.value, txHash);

        // todo: sent, transfer to other wallet
    }
}

// https://shishirsingh66g.medium.com/solidity-part-2-payable-fallback-and-receive-42c00cb75108#:~:text=The%20receive%20the%20function%20is,without%20any%20additional%20data%20or
