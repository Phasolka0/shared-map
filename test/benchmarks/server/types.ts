export type ClassType = 'SimpleMap' | 'SharedMap';
export type MethodType = 'get' | 'set';

export type TaskType = { key: number; value: number } | { value: number };
export type PreparedTasksType = { set: TaskType[], get: TaskType[] };
