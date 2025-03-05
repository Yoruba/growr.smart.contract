import { ethers } from 'ethers'
import { deploy } from './init'
import { init } from './init'

export async function runDeployment(): Promise<ethers.BaseContract | undefined> {
	console.log('00 [SETUP] run')
	const { contractFactory, wallet,  metadata, provider } = await init()

	const contract = await deploy(contractFactory, wallet)

	const address = ((await contract?.getAddress()) || '').toString()
	const yearContract = new ethers.Contract(address, metadata.abi, provider)
	// get value of cost, year, withdrawalLimit and beneficiary
	const value = await yearContract.getYear()
	const cost = await yearContract.getCost()
	const withdrawalLimit = await yearContract.getWithdrawalLimit()
	const beneficiary = await yearContract.getBeneficiary()
	const owner = await yearContract.getOwner()
	console.log(`Owner: ${owner} Year: ${value}, Cost: ${cost}, Withdrawal Limit: ${withdrawalLimit}, Beneficiary: ${beneficiary}`)

	return contract
}

runDeployment()
