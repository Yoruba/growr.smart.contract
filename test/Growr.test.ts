import { expect } from 'chai'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'

describe('Growr', function () {
	let contract: Growr
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

	describe('getYear', function () {
		it('should return the year', async function () {
			const year = await contract.getYear()
			expect(year).to.equal(2024)
		})
	})

	describe('getBalance', function () {
		it('should return the contract balance', async function () {
			const balance = await contract.getBalance()
			expect(balance).to.equal(0)
		})
	})
})
