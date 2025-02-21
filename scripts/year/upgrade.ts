import { upgrades } from 'hardhat'
import fs from 'fs'
import { env } from 'process'
import { runDeployment } from './deploy'
import { init } from './init'

// see .openzeppelin/<network>.json for the proxy address
export async function upgrade(proxyAddress: string, contractFactory: any) {
	try {
		console.log('upgrading year contract...')
		// upgrade the contract with the owner wallet address
		const contract = await upgrades.upgradeProxy(proxyAddress, contractFactory)

		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		// don't log when testing
		console.log(env.NODE_ENV)
		if (process.env.NODE_ENV === 'test') return contract

		console.log('proxy address year   :', proxyAddress)
		console.log('contract update address year:', contract.target)

		if (!contract) {
			throw new Error('-------------- Contract is undefined --------------')
		}

		return contract
	} catch (err: any) {
		console.error('upgrade failed:', err.message)
		// if error message contains proxy create new proxy
		if (err.message.includes('proxy')) {
			console.log('creating new contract...')
			await runDeployment()
		}
	}
}

// get proxy address from the network json file
export async function getProxyAddress(name: string) {
	try {
		const jsonFile = `./addresses.json`
		// console.log(`reading proxy address from ${jsonFile}`)
		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

		// get where name is year with structure  { type: 'factory', name: 'year', address: contract.target }
		const proxyAddress = metadata.find((item: any) => item.name === name).address

		if (!proxyAddress) {
			throw new Error(`-------------- Proxy address for ${name} is undefined --------------`)
		}

		return proxyAddress
	} catch (err: any) {
		console.error('getProxyAddress failed:', err.message)
	}
}

// run the init function first and then upgrade
export async function runUpgrade() {
	try {
		const { contractFactory } = await init()
		const proxyAddress = await getProxyAddress('year')
		const response = await upgrade(proxyAddress, contractFactory)

		console.log(JSON.stringify(response, null, 2))

		return response
	} catch (err: any) {
		console.error('Error:', err.message)
	}
}
