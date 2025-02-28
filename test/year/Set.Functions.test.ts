import { expect } from 'chai'
import { getProxyAddress, upgrade } from '../../scripts/year/upgrade.year'
import { init } from '../../scripts/year/init.year'
import { Year } from '../../typechain-types'
import { JsonRpcProvider, ethers, getAddress, parseEther } from 'ethers'

describe('Set Functions', function () {
	let contract: Year
	let factory: any
	let address: string
	let owner: ethers.Wallet
	let thetaProvider: JsonRpcProvider

	before(async function () {
		try {
			const { contractFactory, wallet, provider } = await init()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			address = proxyAddress
			thetaProvider = provider
			owner = wallet
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	describe('setCost', function () {
		it('setCost', async function () {
			const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest')
			const value = parseEther('1234')

			const tx = await contract.setCost(value, { nonce })

			const response = await tx.wait()
			// console.log('Response:', response)
			//expect(response?.status).to.be.equal(0)

			const cost = await contract.getCost()
			// console.log('Cost:', cost.toString())
			expect(cost).to.equal(value)
		})

		it('setCost to low', async function () {
			const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest')
			const value = parseEther('9')

			try {
				const tx = await contract.setCost(value, { nonce })

				const response = await tx.wait()
				// console.log('Response:', response)
				//expect(response?.status).to.be.equal(0)
			} catch (err: any) {
				// expect error to be defined
				expect(err).to.be.not.undefined
			}

			const cost = await contract.getCost()
			// console.log('Cost:', cost.toString())
			expect(cost).to.above(parseEther('1000'))
		})
	})

	describe('setWithdrawalLimit', function () {
		it('setWithdrawalLimit', async function () {
			const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest')
			const value = parseEther('12345')

			const tx = await contract.setWithdrawalLimit(value, { nonce })

			const response = await tx.wait()
			// console.log('Response:', response)
			//expect(response?.status).to.be.equal(0)

			const withdrawal = await contract.getWithdrawalLimit()
			// console.log('withdrawal:', withdrawal.toString())
			expect(withdrawal).to.equal(value)
		})

		it('setWithdrawalLimit to low', async function () {
			const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest')
			const value = parseEther('99')

			try {
				const tx = await contract.setWithdrawalLimit(value, { nonce })

				const response = await tx.wait()
				// console.log('Response:', response)
				//expect(response?.status).to.be.equal(0)
			} catch (err: any) {
				// expect error to be defined
				expect(err).to.be.not.undefined
			}

			const withdrawal = await contract.getWithdrawalLimit()
			// console.log('withdrawal:', withdrawal.toString())
			expect(withdrawal).to.above(parseEther('10000'))
		})
	})

	describe('setBeneficiary', function () {
		it('setBeneficiary', async function () {
			const nonce = await thetaProvider.getTransactionCount(owner.address, 'latest')
			const beneficiary = getAddress('0x5453DcFd995cedB64b401A9B9ea888a3814394fE')

			const tx = await contract.setBeneficiary(beneficiary, { nonce })

			const response = await tx.wait()
			// console.log('Response:', response)
			//expect(response?.status).to.be.equal(0)

			const beneficiaryAddress = await contract.getBeneficiary()
			// console.log('Beneficiary:', beneficiaryAddress)
			expect(beneficiaryAddress).to.equal(beneficiary)
		})
	})
})
