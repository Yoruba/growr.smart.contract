import { expect } from 'chai'
import { initYear } from '../scripts/year/init.year'
import { Wallet } from 'ethers'
import { Year } from '../typechain-types'
import { getAddress, getProxyAddress, upgrade } from '../scripts/year/upgrade.year'

describe('Withdrawal', function () {
	let contract: Year
	let factory: any
	let proxyContractAddress: string
	let senderWallet: Wallet
	let thetaProvider: any
	const beneficiary = '0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4'

	beforeEach(async function () {
		try {
			const { contractFactory, wallet, provider } = await initYear()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			proxyContractAddress = proxyAddress
			senderWallet = wallet
			thetaProvider = provider
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	// transfer all funds of contract to owner
	describe('withdraw', function () {
		it('should withdraw all funds', async function () {
			const initialBalanceContract = await contract.getBalance()
			const initialBalanceSender = await thetaProvider.getBalance(senderWallet.address)
			let additionalFunds = 0n
			console.log('Initial balance sender:', initialBalanceSender.toString())

			const withdrawalLimit = await contract.getWithdrawalLimit()
			console.log('Withdrawal limit:', withdrawalLimit.toString())

			console.log('Initial balance :', initialBalanceContract.toString())
			if (initialBalanceContract <= withdrawalLimit) {
				// send tokens
				additionalFunds = withdrawalLimit
				console.log(`Contract has no funds. Send ${additionalFunds.toString()} to contract`)
				const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
				let transaction = await senderWallet.sendTransaction({
					to: proxyContractAddress,
					value: additionalFunds,
					nonce,
				})

				let response = await transaction.wait()
				expect(response?.status).to.be.equal(1)
			}

			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			let transaction = await contract.withdraw({ nonce })

			let response = await transaction.wait()
			expect(response?.status).to.be.equal(1)

			const contractBalance = await contract.getBalance()
			const beneficiaryBalance = await thetaProvider.getBalance(beneficiary)

			expect(contractBalance).to.equal(0)
			expect(beneficiaryBalance).to.equal(initialBalanceContract + beneficiaryBalance)

			// Get all past events (useful for initial loading)
			const filter = contract.filters.Withdrawal()

			// get last block
			const block = await thetaProvider.getBlockNumber()
			const events = await contract.queryFilter(filter, block - 100, 'latest') // From block 0 to latest

			// event FundsReceived(address indexed sender, uint256 amount, uint256 year);
			events.forEach((event: any) => {
				console.log('Funder:', event.args.sender)
				console.log('Amount:', event.args.amount.toString())
				console.log('Recipient:', event.args.recipient.toString())
				console.log('Year:', event.args.year.toString())
			})
		})
	})
})
