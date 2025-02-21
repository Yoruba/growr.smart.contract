import { ethers } from 'ethers'
import { deployYear } from './init.year'
import { init } from './init.year'

async function runDeployment(): Promise<ethers.BaseContract | undefined> {
	console.log('runDeployment for year contract...')
	const { contractFactory, wallet, provider } = await init()

	return await deployYear(contractFactory, wallet, provider)
}

runDeployment()

export { runDeployment }
