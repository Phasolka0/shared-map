import SharedMap from "../../src/SharedMap/SharedMap";
import {getRandomFloat} from "../helpers/utils";
import Benchmark from "benchmark";

const map = new Map<number, number>();
const sharedMap = new SharedMap({size: 100000});

const totalKeys = 100000;
const keys: number[] = Array.from({length: totalKeys}, () => getRandomFloat());

const suiteOptions: Benchmark.Options = {
	minSamples: 200,
	maxTime: 15
};

let currentKeyIndex = 0;

const setMapBenchmark = () => {
	const key = keys[currentKeyIndex % totalKeys];
	map.set(key, getRandomFloat());
	currentKeyIndex++;
};

const getMapBenchmark = () => {
	const key = keys[currentKeyIndex % totalKeys];
	map.get(key);
	currentKeyIndex++;
};

const setSharedMapBenchmark = () => {
	const key = keys[currentKeyIndex % totalKeys];
	sharedMap.set(key, getRandomFloat());
	currentKeyIndex++;
};

const getSharedMapBenchmark = () => {
	const key = keys[currentKeyIndex % totalKeys];
	sharedMap.get(key);
	currentKeyIndex++;
};

const createSuite = (operationName: string, mapBenchmark: () => void, sharedMapBenchmark: () => void) => {
	const suite = new Benchmark.Suite(`${operationName} Operations`, suiteOptions);
	suite
	.add(`Map ${operationName}`, mapBenchmark)
	.add(`SharedMap ${operationName}`, sharedMapBenchmark)
	.on('cycle', (event: Benchmark.Event) => {
		console.log(String(event.target));
	})
	.on('complete', function (this: Benchmark.Suite) {
		let mapBenchmarkMean, sharedMapBenchmarkMean;
		
		this.forEach((benchmark: Benchmark) => {
			if (benchmark.name === `Map ${operationName}`) {
				mapBenchmarkMean = benchmark.stats.mean;
			} else if (benchmark.name === `SharedMap ${operationName}`) {
				sharedMapBenchmarkMean = benchmark.stats.mean;
			}
		});
		
		if (mapBenchmarkMean !== undefined && sharedMapBenchmarkMean !== undefined) {
			const speedRatio = sharedMapBenchmarkMean / mapBenchmarkMean;
			console.log(`SharedMap ${operationName} is ${(1 / speedRatio).toFixed(2)} times faster than Map ${operationName}`);
		}
	});
	
	return suite;
};

const setSuite = createSuite('Set', setMapBenchmark, setSharedMapBenchmark);
const getSuite = createSuite('Get', getMapBenchmark, getSharedMapBenchmark);

console.log('Running Set Benchmarks...');
setSuite.run();

console.log('Running Get Benchmarks...');
getSuite.run();
