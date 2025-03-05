"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const init_year_1 = require("../scripts/year/init.year");
const upgrade_year_1 = require("../scripts/year/upgrade.year");
describe('Withdrawal', function () {
    let contract;
    let factory;
    let proxyContractAddress;
    let senderWallet;
    let thetaProvider;
    const beneficiary = '0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4';
    beforeEach(async function () {
        try {
            const { contractFactory, wallet, provider } = await (0, init_year_1.initYear)();
            const proxyAddress = await (0, upgrade_year_1.getProxyAddress)('unknown-366');
            factory = contractFactory;
            proxyContractAddress = proxyAddress;
            senderWallet = wallet;
            thetaProvider = provider;
            contract = await (0, upgrade_year_1.upgrade)(proxyAddress, contractFactory);
        }
        catch (err) {
            console.error('Error:', err.message);
        }
    });
    // transfer all funds of contract to owner
    describe('withdraw', function () {
        it('should withdraw all funds', async function () {
            const initialBalanceContract = await contract.getBalance();
            const initialBalanceSender = await thetaProvider.getBalance(senderWallet.address);
            let additionalFunds = 0n;
            console.log('Initial balance sender:', initialBalanceSender.toString());
            const withdrawalLimit = await contract.getWithdrawalLimit();
            console.log('Withdrawal limit:', withdrawalLimit.toString());
            console.log('Initial balance :', initialBalanceContract.toString());
            if (initialBalanceContract <= withdrawalLimit) {
                // send tokens
                additionalFunds = withdrawalLimit;
                console.log(`Contract has no funds. Send ${additionalFunds.toString()} to contract`);
                const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest');
                let transaction = await senderWallet.sendTransaction({
                    to: proxyContractAddress,
                    value: additionalFunds,
                    nonce,
                });
                let response = await transaction.wait();
                (0, chai_1.expect)(response?.status).to.be.equal(1);
            }
            const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest');
            let transaction = await contract.withdraw({ nonce });
            let response = await transaction.wait();
            (0, chai_1.expect)(response?.status).to.be.equal(1);
            const contractBalance = await contract.getBalance();
            const beneficiaryBalance = await thetaProvider.getBalance(beneficiary);
            (0, chai_1.expect)(contractBalance).to.equal(0);
            (0, chai_1.expect)(beneficiaryBalance).to.equal(initialBalanceContract + beneficiaryBalance);
            // Get all past events (useful for initial loading)
            const filter = contract.filters.Withdrawal();
            // get last block
            const block = await thetaProvider.getBlockNumber();
            const events = await contract.queryFilter(filter, block - 100, 'latest'); // From block 0 to latest
            // event FundsReceived(address indexed sender, uint256 amount, uint256 year);
            events.forEach((event) => {
                console.log('Funder:', event.args.sender);
                console.log('Amount:', event.args.amount.toString());
                console.log('Recipient:', event.args.recipient.toString());
                console.log('Year:', event.args.year.toString());
            });
        });
    });
});
