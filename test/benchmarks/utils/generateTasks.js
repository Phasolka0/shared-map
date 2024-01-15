import {getRandomFloat} from '../../helpers/utils.ts'
const MAX_KEYS_STORED = 100000
export default function generateTasks() {
	let tasks = []
	for (let i = 0; i < MAX_KEYS_STORED; i++) {
		tasks.push(getRandomFloat())
	}
	return tasks
}