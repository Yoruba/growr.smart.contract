import dotenv from 'dotenv'
import { ContractFactory, Wallet, ethers } from 'ethers'
import { upgrades } from 'hardhat'
import fs from 'fs-extra'
import { ProxyAddress, setImplementationAddress, setProxyAddress } from './upgrade'

export async function init() {
	try {
		console.log('01 [INIT]')
		const contractName = 'Year'
		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL, PRIVATE_KEY } = process.env
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const provider = new ethers.JsonRpcProvider(API_URL)
		const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)

		return { contractFactory, wallet, provider, metadata }
	} catch (err: any) {
		console.error('init factory failed:', err.message)
		throw err
	}
}

export async function deploy(contractFactory: ContractFactory, wallet: Wallet) {
	try {
		const checksumAddressBeneficiary = ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4')

		const contract = await upgrades.deployProxy(
			contractFactory,
			[wallet.address, 2024, ethers.parseEther('1000'), ethers.parseEther('5000'), checksumAddressBeneficiary], // constructor arguments
			{ kind: 'uups' }
		)

		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		setProxyAddress(contract.target.toString())
		console.log(`03 [PROXY] address: ${ProxyAddress}`)

		const implementationAddress = await upgrades.erc1967.getImplementationAddress(ProxyAddress)
		setImplementationAddress(implementationAddress)
		console.log(`03 [IMPL] address: ${implementationAddress}`)

		return contract
	} catch (err: any) {
		console.error('deploy failed:', err.message)
	}
}
