import { expect } from 'chai'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, runUpgrade, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Wallet } from 'ethers'
import { ethers } from 'hardhat'

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
			// console.log('initialBalance', initialBalance.toString())

			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			// console.log('nonce', nonce)

			const transaction = await senderWallet.sendTransaction({
				to: contract.getAddress(),
				value: '10200',
				nonce: nonce,
			})

			const response = await transaction.wait()
			// const contractAddress = await contract.getAddress()

			// const inCorrectEvent = new ethers.Interface(['event InCorrectAmount(address sender, uint256 amount)'])
			// const alreadyKnownEvent = new ethers.Interface(['event AlreadyKnown(address sender)'])
			// const fundsReceivedEvent = new ethers.Interface(['event FundsReceived(address sender, uint256 amount, bytes32 txHash)'])

			// // console.log(response?.logs)

			// const logs = response?.logs.filter((log) => log.address === contractAddress)

			// //console.log('logs -----', logs)

			// logs?.find((log) => {
			// 	try {
			// 		const parsedLog = fundsReceivedEvent.parseLog(log)
			// 		const incorrectAmount = inCorrectEvent.parseLog(log)
			// 		const parseAlreadyKnown = alreadyKnownEvent.parseLog(log)
			// 		console.log('parsedLog', parsedLog)
			// 		console.log('incorrectAmount', incorrectAmount)
			// 		console.log('parseAlreadyKnown', parseAlreadyKnown)
			// 	} catch (e) {
			// 		console.log('error', e)
			// 		return false
			// 	}
			// })

			// const lowValueReceivedLog = logs?.find((log) => {
			// 	try {
			// 		const parsedLog = inCorrectEvent.parseLog(log)
			// 		return parsedLog?.name === 'InCorrectAmount'
			// 	} catch (e) {
			// 		return false
			// 	}
			// })

			// // Decode the log
			// if (lowValueReceivedLog) {
			// 	const parsedLog = inCorrectEvent.parseLog(lowValueReceivedLog)
			// 	console.log('InCorrectAmount event:', parsedLog?.args)
			// 	expect(parsedLog?.args.sender).to.equal(senderWallet.address)
			// 	expect(parsedLog?.args.amount.toString()).to.equal('1000')
			// } else {
			// 	throw new Error('InCorrectAmount event not found')
			// }

			// Check if the transaction was successful
			expect(response?.status).to.be.equal(1)

			const finalBalance = await thetaProvider.getBalance(address)
			console.log('finalBalance', finalBalance.toString())
			//console.log('response', response)
			// Assert that the final balance is initial balance + 1 ether
			expect(finalBalance).to.equal(BigInt(initialBalance) + BigInt(1000))
		})
	})
})
