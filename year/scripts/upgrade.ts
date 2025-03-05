import { upgrades } from 'hardhat'
import { init } from './init'
import fs from 'fs'
import { runDeployment } from './deploy'

// see .openzeppelin/<network>.json for the proxy address
export async function upgrade(proxyAddress: string, contractFactory: any) {
	try {
		console.log(`03 [FACTORY] upgrading factory contract with: ${proxyAddress}`)
		// upgrade the contract with the owner wallet address
		const contract = await upgrades.upgradeProxy(proxyAddress, contractFactory)

		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		// target is the proxy address and also proxy address which is used for the next upgrade
		process.env.PROXY_ADDRESS_FACTORY = contract.target.toString()
		console.log('04 [FACTORY] [PROXY] [TARGET] address factory:', process.env.PROXY_ADDRESS_FACTORY)
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

export async function getProxyAddress(network: string) {
	try {
		const jsonFile = `.openzeppelin/${network}.json`
		// console.log(`reading proxy address from ${jsonFile}`)
		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		return metadata.proxies[0].address
	} catch (err: any) {
		console.error('getProxyAddress failed:', err.message)
	}
}

// run the init function first and then upgrade
export async function runUpgrade() {
	try {
		const { contractFactory } = await init()
		const proxyAddress = await getProxyAddress('unknown-366')
		const response = await upgrade(proxyAddress, contractFactory)

		console.log(JSON.stringify(response, null, 2))

		return response
	} catch (err: any) {
		console.error('Error:', err.message)
	}
}
