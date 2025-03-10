import { expect } from 'chai'
import { ethers, parseEther } from 'ethers'
import { buildDeployParams } from '../scripts/buildDeployParams'
import { DeployParams } from '../scripts/DeployParams'
import { execSync } from 'child_process'
import { Year } from '../typechain-types'
import { Deployer } from '../scripts/Deployer'

describe('Get Functions', function () {
	let contract: Year
	let owner: ethers.Wallet
	let factory: any
	const deployParams: DeployParams = buildDeployParams()

	before(async function () {
		try {
			console.log('Clearing Hardhat cache...')
			execSync('npx hardhat clean', { stdio: 'inherit' })

			// Recompile the contracts
			console.log('Compiling contracts...')
			execSync('npx hardhat compile', { stdio: 'inherit' })

			const deployer = new Deployer(deployParams.apiUrl, deployParams.privateKey, deployParams.contractName)
			owner = deployer.wallet
			contract = await deployer.deployProxy([
				owner.address,
				2024,
				ethers.parseEther('1000'),
				ethers.parseEther('5000'),
				'0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4',
			])
			factory = deployer.contractFactory
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

	// get owner
	describe('getOwner', function () {
		it('should return the owner', async function () {
			const owner = await contract.getOwner()
			expect(owner).to.equal(owner)
		})
	})
})
