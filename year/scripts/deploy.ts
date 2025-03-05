import { ContractFactory, ethers } from 'ethers'
import fs from 'fs-extra'
import dotenv from 'dotenv'

export async function runDeployment(): Promise<any> {
	console.log('00 [SETUP]')
	const { contractFactory, wallet, metadata, provider } = await init()

	const contract = await deploy(contractFactory)

	// is same as target address. There is no proxy contract
	const address = ((await contract?.getAddress()) || '').toString()
	setImplementationAddress(address)
	console.log(`02 [IMPL] address: ${address}`)

	return { contractFactory, wallet, metadata, provider, contract }
}

export async function init() {
	try {
		console.log('01 [INIT]')
		const contractName = 'Year'
		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL, PRIVATE_KEY } = process.env
		const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
		const provider = new ethers.JsonRpcProvider(API_URL)
		const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

		const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())
		const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)

		// log the constructor arguments from the abi
		// console.log('constructor args:', metadata.abi.find((x: any) => x.type === 'constructor').inputs)

		return { contractFactory, wallet, provider, metadata }
	} catch (err: any) {
		console.error('init factory failed:', err.message)
		throw err
	}
}

export async function deploy(contractFactory: ContractFactory) {
	try {
		const checksumAddressBeneficiary = ethers.getAddress('0xe873f6a0e5c72ad7030bb4e0d3b3005c8c087df4')

		const contract = await contractFactory.deploy(2024, ethers.parseEther('1000'), ethers.parseEther('5000'), checksumAddressBeneficiary)

		// Wait for the deployment transaction to be mined
		await contract.waitForDeployment()

		return contract
	} catch (err: any) {
		console.error('deploy failed:', err.message)
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
