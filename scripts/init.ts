import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { upgrades } from 'hardhat'
import fs from 'fs'
import { runDeployment } from './year/deploy'

export async function init() {
	// Get the environment file path from an environment variable
	try {
		console.log('init...')

		// deploy year contract first as a template
		const yearTemplate = await runDeployment()
		if(!yearTemplate) {
			throw new Error('year contract template deployment failed')
		}
		// needed for year factory contract deployment and update via factory
		const implementationAddress = yearTemplate?.target.toString() || ''
		console.log('implementationAddress year:', implementationAddress)

		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL, PRIVATE_KEY } = process.env
		const contractName = 'YearFactory'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const provider = new ethers.JsonRpcProvider(API_URL)
		const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

		console.log(`deployer address: ${wallet.address}`)

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

		// Create a contract factory
		const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)

		return { contractFactory, wallet, provider, implementationAddress }
	} catch (err: any) {
		console.error('init failed:', err.message)
		throw err
	}
}

export async function deploy(contractFactory: ethers.ContractFactory, wallet: ethers.Wallet, implementationAddress: string) {
	try {
		console.log('deploying contract...')
		// Deploy the contract with the owner wallet address
		const contract = await upgrades.deployProxy(
			contractFactory,
			[wallet.address, implementationAddress], // constructor arguments
			// function call
			{ initializer: 'initialize', timeout: 60000 }
		)
		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		console.log('contract address:', contract.target)

		return contract
	} catch (err: any) {
		console.error('deploy failed:', err.message)
	}
}
