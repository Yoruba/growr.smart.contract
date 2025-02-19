import { expect } from 'chai'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Wallet, parseEther } from 'ethers'
import exp from 'constants'
import { RpcResponse } from '../interfaces/RpcResponse'

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

	describe('receive', function () {
		it('should not receive ether', async function () {
			const initialBalance = await thetaProvider.getBalance(address)
			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			const fundsInWei = parseEther('999')
			console.log(`Funds in Wei: ${fundsInWei}`)

			try {
				const transaction = await senderWallet.sendTransaction({
					to: contract.getAddress(),
					value: fundsInWei,
					nonce: nonce,
				})

				const response = await transaction.wait()
				expect(response?.status).to.be.equal(0)

				const finalBalance = await thetaProvider.getBalance(address)
				expect(finalBalance).to.equal(initialBalance)
			} catch (err: any) {
				const error = err as RpcResponse
				console.log(error.shortMessage)
				// todo: error
				expect(error.shortMessage).to.be.equal('missing revert data')
			}
		})

		it('should receive ether', async function () {
			// get contribution of sender
			const contribtution = await contract.getContribution(senderWallet.address)

			const initialBalance = await thetaProvider.getBalance(address)
			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			const funds = '1000'
			const fundsInWei = parseEther(funds)
			console.log(`Funds in Wei: ${fundsInWei}`)

			const transaction = await senderWallet.sendTransaction({
				to: contract.getAddress(),
				value: fundsInWei,
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
