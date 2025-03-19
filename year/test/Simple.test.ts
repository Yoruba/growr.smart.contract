// send 100 ethers to contract address 0xa5f41eeb4ddbad0aa7b2b44f4096e6569c81d28b
// use simple contract to send 100 ethers to contract address 0xa5f41eeb4ddbad0aa7b2b44f4096e6569c81d28b

import { DeployParams } from '../scripts/DeployParams'
import { buildDeployParams } from '../scripts/buildDeployParams'
import { Deployer } from '../scripts/Deployer'
import { ethers, parseEther } from 'ethers'
import { it } from 'vitest'
import dotenv from 'dotenv'

it('should send 100 ethers to contract address', async function () {
	const envFilePath = './.env.test'

	// if path is ENV_FILE_PATH=./.env.private, then set network to 'private'
	const network = 'testnet'

	dotenv.config({ path: envFilePath })

	const { API_URL, PRIVATE_KEY } = process.env

	const contractName = 'Simple'
	const contractAddress = '0xa5f41eeb4ddbad0aa7b2b44f4096e6569c81d28b'
	const deployer = new Deployer(API_URL || '', PRIVATE_KEY || '', contractName)
	const provider = deployer.provider
	const wallet = deployer.wallet

	const contractBalance = await provider.getBalance(contractAddress)
	console.log('Contract balance:', contractBalance.toString()) //?

	// const nonce = await provider.getTransactionCount(wallet.address, 'latest')

	// const value = parseEther('100')
	// const tx = await wallet.sendTransaction({
	// 	to: contractAddress,
	// 	value,
	// 	nonce,
	// })
	// await tx.wait()

	// const newContractBalance = await provider.getBalance(contractAddress)

	// console.log('New contract balance:', newContractBalance.toString())
})
