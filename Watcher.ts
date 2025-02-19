import dotenv from 'dotenv'
import { ethers, JsonRpcProvider } from 'ethers'
import fs from 'fs'

export class Watcher {
	static contract: any
	static provider: JsonRpcProvider

	static async init(rpcUrl: string, smartContactAddress: string) {
		try {
			console.log('init...')

			const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
			dotenv.config({ path: envFilePath })

			const contractName = 'Growr'
			const jsonFile = `./artifacts/contracts/${contractName}.sol/${contractName}.json`
			this.provider = new ethers.JsonRpcProvider(rpcUrl)

			const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

			// todo: abi hardcode or upload
			this.contract = new ethers.Contract(smartContactAddress, metadata.abi, this.provider)

			// throw error if contract is undefined
			if (!this.contract) {
				throw new Error('Contract not found')
			}

			// console.log(this.contract)

			console.log('contract address:', this.contract.target)

			// await Watcher.logs()
			// await Watcher.logsByAddress()
			// await Watcher.historyFunds()
			await Watcher.historyAlreadyKnown()
		} catch (err: any) {
			console.error('init failed:', err.message)
			// todo: reconnect when connection is lost
			throw err
		}
	}

	static async watchFundsReceived() {
		try {
			console.log('watching funds received...')
			this.contract.on('FundsReceived', (sender: string, amount: string, year: string, event: any) => {
				// console.log('event:', event)
				console.log('------------------- funds received -------------------')
				const blockNumber = event.log.blockNumber
				const transactionHash = event.log.transactionHash
				const smartContractAddress = event.log.address
				console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nFunder: ${sender} Amount: ${amount} Year: ${year} to ${smartContractAddress}`)
			})
		} catch (err: any) {
			console.error('watch failed:', err.message)
		}
	}

	// watch AlreadyKnown event
	static async watchAlreadyKnown() {
		try {
			console.log('watching AlreadyKnown...')
			this.contract.on('AlreadyKnown', (sender: string, event: any) => {
				// console.log('event:', event)
				console.log('------------------- already known -------------------')
				const blockNumber = event.log.blockNumber
				const transactionHash = event.log.transactionHash
				const smartContractAddress = event.log.address
				console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nFunder: ${sender} to ${smartContractAddress}`)
			})
		} catch (err: any) {
			console.error('watch failed:', err.message)
		}
	}

	// watch action proposed
	static async watchActionProposed() {
		try {
			console.log('watching ActionProposed...')
			this.contract.on('ActionProposed', (sender: string, action: string, event: any) => {
				// console.log('event:', event)
				console.log('------------------- action proposed -------------------')
				const blockNumber = event.log.blockNumber
				const transactionHash = event.log.transactionHash
				const smartContractAddress = event.log.address
				console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nProposer: ${sender} Action: ${action} to ${smartContractAddress}`)
			})
		} catch (err: any) {
			console.error('watch failed:', err.message)
		}
	}

	// get all logs from the chain
	static async logs() {
		console.log('logs...')

		const block = await this.provider.getBlockNumber()

		console.log('block:', block)

		const logs = await this.provider.getLogs({
			fromBlock: block - 10,
			toBlock: 'latest',
			address: this.contract.address,
		})

		logs.forEach((log: any) => {
			console.log(log)
		})
	}

	// by address
	static async logsByAddress() {
		console.log('logs by address...')

		const block = await this.provider.getBlockNumber()
		const from = block - 1000

		const filterByTopic = {
			address: this.contract.address,
			// topics: [topic], bytes32 topic = keccak256("MyEvent(address,uint256)");
			// const iface = new ethers.utils.Interface(["event MyEvent(address indexed from, uint256 value)"]);
			// const topic = iface.getEventTopic("MyEvent");
			// console.log("Event Topic:", topic);
			fromBlock: from,
			toBlock: block,
		}

		const logsByTopic = await this.provider.getLogs(filterByTopic)
		console.log('Logs by Topic:', logsByTopic)
	}

	static async historyFunds() {
		const filter = this.contract.filters.FundsReceived()
		const block = await this.provider.getBlockNumber()

		const from = block - 1000
		const events = await this.contract.queryFilter(filter, from, 'latest')

		console.log(`Funds history from block: ${from} to ${block} length: ${events.length}`)

		// event FundsReceived(address indexed sender, uint256 amount, uint256 year);
		events.forEach((event: any) => {
			const { sender, amount, year } = event.args
			const blockNumber = event.blockNumber
			const transactionHash = event.transactionHash
			console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nFunder: ${sender} Amount: ${amount} Year: ${year}`)
		})
	}

	// history of already known
	static async historyAlreadyKnown() {
		const filter = this.contract.filters.AlreadyKnown()
		const block = await this.provider.getBlockNumber()

		const from = block - 1000
		const events = await this.contract.queryFilter(filter, from, 'latest')

		console.log(`Already know history from block: ${from} to ${block} length: ${events.length}`)

		// event AlreadyKnown(address indexed sender);
		events.forEach((event: any) => {
			const { sender } = event.args
			const blockNumber = event.blockNumber
			const transactionHash = event.transactionHash
			console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nFunder: ${sender}`)
		})
	}
}
