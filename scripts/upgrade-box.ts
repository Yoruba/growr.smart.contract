// scripts/deploy_upgradeable_box.js
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { upgrades } from "hardhat";
import fs from "fs";
import { Box } from "../typechain-types/contracts/Box";

// Get the environment file path from an environment variable
const envFilePath = process.env.ENV_FILE_PATH || "./.env.private";
dotenv.config({ path: envFilePath });

const { API_URL, PRIVATE_KEY } = process.env;
const jsonFile = "./artifacts/contracts/Box.sol/Box.json";

console.log(API_URL);
console.log(PRIVATE_KEY);

async function main() {
  const provider = new ethers.JsonRpcProvider(API_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY || "", provider);

  console.log(`deployer address: ${wallet.address}`);

  const metadata = JSON.parse(fs.readFileSync(jsonFile).toString());

  // Create a contract factory
  const contractFactory = new ethers.ContractFactory(
    metadata.abi,
    metadata.bytecode,
    wallet
  );

  // see .openzeppelin/<network>.json for the proxy address
  const proxyAddress = "0xa6b63544177B99b05e41b88F01067ee5bba617ed";
  // Deploy the contract with the owner wallet address
  const contract = await upgrades.upgradeProxy(
    proxyAddress,
    contractFactory
  ) as Box


  // Wait for the deployment transaction to be mined
  await contract.waitForDeployment();

  console.log("proxy address   :", proxyAddress);
  console.log("contract address:", contract.target);

  // test if the value is still stored and the same a before
  const value = await contract.retrieve();
  console.log(value.toString());
  console.log("value is still stored and the same as before:", value.toString() === "42");

  // test if the owner is still the same
  // const owner = await contract.owner();
  // console.log(owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
