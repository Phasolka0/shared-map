export function generateRandomNumber(min = 0.000000000001, max = 10000000000) {
    const range = max - min;
    return Number((Math.random() * range + min).toFixed(12));
}
export async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const powCache = {
    0: 1, 1: 10, 2: 100, 3: 1000, 4: 10000, 5: 100000, 6: 1000000, 7: 10000000,
    8: 100000000, 9: 1000000000, 10: 10000000000, 11: 100000000000,
    12: 1000000000000, 13: 10000000000000, 14: 100000000000000,
    15: 1000000000000000
};
export function toFixedUpNumber(number, x = 0) {
    return Math.ceil(number * powCache[x]) / powCache[x];
}
export function getRandomFloat() {
    return toFixedUpNumber(0.1 + Math.floor(Math.random() * 1000), 2);
}
//# sourceMappingURL=utils.js.map