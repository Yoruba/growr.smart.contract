import { deployFactory } from './init'
import { int } from './init'

async function runDeployment(): Promise<void> {
	console.log('runDeployment')
	const { contractFactory, wallet, implementationAddress, proxyAddress } = await int()
	await deployFactory(contractFactory, wallet, implementationAddress, proxyAddress)
}

runDeployment()

export { runDeployment }
