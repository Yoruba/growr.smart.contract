import { deploy } from './init'
import { init } from './init'

async function runDeployment(): Promise<void> {
	console.log('runDeployment')
	const { contractFactory, wallet, implementationAddress } = await init()
	await deploy(contractFactory, wallet, implementationAddress)
}

runDeployment()

export { runDeployment }
