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

function thenHandler(task, data) {
    var taskman = this;

    taskman.callbackQueue.push({
        task: task,
        data: data
    });

    return {
        then: thenHandler.bind(taskman),
        runTask: thenHandler.bind(taskman),
    };
}

class TaskManager {

    constructor () {
        this.hasRunTasks = false;
        this.callbackQueue = [];
        this.runStarted = null;
        this.then = thenHandler.bind(this);
    }

    runNext () {
        var taskman = this;
        var nextQueued = taskman.callbackQueue.shift();
        var nextTask = nextQueued && nextQueued.task;
        var next = {
            taskStarted: Date.now(),
        };

        if (typeof nextTask === 'string') {
            var nextName = nextTask;
            next.name = nextName;
            nextTask = tasks[nextName];
            if (!nextTask && tasksQuiet[nextName]) {
                nextTask = tasksQuiet[nextName];
                next.quiet = true;
            }
        }

        if (typeof nextTask === 'function') {
            taskman.hasRunTasks = true;
            if (next.name) {
                log('Running task ' + next.name);
            }
            var ret = nextTask.call({ name: next.name }, runDone.bind(next), nextQueued.data);
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
    taskTimes = {};

    if (args._.length) {
        var runner = runTask();
        each(args._, function (arg) {
            runner.then(arg);
        });

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

    return thenHandler.apply(taskman, arguments);
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
