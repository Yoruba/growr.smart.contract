const dotenv = require("dotenv");
const { ethers } = require("ethers");
const { upgrades } = require("hardhat");
const fs = require("fs");

// scripts/deploy_upgradeable_box.js

// Get the environment file path from an environment variable
const envFilePath = process.env.ENV_FILE_PATH || "./.env.private";
dotenv.config({ path: envFilePath });

const { API_URL, PRIVATE_KEY } = process.env;
const contractName = "Upgradeable";
const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`;

console.log(API_URL);
console.log(PRIVATE_KEY);

async function main() {
  const provider = new ethers.JsonRpcProvider(API_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY || "", provider);

  console.log(`deployer address ${wallet.address}`);

  const metadata = JSON.parse(fs.readFileSync(jsonFile).toString());

  // Create a contract factory
  const contractFactory = new ethers.ContractFactory(
    metadata.abi,
    metadata.bytecode,
    wallet
  );

  // Deploy the contract with the owner wallet address
  const contract = await upgrades.deployProxy(
    contractFactory,
    [wallet.address], // constructor arguments
    // function call
    { initializer: "initialize" }
  );
  // Wait for the deployment transaction to be mined
  await contract.waitForDeployment();

  console.log("contract address:", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});

module.exports = {}; // Add this line at the end
