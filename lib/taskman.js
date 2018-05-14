/**
 * Manage tasks
 */

"use strict";

var asTable = require('as-table');
var each = require('seebigs-each');
var Log = require('./log.js');
var prettyMS = require('pretty-ms');
var args = require('seebigs-args')();

var log = new Log();

var tasks = {};
var tasksQuiet = {};
var taskTimes = {};

function listTasks () {
    return Object.assign({}, tasks, tasksQuiet);
}

class TaskManager {

    constructor () {
        this.hasRunTasks = false;
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
            },
            runTask: function () {
                return taskman.then.apply(taskman, arguments);
            },
        };
    }

    runNext () {
        var taskman = this;
        var nextTask = taskman.callbackQueue.shift();
        var nextFn = nextTask && nextTask.fn;
        var next = {
            taskStarted: Date.now(),
        };

        if (typeof nextFn === 'string') {
            var nextName = nextFn;
            next.name = nextName;
            nextFn = tasks[nextName];
            if (!nextFn && tasksQuiet[nextName]) {
                nextFn = tasksQuiet[nextName];
                next.quiet = true;
            }
        }

        if (typeof nextFn === 'function') {
            taskman.hasRunTasks = true;
            if (next.name) {
                log('Running task ' + next.name);
            }
            var ret = nextFn.call({ name: next.name }, runDone.bind(next), nextTask.data);
            if (typeof ret !== 'undefined') {
                setTimeout(function () {
                    runDone.call(next, ret);
                }, 0);
            }

        } else {
            runDone.call({});
        }

        function runDone () {
            var next = this;
            var now = Date.now();
            var taskTime = now - next.taskStarted;
            var taskName = next.name;
            if (taskName && taskName !== 'default') {
                if (!next.quiet) {
                    taskTimes[taskName] = (taskTimes[taskName] || 0) + taskTime;
                }
                log.gray('------- task ' + taskName + ' finished in ' + prettyMS(taskTime));
            }

            if (taskman.callbackQueue.length) {
                taskman.runNext.call(taskman);
            } else {
                if (taskman.hasRunTasks && !args.quiet) {
                    var runTime = now - taskman.runStarted;
                    log.section('Bundl Finished ' + prettyMS(runTime));
                    if (args.verbose) {
                        printTotalTimes();
                    }
                }
            }
        }
    }
}

function printTotalTimes() {
    var toTable = [];
    var totalOfAll = 0;
    each(taskTimes, function (taskTime, taskName) {
        totalOfAll += taskTime;
        toTable.push({
            'Task': taskName,
            'Weight': '',
            'Total': prettyMS(taskTime),
            _time: taskTime,
        });
    });
    if (toTable.length > 1) {
        toTable.sort(function (a, b) {
            return a._time < b._time;
        });
        each(toTable, function (tt) {
            tt['Weight'] = Math.round(tt._time / totalOfAll * 100) + '%';
            delete tt._time;
        });
        log(asTable(toTable));
        log();
    }
}

// Run tasks passed via command line
function runFromCLI () {

    function runNextTask () {
        var orderedTasks = args._.slice(0);
        var task = orderedTasks.shift();
        if (orderedTasks.length) {
            runTask(task, runNextTask);
        } else {
            runTask(task);
        }
    }

    taskTimes = {};

    if (args._.length) {
        runNextTask();

    } else {
        runTask('default');
    }
}

function runTask () {
    var taskman = new TaskManager();

    // allow `.then` tasks to be queued before kicking off
    setTimeout(function () {
        taskman.runStarted = Date.now();
        taskman.runNext();
    }, 0);

    // queue the task that was passed to runTask
    taskman.then.apply(taskman, arguments);

    return {
        then: function () {
            return taskman.then.apply(taskman, arguments);
        },
        runTask: function () {
            return taskman.then.apply(taskman, arguments);
        },
    };
}

function setTask (name, fn, hideFromSummary) {
    var queue = hideFromSummary ? tasksQuiet : tasks;
    if (name) {
        if (typeof fn === 'function') {
            queue[name] = fn;
        } else if (fn === false || fn === null) {
            delete queue[name];
        }
    }

    return this;
}


module.exports = {
    listTasks: listTasks,
    setTask: setTask,
    runTask: runTask,
    runFromCLI: runFromCLI
};
