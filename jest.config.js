export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/tests/**/*.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {tsconfig: './tsconfig.json'}],
	},
	moduleNameMapper: {
		// Перенаправление запросов к .js файлам на .ts файлы
		'^(.*)\\.js$': '$1',
	},
}
