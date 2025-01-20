import * as dotenv from "dotenv";
import { ethers } from "ethers";
import fs from "fs";

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

  console.log(`deployer address ${wallet.address}`);

  const metadata = JSON.parse(fs.readFileSync(jsonFile).toString());

  // Create a contract factory
  const contractFactory = new ethers.ContractFactory(
    metadata.abi,
    metadata.bytecode,
    wallet
  );

  // Deploy the contract
  const contract = await contractFactory.deploy();
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
