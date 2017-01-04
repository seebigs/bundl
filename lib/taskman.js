/**
 * Manage tasks
 */

var Log = require('./log.js');
var prettyTime = require('pretty-hrtime');
var utils = require('seebigs-utils');

var args = utils.args();
var log = new Log();

var tasks = {};
var runTracker = {
    count: 0,
    started: null
};

// Run tasks passed via command line
function runFromCLI () {
    if (args._.length) {
        var orderedTasks = args._.slice(0);

        function runNextTask () {
            var task = orderedTasks.shift();
            if (orderedTasks.length) {
                run(task, runNextTask);
            } else {
                run(task);
            }
        }

        runNextTask();

    } else {
        run('default');
    }
}

function runTask (taskName, done) {
    var task = tasks[taskName];

    if (typeof task === 'function') {
        log('Running task ' + taskName);
        runTracker.count++;
        var ret = task.call({ name: taskName }, done);
        if (typeof ret !== 'undefined') {
            setTimeout(function () {
                done(ret);
            }, 0);
        }

    } else {
        if (taskName !== 'default') {
            log.error('`' + taskName + '` is not a valid task.');
        }
    }
}

function run (taskName, callback) {
    if (!runTracker.count) {
        runTracker.started = process.hrtime();
    }

    var callbackQueue = [];
    if (callback) {
        callbackQueue.push(callback);
    }

    function done (result) {
        runTracker.count--;
        if (args.verbose) {
            log('Finished task ' + taskName);
        }

        var runNext = callbackQueue.shift();

        if (typeof runNext === 'function') {
            runNext(result, taskName);
        } else if (typeof runNext === 'string') {
            runTask(runNext, done);
        }

        if (!runTracker.count && !runNext) {
            var finished = process.hrtime(runTracker.started);
            log.section('Bundl Finished ' + prettyTime(finished));
        }
    }

    // allow `.then` tasks to be queued before kicking off
    setTimeout(function () {
        runTask(taskName, done);
    }, 0);

    function then (next) {
        callbackQueue.push(next);

        return {
            then: then
        };
    }

    return {
        then: then
    };
}

function task (name, fn) {
    if (name) {
        if (typeof fn === 'function') {
            tasks[name] = fn;
        } else if (fn === false) {
            delete tasks[name];
        }
    }
    return tasks;
}


module.exports = {
    task: task,
    run: run,
    runFromCLI: runFromCLI
};
