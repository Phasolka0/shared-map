"use strict";
// import express, {Request, Response} from 'express';
// import axios from 'axios';
// import generateTasks from './generateTasks';
//
// const proxyApp = express();
// proxyApp.use(express.json());
//
// const targetServerUrl = 'http://localhost:3000/task';
// const port = 4000;
//
// proxyApp.post('/hello', async (req: Request, res: Response) => {
// 	try {
// 		res.end('hello world');
// 	} catch (error) {
// 		res.status(500).json({error: 'Error sending tasks to target server'});
// 	}
// });
//
// proxyApp.post('/generate-and-send-tasks', async (req: Request, res: Response) => {
// 	const {classType, method} = req.body;
// 	const tasks = generateTasks(classType, method);
//
// 	try {
// 		const response = await axios.post(targetServerUrl, tasks, {
// 			headers: {'Content-Type': 'application/json'}
// 		});
// 		res.end(response.data);
// 	} catch (error) {
// 		res.status(500).json({error: 'Error sending tasks to target server'});
// 	}
// });
//
// proxyApp.listen(port, () => {
// 	console.log(`Proxy server running on port ${port}`);
// });
//# sourceMappingURL=proxyServer.js.map