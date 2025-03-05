"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const init_year_1 = require("../scripts/year/init.year");
const ethers_1 = require("ethers");
const upgrade_year_1 = require("../scripts/year/upgrade.year");
describe('Receive', function () {
    let contract;
    let factory;
    let contractProxyAddress;
    let senderWallet;
    let thetaProvider;
    beforeEach(async function () {
        try {
            const { contractFactory, wallet, provider } = await (0, init_year_1.initYear)();
            const proxyAddress = await (0, upgrade_year_1.getProxyAddress)('unknown-366');
            factory = contractFactory;
            contractProxyAddress = proxyAddress;
            senderWallet = wallet;
            thetaProvider = provider;
            contract = await (0, upgrade_year_1.upgrade)(proxyAddress, contractFactory);
        }
        catch (err) {
            console.error('Error:', err.message);
        }
    });
    describe('receive', function () {
        it('should not receive ether', async function () {
            const initialBalance = await thetaProvider.getBalance(contractProxyAddress);
            const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest');
            const fundsInWei = (0, ethers_1.parseEther)('999');
            console.log(`Funds in Wei: ${fundsInWei}`);
            try {
                const transaction = await senderWallet.sendTransaction({
                    to: contract.getAddress(),
                    value: fundsInWei,
                    nonce: nonce,
                });
                const response = await transaction.wait();
                (0, chai_1.expect)(response?.status).to.be.equal(0);
                const finalBalance = await thetaProvider.getBalance(contractProxyAddress);
                (0, chai_1.expect)(finalBalance).to.equal(initialBalance);
            }
            catch (err) {
                const error = err;
                console.log(error.shortMessage);
                (0, chai_1.expect)(error.shortMessage).to.be.equal('missing revert data');
            }
        });
        it('should receive ether', async function () {
            const initialBalance = await thetaProvider.getBalance(contractProxyAddress);
            // get contribution of sender
            const contribution = await contract.getContribution(senderWallet.address);
            console.log('Contribution:', contribution.toString());
            if (contribution > 0) {
                console.log('Sender already contributed');
                const finalContributions = await contract.getContribution(senderWallet.address);
                console.log(`Final Contribution: ${finalContributions.toString()}`);
            }
            const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest');
            const funds = '1000';
            const fundsInWei = (0, ethers_1.parseEther)(funds);
            console.log(`Funds in Wei: ${fundsInWei}`);
            const transaction = await senderWallet.sendTransaction({
                to: contractProxyAddress,
                value: fundsInWei,
                nonce: nonce,
            });
            const response = await transaction.wait();
            (0, chai_1.expect)(response?.status).to.be.equal(1);
            const contractBalance = await contract.getBalance();
            console.log('Contract Balance:', contractBalance.toString());
            const finalBalance = await thetaProvider.getBalance(contractProxyAddress);
            console.log('Final Balance:', finalBalance.toString());
            (0, chai_1.expect)(finalBalance).to.equal(BigInt(initialBalance) + BigInt(fundsInWei));
            // Get all past events (useful for initial loading)
            const filter = contract.filters.FundsReceived(); // All FundsReceived events
            // get last block
            const block = await thetaProvider.getBlockNumber();
            console.log('Block:', block);
            // go 5000 blocks back
            const events = await contract.queryFilter(filter, block - 10, 'latest'); // From block 0 to latest
            // event FundsReceived(address indexed sender, uint256 amount, uint256 year);
            events.forEach((event) => {
                console.log('Funder:', event.args.sender);
                console.log('Amount:', event.args.amount.toString());
                console.log('Year:', event.args.year.toString());
            });
        });
    });
});
