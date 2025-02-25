import { expect } from 'chai'
import { extractError } from '../scripts/extractError'

describe('extractError', function () {
	it('should extract the error message from the input', function () {
		const input = `Error: missing revert data (action="estimateGas", data=null, reason=null, transaction={ "data": "0x881537a6", "from": "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A", "to": "0x92978F7905BA3c38354a2C943f9614BdF9872E8c" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.13.5)
    at makeError (/home/nuc/Documents/ggrow/growr.smart.contract/node_modules/ethers/src.ts/utils/errors.ts:694:21)
    at getBuiltinCallException (/home/nuc/Documents/ggrow/growr.smart.contract/node_modules/ethers/src.ts/abi/abi-coder.ts:118:21)
    at Function.getBuiltinCallException (/home/nuc/Documents/ggrow/growr.smart.contract/node_modules/ethers/src.ts/abi/abi-coder.ts:235:16)
    at JsonRpcProvider.getRpcError (/home/nuc/Documents/ggrow/growr.smart.contract/node_modules/ethers/src.ts/providers/provider-jsonrpc.ts:989:32)
    at /home/nuc/Documents/ggrow/growr.smart.contract/node_modules/ethers/src.ts/providers/provider-jsonrpc.ts:563:45
    at processTicksAndRejections (node:internal/process/task_queues:95:5) {
  code: 'CALL_EXCEPTION',
  action: 'estimateGas',
  data: null,
  reason: null,
  transaction: {
    to: '0x92978F7905BA3c38354a2C943f9614BdF9872E8c',
    data: '0x881537a6',
    from: '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
  },
  invocation: null,
  revert: null,
  shortMessage: 'missing revert data',
  info: {
    error: { code: -32000, message: 'evm: execution reverted' },
    payload: {
      method: 'eth_estimateGas',
      params: [Array],
      id: 26,
      jsonrpc: '2.0'
    }
  }
}`

		const expectedOutput = {
			error: 'missing revert data',
			message:
				'missing revert data (action="estimateGas", data=null, reason=null, transaction={ "data": "0x881537a6", "from": "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A", "to": "0x92978F7905BA3c38354a2C943f9614BdF9872E8c" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.13.5)',
			payload: {
				method: 'eth_estimateGas',
				params: [Array],
				id: 26,
				jsonrpc: '2.0',
			},
		}

		const result = extractError(input)

		expect(result).to.deep.equal(expectedOutput)
	})
})
