"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const init_year_1 = require("../scripts/year/init.year");
const upgrade_year_1 = require("../scripts/year/upgrade.year");
describe('Drain', function () {
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
    describe('drain', function () {
        it('should drain all funds', async function () {
            // get balance of smart contract
            const balanceContract = await contract.getBalance();
            let additional = 0n;
            console.log('Balance contract:', balanceContract.toString());
            const initialBeneficiary = await thetaProvider.getBalance(beneficiary);
            console.log('Balance beneficiary:', initialBeneficiary.toString());
            // ----------- contribute to contract can only be once------------
            if (balanceContract < 1n) {
                // get sender balance
                const senderBalance = await thetaProvider.getBalance(senderWallet.address);
                console.log('Sender balance:', senderBalance.toString());
                // send tokens
                // get cost
                additional = await contract.getCost();
                console.log(`Sender wallet has no funds. Send ${additional.toString()} to contract`);
                const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest');
                let transaction = await senderWallet.sendTransaction({
                    to: proxyContractAddress,
                    value: additional,
                    nonce,
                });
                let response = await transaction.wait();
                (0, chai_1.expect)(response?.status).to.be.equal(1);
                const contractBalance = await contract.getBalance();
                console.log('Contract balance:', contractBalance.toString());
            }
            // owner is the sender not the smart contract
            const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest');
            console.log('Nonce:', nonce);
            let transaction = await contract.drain({ nonce });
            let response = await transaction.wait();
            // console.log('Response:', response)
            (0, chai_1.expect)(response?.status).to.be.equal(1);
            const contractBalance = await contract.getBalance();
            console.log('Contract balance:', contractBalance.toString());
            const finalBalanceBeneficiary = await thetaProvider.getBalance(beneficiary);
            (0, chai_1.expect)(contractBalance).to.equal(0);
            (0, chai_1.expect)(finalBalanceBeneficiary).to.equal(initialBeneficiary + balanceContract + additional);
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
            });
        });
    });
});
