import SharedMap from "../../src/SharedMap/SharedMap";

describe('SharedMap', () => {

	describe('Constructor', () => {
		it('should create an instance with default size and precision', () => {
			const sharedMap = new SharedMap({size: 4096});
			expect(sharedMap).toBeInstanceOf(Object);
			expect(sharedMap.size).toBe(0);
			expect(sharedMap.maxSize).toBe(4096);
			expect(sharedMap.maxPrecision).toBe(12);
		});

		// Additional tests for constructor arguments, error handling, etc.
	});

	describe('set method', () => {
		it('should store a key-value pair', () => {
			const sharedMap = new SharedMap({size: 4096});
			sharedMap.set(1, 100);
			expect(sharedMap.get(1)).toBe(100);
		});

		// Additional tests for set method
	});

	describe('get method', () => {
		it('should retrieve the correct value for a key', () => {
			const sharedMap = new SharedMap({size: 4096});
			sharedMap.set(1, 100);
			expect(sharedMap.get(1)).toBe(100);
		});

		// Additional tests for get method
	});

	// Additional tests for other methods and edge cases
});
