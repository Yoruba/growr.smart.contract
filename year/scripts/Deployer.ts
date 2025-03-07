import { JsonRpcProvider, Wallet, ethers } from 'ethers'
import fs from 'fs-extra'
import { Year } from '../typechain-types'
import { upgrades } from 'hardhat'

export class Deployer {
	private apiUrl: string
	private privateKey: string
	private contractName: string
	public provider!: JsonRpcProvider
	public contract!: Year
	public contractAddress!: string
	public implementationAddress!: string
	public abi: any
	public wallet!: Wallet
	public artifacts: any
	public contractFactory: any

	constructor(apiUrl: string, privateKey: string, contractName: string) {
		this.apiUrl = apiUrl
		this.privateKey = privateKey
		this.contractName = contractName
		console.log('Contract Name:', this.contractName)
		this.setup()
	}

	private setup() {
		try {
			console.log('Setting up...')
			this.provider = new JsonRpcProvider(this.apiUrl)
			this.wallet = new Wallet(this.privateKey, this.provider)
			this.artifacts = JSON.parse(fs.readFileSync(`./artifacts/contracts/${this.contractName}.sol/${this.contractName}.json`).toString())
			this.abi = this.artifacts.abi
			this.contractFactory = new ethers.ContractFactory(this.abi, this.artifacts.bytecode, this.wallet)
		} catch (err: any) {
			console.error('setup failed:', err.message)
			throw err
		}
	}

	public async deploy(contractParams: any[]) {
		try {
			this.contract = await this.contractFactory.deploy(...contractParams)
			await this.contract.waitForDeployment()
			this.contractAddress = this.contract.target.toString()
			console.log(`Deployed contract ${this.contractName} at address ${this.contractAddress}`)
			return this.contract
		} catch (err: any) {
			console.error('deploy failed:', err.message)
			throw err
		}
	}

	public async deployProxy(contractParams: any[]) {
		console.log('Deploying proxy...')
		console.log(`${[...contractParams]}`)
		try {
			this.contract = await upgrades.deployProxy(
				this.contractFactory,
				[...contractParams], // constructor arguments
				{ kind: 'uups' }
			)
			// Wait for the deployment transaction to be mined
			await this.contract.waitForDeployment()

			this.contractAddress = this.contract.target.toString()
			this.implementationAddress = await upgrades.erc1967.getImplementationAddress(this.contractAddress)

			console.log(
				`Deployed proxy contract ${this.contractName} at address ${this.contractAddress} with implementation address ${this.implementationAddress}`
			)

			return this.contract
		} catch (err: any) {
			console.error('deployProxy failed:', err.message)
			throw err
		}
	}

	public async upgrade() {
		console.log('Upgrading contract...')
		try {
			this.contract = await upgrades.upgradeProxy(this.contractAddress, this.contractFactory)
			await this.contract.waitForDeployment()
			this.contractAddress = this.contract.target.toString()
			console.log(`Upgraded contract ${this.contractName} at address ${this.contractAddress}`)
			return this.contract
		} catch (err: any) {
			console.error('upgrade failed:', err.message)
			throw err
		}
	}

	public async writeContractAddress() {
		try {
			const date = new Date().toISOString()
			const file = `./${this.contractName}.txt`
			const line = `${date} ${this.contractName} proxy: ${this.contractAddress} implementation: ${this.implementationAddress} \n`
			fs.appendFileSync(file, line)
		} catch (err: any) {
			console.error('writeContractAddress failed:', err.message)
			throw err
		}
	}
}
