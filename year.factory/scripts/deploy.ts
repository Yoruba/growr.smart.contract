import { AbiCoder, keccak256, toUtf8Bytes } from 'ethers'
import { DeployParams } from './DeployParams'
import { Deployer } from './Deployer'
import { buildDeployParams } from './buildDeployParams'

// --- for deploy only --- for test use the before function and set params there
export async function deploy() {
	try {
		const deployParams: DeployParams = buildDeployParams()
		const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
		const walletAddress = deployer.wallet.address.toString()
		// fixme: read contract params from year address txt
		console.log(`wallet address: ${walletAddress}`)
		await deployer.deployProxy([walletAddress, '0x4815592a9368F86dD269969ba828Ad2385dFe856'])
		await deployer.writeContractAddress()
		console.log(`Deployed contract ${deployParams.contractName} at address ${deployer.contractAddress}`)

		// Listen for YearParams event globally
		const filterYearParams = {
			address: undefined, // Listen to all addresses
			topics: [keccak256(toUtf8Bytes('YearParams(uint256,uint256,uint256,address)'))],
		}

		const block = await deployer.provider.getBlockNumber()
		const eventsYearParams = await deployer.provider.getLogs({
			...filterYearParams,
			fromBlock: block - 100,
			toBlock: 'latest',
		})

		const abiCoder = new AbiCoder()
		eventsYearParams.find((event) => {
			const decoded = abiCoder.decode(['uint256', 'uint256', 'uint256', 'address'], event.data)
			console.log('YearParams event:', decoded)
		})
	} catch (err: any) {
		console.error('deploy failed:', err.message)
	}
}

// for deploy by npm run deploy
// deploy()
