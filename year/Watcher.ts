import dotenv from 'dotenv'
import { ethers, JsonRpcProvider } from 'ethers'
import fs from 'fs'

export class Watcher {
	static contract: any
	static provider: JsonRpcProvider

	static async init(rpcUrl: string, smartContactAddress: string, contractName: string) {
		try {
			console.log('init...')

			const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
			dotenv.config({ path: envFilePath })

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
			await Watcher.historyTransferredFunds()
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
				const blockNumber = event.log.blockNumber
				const transactionHash = event.log.transactionHash
				const smartContractAddress = event.log.address
				console.log(
					`[RECEIVED] Amount: ${amount} Year: ${year} to ${smartContractAddress} Block: ${blockNumber} TxHash: ${transactionHash} Funder: ${sender}`
				)
			})
		} catch (err: any) {
			console.error('watch failed:', err.message)
		}
	}

	// watch action proposed
	static async watchFundsTransferred() {
		try {
			console.log('watching funds Withdrawal...')
			this.contract.on('Withdrawal', (sender: string, amount: string, event: any) => {
				// console.log('event:', event)
				const blockNumber = event.log.blockNumber
				const transactionHash = event.log.transactionHash
				const smartContractAddress = event.log.address
				console.warn(`[TRANSFERRED] Amount: ${amount} to ${smartContractAddress} Block: ${blockNumber} TxHash: ${transactionHash} Proposer: ${sender}`)
			})
		} catch (err: any) {
			console.error('watch failed:', err.message)
		}
	}

	// watch Trace
	static async watchTrace() {
		try {
			console.log('watching trace...')
			this.provider.on('Trace', (functionCall: string, message: string) => {
				console.log(`[TRACE] Function Call: ${functionCall} Message: ${message}`)
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
		console.log('------------------- funds history -------------------')
		events.forEach((event: any) => {
			const { sender, amount, year } = event.args
			const blockNumber = event.blockNumber
			const transactionHash = event.transactionHash
			console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nFunder: ${sender} Amount: ${amount} Year: ${year}`)
		})
	}

	// history of transfer funds
	static async historyTransferredFunds() {
		const filter = this.contract.filters.Withdrawal()
		const block = await this.provider.getBlockNumber()

		const from = block - 1000
		const events = await this.contract.queryFilter(filter, from, 'latest')

		console.log(`Funds Withdrawal history from block: ${from} to ${block} length: ${events.length}`)

		// event FundsTransferred(address indexed sender, uint256 amount);
		console.log('------------------- Withdrawal history -------------------')
		events.forEach((event: any) => {
			const { sender, amount } = event.args
			const blockNumber = event.blockNumber
			const transactionHash = event.transactionHash
			console.log(`Block: ${blockNumber} TxHash: ${transactionHash} \nProposer: ${sender} Amount: ${amount}`)
		})
	}
}
