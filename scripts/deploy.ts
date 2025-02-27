import { deployFactory } from './init'
import { int } from './init'

export async function runDeployment(): Promise<void> {
	console.log('00 [FACTORY] run deployment')
	const { contractFactory, wallet, implementationAddress, proxyAddress } = await int()
	await deployFactory(contractFactory, wallet, proxyAddress, implementationAddress)
}

runDeployment()
