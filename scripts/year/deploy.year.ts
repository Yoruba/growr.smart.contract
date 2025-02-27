import { ethers } from 'ethers'
import { deployYear } from './init.year'
import { init } from './init.year'

async function runDeployment(): Promise<ethers.BaseContract | undefined> {
	console.log('01 [YEAR] run deployment for year contract')
	const { contractFactory, wallet, provider } = await init()

	return await deployYear(contractFactory, wallet, provider)
}

export { runDeployment }
