import {parentPort} from 'worker_threads';
import {MessageToWorker} from "./MessageToWorker";
import SharedMap from "../../src/SharedMap/SharedMap.js";

let sharedMap: SharedMap;

if (parentPort) {
	parentPort.on('message', async (message: MessageToWorker) => {
		if (!parentPort) return
		
		if (message.type === 'init' && message.initData) {
			sharedMap = SharedMap.connectWithInitData(message.initData);
		} else if (message.type === 'set' && message.key !== undefined && message.value !== undefined) {
			sharedMap.set(message.key, message.value);
			const index = sharedMap['findIndexForGet'](message.key)
			parentPort.postMessage({type: 'set-complete', key: message.key, value: message.value, index});
		} else if (message.type === 'get' && message.key !== undefined) {
			const value = sharedMap.get(message.key);
			const index = sharedMap['findIndexForGet'](message.key)
			parentPort.postMessage({type: 'get', key: message.key, value, index});
		}
	});
}
