import {SharedMapConstructorOParams} from "../../src/SharedMap/SharedMapConstructorOParams";

export type MessageToWorker =
	| { type: 'init'; initData: SharedMapConstructorOParams }
	| { type: 'set'; key: number; value: number }
	| { type: 'get'; key: number }
	| { type: 'size' }
