import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";
import { Deploy } from "../typechain-types/contracts/Deploy";

// Start test block
describe("Box", function () {
  const envFilePath = process.env.ENV_FILE_PATH || "./.env.private";
  dotenv.config({ path: envFilePath });

  const { API_URL, PRIVATE_KEY } = process.env;
  const jsonFile = "./artifacts/contracts/Deploy.sol/Deploy.json";

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

  let contract: Deploy;

  beforeEach(async function () {
    // Deploy the contract
    contract = (await contractFactory.deploy(wallet.address)) as Deploy;
    // Wait for the deployment transaction to be mined
    await contract.waitForDeployment();

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
