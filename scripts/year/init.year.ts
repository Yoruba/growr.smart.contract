import dotenv from 'dotenv'
import { JsonRpcProvider, ethers } from 'ethers'
import { upgrades } from 'hardhat'
import fs from 'fs'
import { getImplementationAddress } from '@openzeppelin/upgrades-core'

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

		return { contractFactory, wallet, provider }
	} catch (err: any) {
		console.error('[YEAR] init year failed:', err.message)
		throw err
	}
}

export async function deployYear(contractFactory: ethers.ContractFactory, wallet: ethers.Wallet, provider: JsonRpcProvider) {
	try {
		console.log('03 [YEAR] deploying year contract')
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
		const implementationAddress = await getImplementationAddress(provider, contract.target.toString())
		console.log('05 [YEAR] deployed implementation to :', implementationAddress)

		return contract
	} catch (err: any) {
		console.error('[YEAR] deploy year failed:', err.message)
	}
}
