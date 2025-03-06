import dotenv from 'dotenv'
import { DeployParams } from './DeployParams'
import { Deployer } from './Deployer'
import { ethers } from 'ethers'

export function buildDeployParams(): DeployParams {
	const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
	dotenv.config({ path: envFilePath })

	const { API_URL, PRIVATE_KEY } = process.env

	return { contractName: 'Year', apiUrl: API_URL || '', privateKey: PRIVATE_KEY || '' }
}

export async function deploy() {
	const deployParams: DeployParams = buildDeployParams()
	const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
	await deployer.deploy([2024, ethers.parseEther('1000'), ethers.parseEther('5000'), '0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4'])
	await deployer.writeContractAddress()
	console.log(`Deployed contract ${deployParams.contractName} at address ${deployer.contractAddress}`)
}

// for deploy by npm run deploy
deploy()
