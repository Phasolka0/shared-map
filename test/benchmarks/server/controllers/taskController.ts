import {Request, Response} from 'express';
import {ClassType, MethodType} from '../types';
import SharedMap from "../../../../src/SharedMap/SharedMap";
import {getRandomFloat} from "../../../helpers/utils";

const MAX_KEYS = 100000;
const NUMBER_OF_GET_KEYS = 10000;
const GET_KEYS_POOL_SIZE = 2000;
const TASKS_POOL_SIZE = 2000;
const sharedMap = new SharedMap({size: MAX_KEYS});
const map: Map<number, number> = new Map();

let keysCache = new Array(MAX_KEYS).fill(null).map(() => getRandomFloat());
let tasksPool: number[][] = [];
let getKeysPool: number[][] = [];

function regenerateData() {
	keysCache = keysCache.map(() => getRandomFloat());
	tasksPool = new Array(TASKS_POOL_SIZE).fill(null).map(() => new Array(MAX_KEYS).fill(null).map(() => getRandomFloat()));
	getKeysPool = new Array(GET_KEYS_POOL_SIZE).fill(null).map(() => getRandomKeys(keysCache, NUMBER_OF_GET_KEYS));
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
			return res.status(500).send('No more pre-generated key sets available');
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
		if (classType === 'SharedMap') regenerateData();
		
	} else {
		res.status(400).send('Invalid method');
	}
};

function getRandomKeys(keysCache: number[], numberOfKeys: number) {
	let shuffledKeys = [...keysCache];
	let m = shuffledKeys.length, t, i;
	
	while (m) {
		i = Math.floor(Math.random() * m--);
		
		t = shuffledKeys[m];
		shuffledKeys[m] = shuffledKeys[i];
		shuffledKeys[i] = t;
	}
	
	return shuffledKeys.slice(0, numberOfKeys);
}
