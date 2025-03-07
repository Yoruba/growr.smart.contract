import { expect } from 'chai'
import { execSync } from 'child_process'
import { AbiCoder, Wallet, ethers, keccak256, parseEther, toUtf8Bytes } from 'ethers'
import fs from 'fs-extra'
import { DeployParams } from '../scripts/DeployParams'
import { buildDeployParams } from '../scripts/buildDeployParams'
import { YearFactory } from '../typechain-types'
import { Deployer } from '../scripts/Deployer'
import { join, resolve } from 'path'
import { get } from 'http'

describe('Functions', function () {
	let contract: YearFactory
	let factory: any
	let senderWallet: Wallet
	let thetaProvider: any
	// we don't use proxy with factory testing because the factory is creating proxy for year
	let addressYearContract: string
	let proxyAddressFactory: string
	const deployParams: DeployParams = buildDeployParams()

	before(async function () {
		try {
			console.log('Clearing Hardhat cache...')
			execSync('npx hardhat clean', { stdio: 'inherit' })

			// Recompile the contracts
			console.log('Compiling contracts...')
			execSync('npx hardhat compile', { stdio: 'inherit' })

			const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
			// fixme: address of year contract can be read from year address txt
			addressYearContract = '0x4815592a9368F86dD269969ba828Ad2385dFe856'
			senderWallet = deployer.wallet
			contract = await deployer.deployProxy([senderWallet.address, addressYearContract])
			thetaProvider = deployer.provider
			factory = deployer.contractFactory
			const owner = await contract.getOwner()
			console.log('Owner:', owner)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	// test if template contract is a smart contract address
	// --- is already not set because we are using implementation address
	// it('get year of contract', async function () {
	// 	// attach contract
	// 	const contractName = 'Year'
	// 	const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`

	// 	const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
	// 	const yearContract = new ethers.Contract(addressYearContract, metadata.abi, thetaProvider)

	// 	const value = await yearContract.getYear()
	// 	const cost = await yearContract.getCost()
	// 	const withdrawalLimit = await yearContract.getWithdrawalLimit()
	// 	const beneficiary = await yearContract.getBeneficiary()

	// 	// log the values in 1 line
	// 	console.log(`[TEST] Year: ${value}, Cost: ${cost}, Withdrawal Limit: ${withdrawalLimit}, Beneficiary: ${beneficiary}`)

	// 	expect(value).to.equal(2024)
	// 	expect(cost).to.equal(parseEther('1000'))
	// 	expect(withdrawalLimit).to.equal(parseEther('5000'))
	// 	expect(beneficiary).to.equal('0xe873f6a0e5C72aD7030bB4e0D3B3005C8C087Df4')
	// })

	it('getImplementation', async function () {
		const template = await contract.getImplementation()
		expect(template).to.equal(addressYearContract)
	})

	it('getOwner', async function () {
		const owner = await contract.getOwner()
		expect(owner).to.equal(senderWallet.address)
	})

	// get for all deployed years the beneficiary address
	// it('getAllDeployedYears', async function () {
	// 	const yearInfos: [bigint, string][] = await contract.getAllDeployedYears()

	// 	const processedYearInfos = yearInfos.map((yearInfo) => ({
	// 		year: Number(yearInfo[0]),
	// 		contractAddress: yearInfo[1],
	// 	}))
	// 	// Get the current working directory
	// 	const metadata = getAbi()
	// 	for (const yearInfo of processedYearInfos) {
	// 		const contractAddress = yearInfo.contractAddress
	// 		const yearContract = new ethers.Contract(contractAddress, metadata.abi, thetaProvider)
	// 		const beneficiary = await yearContract.getBeneficiary()

	// 		// get year
	// 		const year = await yearContract.getYear()

	// 		// get cost
	// 		const cost = await yearContract.getCost()
	// 		console.log(`Year: ${year}, Year: ${yearInfo.year} Beneficiary: ${beneficiary}, Cost: ${cost}`)
	// 	}
	// })

	// it('get template props', async function () {
	// 	const metadata = getAbi()
	// 	const yearContract = new ethers.Contract(addressYearContract, metadata.abi, thetaProvider)
	// 	const beneficiary = await yearContract.getBeneficiary()

	// 	// get year
	// 	const year = await yearContract.getYear()

	// 	// get cost
	// 	const cost = await yearContract.getCost()
	// 	console.log(`Year: ${year}, Beneficiary: ${beneficiary}, Cost: ${cost}`)
	// })

	it('deployYearContract', async function () {
		try {
			const nounce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			// console.log(`03 [TEST] factory address: ${contract.target}`)

			const template = await contract.getImplementation()
			expect(template).to.equal(addressYearContract)

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
			const tx = await contract.deployYear(newYear, parseEther('1000'), parseEther('5000'), checksumAddress)
			await tx.wait()

			// get year address by year
			const yearAddress = await contract.getYearContract(newYear)
			console.log('Year Address---:', yearAddress)

			// Get all past events (useful for initial loading)
			// const filter = contract.filters.YearParams() // All FundsReceived events

			// // get last block
			const block = await thetaProvider.getBlockNumber()
			// console.log('Block:', block)

			// const events = await contract.queryFilter(filter, block - 100, 'latest') // From block 0 to latest
			// console.log('events:', events.length)

			// //event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit, address beneficiary);
			// events.forEach((event: any) => {
			// 	console.log(
			// 		`Year: ${event.args?.year.toString()} Cost: ${event.args?.cost.toString()} Withdrawal Limit: ${event.args?.withdrawalLimit.toString()} Beneficiary: ${event.args?.beneficiary.toString()}`
			// 	)
			// })

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
			const yearContractAddress = lastEvent.args?.contractAddress.toString()

			console.log('----------get deployed years-----------')
			const deployedYearsAfter: [bigint, string][] = await contract.getAllDeployedYears()

			const deployedYears = deployedYearsAfter.map((yearInfo) => ({
				year: yearInfo[0].toString(), // Convert BigInt to string
				contractAddress: yearInfo[1],
			}))

			console.log(JSON.stringify(deployedYears))

			const addressDeployedYear = deployedYears[deployedYears.length - 1].contractAddress
			console.log('Year Contract Address:', yearContractAddress, 'Deployed Year Contract Address:', addressDeployedYear)

			const metadata = getAbi()
			const newContract = new ethers.Contract(yearContractAddress, metadata.abi, thetaProvider)

			console.log('----------get year-----------')
			const year = await newContract.getYear()
			console.log('Year:', year)

			console.log('----------get beneficiary-----------')
			const beneficiary = await newContract.getBeneficiary()
			console.log('Beneficiary:', beneficiary)
			// fixME: expect(beneficiary).to.equal(checksumAddress)

			deployedYearsAfter[0].forEach((yearInfo) => {
				console.log(yearInfo)
			})

			// Listen for YearParams event globally
			const filterYearParams = {
				address: undefined, // Listen to all addresses
				topics: [keccak256(toUtf8Bytes('YearParams(uint256,uint256,uint256,address)'))],
			}

			const blockHeight = await thetaProvider.getBlockNumber()
			const eventsYearParams = await thetaProvider.provider.getLogs({
				...filterYearParams,
				fromBlock: blockHeight - 100,
				toBlock: 'latest',
			})

			const abiCoder = new AbiCoder()
			eventsYearParams.find((event: any) => {
				const decoded = abiCoder.decode(['uint256', 'uint256', 'uint256', 'address'], event.data)
				console.log('YearParams event:', decoded)
			})

			console.log('----------end-----------')
		} catch (err: any) {
			console.error(err)
		}
	})
})

function getAbi() {
	const currentPath = process.cwd()

	// Go one folder lower than the project folder
	const lowerFolderPath = resolve(currentPath, '..')

	const contractName = 'Year'
	const jsonFile = `${lowerFolderPath}/year/artifacts/contracts/${contractName}.sol/${contractName}.json`
	console.log('Json File:', jsonFile)

	const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
	return metadata
}
