const dotenv = require("dotenv");
const { ethers } = require("ethers");
const { upgrades } = require("hardhat");
const fs = require("fs");

async function init() {
  console.log("init");
  // Get the environment file path from an environment variable
  try {
    const envFilePath = process.env.ENV_FILE_PATH || "./.env.private";
    dotenv.config({ path: envFilePath });

    const { API_URL, PRIVATE_KEY } = process.env;
    const contractName = "Growr";
    const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`;
    const provider = new ethers.JsonRpcProvider(API_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY || "", provider);

    console.log(`deployer address ${wallet.address}`);

    const metadata = JSON.parse(fs.readFileSync(jsonFile).toString());

    // Create a contract factory
    const contractFactory = new ethers.ContractFactory(
      metadata.abi,
      metadata.bytecode,
      wallet,
    );

    return { contractFactory, wallet };
  } catch (err) {
    console.log("init failed:", err.message);
  }
}

async function deploy(contractFactory, wallet) {
  console.log("deploy");
  try {
    // Deploy the contract with the owner wallet address
    const contract = await upgrades.deployProxy(
      contractFactory,
      [wallet.address], // constructor arguments
      // function call
      { initializer: "initialize" },
    );
    // Wait for the deployment transaction to be mined
    await contract.waitForDeployment();

    console.log("contract address:", contract.target);

    return contract;
  } catch (err) {
    console.log("deploy failed:", err.message);
  }
}

// Export the functions
module.exports = { init, deploy };
