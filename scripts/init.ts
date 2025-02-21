import dotenv from 'dotenv'
import { ContractFactory, Wallet, ethers } from 'ethers'
import { upgrades } from 'hardhat'
import { runDeployment } from './year/deploy.year'
import fs from 'fs-extra'
import { getImplementationAddress } from '@openzeppelin/upgrades-core'

export async function int() {
	// Get the environment file path from an environment variable
	try {
		console.log('init factory...')

		// deploy year contract first as a template
		const yearTemplate = await runDeployment()
		if (!yearTemplate) {
			throw new Error('year contract template deployment failed')
		}

		const proxyAddress = yearTemplate?.target.toString() || ''

		// needed for year factory contract deployment and update via factory
		console.log('proxy year:', proxyAddress)

		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL, PRIVATE_KEY } = process.env
		const contractName = 'YearFactory'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const provider = new ethers.JsonRpcProvider(API_URL)
		const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

		// console.log(`deployer factory address: ${wallet.address}`)

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

		// Create a contract factory
		const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)

		const implementationAddress = await getImplementationAddress(provider, proxyAddress)
		console.log('Deployed implementation to:', implementationAddress)

		return { contractFactory, wallet, provider, implementationAddress, proxyAddress }
	} catch (err: any) {
		console.error('init factory failed:', err.message)
		throw err
	}
}

export async function deployFactory(contractFactory: ContractFactory, wallet: Wallet, proxyAddress: string, implementationAddress: string) {
	try {
		console.log('deploying factory contract...')
		// Deploy the contract with the owner wallet address
		const contract = await upgrades.deployProxy(
			contractFactory,
			[wallet.address, implementationAddress], // constructor arguments
			// function call
			{ initializer: 'initialize', timeout: 60000 }
		)
		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		console.log('contract factory address:', contract.target)

		// write to json file scripts folder in project addresses.json with { type: 'factory', name: 'year', address: contract.target }
		// write to json file addresses.json with { type: 'implementation', name: 'year', address: implementationAddress }

		const addresses = [
			{ type: 'proxy', name: 'factory', address: contract.target },
			{ type: 'proxy', name: 'year', address: proxyAddress },
			{ type: 'implementation', name: 'template', address: implementationAddress },
		]
		// use fs-extra to write to file
		// check if file exists
		// if no exists create file
		if (!fs.existsSync('./addresses.json')) {
			await fs.writeJSON('./addresses.json', addresses, { spaces: 1 })
		}
		await fs.writeJSON('./addresses.json', addresses, { spaces: 1 })

		return contract
	} catch (err: any) {
		console.error('deploy failed:', err.message)
	}
}
