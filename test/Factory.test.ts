import { expect } from 'chai'
import { getAddress, upgrade } from '../scripts/upgrade'
import { int } from '../scripts/init'
import { Wallet, ethers, parseEther } from 'ethers'
import { YearFactory, YearFactoryInterface } from '../typechain-types/contracts/YearFactory'
import fs from 'fs-extra'
import { RpcResponse } from '../interfaces/RpcResponse'
import { extractError } from '../scripts/helpers/RpcErrorResponseExtractor'

describe('Functions', function () {
	let contract: YearFactory
	let factory: any
	let address: string
	let senderWallet: Wallet
	let thetaProvider: any
	let templateAddress: string

	before(async function () {
		try {
			const { contractFactory, wallet, provider } = await int()
			const proxyAddress = await getAddress('factory')
			templateAddress = await getAddress('template')
			factory = contractFactory
			address = proxyAddress
			senderWallet = wallet
			thetaProvider = provider
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	// // test if template contract is a smart contract address
	// it('get year of template', async function () {
	// 	// attach contract
	// 	const contractName = 'Year'
	// 	const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`

	// 	//console.log(`deployer address: ${wallet.address}`)

	// 	const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

	// 	const yearContract = new ethers.Contract(templateAddress, metadata.abi, senderWallet)

	// 	const value = await yearContract.getYear()
	// 	// console.log('year:', value)
	// 	expect(value).to.equal(2024)
	// })

	// it('getImplementation', async function () {
	// 	const template = await contract.getImplementation()
	// 	expect(template).to.equal(templateAddress)
	// })

	// it('getOwner', async function () {
	// 	const owner = await contract.getOwner()
	// 	expect(owner).to.equal(senderWallet.address)
	// })

	it('deployYearContract', async function () {
		try {
			const nounce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			// const yearContract = await contract.deployYear(2027, parseEther('1000'), parseEther('5000'), { nonce: nounce })

			const template = await contract.getImplementation()
			expect(template).to.equal(templateAddress)

			const yearContract = await contract.deployYear({ nonce: nounce })
			// expect(yearContract).to.be.a('string')

			// Get all past events (useful for initial loading)
			const filter = contract.filters.YearParams() // All FundsReceived events

			// get last block
			const block = await thetaProvider.getBlockNumber()
			console.log('Block:', block)

			const events = await contract.queryFilter(filter, block - 100, 'latest') // From block 0 to latest
			console.log('events:', events.length)

			//event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit);
			events.forEach((event) => {
				console.log(
					`Year: ${event.args?.year.toString()} Cost: ${event.args?.cost.toString()} Withdrawal Limit: ${event.args?.withdrawalLimit.toString()}`
				)
			})

			console.log('end', 1234)
			// console.log('year contract:', yearContract)
		} catch (err: any) {
			console.log(3333)
			console.log(err)
			console.log(3333)
			// console.error('Error:', err.message)
			// const rpcResponse = err as RpcResponse
			// console.log('Error:', rpcResponse.data)
		}
	})

	// it('getYearContract', async function () {
	// 	const yearContract = await contract.getYearContract(2024)
	// 	console.log('year contract:', yearContract)
	// 	expect(yearContract).to.be.a('string')
	// })
})
