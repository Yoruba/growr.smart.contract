import dotenv from 'dotenv'
import { JsonRpcProvider, ethers } from 'ethers'
import { upgrades } from 'hardhat'
import fs from 'fs'

export async function init() {
	// Get the environment file path from an environment variable
	try {
		console.log('02 [YEAR] init year')

		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL, PRIVATE_KEY } = process.env
		const contractName = 'Year'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const provider = new ethers.JsonRpcProvider(API_URL)
		const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

		//console.log(`deployer address: ${wallet.address}`)

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

		// Create a contract factory
		const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)

		return { contractFactory, wallet, provider, metadata }
	} catch (err: any) {
		console.error('[YEAR] init year failed:', err.message)
		throw err
	}
}

export async function deployYearProxy(contractFactory: ethers.ContractFactory, wallet: ethers.Wallet, provider: JsonRpcProvider, metadata: any) {
	try {
		console.log('03 [YEAR] deploying [PROXY] year contract')
		// Deploy the contract with the owner wallet address
		const checksumAddress = ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4')

		const contract = await upgrades.deployProxy(
			contractFactory,
			[wallet.address, 2024, ethers.parseEther('1000'), ethers.parseEther('5000'), checksumAddress], // constructor arguments
			// function call
			{ initializer: 'initialize', timeout: 60000 }
		)

		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		console.log('04 [YEAR] contract proxy address year:', contract.target)

		const block = await provider.getBlockNumber()
		// const createFilter = contract.filters.YearParams() // All FundsReceived events
		// const createEvents = await contract.queryFilter(createFilter, block - 100, 'latest') // From block 0 to latest
		// console.log('events:', createEvents.length)

		// const abi = ['function proxiableUUID() view returns (bytes32)', 'function implementation() view returns (address)']

		// const attached = new ethers.Contract(contract.target, abi, provider)
		// const impl = await attached.implementation()
		// console.log('Implementation Address----------->:', impl)

		const proxyAddress = contract.target.toString()
		const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
		const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress)

		console.log('Proxy: ', proxyAddress)
		console.log('Implementation: ', implementationAddress)
		console.log('Admin: ', adminAddress)

		// const implementationAddress = await getImplementationAddress(provider, contract.target.toString())
		// console.log('Implementation Address ----->>>:', implementationAddress)

		//event YearDeployed(uint256 year, address contractAddress);
		// createEvents.forEach((createEvents: any) => {
		// 	// console.log(createEvents)
		// 	console.log(
		// 		`Deployed Year: ${createEvents.args?.year.toString()} contractAddress: ${createEvents.args?.contractAddress.toString()} beneficiary: ${createEvents.args?.beneficiary.toString()} implementation ${createEvents.args?.implementation.toString()}`
		// 	)
		// })

		// // get last entry of createEvents and get the implementation address
		// const lastEvent = createEvents[createEvents.length - 1] as any
		// const contractAddress = lastEvent.args?.contractAddress.toString()
		// // set in nodejs env
		process.env.IMPLEMENTATION_ADDRESS = implementationAddress
		// console.log('05 [YEAR] deployed implementation to :', process.env.IMPLEMENTATION_ADDRESS)

		return contract
	} catch (err: any) {
		console.error('[YEAR] deploy year failed:', err.message)
	}
}

async function getImplementationAddress(provider: JsonRpcProvider, proxyAddress: string) {
	const IMPLEMENTATION_SLOT = '0x360894A13BA1A3210667C828492DB98DCA3E2076'
	const implStorage = await provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT)
	return ethers.getAddress('0x' + implStorage.slice(-40)) // Extract the last 20 bytes
}
