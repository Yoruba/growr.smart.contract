import { expect } from 'chai'
import { init } from '../../scripts/year/init.year'
import { Wallet, parseEther } from 'ethers'
import { Year } from '../../typechain-types'
import { getProxyAddress, upgrade } from '../../scripts/year/upgrade.year'
import { bigint } from 'hardhat/internal/core/params/argumentTypes'

describe('Drain', function () {
	let contract: Year
	let factory: any
	let proxyContractAddress: string
	let senderWallet: Wallet
	let thetaProvider: any
	const beneficiary = '0xE873f6A0e5c72aD7030Bb4e0d3B3005C8C087DF4'

	beforeEach(async function () {
		try {
			const { contractFactory, wallet, provider } = await init()
			const proxyAddress = await getProxyAddress('unknown-366')
			factory = contractFactory
			proxyContractAddress = proxyAddress
			senderWallet = wallet
			thetaProvider = provider
			contract = await upgrade(proxyAddress, contractFactory)
		} catch (err: any) {
			console.error('Error:', err.message)
		}
	})

	// transfer all funds of contract to owner
	describe('drain', function () {
		it('should drain all funds', async function () {
			// get balance of smart contract
			const balanceContract = await contract.getBalance()
			console.log('Balance contract:', balanceContract.toString())

			const initialBeneficiary = await thetaProvider.getBalance(beneficiary)
			console.log('Balance beneficiary:', initialBeneficiary.toString())

			// ----------- contribute to contract can only be once------------
			if (balanceContract === 0n) {
				// get sender balance
				const senderBalance = await thetaProvider.getBalance(senderWallet.address)
				console.log('Sender balance:', senderBalance.toString())

				// send tokens
				// get cost
				const cost = await contract.getCost()
				const fundsInWei = cost
				console.log(`Sender wallet has no funds. Send ${fundsInWei.toString()} to contract`)
				const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
				let transaction = await senderWallet.sendTransaction({
					to: proxyContractAddress,
					value: fundsInWei,
					nonce,
				})

				let response = await transaction.wait()
				expect(response?.status).to.be.equal(1)

				const contractBalance = await contract.getBalance()
				console.log('Contract balance:', contractBalance.toString())
			}

			// owner is the sender not the smart contract
			const nonce = await thetaProvider.getTransactionCount(senderWallet.address, 'latest')
			console.log('Nonce:', nonce)
			let transaction = await contract.drain({ nonce })

			let response = await transaction.wait()
			// console.log('Response:', response)
			expect(response?.status).to.be.equal(1)

			const contractBalance = await contract.getBalance()
			console.log('Contract balance:', contractBalance.toString())
			const finalBalanceBeneficiary = await thetaProvider.getBalance(beneficiary)

			expect(contractBalance).to.equal(0)
			expect(finalBalanceBeneficiary).to.equal(initialBeneficiary + balanceContract)

			// Get all past events (useful for initial loading)
			const filter = contract.filters.Withdrawal()

			// get last block
			const block = await thetaProvider.getBlockNumber()
			const events = await contract.queryFilter(filter, block - 10, 'latest') // From block 0 to latest

			// event FundsReceived(address indexed sender, uint256 amount, uint256 year);
			events.forEach((event: any) => {
				console.log('Funder:', event.args.sender)
				console.log('Amount:', event.args.amount.toString())
				console.log('Recipient:', event.args.recipient.toString())
			})
		})
	})
})
