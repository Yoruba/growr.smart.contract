import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-truffle5'
import '@nomiclabs/hardhat-web3'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'

const config: HardhatUserConfig = {
	defaultNetwork: 'theta_privatenet',
	networks: {
		theta_privatenet: {
			url: 'http://localhost:18888/rpc',
			accounts: [
				'1111111111111111111111111111111111111111111111111111111111111111', // 0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A
				'2222222222222222222222222222222222222222222222222222222222222222', // 0x1563915e194D8CfBA1943570603F7606A3115508
				'3333333333333333333333333333333333333333333333333333333333333333', // 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB
				'4444444444444444444444444444444444444444444444444444444444444444', // 0x7564105E977516C53bE337314c7E53838967bDaC
			],
			chainId: 366,
			gasPrice: 4000000000000,
		},
		theta_testnet: {
			// https://testnet-explorer.thetatoken.org/
			url: `https://eth-rpc-api-testnet.thetatoken.org/rpc`,
			accounts: ['1111111111111111111111111111111111111111111111111111111111111111'],
			chainId: 365,
			gasPrice: 4000000000000,
		},
		theta_mainnet: {
			url: `https://eth-rpc-api.thetatoken.org/rpc`,
			accounts: ['1111111111111111111111111111111111111111111111111111111111111111'],
			chainId: 361,
			gasPrice: 4000000000000,
		},
	},
	typechain: {
		outDir: 'typechain-types',
		target: 'ethers-v6',
	},
	solidity: {
		version: '0.8.28',
		settings: {
			optimizer: {
				enabled: true,
				runs: 800,
			},
			metadata: {
				// do not include the metadata hash, since this is machine dependent
				// and we want all generated code to be deterministic
				// https://docs.soliditylang.org/en/v0.7.6/metadata.html
				bytecodeHash: 'none',
			},
		},
	},
	watcher: {
		// The task name to run tests = 'test'
		test: {
			tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
			files: ['./test/**/*.ts', './contracts/**/*.sol', './scripts/**/*.ts'],
			verbose: true,
		},
	},
}

export default config
