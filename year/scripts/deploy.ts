import { deployFactory } from './init'
import { init } from './init'

export async function runDeployment(): Promise<void> {
	console.log('00 [FACTORY] run deployment')
	const { contractFactory, wallet, implementationAddress } = await init()
	await deployFactory(contractFactory, wallet, implementationAddress)
}

runDeployment()
