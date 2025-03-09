import { execSync } from 'child_process'
import { Wallet, ethers } from 'ethers'
import fs from 'fs-extra'
import { DeployParams } from '../scripts/DeployParams'
import { buildDeployParams } from '../scripts/buildDeployParams'
import { Deployer } from '../scripts/Deployer'
import { resolve } from 'path'

describe('Functions', function () {
	let contract: any
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

			const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, 'YearFactory')
			senderWallet = deployer.wallet
			contract = await deployer.deploy(['0x97F955330e33B5a4BA262db3407ac33cf2b8d2da'])
			thetaProvider = deployer.provider
			factory = deployer.contractFactory
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	it('deployYearContract', async function () {
		try {
			// fixme:  beneficiary
			const tx = await contract.createYear(senderWallet.address, 2034, 1000, 1000000, '0x4407ae23ab2E97e91A6C3AB4d65F358632697939')
			const receipt = await tx.wait()

			const event = receipt?.logs
			console.log('Event:', event)

			// get year address by year
			const yearAddress = await contract.getNumberOfYears()
			console.log('Year Address---:', yearAddress)

			const carAddress = await contract.getYear(0)
			console.log('Car Address:', carAddress)

			// attach to car contract
			const carContract = new ethers.Contract(carAddress, getAbi().abi, thetaProvider)
			// get car details
			const carDetails = await carContract.getYearDetails()
			console.log('Car Details:', carDetails)

			const owner = await carContract.getOwner()
			console.log('Owner:', owner)

			// Get all past events (useful for initial loading)
			// const filter = contract.filters.YearParams() // All FundsReceived events

			// // // get last block
			// const block = await thetaProvider.getBlockNumber()
			// // console.log('Block:', block)

			// // const events = await contract.queryFilter(filter, block - 100, 'latest') // From block 0 to latest
			// // console.log('events:', events.length)

			// // //event YearParams(uint256 year, uint256 cost, uint256 withdrawalLimit, address beneficiary);
			// // events.forEach((event: any) => {
			// // 	console.log(
			// // 		`Year: ${event.args?.year.toString()} Cost: ${event.args?.cost.toString()} Withdrawal Limit: ${event.args?.withdrawalLimit.toString()} Beneficiary: ${event.args?.beneficiary.toString()}`
			// // 	)
			// // })

			// const createFilter = contract.filters.YearDeployed() // All FundsReceived events
			// const createEvents = await contract.queryFilter(createFilter, block - 100, 'latest') // From block 0 to latest
			// console.log('events:', createEvents.length)

			// //event YearDeployed(uint256 year, address contractAddress);
			// createEvents.forEach((createEvents: any) => {
			// 	// console.log(createEvents)
			// 	console.log(
			// 		`Deployed Year: ${createEvents.args?.year.toString()} contractAddress: ${createEvents.args?.contractAddress.toString()} beneficiary: ${createEvents.args?.beneficiary.toString()} implementation ${createEvents.args?.implementation.toString()}`
			// 	)
			// })

			// // get last entry of createEvents and get the contract address
			// const lastEvent = createEvents[createEvents.length - 1]
			// const yearContractAddress = lastEvent.args?.contractAddress.toString()

			// console.log('----------get deployed years-----------')
			// const deployedYearsAfter: [bigint, string][] = await contract.getAllDeployedYears()

			// const deployedYears = deployedYearsAfter.map((yearInfo) => ({
			// 	year: yearInfo[0].toString(), // Convert BigInt to string
			// 	contractAddress: yearInfo[1],
			// }))

			// console.log(JSON.stringify(deployedYears))

			// const addressDeployedYear = deployedYears[deployedYears.length - 1].contractAddress
			// console.log('Year Contract Address:', yearContractAddress, 'Deployed Year Contract Address:', addressDeployedYear)

			// const metadata = getAbi()
			// const newContract = new ethers.Contract(yearContractAddress, metadata.abi, thetaProvider)

			// console.log('----------get year-----------')
			// const year = await newContract.getYear()
			// console.log('Year:', year)

			// console.log('----------get beneficiary-----------')
			// const beneficiary = await newContract.getBeneficiary()
			// console.log('Beneficiary:', beneficiary)
			// // fixME: expect(beneficiary).to.equal(checksumAddress)

			// deployedYearsAfter[0].forEach((yearInfo) => {
			// 	console.log(yearInfo)
			// })

			// // Listen for YearParams event globally
			// const filterYearParams = {
			// 	address: undefined, // Listen to all addresses
			// 	topics: [keccak256(toUtf8Bytes('YearParams(uint256,uint256,uint256,address)'))],
			// }

			// const blockHeight = await thetaProvider.getBlockNumber()
			// const eventsYearParams = await thetaProvider.provider.getLogs({
			// 	...filterYearParams,
			// 	fromBlock: blockHeight - 1000,
			// 	toBlock: 'latest',
			// })

			// const abiCoder = new AbiCoder()
			// eventsYearParams.find((event: any) => {
			// 	const decoded = abiCoder.decode(['uint256', 'uint256', 'uint256', 'address'], event.data)
			// 	console.log('YearParams event:', decoded)
			// })

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
	const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json` //`${lowerFolderPath}/year/artifacts/contracts/${contractName}.sol/${contractName}.json`
	console.log('Json File:', jsonFile)

	const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
	return metadata
}
