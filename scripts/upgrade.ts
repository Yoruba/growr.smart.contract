import { upgrades } from 'hardhat'
import { init } from './init'
import fs from 'fs'

// see .openzeppelin/<network>.json for the proxy address
export async function upgrade(proxyAddress: string, contractFactory: any) {

	try {
		// upgrade the contract with the owner wallet address
		const contract = await upgrades.upgradeProxy(proxyAddress, contractFactory)
		
		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()
		
		// don't log when testing
		if (process.env.NODE_ENV === 'test') return contract

		console.log('upgrade')
		console.log('proxy address   :', proxyAddress)
		console.log('contract address:', contract.target)
		return contract
	} catch (err: any) {
		console.error('upgrade failed:', err.message)
	}
}

// get proxy address from the network json file
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
		return await upgrade(proxyAddress, contractFactory)
	} catch (err: any) {
		console.error('Error:', err.message)
	}
}
