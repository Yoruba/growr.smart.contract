import dotenv from 'dotenv'
import { DeployParams } from './DeployParams'
import { Deployer } from './Deployer'

export function buildDeployParams(): DeployParams {
	const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
	dotenv.config({ path: envFilePath })

	const { API_URL, PRIVATE_KEY } = process.env

	return { contractName: 'YearFactory', apiUrl: API_URL || '', privateKey: PRIVATE_KEY || '' }
}

export async function deploy() {
	const deployParams: DeployParams = buildDeployParams()
	const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
	// fixme: read contract params from year address txt
	await deployer.deploy(['0xe0a14cB9EDfe099D5CB75C60fEd374104D9Fb396'])
	await deployer.writeContractAddress()
	console.log(`Deployed contract ${deployParams.contractName} at address ${deployer.contractAddress}`)
}

// for deploy by npm run deploy
deploy()
