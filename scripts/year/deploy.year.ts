import { ethers } from 'ethers'
import { deployYearProxy } from './init.year'
import { initYear } from './init.year'

// for testing with factory
export async function runYearDeployment(): Promise<ethers.BaseContract | undefined> {
	console.log('01 [YEAR] run deployment for year contract')
	const { yearFactory, provider, yearMetadata, wallet } = await initYear()

	const contract = await deployYearProxy(yearFactory, wallet, provider, yearMetadata)

	const address = ((await contract?.getAddress()) || '').toString()
	const yearContract = new ethers.Contract(address, yearMetadata.abi, provider)
	// get value of cost, year, withdrawalLimit and beneficiary
	const value = await yearContract.getYear()
	const cost = await yearContract.getCost()
	const withdrawalLimit = await yearContract.getWithdrawalLimit()
	const beneficiary = await yearContract.getBeneficiary()
	const owner = await yearContract.getOwner()
	console.log(`Owner: ${owner} Year: ${value}, Cost: ${cost}, Withdrawal Limit: ${withdrawalLimit}, Beneficiary: ${beneficiary}`)

	return contract
}

export async function runDeploymentYearOnly(): Promise<ethers.BaseContract | undefined> {
	console.log('01 [YEAR] run deployment for year contract')
	const { yearFactory, wallet, provider, yearMetadata } = await initYear()

	const contract = await deployYearProxy(yearFactory, wallet, provider, yearMetadata)

	const address = contract?.target || ''
	const yearContract = new ethers.Contract(address, yearMetadata.abi, provider)
	// get value of cost, year, withdrawalLimit and beneficiary
	const value = await yearContract.getYear()
	const cost = await yearContract.getCost()
	const withdrawalLimit = await yearContract.getWithdrawalLimit()
	const beneficiary = await yearContract.getBeneficiary()
	const owner = await yearContract.getOwner()
	console.log(`Owner: ${owner} Year: ${value}, Cost: ${cost}, Withdrawal Limit: ${withdrawalLimit}, Beneficiary: ${beneficiary}`)

	return contract
}

// for testing year only
runDeploymentYearOnly()
