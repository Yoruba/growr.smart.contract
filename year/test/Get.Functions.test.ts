import { expect } from 'chai'
import { Year } from '../typechain-types'
import { ethers } from 'ethers'
import { init } from '../scripts/init'
import { upgrade } from '../scripts/upgrade'
import { runDeployment } from '../scripts/deploy'
import { execSync } from 'child_process'

describe('Get Functions', function () {
	let yearContract: Year
	let owner: ethers.Wallet

	before(async function () {
		try {
			console.log('Clearing Hardhat cache...')
			execSync('npx hardhat clean', { stdio: 'inherit' })

			// Recompile the contracts
			console.log('Compiling contracts...')
			execSync('npx hardhat compile', { stdio: 'inherit' })

			// console.log('Compiling TypeScript files...')
			// execSync('npx tsc ./scripts/**/*.ts', { stdio: 'inherit' })

			// Deploy the updated contract
			const { contractFactory, wallet, metadata, provider, contract } = await runDeployment()
			yearContract = contract
			owner = wallet
			// console.log('Contract:', contract)
			console.log('address:', contract.target)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	describe('getYear', function () {
		it('should return the year', async function () {
			const year = await yearContract.getYear()
			expect(year).to.equal(2024)
		})
	})

	describe('getBalance', function () {
		it('should return the contract balance', async function () {
			const balance = await yearContract.getBalance()
			expect(balance).to.equal(0)
		})
	})

	describe('getCost', function () {
		it('should return the cost', async function () {
			const cost = await yearContract.getCost()
			expect(cost).to.equal(ethers.parseEther('1000'))
		})
	})

	describe('getWithdrawalLimit', function () {
		it('should return the withdrawal limit', async function () {
			const limit = await yearContract.getWithdrawalLimit()
			expect(limit).to.equal(ethers.parseEther('5000'))
		})
	})

	describe('getContribution', function () {
		it('should return the contribution', async function () {
			const contribution = await yearContract.getContribution(owner.address)
			expect(contribution).to.equal(ethers.parseEther('0'))
		})
	})

	describe('getBeneficiary', function () {
		it('should return the beneficiary', async function () {
			const beneficiary = await yearContract.getBeneficiary()
			expect(beneficiary).to.equal('0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4')
		})
	})
})
