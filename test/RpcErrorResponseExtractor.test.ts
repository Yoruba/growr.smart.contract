import { expect } from 'chai'
import { extractError } from '../scripts/helpers/RpcErrorResponseExtractor'
import { Param } from '../interfaces/RpcResponse'
import { json } from 'stream/consumers'

describe('extractError', function () {
	it('should extract the error message from the input', function () {
		const input = `Error: missing revert data (action="estimateGas", data=null, reason=null, transaction={ "data": "0x881537a6", "from": "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A", "to": "0x92978F7905BA3c38354a2C943f9614BdF9872E8c" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.13.5)
    at makeError  {
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

		const lines = input.split('(')
		const error = lines[0].trim()
		const message = lines[1].split(')')[0].trim()
		// console.log(lines[1].split('{')[1].split('}')[0].trim())

		const jsonPart = `{${input.split(' transaction: {')[1].split('}')[0].trim()}}`
		console.log(jsonPart)

		const payload = JSON.parse(jsonPart)
		console.log(payload)

		// const expectedOutput = {
		// 	error: 'missing revert data',
		// 	message:
		// 		'missing revert data (action="estimateGas", data=null, reason=null, transaction={ "data": "0x881537a6", "from": "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A", "to": "0x92978F7905BA3c38354a2C943f9614BdF9872E8c" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.13.5)',
		// 	payload: {
		// 		method: 'eth_estimateGas',
		// 		params: Param[],
		// 		id: 26,
		// 		jsonrpc: '2.0',
		// 	},
		// }

		// const result = extractError(input)

		// expect(result).to.deep.equal(expectedOutput)
	})
})
