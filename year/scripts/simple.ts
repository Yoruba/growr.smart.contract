import { DeployParams } from './DeployParams'
import { Deployer } from './Deployer'
import { buildDeployParams } from './buildDeployParams'
import { execSync } from 'child_process'

export async function deploy() {
	console.log('Clearing Hardhat cache...')
	execSync('npx hardhat clean', { stdio: 'inherit' })

	// Recompile the contracts
	console.log('Compiling contracts...')
	execSync('npx hardhat compile', { stdio: 'inherit' })

	const deployParams: DeployParams = buildDeployParams()
	deployParams.contractName = 'Simple'
	const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
	const params: any[] = []

	await deployer.deploy(params)
	await deployer.writeContractAddress(params, deployParams.network)
	console.log(`Deployed contract ${deployParams.contractName} at address ${deployer.contractAddress}`)
}

// for deploy by npm run deploy
deploy()
