import { expect } from 'chai'
import { Wallet, ethers, parseEther } from 'ethers'
import fs from 'fs-extra'
import { YearFactory } from '../../typechain-types'
import { int } from '../../scripts/init'
import { getAddress, upgrade } from '../../scripts/upgrade'

describe('Functions', function () {
	let contract: YearFactory
	let factory: any
	let address: string
	let senderWallet: Wallet
	let thetaProvider: any
	let templateAddress: string
	let proxyAddressYear: string

	before(async function () {
		try {
			const { contractFactory, wallet, provider } = await int()
			const proxyAddress = await getAddress('factory')
			console.log(`01 [TEST] proxy address factory: ${proxyAddress}`)
			templateAddress = await getAddress('template')
			console.log(`02 [TEST] template address: ${templateAddress}`)
			proxyAddressYear = await getAddress('year')
			console.log(`03 [TEST] proxy address year: ${proxyAddressYear}`)
			factory = contractFactory
			address = proxyAddress
			senderWallet = wallet
			thetaProvider = provider
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	// test if template contract is a smart contract address
	it('get year of template', async function () {
		// attach contract
		const contractName = 'Year'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		const yearContract = new ethers.Contract(proxyAddressYear, metadata.abi, thetaProvider)

		const value = await yearContract.getYear()
		expect(value).to.equal(2024)
	})

	it('getImplementation', async function () {
		const template = await contract.getImplementation()
		expect(template).to.equal(templateAddress)
	})

	it('getOwner', async function () {
		const owner = await contract.getOwner()
		expect(owner).to.equal(senderWallet.address)
	})

	it('deployYearContract', async function () {
		try {
			const nounce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			// console.log(`03 [TEST] factory address: ${contract.target}`)

			const template = await contract.getImplementation()
			expect(template).to.equal(templateAddress)

			// Call the getAllYearInfos function
			const yearInfos: [bigint, string][] = await contract.getAllDeployedYears()

			// Process the returned array
			const processedYearInfos = yearInfos.map((yearInfo) => ({
				year: Number(yearInfo[0]),
				contractAddress: yearInfo[1],
			}))

			console.log(`processedYearInfos: ${processedYearInfos}`)

			const lastDeployedYear = processedYearInfos[processedYearInfos.length - 1] || 2000
			const newYear = Number(lastDeployedYear) + 1
			console.log('Year:', newYear.toString())

			const checksumAddress = ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4')
			console.log('Checksum Address:', checksumAddress)

			const tx = await contract.deployYear(newYear, parseEther('1000'), parseEther('5000'), checksumAddress, {
				nonce: nounce,
			})
			await tx.wait()

			// Get all past events (useful for initial loading)
			const filter = contract.filters.YearParams() // All FundsReceived events

			// get last block
			const block = await thetaProvider.getBlockNumber()
			console.log('Block:', block)

			const events = await contract.queryFilter(filter, block - 100, 'latest') // From block 0 to latest
			console.log('events:', events.length)

			//event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit);
			events.forEach((event: any) => {
				console.log(
					`Year: ${event.args?.year.toString()} Cost: ${event.args?.cost.toString()} Withdrawal Limit: ${event.args?.withdrawalLimit.toString()}`
				)
			})

			const createFilter = contract.filters.YearDeployed() // All FundsReceived events
			const createEvents = await contract.queryFilter(createFilter, block - 100, 'latest') // From block 0 to latest
			console.log('events:', events.length)

			//event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit);
			createEvents.forEach((createEvents: any) => {
				// console.log(createEvents)
				console.log(`Deployed Year: ${createEvents.args?.year.toString()} contractAddress: ${createEvents.args?.contractAddress.toString()} `)
			})

			// get last entry of createEvents and get the contract address
			const lastEvent = createEvents[createEvents.length - 1]
			const contractAddress = lastEvent.args?.contractAddress.toString()
			console.log('Contract Address:', contractAddress)

			// attach contract by address
			const contractName = 'Year'
			const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
			const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
			const newContract = new ethers.Contract(contractAddress, metadata.abi, thetaProvider)

			const year = await newContract.getYear()
			console.log('Year:', year)

			const beneficiary = await newContract.getBeneficiary()
			console.log('Beneficiary:', beneficiary)
			expect(beneficiary).to.equal(checksumAddress)

			const deployedYearsAfter = await contract.getAllDeployedYears()
			console.log(deployedYearsAfter[0])

			deployedYearsAfter[0].forEach((yearInfo) => {
				console.log(yearInfo)
			})

			console.log('----------end-----------')
		} catch (err: any) {
			console.error(err)
		}
	})
})
