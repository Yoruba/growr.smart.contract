import { ethers } from 'ethers'
import { deployYearProxy } from './init.year'
import { init } from './init.year'

// for testing with factory
export async function runDeployment(): Promise<ethers.BaseContract | undefined> {
	console.log('01 [YEAR] run deployment for year contract')
	const { contractFactory, wallet, provider, metadata } = await init()

	return await deployYearProxy(contractFactory, wallet, provider, metadata)
}

export async function runDeploymentYearOnly(): Promise<ethers.BaseContract | undefined> {
	console.log('01 [YEAR] run deployment for year contract')
	const { contractFactory, wallet, provider, metadata } = await init()

	return await deployYearProxy(contractFactory, wallet, provider, metadata)
}

// for testing year only
runDeploymentYearOnly()
