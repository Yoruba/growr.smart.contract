"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const deploy_1 = require("../scripts/deploy");
const child_process_1 = require("child_process");
describe('Get Functions', function () {
    let yearContract;
    let owner;
    before(async function () {
        try {
            console.log('Clearing Hardhat cache...');
            (0, child_process_1.execSync)('npx hardhat clean', { stdio: 'inherit' });
            // Recompile the contracts
            console.log('Compiling contracts...');
            (0, child_process_1.execSync)('npx hardhat compile', { stdio: 'inherit' });
            console.log('Compiling TypeScript files...');
            (0, child_process_1.execSync)('npx tsc', { stdio: 'inherit' });
            // Deploy the updated contract
            const { contractFactory, wallet, metadata, provider, contract } = await (0, deploy_1.runDeployment)();
            yearContract = contract;
            owner = wallet;
            // console.log('Contract:', contract)
            console.log('address:', contract.target);
        }
        catch (err) {
            console.error('Error:', err.message);
        }
    });
    describe('getYear', function () {
        it('should return the year', async function () {
            const year = await yearContract.getYear();
            (0, chai_1.expect)(year).to.equal(2024);
        });
    });
    describe('getBalance', function () {
        it('should return the contract balance', async function () {
            const balance = await yearContract.getBalance();
            (0, chai_1.expect)(balance).to.equal(0);
        });
    });
    describe('getCost', function () {
        it('should return the cost', async function () {
            const cost = await yearContract.getCost();
            (0, chai_1.expect)(cost).to.equal(ethers_1.ethers.parseEther('1000'));
        });
    });
    describe('getWithdrawalLimit', function () {
        it('should return the withdrawal limit', async function () {
            const limit = await yearContract.getWithdrawalLimit();
            (0, chai_1.expect)(limit).to.equal(ethers_1.ethers.parseEther('5000'));
        });
    });
    describe('getContribution', function () {
        it('should return the contribution', async function () {
            const contribution = await yearContract.getContribution(owner.address);
            (0, chai_1.expect)(contribution).to.equal(ethers_1.ethers.parseEther('0'));
        });
    });
    describe('getBeneficiary', function () {
        it('should return the beneficiary', async function () {
            const beneficiary = await yearContract.getBeneficiary();
            (0, chai_1.expect)(beneficiary).to.equal('0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4');
        });
    });
});
