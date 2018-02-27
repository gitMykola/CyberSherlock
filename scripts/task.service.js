function Task () {
    this.result = 'Task service Ok.';
}
Task.prototype.task_state = function (params) {
    return new Promise(resolve => {
        resolve(this.result);
    })
};

module.exports = Task;