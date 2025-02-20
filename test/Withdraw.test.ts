import { expect } from 'chai'
import { initYear } from '../scripts/year/init'
import { Wallet } from 'ethers'
import { Year } from '../typechain-types'
import { getProxyAddress, upgrade } from '../scripts/year/upgrade'

describe('Withdrawal', function () {
	let contract: Year
	let factory: any
	let proxyContractAddress: string
	let senderWallet: Wallet
	let thetaProvider: any

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
			const initialBalanceContract = await thetaProvider.getBalance(proxyContractAddress)
			const initialBalanceSender = await thetaProvider.getBalance(senderWallet.address)
			console.log('Initial balance sender:', initialBalanceSender.toString())

			const withdrawalLimit = await contract.getWithdrawalLimit()
			console.log('Withdrawal limit:', withdrawalLimit.toString())

			console.log('Initial balance:', initialBalanceContract.toString())
			if (initialBalanceContract <= withdrawalLimit) {
				// get sender contribution
				const contribution = await contract.getContribution(senderWallet.address)
				console.log('Contribution:', contribution.toString())

				// send tokens
				const fundsInWei = await contract.getCost()
				console.log(`Sender wallet has no funds. Send ${fundsInWei} to contract`)
				const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
				let transaction = await senderWallet.sendTransaction({
					to: proxyContractAddress,
					value: fundsInWei,
					nonce,
				})

				let response = await transaction.wait()
				expect(response?.status).to.be.equal(1)
			}

			const nonce = await thetaProvider.getTransactionCount(proxyContractAddress, 'latest')
			let transaction = await contract.withdraw({ nonce })

			let response = await transaction.wait()
			expect(response?.status).to.be.equal(1)

			const contractBalance = await thetaProvider.getBalance(proxyContractAddress)
			const finalBalance = await thetaProvider.getBalance(senderWallet.address)
			const finalBalanceSender = await thetaProvider.getBalance(senderWallet.address)

			expect(contractBalance).to.equal(0)
			expect(finalBalance).to.equal(0)
			expect(finalBalanceSender).to.equal(initialBalanceSender.add(initialBalanceContract))

			// Get all past events (useful for initial loading)
			const filter = contract.filters.Withdrawal()

			// get last block
			const block = await thetaProvider.getBlockNumber()
			const events = await contract.queryFilter(filter, block - 10, 'latest') // From block 0 to latest

			// event FundsReceived(address indexed sender, uint256 amount, uint256 year);
			events.forEach((event) => {
				console.log('Funder:', event.args.sender)
				console.log('Amount:', event.args.amount.toString())
				console.log('Recipient:', event.args.recipient.toString())
			})
		})
	})
})
