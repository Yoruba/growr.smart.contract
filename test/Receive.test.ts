import { expect } from 'chai'
import { initYear } from '../scripts/year/init'
import { Wallet, parseEther } from 'ethers'
import { Year } from '../typechain-types'
import { RpcResponse } from '../interfaces/RpcResponse'
import { getProxyAddress, upgrade } from '../scripts/year/upgrade'

describe('Receive', function () {
	let contract: Year
	let factory: any
	let contractProxyAddress: string
	let senderWallet: Wallet
	let thetaProvider: any

	beforeEach(async function () {
		try {
			const { contractFactory, wallet, provider } = await initYear()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			contractProxyAddress = proxyAddress
			senderWallet = wallet
			thetaProvider = provider
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	describe('receive', function () {
		it('should not receive ether', async function () {
			const initialBalance = await thetaProvider.getBalance(contractProxyAddress)
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

				const finalBalance = await thetaProvider.getBalance(contractProxyAddress)
				expect(finalBalance).to.equal(initialBalance)
			} catch (err: any) {
				const error = err as RpcResponse
				console.log(error.shortMessage)
				expect(error.shortMessage).to.be.equal('missing revert data')
			}
		})

		it('should receive ether', async function () {
			const initialBalance = await thetaProvider.getBalance(contractProxyAddress)

			// get contribution of sender
			const contribution = await contract.getContribution(senderWallet.address)
			console.log('Contribution:', contribution.toString())

			if (contribution > 0) {
				console.log('Sender already contributed')
				// reset sender contributions
				const resetNonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
				const reset = await contract.resetContribution(senderWallet.address, { nonce: resetNonce })
				const resetResponse = await reset.wait()
				expect(resetResponse?.status).to.be.equal(1)

				const finalContributions = await contract.getContribution(senderWallet.address)

				console.log(`Final Contribution: ${finalContributions.toString()}`)
			}

			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			const funds = '1000'
			const fundsInWei = parseEther(funds)
			console.log(`Funds in Wei: ${fundsInWei}`)

			const transaction = await senderWallet.sendTransaction({
				to: contractProxyAddress,
				value: fundsInWei,
				nonce: nonce,
			})

			const response = await transaction.wait()
			expect(response?.status).to.be.equal(1)

			const contractBalance = await contract.getBalance()
			console.log('Contract Balance:', contractBalance.toString())

			const finalBalance = await thetaProvider.getBalance(contractProxyAddress)
			console.log('Final Balance:', finalBalance.toString())

			expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(fundsInWei))

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
