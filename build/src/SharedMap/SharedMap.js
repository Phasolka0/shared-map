export default class SharedMap {
    sharedArrayBuffer;
    valuesArray;
    keysArray;
    lockArray;
    sizeArray;
    globalLockArray;
    activeSets;
    maxSize;
    maxPrecision;
    scalingFactor;
    maxProbeSteps;
    constructor({ size = 4096, sharedArrayBuffer, maxPrecision = 12 } = {}) {
        if (sharedArrayBuffer) {
            this.sharedArrayBuffer = sharedArrayBuffer;
        }
        else {
            const keysArraySize = size * Float64Array.BYTES_PER_ELEMENT;
            const valuesArraySize = size * Float64Array.BYTES_PER_ELEMENT;
            const lockArraySize = size * Int32Array.BYTES_PER_ELEMENT;
            const sizeArraySize = Int32Array.BYTES_PER_ELEMENT;
            const globalLockArraySize = Int32Array.BYTES_PER_ELEMENT;
            const activeSetsSize = Int32Array.BYTES_PER_ELEMENT;
            const totalSize = keysArraySize + valuesArraySize + lockArraySize + sizeArraySize + globalLockArraySize + activeSetsSize;
            this.sharedArrayBuffer = new SharedArrayBuffer(totalSize);
        }
        const keysArrayOffset = 0;
        const valuesArrayOffset = keysArrayOffset + size * Float64Array.BYTES_PER_ELEMENT;
        const lockArrayOffset = valuesArrayOffset + size * Float64Array.BYTES_PER_ELEMENT;
        const sizeArrayOffset = lockArrayOffset + size * Int32Array.BYTES_PER_ELEMENT;
        const globalLockOffset = sizeArrayOffset + Int32Array.BYTES_PER_ELEMENT;
        const activeSetsOffset = globalLockOffset + Int32Array.BYTES_PER_ELEMENT;
        this.keysArray = new Float64Array(this.sharedArrayBuffer, keysArrayOffset, size);
        this.valuesArray = new Float64Array(this.sharedArrayBuffer, valuesArrayOffset, size);
        this.lockArray = new Int32Array(this.sharedArrayBuffer, lockArrayOffset, size);
        this.sizeArray = new Int32Array(this.sharedArrayBuffer, sizeArrayOffset, 1);
        this.globalLockArray = new Int32Array(this.sharedArrayBuffer, globalLockOffset, 1);
        this.activeSets = new Int32Array(this.sharedArrayBuffer, activeSetsOffset, 1);
        this.maxSize = size;
        if (maxPrecision < 0 || maxPrecision > 14) {
            throw new Error("maxPrecision must be in the range of 0 to 14");
        }
        this.maxPrecision = maxPrecision;
        this.scalingFactor = 10 ** maxPrecision;
        this.maxProbeSteps = Math.ceil(size * 0.001);
    }
    get size() {
        return this.sizeArray[0];
    }
    set(key, value) {
        this.incrementActiveSets();
        if (key <= 0)
            throw new Error('key <= 0:' + key);
        const index = this.findIndexForSet(key);
        this.acquireLock(index);
        //console.log(`[SET] Key: ${key}, Value: ${value}, Index: ${index}`)
        if (this.keysArray[index] === 0) {
            this.IncreaseSize();
        }
        this.keysArray[index] = key;
        this.valuesArray[index] = value;
        this.releaseLock(index);
        this.decrementActiveSets();
    }
    get(key) {
        const index = this.findIndexForGet(key);
        //console.log(`[GET] Key: ${key}, Index: ${index}`)
        if (this.keysArray[index] === key) {
            return this.valuesArray[index];
        }
        else
            return -1;
    }
    async clear() {
        //console.log('clear')
        this.acquireGlobalLock();
        if (this.sizeArray[0] === 0) {
            //console.log('clear do not needed')
            this.releaseGlobalLock();
            return;
        }
        while (Atomics.load(this.activeSets, 0) !== 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        this.keysArray.fill(0);
        this.valuesArray.fill(0);
        //this.lockArray.fill(0);
        this.sizeArray[0] = 0;
        this.releaseGlobalLock();
        //console.log('clear end')
    }
    exportInitData() {
        return {
            sharedArrayBuffer: this.sharedArrayBuffer,
            size: this.maxSize
        };
    }
    incrementActiveSets() {
        Atomics.add(this.activeSets, 0, 1);
    }
    decrementActiveSets() {
        Atomics.sub(this.activeSets, 0, 1);
    }
    IncreaseSize() {
        Atomics.add(this.sizeArray, 0, 1);
    }
    keyToIndex(key) {
        let hash = Math.floor(key * this.scalingFactor);
        hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
        hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
        hash = (hash >> 16) ^ hash;
        return hash % this.maxSize;
    }
    findIndexForSet(key) {
        let index = this.keyToIndex(key);
        let count = 0;
        //console.log(this.sizeArray[0], this.maxSize)
        while (true) {
            const existedKey = this.keysArray[index];
            // Если ключ уже существует или массив заполнен и мы можем перезаписать существующий ключ
            if (existedKey === key || existedKey === 0 || this.sizeArray[0] === this.maxSize) {
                return index;
            }
            index = (index + 1) % this.maxSize;
            if (++count >= this.maxSize) {
                throw new Error('Buffer loop detected, size: ' + this.maxSize);
            }
        }
    }
    findIndexForGet(key) {
        let index = this.keyToIndex(key);
        let count = 0;
        while (count <= this.maxProbeSteps) {
            const existedKey = this.keysArray[index];
            if (existedKey === key) {
                return index;
            }
            index = (index + 1) % this.maxSize;
            count++;
        }
        return -1; // Ключ не найден
    }
    acquireLock(index) {
        while (true) {
            if (Atomics.compareExchange(this.lockArray, index, 0, 1) === 0) {
                return;
            }
            Atomics.wait(this.lockArray, index, 1);
        }
    }
    releaseLock(index) {
        Atomics.store(this.lockArray, index, 0);
        Atomics.notify(this.lockArray, index);
    }
    acquireGlobalLock() {
        while (Atomics.compareExchange(this.globalLockArray, 0, 0, 1) !== 0) {
            Atomics.wait(this.globalLockArray, 0, 1);
        }
    }
    releaseGlobalLock() {
        Atomics.store(this.globalLockArray, 0, 0);
        Atomics.notify(this.globalLockArray, 0);
    }
    static connectWithInitData(data) {
        return new SharedMap({ sharedArrayBuffer: data.sharedArrayBuffer, size: data.size });
    }
}
//# sourceMappingURL=SharedMap.js.map