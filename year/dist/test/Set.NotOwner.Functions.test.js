"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const upgrade_year_1 = require("../scripts/year/upgrade.year");
const init_year_1 = require("../scripts/year/init.year");
const ethers_1 = require("ethers");
describe('Set Not Owner Functions', function () {
    let contract;
    let factory;
    let address;
    let owner;
    let nonOwner;
    let thetaProvider;
    before(async function () {
        try {
            const { contractFactory, wallet, provider } = await (0, init_year_1.initYear)();
            const proxyAddress = await (0, upgrade_year_1.getProxyAddress)('unknown-366');
            factory = contractFactory;
            address = proxyAddress;
            thetaProvider = provider;
            owner = wallet;
            contract = await (0, upgrade_year_1.upgrade)(proxyAddress, contractFactory);
            nonOwner = ethers_1.ethers.Wallet.createRandom().connect(provider); // Create a non-owner wallet
        }
        catch (err) {
            console.error('Error:', err.message);
        }
    });
    describe('setCost', function () {
        it('should fail when called by non-owner', async function () {
            const nonce = await thetaProvider.getTransactionCount(nonOwner.address, 'latest');
            const value = (0, ethers_1.parseEther)('9');
            try {
                const tx = await contract.connect(nonOwner).setCost(value, { nonce });
                await tx.wait();
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.not.undefined;
            }
            const cost = await contract.getCost();
            (0, chai_1.expect)(cost).to.be.above((0, ethers_1.parseEther)('1000'));
        });
    });
    describe('setWithdrawalLimit', function () {
        it('should fail when called by non-owner', async function () {
            const nonce = await thetaProvider.getTransactionCount(nonOwner.address, 'latest');
            const value = (0, ethers_1.parseEther)('99');
            try {
                const tx = await contract.connect(nonOwner).setWithdrawalLimit(value, { nonce });
                await tx.wait();
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.not.undefined;
            }
            const withdrawal = await contract.getWithdrawalLimit();
            (0, chai_1.expect)(withdrawal).to.be.above((0, ethers_1.parseEther)('10000'));
        });
    });
    describe('setBeneficiary', function () {
        it('should fail when called by non-owner', async function () {
            const nonce = await thetaProvider.getTransactionCount(nonOwner.address, 'latest');
            const beneficiary = (0, ethers_1.getAddress)('0x5453DcFd995cedB64b401A9B9ea888a3814394fE');
            try {
                const tx = await contract.connect(nonOwner).setBeneficiary(beneficiary, { nonce });
                await tx.wait();
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.not.undefined;
            }
            const beneficiaryAddress = await contract.getBeneficiary();
            (0, chai_1.expect)(beneficiaryAddress).to.not.equal('0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4');
        });
    });
});
