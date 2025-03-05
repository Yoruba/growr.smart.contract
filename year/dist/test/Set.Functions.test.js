"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const upgrade_year_1 = require("../scripts/year/upgrade.year");
const init_year_1 = require("../scripts/year/init.year");
const ethers_1 = require("ethers");
describe('Set Functions', function () {
    let contract;
    let factory;
    let address;
    let owner;
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
        }
        catch (err) {
            console.error('Error:', err.message);
        }
    });
    describe('setCost', function () {
        it('setCost', async function () {
            const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest');
            const value = (0, ethers_1.parseEther)('1234');
            const tx = await contract.setCost(value, { nonce });
            const response = await tx.wait();
            // console.log('Response:', response)
            //expect(response?.status).to.be.equal(0)
            const cost = await contract.getCost();
            // console.log('Cost:', cost.toString())
            (0, chai_1.expect)(cost).to.equal(value);
        });
        it('setCost to low', async function () {
            const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest');
            const value = (0, ethers_1.parseEther)('9');
            try {
                const tx = await contract.setCost(value, { nonce });
                const response = await tx.wait();
                // console.log('Response:', response)
                //expect(response?.status).to.be.equal(0)
            }
            catch (err) {
                // expect error to be defined
                (0, chai_1.expect)(err).to.be.not.undefined;
            }
            const cost = await contract.getCost();
            // console.log('Cost:', cost.toString())
            (0, chai_1.expect)(cost).to.above((0, ethers_1.parseEther)('1000'));
        });
    });
    describe('setWithdrawalLimit', function () {
        it('setWithdrawalLimit', async function () {
            const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest');
            const value = (0, ethers_1.parseEther)('12345');
            const tx = await contract.setWithdrawalLimit(value, { nonce });
            const response = await tx.wait();
            // console.log('Response:', response)
            //expect(response?.status).to.be.equal(0)
            const withdrawal = await contract.getWithdrawalLimit();
            // console.log('withdrawal:', withdrawal.toString())
            (0, chai_1.expect)(withdrawal).to.equal(value);
        });
        it('setWithdrawalLimit to low', async function () {
            const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest');
            const value = (0, ethers_1.parseEther)('99');
            try {
                const tx = await contract.setWithdrawalLimit(value, { nonce });
                const response = await tx.wait();
                // console.log('Response:', response)
                //expect(response?.status).to.be.equal(0)
            }
            catch (err) {
                // expect error to be defined
                (0, chai_1.expect)(err).to.be.not.undefined;
            }
            const withdrawal = await contract.getWithdrawalLimit();
            // console.log('withdrawal:', withdrawal.toString())
            (0, chai_1.expect)(withdrawal).to.above((0, ethers_1.parseEther)('10000'));
        });
    });
    describe('setBeneficiary', function () {
        it('setBeneficiary', async function () {
            const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest');
            const beneficiary = (0, ethers_1.getAddress)('0x5453DcFd995cedB64b401A9B9ea888a3814394fE');
            const tx = await contract.setBeneficiary(beneficiary, { nonce });
            const response = await tx.wait();
            // console.log('Response:', response)
            //expect(response?.status).to.be.equal(0)
            const beneficiaryAddress = await contract.getBeneficiary();
            // console.log('Beneficiary:', beneficiaryAddress)
            (0, chai_1.expect)(beneficiaryAddress).to.equal(beneficiary);
        });
    });
});
