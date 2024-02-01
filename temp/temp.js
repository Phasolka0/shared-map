import SharedMap from '../build/index.js'
function main() {
	const sharedMap = new SharedMap()
	// Заполняем мапу
	for (let i = 1; i <= 100000; i++) {
		sharedMap.set(i, i * 100)
	}
	// Получаем значения
	for (let i = 1; i <= 100; i++) {
		console.log(`Key: ${i}, Value: ${sharedMap.get(i)}`)
	}
	// Очищаем мапу
	sharedMap.clear().then(() => {
		console.log('Map cleared')
	})
}
main()
