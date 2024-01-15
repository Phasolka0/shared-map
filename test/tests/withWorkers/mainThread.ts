import {Worker} from 'worker_threads';
import SharedMap from "../../../src/SharedMap/SharedMap";
import {MessageToMain} from "../../helpers/MessageToMain";
import {generateRandomNumber} from "../../helpers/utils";
import {MessageToWorker} from "../../helpers/MessageToWorker";
import path from "path";

describe('SharedMap with Worker Threads', () => {
	let sharedMap: SharedMap;
	const workersCount = 16;
	const workers: Worker[] = [];
	const lastWrittenValues = new Map<number, number>();
	const pendingGets = new Map<number, boolean>();
	// const indexToMessageRecords: Record<number, MessageToMain[]> = {}
	// const valueToMessageRecords: Record<number, MessageToMain[]> = {}
	let stop = false
	
	beforeAll(() => {
		sharedMap = new SharedMap({size: 100000});
		const initData = sharedMap.exportInitData()
		
		const workerFilePath = path.resolve(__dirname, '../../../build/test/helpers/worker.js');
		
		for (let i = 0; i < workersCount; i++) {
			const worker = new Worker(workerFilePath);
			
			worker.on('message', receiveMessage);
			worker.postMessage({type: 'init', initData});
			workers.push(worker);
		}
	});
	
	function receiveMessage(message: MessageToMain) {
		// if (!indexToMessageRecords[message.index]) {
		// 	indexToMessageRecords[message.index] = []
		// }
		// if (!valueToMessageRecords[message.value]) {
		// 	valueToMessageRecords[message.value] = []
		// }
		// indexToMessageRecords[message.index].push(message)
		// valueToMessageRecords[message.value].push(message)
		
		if (message.type === 'get') {
			if (pendingGets.has(message.key)) {
				pendingGets.delete(message.key);
				const expectedValue = lastWrittenValues.get(message.key);
				if (message.value !== expectedValue) {
					console.log(message)
					// console.log(indexToMessageRecords[message.index])
					// if (expectedValue) {
					// 	console.log(valueToMessageRecords[expectedValue])
					// } else {
					// 	console.log('!expectedValue')
					// }
					// console.log(valueToMessageRecords)
					
					stop = true
				}
			}
		} else if (message.type === 'set-complete') {
			lastWrittenValues.set(message.key, message.value);
		}
	}
	
	async function sendRandomTask(worker: Worker): Promise<void> {
		const operationType = Math.floor(Math.random() * 2);
		let key: number, value: number;
		
		if (operationType === 0 || lastWrittenValues.size === 0) {
			// Операция "set"
			key = generateRandomNumber();
			value = generateRandomNumber();
			worker.postMessage({type: 'set', key, value} as MessageToWorker);
		} else if (operationType === 1) {
			// Операция "get"
			key = Array.from(lastWrittenValues.keys())[Math.floor(Math.random() * lastWrittenValues.size)];
			worker.postMessage({type: 'get', key} as MessageToWorker);
			pendingGets.set(key, true);
		}
	}
	
	it('performs random set/get tasks correctly', async () => {
		const testRounds = 100;
		const tasksPerRound = 10000;
		for (let i = 0; i < testRounds; ++i) {
			for (let j = 0; j < tasksPerRound; ++j) {
				if (stop) throw 'Unexpected value in GET'
				sendRandomTask(workers[Math.floor(Math.random() * workersCount)]);
			}
		}
		console.log(sharedMap)
	});
	
	it('clears the map correctly', async () => {
		
		// Вызов метода clear
		await sharedMap.clear();
		
		// Проверка, что все значения были очищены
		lastWrittenValues.forEach((_: number, key: number) => {
			const sharedMapValue = sharedMap.get(key);
			expect(sharedMapValue).toEqual(-1); // или другое значение, обозначающее "пусто"
		})
		
		// Проверка, что размер карты равен 0
		expect(sharedMap.size).toEqual(0);
		console.log(sharedMap)
	});
	
	afterAll(async () => {
		workers.forEach(worker => worker.terminate());
		
	});
});
