"use strict";
// // todo:
// import { ethers } from 'ethers';
// // Define the ABI of the Year contract
// const abi = [
//     // Add other function signatures if needed
//     "function transferOwnership(address newOwner) public",
// ];
// // Define the address of the deployed Year contract
// const contractAddress = "0xYourYearContractAddressHere";
// // Connect to the Ethereum provider (e.g., Infura, Alchemy, or local node)
// const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
// // Define the signer (the current owner of the contract)
// const privateKey = "0xYourPrivateKeyHere";
// const signer = new ethers.Wallet(privateKey, provider);
// // Create a contract instance
// const yearContract = new ethers.Contract(contractAddress, abi, signer);
// async function changeOwner(newOwnerAddress) {
//     try {
//         // Call the transferOwnership function
//         const tx = await yearContract.transferOwnership(newOwnerAddress);
//         console.log("Transaction hash:", tx.hash);
//         // Wait for the transaction to be mined
//         await tx.wait();
//         console.log("Ownership transferred to:", newOwnerAddress);
//     } catch (error) {
//         console.error("Error transferring ownership:", error);
//     }
// }
// // Execute the function with the new owner's address
// const newOwnerAddress = "0xNewOwnerAddressHere";
// changeOwner(newOwnerAddress);
