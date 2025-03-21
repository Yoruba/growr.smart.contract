import dotenv from 'dotenv'
import { DeployParams } from './DeployParams'

export function buildDeployParams(): DeployParams {
	const envFilePath = process.env.ENV_FILE_PATH || './.env.private'

	// if path is ENV_FILE_PATH=./.env.private, then set network to 'private'
	const network = process.env.ENV_FILE_PATH === './.env.private' ? 'private' : 'testnet'

	dotenv.config({ path: envFilePath })

	const { API_URL, PRIVATE_KEY } = process.env

	return { contractName: 'Year', apiUrl: API_URL || '', privateKey: PRIVATE_KEY || '', network }
}
