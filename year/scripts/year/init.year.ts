import dotenv from 'dotenv'
import { JsonRpcProvider, ethers } from 'ethers'
import { upgrades } from "hardhat"; // Import upgrades directly
import fs from 'fs'

export async function initYear() {
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

		const yearMetadata = JSON.parse(fs.readFileSync(jsonFile).toString())

		const yearFactory = new ethers.ContractFactory(yearMetadata.abi, yearMetadata.bytecode, wallet)

		return { yearFactory, wallet, provider, yearMetadata }
	} catch (err: any) {
		console.error('[YEAR] init year failed:', err.message)
		throw err
	}
}

export async function deployYearProxy(yearTemplate: ethers.ContractFactory, wallet: ethers.Wallet, provider: JsonRpcProvider, metadata: any) {
	try {
		console.log('03 [YEAR] deploying [PROXY] year contract')
		// Deploy the contract with the owner wallet address
		const checksumAddressBeneficiary = ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4')

		// deploys the implementation contract and creates a proxy that delegates to it
		const contractProxy = await upgrades.deployProxy(
			yearTemplate,
			[wallet.address, 2024, ethers.parseEther('1000'), ethers.parseEther('5000'), checksumAddressBeneficiary], // constructor arguments
			{ kind: 'uups' }
		)

		// Wait for the deployment transaction to be mined
		await contractProxy.waitForDeployment()

		process.env.PROXY_ADDRESS_YEAR = contractProxy.target.toString()
		console.log('04 [YEAR] contract proxy address year:', process.env.PROXY_ADDRESS_YEAR)

		const proxyAddress = contractProxy.target.toString()

		const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)

		process.env.IMPLEMENTATION_ADDRESS_YEAR = implementationAddress
		console.log('05 [YEAR] deployed implementation to :', process.env.IMPLEMENTATION_ADDRESS_YEAR)

		return contractProxy
	} catch (err: any) {
		console.error('[YEAR] deploy year failed:', err.message)
	}
}

