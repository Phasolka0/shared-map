function isPrime(n) {
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            return false;
        }
    }
    return true;
}
export default function findNextPrime(num) {
    if (num <= 2)
        return 2;
    let prime = num;
    if (isPrime(prime)) {
        return prime;
    }
    while (true) {
        prime++;
        if (isPrime(prime)) {
            return prime;
        }
    }
}
//# sourceMappingURL=findNextPrime.js.map