import { Watcher } from './Watcher' // Adjust the path as necessary
import dotenv from 'dotenv'
import { getProxyAddress } from './scripts/upgrade' // Adjust the path as necessary

async function main() {
	try {
		const contractName = 'Year'
		const envFilePath = process.env.ENV_FILE_PATH || './.env.private'
		dotenv.config({ path: envFilePath })

		const { API_URL } = process.env
		const address = await getProxyAddress('unknown-366')
		await Watcher.init(API_URL || '', address, contractName)
		await Watcher.historyFunds()
		await Watcher.historyTransferredFunds()
		await Watcher.watchFundsReceived()
		await Watcher.watchFundsTransferred()
	} catch (err) {
		console.error('Error:', err)
	}
}

main()
