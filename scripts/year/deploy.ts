import { ethers } from 'ethers'
import { deploy } from './init'
import { init } from './init'

async function runDeployment(): Promise<ethers.BaseContract | undefined> {
	console.log('runDeployment for year contract...')
	const { contractFactory, wallet } = await init()
	return await deploy(contractFactory, wallet)
}

runDeployment()

export { runDeployment }
