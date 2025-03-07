import dotenv from 'dotenv'
import { DeployParams } from './DeployParams'
import { Deployer } from './Deployer'
import { ethers, keccak256, toUtf8Bytes, AbiCoder } from 'ethers'

export function buildDeployParams(): DeployParams {
	const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
	dotenv.config({ path: envFilePath })

	const { API_URL, PRIVATE_KEY } = process.env

	return { contractName: 'Year', apiUrl: API_URL || '', privateKey: PRIVATE_KEY || '' }
}

export async function deploy() {
	const deployParams: DeployParams = buildDeployParams()
	const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
	await deployer.deployProxy([
		deployer.wallet.address,
		2024,
		ethers.parseEther('1000'),
		ethers.parseEther('5000'),
		'0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4',
	])
	await deployer.writeContractAddress()
	console.log(`Deployed contract ${deployParams.contractName} at address ${deployer.contractAddress}`)

	// Listen for YearParams event globally
	const filterYearParams = {
		address: undefined, // Listen to all addresses
		topics: [keccak256(toUtf8Bytes('YearParams(uint256,uint256,uint256,address)'))],
	}

	const block = await deployer.provider.getBlockNumber()
	const eventsYearParams = await deployer.provider.getLogs({
		...filterYearParams,
		fromBlock: block - 100,
		toBlock: 'latest',
	})

	const abiCoder = new AbiCoder()
	eventsYearParams.find((event) => {
		const decoded = abiCoder.decode(['uint256', 'uint256', 'uint256', 'address'], event.data)
		console.log('YearParams event:', decoded)
	})
}

// for deploy by npm run deploy
deploy()
