export class TasksManager {
    constructor() {
        this._isWaiting = true;
        this._tasks = [];
    }

    async addTask(task) {
        if (this._isWaiting) {
            return new Promise(res => {
                this._tasks.push({
                    task,
                    res
                });
            })
        } else {
            return task();
        }
    }

    switchMode() {
        if (this._isWaiting) {
            for (const taskData of this._tasks) {
                taskData.res(taskData.task());
            }

            this._tasks = [];
        }

        this._isWaiting = !this._isWaiting;
    }
}