import express from 'express';
import { tasksRouter } from "./routes/tasks";
const app = express();
const port = 4000;
app.use(express.json({ limit: '10mb' }));
app.use('/tasks', tasksRouter);
app.get('/empty', (req, res) => res.end());
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=serverWorker.js.map