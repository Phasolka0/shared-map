import SharedMap from '../build/index.js'
const sharedMap = new SharedMap({size: 100})
//for (let i = 0; i < 1000000000 ; ++i) {
//	const index = sharedMap['hash2'](Math.random())
//	if (index > 99 || index < 1) {
//		console.log(index)
//		break
//	}
//}
const index = sharedMap['hash1'](Math.random())
console.log(index)