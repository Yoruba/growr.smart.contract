export interface RpcErrorResponse {
	error: string
	message: string
	payload: Payload
}

export interface RpcResponse {
	code: string
	action: string
	data: null
	reason: null
	transaction: Transaction
	invocation: null
	revert: null
	shortMessage: string
	info: Info
}

interface Info {
	error: Error
	payload: Payload
}

interface Payload {
	method: string
	params: Param[]
	id: number
	jsonrpc: string
}

export interface Param {
	nonce: string
	value: string
	from: string
	to: string
}

interface Error {
	code: number
	message: string
}

export interface Transaction {
	to: string
	data: string
	from: string
}
