import { upgrades } from 'hardhat'
import { init } from './init'
import { runDeployment } from './deploy'

// see .openzeppelin/<network>.json for the proxy address
export async function upgrade(proxyAddress: string, contractFactory: any) {
	try {
		console.log(`03 [UPGRADE] contract with: ${proxyAddress}`)
		// upgrade the contract with the owner wallet address
		const contract = await upgrades.upgradeProxy(proxyAddress, contractFactory)

		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		// target is the proxy address and also proxy address which is used for the next upgrade
		setProxyAddress(contract.target.toString())
		console.log('04 [PROXY] [TARGET] address:', ProxyAddress)
		// console.log('05 [FACTORY] [PROXY] contract address factory :', proxyAddress)

		if (!contract) {
			throw new Error('-------------- Contract is undefined --------------')
		}

		return contract
	} catch (err: any) {
		console.error('[FACTORY] upgrade failed:', err.message)
		// if error message contains proxy create new proxy
		if (err.message.includes('proxy')) {
			console.log('[FACTORY] creating new contract...')
			await runDeployment()
		}
	}
}

// run the init function first and then upgrade
export async function runUpgrade() {
	try {
		const { contractFactory } = await init()
		const proxyAddress = ProxyAddress
		const response = await upgrade(proxyAddress, contractFactory)

		console.log(JSON.stringify(response, null, 2))

		return response
	} catch (err: any) {
		console.error('Error:', err.message)
	}
}

const proxy = 'PROXY_ADDRESS'
export const ProxyAddress = process.env[proxy] || ''

export function setProxyAddress(proxyAddress: string) {
	process.env[proxy] = proxyAddress
}

// for implementation address
const implementation = 'IMPLEMENTATION_ADDRESS'
export const ImplementationAddress = process.env[implementation] || ''

export function setImplementationAddress(implementationAddress: string) {
	process.env[implementation] = implementationAddress
}
