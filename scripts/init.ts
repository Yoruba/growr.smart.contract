import dotenv from 'dotenv'
import { ContractFactory, Wallet, ethers } from 'ethers'
import { upgrades } from 'hardhat'
import { runYearDeployment } from './year/deploy.year'
import fs from 'fs-extra'

export async function init() {
	try {
		console.log('01 [FACTORY] init factory')

		// deploy year contract first as a template
		const yearTemplate = await runYearDeployment()
		if (!yearTemplate) {
			throw new Error('year contract template deployment failed')
		}

		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL, PRIVATE_KEY } = process.env
		const contractName = 'YearFactory'
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const provider = new ethers.JsonRpcProvider(API_URL)
		const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)

		const implementationAddress = process.env.IMPLEMENTATION_ADDRESS_YEAR || ''
		//console.log('Deployed implementation to --->:', implementationAddress)

		return { contractFactory, wallet, provider, implementationAddress }
	} catch (err: any) {
		console.error('init factory failed:', err.message)
		throw err
	}
}

export async function deployFactory(contractFactory: ContractFactory, wallet: Wallet, implementationAddress: string) {
	try {
		console.log(`02 [FACTORY] deploying factory contract with year [TEMPLATE]: ${implementationAddress}`)
		// Deploy the contract with the owner wallet address

		const contract = await upgrades.deployProxy(
			contractFactory,
			[wallet.address, implementationAddress], // constructor arguments
			{ kind: 'uups' }
		)
		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		process.env.PROXY_ADDRESS_FACTORY = contract.target.toString()
		console.log(`03 [FACTORY] contract [PROXY] factory address: ${process.env.PROXY_ADDRESS_FACTORY}`)

		return contract
	} catch (err: any) {
		console.error('deploy failed:', err.message)
	}
}
