import { expect } from 'chai'
import { getProxyAddress, upgrade } from '../scripts/year/upgrade.year'
import { initYear } from '../scripts/year/init.year'
import { Year } from '../typechain-types'
import { JsonRpcProvider, ethers, getAddress, parseEther } from 'ethers'

describe('Set Not Owner Functions', function () {
	let contract: Year
	let factory: any
	let address: string
	let owner: ethers.Wallet
	let nonOwner: any
	let thetaProvider: JsonRpcProvider

	before(async function () {
		try {
			const { contractFactory, wallet, provider } = await initYear()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			address = proxyAddress
			thetaProvider = provider
			owner = wallet
			contract = await upgrade(proxyAddress, contractFactory)
			nonOwner = ethers.Wallet.createRandom().connect(provider) // Create a non-owner wallet
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	describe('setCost', function () {
		it('should fail when called by non-owner', async function () {
			const nonce = await thetaProvider.getTransactionCount(nonOwner.address, 'latest')
			const value = parseEther('9')

			try {
				const tx = await contract.connect(nonOwner).setCost(value, { nonce })
				await tx.wait()
			} catch (err: any) {
				expect(err).to.be.not.undefined
			}

			const cost = await contract.getCost()
			expect(cost).to.be.above(parseEther('1000'))
		})
	})

	describe('setWithdrawalLimit', function () {
		it('should fail when called by non-owner', async function () {
			const nonce = await thetaProvider.getTransactionCount(nonOwner.address, 'latest')
			const value = parseEther('99')

			try {
				const tx = await contract.connect(nonOwner).setWithdrawalLimit(value, { nonce })
				await tx.wait()
			} catch (err: any) {
				expect(err).to.be.not.undefined
			}

			const withdrawal = await contract.getWithdrawalLimit()
			expect(withdrawal).to.be.above(parseEther('10000'))
		})
	})

	describe('setBeneficiary', function () {
		it('should fail when called by non-owner', async function () {
			const nonce = await thetaProvider.getTransactionCount(nonOwner.address, 'latest')
			const beneficiary = getAddress('0x5453DcFd995cedB64b401A9B9ea888a3814394fE')

			try {
				const tx = await contract.connect(nonOwner).setBeneficiary(beneficiary, { nonce })
				await tx.wait()
			} catch (err: any) {
				expect(err).to.be.not.undefined
			}

			const beneficiaryAddress = await contract.getBeneficiary()
			expect(beneficiaryAddress).to.not.equal('0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4')
		})
	})
})
