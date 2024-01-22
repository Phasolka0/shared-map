import {Request, Response} from 'express';
import {ClassType, MethodType} from '../types';
import SharedMap from "../../../../src/SharedMap/SharedMap";
import {getRandomFloat} from "../../../helpers/utils";

const MAX_KEYS = 100000;
const NUMBER_OF_GET_KEYS = 10000;
const GET_KEYS_POOL_SIZE = 2000;
const TASKS_POOL_SIZE = 1000;
const sharedMap = new SharedMap({size: MAX_KEYS});
const map: Map<number, number> = new Map();

let keysCache = new Array(MAX_KEYS).fill(null).map(() => getRandomFloat());
let tasksPool: number[][] = [];
let getKeysPool: number[][] = [];

function regenerateData() {
	// Перегенерировать keysCache напрямую без .fill().map()
	for (let i = 0; i < MAX_KEYS; i++) {
		keysCache[i] = getRandomFloat();
	}
	
	// Перегенерировать tasksPool
	for (let i = 0; i < TASKS_POOL_SIZE * 2; i++) {
		if (!tasksPool[i]) {
			tasksPool[i] = new Array(MAX_KEYS);
		}
		for (let j = 0; j < MAX_KEYS; j++) {
			tasksPool[i][j] = getRandomFloat();
		}
	}
	
	// Перегенерировать getKeysPool
	for (let i = 0; i < GET_KEYS_POOL_SIZE * 2; i++) {
		if (!getKeysPool[i]) {
			getKeysPool[i] = new Array(NUMBER_OF_GET_KEYS);
		}
		getKeysPool[i] = getRandomKeys(keysCache, NUMBER_OF_GET_KEYS);
	}
}

regenerateData(); // Инициализация при старте сервера

export const handleTaskRequest = async (req: Request, res: Response) => {
	const {classType, method}: { classType: ClassType, method: MethodType } = req.body;
	const usedMap = classType === 'SimpleMap' ? map : sharedMap;
	
	if (method === 'set') {
		const tasks = tasksPool.pop();
		if (!tasks) {
			return res.status(500).send('No more pre-generated task sets available');
		}
		tasks.forEach((value, index) => {
			usedMap.set(keysCache[index], value);
		});
		res.end();
	} else if (method === 'get') {
		let globalCounter = 0;
		let randomKeys = getKeysPool.pop();
		if (!randomKeys) {
			return res.status(500).send('No more pre-generated key available');
		}
		randomKeys.forEach((key) => {
			let value = usedMap.get(key);
			if (value !== undefined) {
				globalCounter += value;
			}
		});
		res.send(globalCounter.toString());
	} else if (method === 'clear') {
		usedMap.clear();
		res.end();
	} else if (method === 'regenerate') {
		regenerateData()
		res.end();
		
	} else {
		res.status(400).send('Invalid method');
	}
};

function getRandomKeys(keysCache: number[], numberOfKeys: number) {
	const result = new Array(numberOfKeys);
	const taken = new Array(numberOfKeys);
	let maxIndex = MAX_KEYS; // Используйте переменную для уменьшения индекса
	
	for (let i = 0; i < numberOfKeys; i++) {
		let x = Math.floor(Math.random() * (maxIndex - i));
		result[i] = keysCache[x in taken ? taken[x] : x];
		taken[x] = --maxIndex in taken ? taken[maxIndex] : maxIndex;
	}
	
	return result;
}

