import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Growr } from '../typechain-types/contracts/Growr'
import { getProxyAddress, runUpgrade, upgrade } from '../scripts/upgrade'
import { init } from '../scripts/init'

describe('Growr', function () {
	let contract: Growr
	let factory: any
	let address: string

	before(async function () {
		console.log('before')
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

	// beforeEach(async function () {
	// 	console.log('beforeEach')
	// 	try {
	// 		contract = await upgrade(address, factory)
	// 	} catch (err: any) {
	// 		console.error(err.message)
	// 	}
	// })

	describe('receive', function () {
		it('should receive ether', async function () {
			const initialBalance = await ethers.provider.getBalance(address)
			console.log('initialBalance', initialBalance.toString())

      // send 1 ether
      
		})
	})

	// it("should record the contribution correctly", async function () {
	//   const sender = await ethers.getSigner(0);
	//   const value = ethers.utils.parseEther("1");

	//   await growr.connect(sender).sendTransaction({ value });

	//   expect(await growr.contributions(sender.address)).to.equal(value);
	// });

	describe('payment status', function () {
		it('should return 3 if the value is ONE_YEAR_COST', async function () {
			const value = await contract.validateValue(1000)
			expect(value).to.equal(3)
		})

		it('should return 0 if the value is less than ONE_YEAR_COST', async function () {
			const value = await contract.validateValue(999)
			expect(value).to.equal(0)
		})

		// it('should return 1 if the value is a multiple of high', async function () {
		// 	const value = await contract.validateValue(22000)
		// 	expect(value).to.equal(1)
		// })

		it('should return 2 if the value is a not a multiple of ONE_YEAR_COST', async function () {
			const value = await contract.validateValue(1500)
			expect(value).to.equal(2)
		})

		it('should return 4 if the value is a multiply of ONE_YEAR_COST', async function () {
			const value = await contract.validateValue(2000)
			expect(value).to.equal(4)
		})
	})

	describe('multiplier', function () {
		it('should return false when not equal to ONE_YEAR_COST', async function () {
			const value = await contract.multiplier(1500)
			expect(value).to.equal(false)
		})

		it('should return true when is equal to ONE_YEAR_COST', async function () {
			const value = await contract.multiplier(1000)
			expect(value).to.equal(true)
		})

		it('should return true when is multiply of ONE_YEAR_COST', async function () {
			const value = await contract.multiplier(2000)
			expect(value).to.equal(true)
		})
	})
})
