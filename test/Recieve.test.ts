import { init } from '../scripts/init'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { Growr } from '../typechain-types'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { ErrorDecoder, ErrorType } from 'ethers-decode-error'
import { RpcResponse } from '../interfaces/RpcResponse'
import { console } from 'inspector'
import { Wallet } from 'ethers'

const errorDecoder = ErrorDecoder.create()

describe('receive', function () {
	let contract: Growr
	let factory: any
	let address: string
	let senderWallet: Wallet

	before(async function () {
		try {
			const { contractFactory, wallet } = await init()
			const proxyAddress = await getProxyAddress('unknown-366')
			senderWallet = wallet
			factory = contractFactory
			address = proxyAddress
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	describe('payment status', function () {
		it('should receive ether', async function () {
			console.debug('-------------------')
			console.log('contract', contract)
			const initialBalance = await ethers.provider.getBalance(address)
			console.log('initialBalance', initialBalance.toString())
			// expect(true).to.be.false
		})

		//test if the contract can receive ether
		it('should receive ether', async function () {
			const initialBalance = await ethers.provider.getBalance(address)
			console.log('initialBalance', initialBalance.toString())

			const nonce = await ethers.provider.getTransactionCount(senderWallet.address, 'latest')
			console.log('nonce', nonce)

			//	const value = parseEther('10000000') // 1 ether
			try {
				const transaction = await senderWallet.sendTransaction({
					to: contract.getAddress(),
					value: '5000',
					nonce: nonce,
				})

				const response = await transaction.wait()

				console.log('response', response)

				const finalBalance = await ethers.provider.getBalance(address)
				console.log('finalBalance', finalBalance.toString())

				// Assert that the final balance is initial balance + 1 ether
				expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(5000))
			} catch (error: any) {
				// const rpcResponse = error as RpcResponse
				// const value = rpcResponse.info.payload.params[0].value
				// console.log('value', value)

				// get payload params
				// const payload = error.data

				const { reason, type } = await errorDecoder.decode(error)

				// Prints "ERC20: transfer to the zero address"
				console.log('Revert reason:', reason)
				// Prints "true"
				console.log(type === ErrorType.RevertError)

				console.error(`Transaction failed: ${error.message}`)
				console.log(JSON.stringify(error, null, 2))
				if (isError(error, 'ACTION_REJECTED')) {
					console.error('Error:', error.message)
				}

				if (error.receipt) {
					console.error('Revert reason:', error.receipt.revertReason)
				}
			}
		})
	})
})
