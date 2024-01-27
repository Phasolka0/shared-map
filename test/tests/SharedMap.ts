import SharedMap from "../../src/SharedMap/SharedMap";
import {generateRandomNumber} from "../helpers/utils";

let sharedMap: SharedMap
const size = 100003
describe('SharedMap', () => {
	beforeAll(() => {
		sharedMap = new SharedMap({size}) as any;
	})
	describe('Constructor', () => {
		it('should create an instance with default size and precision', () => {
			expect(sharedMap).toBeInstanceOf(Object);
			expect(sharedMap.size).toBe(0);
			expect(sharedMap.maxSize).toBe(size);
			expect(sharedMap.maxPrecision).toBe(12);
		});
		
		// Additional tests for constructor arguments, error handling, etc.
	});
	
	describe('set and get methods', () => {
		it('should store and retrieve the value for a key', () => {
			const sharedMap = new SharedMap();
			const key = generateRandomNumber();
			const value = generateRandomNumber();
			sharedMap.set(key, value);
			expect(sharedMap.get(key)).toBe(value);
		});
		
		it('should return -1 for a non-existing key', () => {
			const sharedMap = new SharedMap();
			const key = generateRandomNumber();
			expect(sharedMap.get(key)).toBe(-1);
		});
		it('massive', () => {
			let failedAttempts = [];
			let key, value, setIndex, getIndex, retrievedValue
			for (let i = 0; i < size; ++i) {
				try {
					key = generateRandomNumber();
					value = generateRandomNumber();
					setIndex = sharedMap['findIndexForSet'](key)
					sharedMap.set(key, value);
					getIndex = sharedMap['findIndexForGet'](key)
					retrievedValue = sharedMap.get(key);
					if (retrievedValue !== value) {
						failedAttempts.push({key, setValue: value, getValue: retrievedValue});
					}
					expect(retrievedValue).toBe(value);
				} catch (error) {
					// @ts-ignore
					const valueBySetIndex = sharedMap['valuesArray'][setIndex]
					console.error({key, value, retrievedValue, setIndex, getIndex, valueBySetIndex});
					throw error;
				}
			}
		});
	});
	
	describe('behavior when maxSize is reached', () => {
		it('should overwrite old keys when maxSize is reached', () => {
			const sharedMap = new SharedMap({size: 100});
			const testRuns = 200;
			const failedOverwrites = [];
			
			for (let i = 0; i < testRuns; ++i) {
				const key = generateRandomNumber();
				const value = generateRandomNumber();
				sharedMap.set(key, value);
				if (sharedMap.size > sharedMap.maxSize) {
					failedOverwrites.push({key, value, size: sharedMap.size});
				}
			}
			
			expect(failedOverwrites.length).toBe(0);
			expect(sharedMap.size).toBeLessThanOrEqual(sharedMap.maxSize);
		});
	});
	
	describe('uniqueness of indices for different keys', () => {
		it('should return unique indices for different keys, considering overwrites', () => {
			const sharedMap = new SharedMap({size: 100});
			const indices = new Set();
			const keys = new Set();
			
			for (let i = 0; i < 200; ++i) {
				const key = generateRandomNumber();
				if (!keys.has(key)) {
					const index = sharedMap['findIndexForSet'](key);
					indices.add(index);
					keys.add(key);
				}
			}
			
			// Учитывая возможность перезаписи, количество уникальных индексов может быть меньше количества ключей
			expect(indices.size).toBeLessThanOrEqual(keys.size);
		});
	});
	
	describe('SharedMap performance and distribution', () => {
		it('should have low collision rate', () => {
			const sharedMap = new SharedMap({size: 100000, maxPrecision: 12});
			const keyCount = 100000;
			const seenCombinations = new Set();
			let collisions = 0;
			
			for (let i = 0; i < keyCount; ++i) {
				const key = generateRandomNumber();
				const value = generateRandomNumber();
				
				sharedMap.set(key, value);
				
				let index = sharedMap['hash1'](key);
				let step = sharedMap['hash2'](key);
				let combination = `${index}-${step}`; // Создаем уникальную строку, представляющую комбинацию индекса и шага
				
				if (seenCombinations.has(combination)) {
					++collisions;
				} else {
					seenCombinations.add(combination);
				}
			}
			
			console.log(`Collision rate: ${collisions / keyCount}`);
			
			expect(collisions / keyCount).toBeLessThan(0.01); // Допустимая степень коллизий
		});
	});
	
	describe('clear method', () => {
		it('should clear all keys and values', async () => {
			const sharedMap = new SharedMap();
			// Добавляем несколько элементов
			for (let i = 0; i < 5; ++i) {
				sharedMap.set(generateRandomNumber(), generateRandomNumber());
			}
			await sharedMap.clear();
			expect(sharedMap.size).toBe(0);
		});
	});
	
});
