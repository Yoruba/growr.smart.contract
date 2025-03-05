import { expect } from 'chai'
import { getProxyAddress, upgrade } from '../../scripts/year/upgrade.year'
import { initYear } from '../../scripts/year/init.year'
import { Year } from '../../typechain-types'
import { ethers } from 'ethers'

describe('Get Functions', function () {
	let contract: Year
	let factory: any
	let address: string
	let owner: ethers.Wallet

	before(async function () {
		try {
			const { contractFactory, wallet } = await initYear()
			const proxyAddress = process.env.PROXY_ADDRESS || ''
			factory = contractFactory
			address = proxyAddress
			owner = wallet
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

	describe('getWithdrawalLimit', function () {
		it('should return the withdrawal limit', async function () {
			const limit = await contract.getWithdrawalLimit()
			expect(limit).to.equal(ethers.parseEther('5000'))
		})
	})

	describe('getContribution', function () {
		it('should return the contribution', async function () {
			const contribution = await contract.getContribution(owner.address)
			expect(contribution).to.equal(ethers.parseEther('0'))
		})
	})

	describe('getBeneficiary', function () {
		it('should return the beneficiary', async function () {
			const beneficiary = await contract.getBeneficiary()
			expect(beneficiary).to.equal('0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4')
		})
	})
})
