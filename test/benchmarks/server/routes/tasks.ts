import express from 'express';
import {handleTaskRequest} from '../controllers/taskController';

export const tasksRouter = express.Router();

tasksRouter.post('/', handleTaskRequest);
