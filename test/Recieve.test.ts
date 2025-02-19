import { expect } from 'chai'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Wallet } from 'ethers'

describe('Growr', function () {
	let contract: Growr
	let factory: any
	let address: string
	let senderWallet: Wallet
	let thetaProvider: any

	before(async function () {
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

	describe('receive', function () {
		it('should receive ether', async function () {
			const initialBalance = await thetaProvider.getBalance(address)
			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			const funds = '1000'

			const transaction = await senderWallet.sendTransaction({
				to: contract.getAddress(),
				value: funds,
				nonce: nonce,
			})

			const response = await transaction.wait()
			expect(response?.status).to.be.equal(1)

			const finalBalance = await thetaProvider.getBalance(address)
			expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(funds))

			// Get all past events (useful for initial loading)
			const filter = contract.filters.FundsReceived() // All FundsReceived events

			// get last block
			const block = await thetaProvider.getBlockNumber()
			console.log('Block:', block)
			// go 5000 blocks back

			const events = await contract.queryFilter(filter, block - 10, 'latest') // From block 0 to latest

			// event FundsReceived(address indexed sender, uint256 amount, uint256 year);
			events.forEach((event) => {
				console.log('Funder:', event.args.sender)
				console.log('Amount:', event.args.amount.toString())
				console.log('Year:', event.args.year.toString())
			})
		})
	})
})
