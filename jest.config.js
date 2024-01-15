export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/test/tests/**/*.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {tsconfig: './tsconfig.json'}],
	},

}
