import { expect } from 'chai'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Year } from '../typechain-types'
import { ethers, parseEther } from 'ethers'
import { YearFactory, YearFactoryInterface } from '../typechain-types/contracts/YearFactory'

describe('Functions', function () {
	let contract: YearFactory
	let factory: any
	let address: string

	before(async function () {
		try {
			const { contractFactory } = await init()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			address = proxyAddress
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	// deploy year contact
	it('deployYearContract', async function () {
		const yearContract = await contract.deployYear(2024, parseEther('1000'), parseEther('5000'))
		expect(yearContract).to.be.a('string')
	})

	// getyearcontract
	it('getYearContract', async function () {
		const yearContract = await contract.getYearContract(2024)
		expect(yearContract).to.be.a('string')
	})
})
