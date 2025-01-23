import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import { Box } from "../typechain-types/contracts/Box";
import { upgrades } from "hardhat";
import { expect } from "chai";

// Start test block
describe("Proxy", function () {
  const envFilePath = process.env.ENV_FILE_PATH || "./.env.private";
  dotenv.config({ path: envFilePath });

  const { API_URL, PRIVATE_KEY } = process.env;
  const jsonFile = "./artifacts/contracts/Box.sol/Box.json";

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

  let contract;

  beforeEach(async function () {
    // Deploy the contract
   // Deploy the contract with the owner wallet address
  const contract = await upgrades.deployProxy(
    contractFactory,
    [wallet.address], // constructor arguments
    // function call
    { initializer: "initialize" }
  );

    console.log("contract address:", contract.target);
  });

  // Test case
  it("retrieve returns a value previously stored", async function () {
    // Store a value
    const tx = await contract.store(42);
    await tx.wait();

  
    const value = await contract.retrieve();
    console.log(value.toString());

    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    expect(value.toString()).to.equal("42");
  });
});
