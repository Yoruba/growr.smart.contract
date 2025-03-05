"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.deploy = deploy;
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upgrade_1 = require("./upgrade");
async function init() {
    try {
        console.log('01 [INIT]');
        const contractName = 'Year';
        const envFilePath = process.env.ENV_FILE_PATH || './.env.private';
        dotenv_1.default.config({ path: envFilePath });
        const { API_URL, PRIVATE_KEY } = process.env;
        const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`;
        const provider = new ethers_1.ethers.JsonRpcProvider(API_URL);
        const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY || '', provider);
        const metadata = JSON.parse(fs_extra_1.default.readFileSync(jsonFile).toString());
        const contractFactory = new ethers_1.ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet);
        // log the constructor arguments from the abi
        console.log('constructor args:', metadata.abi.find((x) => x.type === 'constructor').inputs);
        return { contractFactory, wallet, provider, metadata };
    }
    catch (err) {
        console.error('init factory failed:', err.message);
        throw err;
    }
}
async function deploy(contractFactory, wallet) {
    try {
        const checksumAddressBeneficiary = ethers_1.ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4');
        const contract = await contractFactory.deploy(2024, ethers_1.ethers.parseEther('1000'), ethers_1.ethers.parseEther('5000'), checksumAddressBeneficiary);
        // Wait for the deployment transaction to be mined
        await contract.waitForDeployment();
        (0, upgrade_1.setImplementationAddress)(contract.getAddress().toString());
        console.log(`03 [IMPL] address: ${upgrade_1.ImplementationAddress}`);
        return contract;
    }
    catch (err) {
        console.error('deploy failed:', err.message);
    }
}
