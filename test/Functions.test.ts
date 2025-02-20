import { expect } from 'chai'
import { getProxyAddress, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'
import { Year } from '../typechain-types'
import { ethers, parseEther } from 'ethers';

describe('Functions', function () {
	let contract: Year
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

	describe('getCost', function () {
		it('should return the cost', async function () {
			const cost = await contract.getCost()
			expect(cost).to.equal(ethers.parseEther('1000'))
		})
	})

	// get withdrawal limit
	describe('getWithdrawalLimit', function () {
		it('should return the withdrawal limit', async function () {
			const limit = await contract.getWithdrawalLimit()
			expect(limit).to.equal(ethers.parseEther('5000'))
		})
	})

})
