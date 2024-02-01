import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function startServer() {
    const worker = new Worker(path.resolve(__dirname, 'serverWorker.ts'));
    worker.on('online', () => console.log('Server worker started.'));
    worker.on('message', (msg) => console.log('Message from server worker:', msg));
    worker.on('error', (err) => console.error('Server worker error:', err));
    worker.on('exit', (code) => {
        if (code !== 0)
            console.error(`Server worker stopped with exit code ${code}`);
    });
}
startServer();
//# sourceMappingURL=serverMain.js.map