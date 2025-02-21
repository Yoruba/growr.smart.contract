import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { upgrades } from 'hardhat'
import fs from 'fs'

export async function init() {
	// Get the environment file path from an environment variable
	try {
		console.log('init year...')

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
		console.error('init year failed:', err.message)
		throw err
	}
}

export async function deploy(contractFactory: ethers.ContractFactory, wallet: ethers.Wallet) {
	try {
		console.log('deploying year contract...')
		// Deploy the contract with the owner wallet address
		const contract = await upgrades.deployProxy(
			contractFactory,
			[wallet.address, 2024, ethers.parseEther('1000'), ethers.parseEther('5000')], // constructor arguments
			// function call
			{ initializer: 'initialize', timeout: 60000 }
		)
		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		console.log('contract proxy (implementation) address year:', contract.target)

		return contract
	} catch (err: any) {
		console.error('deploy year failed:', err.message)
	}
}
