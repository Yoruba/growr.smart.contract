import { execSync } from 'child_process'
import { Wallet, ethers } from 'ethers'
import fs from 'fs-extra'
import { DeployParams } from '../scripts/DeployParams'
import { buildDeployParams } from '../scripts/buildDeployParams'
import { Deployer } from '../scripts/Deployer'
import { resolve } from 'path'
import { Address } from '../typechain-types/@openzeppelin/contracts/utils/Address'

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
			contract = await deployer.deploy(['0x1bB3E9132C15b8184e60c78A391e11e37045d2cD'])
			thetaProvider = deployer.provider
			factory = deployer.contractFactory
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	it('deployYearContract', async function () {
		try {
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
			const tx = await contract.createYear(newYear, 1000, 1000000, checksumAddress)
			const receipt = await tx.wait()

			const event = receipt?.logs
			// console.log('Event:', event)

			const yearContractAddress = await contract.getYearContractAddress(newYear)
			console.log('Year Contract Address:', yearContractAddress)
			const carContract = new ethers.Contract(yearContractAddress, getAbi().abi, thetaProvider)
			const owner = await carContract.getOwner()
			console.log('Owner:', owner)

			const yearContract = await carContract.getYear()
			console.log('Year:', yearContract)

			const allDeployedYears = await contract.getAllDeployedYears()
			console.log('All Deployed Years:', allDeployedYears)

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
