import ISharedMapInitData from "../../src/SharedMap/ISharedMapInitData";

export type MessageToWorker =
	| { type: 'init'; initData: ISharedMapInitData }
	| { type: 'set'; key: number; value: number }
	| { type: 'get'; key: number }
