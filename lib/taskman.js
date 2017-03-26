/**
 * Manage tasks
 */

var Log = require('./log.js');
var prettyTime = require('pretty-hrtime');
var utils = require('seebigs-utils');

var args = utils.args();
var log = new Log();

var tasks = {};

class TaskManager {

    constructor (bundl) {
        this.callbackQueue = [];
        this.runStarted = null;
    }

    then (fn, data) {
        var taskman = this;
        taskman.callbackQueue.push({
            fn: fn,
            data: data
        });

        return {
            then: function () {
                return taskman.then.apply(taskman, arguments);
            }
        };
    }

    runNext () {
        var taskman = this;
        var nextTask = taskman.callbackQueue.shift();
        var nextFn = nextTask && nextTask.fn;
        var nextName = '';

        if (typeof nextFn === 'string') {
            nextName = nextFn;
            nextFn = tasks[nextFn];
        }

        if (typeof nextFn === 'function') {
            if (nextName) {
                log('Running task ' + nextName);
            }
            var ret = nextFn.call({ name: nextName }, runDone, nextTask.data);
            if (typeof ret !== 'undefined') {
                setTimeout(function () {
                    runDone(ret);
                }, 0);
            }

        } else {
            runDone();
        }

        function runDone () {
            if (args.verbose && nextName) {
                log('Finished task ' + nextName);
            }

            if (taskman.callbackQueue.length) {
                taskman.runNext();
            } else {
                if (!args.quiet) {
                    var finished = process.hrtime(taskman.runStarted);
                    log.section('Bundl Finished ' + prettyTime(finished));
                }
            }
        }
    }
}

// Run tasks passed via command line
function runFromCLI () {

    function runNextTask () {
        var orderedTasks = args._.slice(0);
        var task = orderedTasks.shift();
        if (orderedTasks.length) {
            run(task, runNextTask);
        } else {
            run(task);
        }
    }

    if (args._.length) {
        runNextTask();

    } else {
        run('default');
    }
}

function run () {
    var taskman = new TaskManager(this);

    // allow `.then` tasks to be queued before kicking off
    setTimeout(function () {
        taskman.runStarted = process.hrtime();
        taskman.runNext();
    }, 0);

    // queue the task that was passed to run
    taskman.then.apply(taskman, arguments);

    return {
        then: function () {
            return taskman.then.apply(taskman, arguments);
        }
    };
}

function task (name, fn) {
    if (name) {
        if (typeof fn === 'function') {
            tasks[name] = fn;
        } else if (fn === false || fn === null) {
            delete tasks[name];
        }
    }

    return this;
}

task.list = function () {
    return tasks;
};


module.exports = {
    task: task,
    run: run,
    runFromCLI: runFromCLI
};
