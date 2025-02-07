import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, runUpgrade, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Wallet } from 'ethers'

describe('Growr', function () {
	let contract: Growr
	let factory: any
	let address: string
	let senderWallet: Wallet

	before(async function () {
		try {
			const { contractFactory, wallet } = await init()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			address = proxyAddress
			senderWallet = wallet
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	describe('receive', function () {
		it('should receive ether', async function () {
			const initialBalance = await ethers.provider.getBalance(address)
			// console.log('initialBalance', initialBalance.toString())

			const nonce = await ethers.provider.getTransactionCount(senderWallet.address, 'latest')
			// console.log('nonce', nonce)

			const transaction = await senderWallet.sendTransaction({
				to: contract.getAddress(),
				value: '1000',
				nonce: nonce,
			})

			// console.log('transaction', transaction)

			const response = await transaction.wait()

			// Check if the transaction was successful
			expect(response?.status).to.be.equal(1)

			const finalBalance = await ethers.provider.getBalance(address)
			console.log('finalBalance', finalBalance.toString())
			//console.log('response', response)
			// Assert that the final balance is initial balance + 1 ether
			expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(1000))
		})
	})
})
