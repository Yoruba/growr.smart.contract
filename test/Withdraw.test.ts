import { expect } from 'chai'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Wallet, ethers, parseEther } from 'ethers'

describe('Growr', function () {
	let contract: Growr
	let factory: any
	let address: string
	let senderWallet: Wallet
	let thetaProvider: any

	beforeEach(async function () {
		try {
			const { contractFactory, wallet, provider } = await init()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			address = proxyAddress
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
			// send funds
			const funds = '1000000000000000000000'
			const fundsInWei = parseEther('1000')
			console.log(`Funds in Wei: ${fundsInWei} and ${funds} diff: ${fundsInWei - BigInt(funds)}`)

			const nonceOwner = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			let transaction = await senderWallet.sendTransaction({
				to: contract.getAddress(),
				value: fundsInWei,
				nonce: nonceOwner,
			})

			let response = await transaction.wait()
			expect(response?.status).to.be.equal(1)

			const initialBalance = await thetaProvider.getBalance(senderWallet.address)
			const contractBalance = await thetaProvider.getBalance(address)

			const nonceInitiator = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')

			// owners is signing the transaction
			transaction = await contract.withdraw({
				nonce: nonceInitiator,
			})

			response = await transaction.wait()
			expect(response?.status).to.be.equal(1)

			const finalBalance = await thetaProvider.getBalance(senderWallet.address)

			console.log(`Initial balance: ${initialBalance} Contract balance: ${contractBalance} Final balance: ${finalBalance}`)

			// difference between initial balance and final balance should be equal to contract balance
			const diff = finalBalance - initialBalance
			console.log(`Difference: ${diff}`)

			expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(contractBalance))

			// Get all past events (useful for initial loading)
			const filter = contract.filters.FundsTransferred()

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
