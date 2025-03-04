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
			templateAddress = process.env.IMPLEMENTATION_ADDRESS || ''
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

		console.log(`Template: ${template} process env: ${process.env.IMPLEMENTATION_ADDRESS} template address: ${templateAddress}`)

		expect(template).to.equal(templateAddress)
		expect(template).to.equal(process.env.IMPLEMENTATION_ADDRESS)
	})

	it('getOwner', async function () {
		const owner = await contract.getOwner()
		expect(owner).to.equal(senderWallet.address)
	})

	// test if implementation contract has all the functions
	it('check implementation contract', async function () {
		const contractName = 'Year'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		const yearContract = new ethers.Contract(templateAddress, metadata.abi, thetaProvider)

		const functions = ['initialize', 'getYear', 'getCost', 'getWithdrawalLimit', 'getBeneficiary']
		for (const func of functions) {
			expect(yearContract[func]).to.be.a('function')
		}

		const year = await yearContract.getYear()
		const cost = await yearContract.getCost()
		const withdrawalLimit = await yearContract.getWithdrawalLimit()
		const beneficiary = await yearContract.getBeneficiary()
		console.log('--- implementation ---')
		console.log(`Year: ${year}, Cost: ${cost}, Withdrawal Limit: ${withdrawalLimit}, Beneficiary: ${beneficiary}`)
	})

	// get for all deployed years the beneficiary address
	it('getAllDeployedYears', async function () {
		const yearInfos: [bigint, string][] = await contract.getAllDeployedYears()

		const processedYearInfos = yearInfos.map((yearInfo) => ({
			year: Number(yearInfo[0]),
			contractAddress: yearInfo[1],
		}))

		const contractName = 'Year'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		for (const yearInfo of processedYearInfos) {
			const contractAddress = yearInfo.contractAddress
			const yearContract = new ethers.Contract(contractAddress, metadata.abi, thetaProvider)
			const beneficiary = await yearContract.getBeneficiary()

			// get year
			const year = await yearContract.getYear()

			// get cost
			const cost = await yearContract.getCost()
			console.log(`Year: ${year}, Year: ${yearInfo.year} Beneficiary: ${beneficiary}, Cost: ${cost}`)
		}
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

			console.log(`processedYearInfos: ${JSON.stringify(processedYearInfos)}`)

			const lastDeployedYear = processedYearInfos[processedYearInfos.length - 1]?.year || 2000

			console.log('Last Deployed Year:', lastDeployedYear)
			const newYear = Number(lastDeployedYear) + 1
			console.log('Year:', newYear.toString())

			const checksumAddress = ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4')
			console.log('Checksum Address:', checksumAddress)

			// initialize(address _initialOwner, uint256 _year, uint256 _cost, uint256 _withdrawalLimit, address _beneficiary)
			// deployYear(uint256 year, uint256 cost, uint256 withdrawalLimit, address beneficiary)
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

			//event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit, address beneficiary);
			events.forEach((event: any) => {
				console.log(
					`Year: ${event.args?.year.toString()} Cost: ${event.args?.cost.toString()} Withdrawal Limit: ${event.args?.withdrawalLimit.toString()} Beneficiary: ${event.args?.beneficiary.toString()}`
				)
			})

			const createFilter = contract.filters.YearDeployed() // All FundsReceived events
			const createEvents = await contract.queryFilter(createFilter, block - 100, 'latest') // From block 0 to latest
			console.log('events:', createEvents.length)

			//event YearDeployed(uint256 year, address contractAddress);
			createEvents.forEach((createEvents: any) => {
				// console.log(createEvents)
				console.log(
					`Deployed Year: ${createEvents.args?.year.toString()} contractAddress: ${createEvents.args?.contractAddress.toString()} beneficiary: ${createEvents.args?.beneficiary.toString()} implementation ${createEvents.args?.implementation.toString()}`
				)
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

			console.log('----------get year-----------')
			const year = await newContract.getYear()
			console.log('Year:', year)

			console.log('----------get beneficiary-----------')
			const beneficiary = await newContract.getBeneficiary()
			console.log('Beneficiary:', beneficiary)
			// fixME: expect(beneficiary).to.equal(checksumAddress)

			console.log('----------get deployed years-----------')
			const deployedYearsAfter: [bigint, string][] = await contract.getAllDeployedYears()
			console.log(
				JSON.stringify(
					deployedYearsAfter.map((yearInfo) => ({
						year: yearInfo[0].toString(), // Convert BigInt to string
						contractAddress: yearInfo[1],
					}))
				)
			)

			deployedYearsAfter[0].forEach((yearInfo) => {
				console.log(yearInfo)
			})

			console.log('----------end-----------')
		} catch (err: any) {
			console.error(err)
		}
	})
})
