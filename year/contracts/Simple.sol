// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Simple {
	// This function is triggered when a contract receives plain tfuel (without data). msg.data must be empty
	receive() external payable {}

	// This function is called when no other function matches the call
	// or when msg.data is not empty
	fallback() external payable {}

	function withdraw() public {	
		uint256 amount = address(this).balance;	
		payable(msg.sender).transfer(amount);
	}
}
