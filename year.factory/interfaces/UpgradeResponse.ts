export interface UpgradeResponse {
	target: string
	interface: Interface
	runner: Runner
	filters: Provider
	deployTransaction: DeployTransaction
}

interface DeployTransaction {
	_type: string
	accessList: null
	blockNumber: null
	blockHash: null
	blobVersionedHashes: null
	chainId: string
	data: string
	from: string
	gasLimit: string
	gasPrice: string
	hash: string
	maxFeePerGas: null
	maxPriorityFeePerGas: null
	maxFeePerBlobGas: null
	nonce: number
	signature: Signature
	to: string
	type: number
	value: string
}

interface Signature {
	_type: string
	networkV: string
	r: string
	s: string
	v: number
}

interface Runner {
	provider: Provider
	address: string
}

interface Provider {}

interface Interface {
	fragments: Fragment[]
	deploy: Deploy
	fallback: null
	receive: boolean
}

interface Deploy {
	type: string
	inputs: any[]
	payable: boolean
	gas: null
}

interface Fragment {
	type: string
	inputs: (Input | Inputs2)[]
	payable?: boolean
	gas?: null
	name?: string
	anonymous?: boolean
	constant?: boolean
	outputs?: Input[]
	stateMutability?: string
}

interface Inputs2 {
	name: string
	type: string
	baseType: string
	indexed: boolean
	components: null
	arrayLength: null
	arrayChildren: null
}

interface Input {
	name: string
	type: string
	baseType: string
	components: null
	arrayLength: null
	arrayChildren: null
}
