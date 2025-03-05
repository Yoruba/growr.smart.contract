"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDeployment = runDeployment;
const ethers_1 = require("ethers");
const init_1 = require("./init");
const init_2 = require("./init");
async function runDeployment() {
    console.log('00 [SETUP] run');
    const { contractFactory, wallet, metadata, provider } = await (0, init_2.init)();
    const contract = await (0, init_1.deploy)(contractFactory, wallet);
    const address = ((await contract?.getAddress()) || '').toString();
    const yearContract = new ethers_1.ethers.Contract(address, metadata.abi, provider);
    // get value of cost, year, withdrawalLimit and beneficiary
    const value = await yearContract.getYear();
    const cost = await yearContract.getCost();
    const withdrawalLimit = await yearContract.getWithdrawalLimit();
    const beneficiary = await yearContract.getBeneficiary();
    const owner = await yearContract.getOwner();
    console.log(`Owner: ${owner} Year: ${value}, Cost: ${cost}, Withdrawal Limit: ${withdrawalLimit}, Beneficiary: ${beneficiary}`);
    return { contractFactory, wallet, metadata, provider, contract };
}
