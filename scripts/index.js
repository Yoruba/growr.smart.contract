import { ethers } from 'ethers'
import fs from 'fs'

 require('dotenv').config({ path: './.env.private' })
//require('dotenv').config({ path: './.env.test' })
const { API_URL, PRIVATE_KEY } = process.env
const jsonFile = './artifacts/contracts/videopassNFT.sol/videopassNFT.json'

console.log(API_URL)
console.log(PRIVATE_KEY)

async function main() {
	const provider = new ethers.providers.JsonRpcProvider(API_URL)
	const wallet = new ethers.Wallet(PRIVATE_KEY || '', provider)

	console.log(`deployer address ${wallet.address}`)
	console.log(`deployer balance ${await wallet.getBalance()}`)

	const metadata = JSON.parse(fs.readFileSync(jsonFile).toString())

	const contractFactory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)
	const contract = await contractFactory.deploy()

	await contract.deployTransaction.wait()

	console.log('contract address:', contract.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
