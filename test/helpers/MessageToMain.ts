export type  MessageToMain =
	| { type: 'set-complete'; key: number; value: number, index: number }
	| { type: 'get'; key: number; value: number, index: number }
