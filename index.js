/**
 * Bundl Module Interface
 */

var glob = require('glob');
var prettyTime = require('pretty-hrtime');

var Bundl = require('./lib/bundl.js');
var args = require('./lib/args.js');

Bundl.tasks = {};


function load (loadPath, callback) {
    var b = new Bundl();

    if (Array.isArray(loadPath)) {
        // iterate, validate, then req each

    } else if (loadPath) {
        var files;
        try {
            files = glob.sync(loadPath, { nodir: true, realpath: true });

        } catch (err) {
            b.log.error(err);
            return;
        }

        if (files.length) {
            files.forEach(function (file) {
                require(file);
            });

            if (typeof callback === 'function') {
                callback(files);
            }

        } else {
            // path is a dir without dir/*
        }
    }

    // Run tasks passed via command line
    if (args._.length) {
        runArgsTasks();
    } else {
        run('default');
    }
}

function runArgsTasks () {
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
}

var runTracker = {
    count: 0,
    started: null
};

function runTask (taskName, done, b) {
    var task = Bundl.tasks[taskName];

    if (typeof task === 'function') {
        b.log('Running task ' + taskName);
        runTracker.count++;
        var ret = task.call({ name: taskName }, done);
        if (typeof ret !== 'undefined') {
            setTimeout(function () {
                done(ret);
            }, 0);
        }

    } else {
        if (taskName !== 'default') {
            b.log.error('`' + taskName + '` is not a valid task.');
        }
    }
}

function run (taskName, callback) {
    if (!runTracker.count) {
        runTracker.started = process.hrtime();
    }

    var b = new Bundl();

    var callbackQueue = [];
    if (callback) {
        callbackQueue.push(callback);
    }

    function done (result) {
        runTracker.count--;
        if (args.verbose) {
            b.log('Finished task ' + taskName);
        }

        var runNext = callbackQueue.shift();

        if (typeof runNext === 'function') {
            runNext(result, taskName);
        } else if (typeof runNext === 'string') {
            runTask(runNext, done, b);
        }

        if (!runTracker.count && !runNext) {
            var finished = process.hrtime(runTracker.started);
            b.log.section('Bundl Finished ' + prettyTime(finished));
        }
    }

    // allow `.then` tasks to be queued before kicking off
    setTimeout(function () {
        runTask(taskName, done, b);
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

function webserver () {
    var b = new Bundl();
    b.webserver.apply(b, arguments);
}

function task (name, fn) {
    Bundl.tasks[name] = fn;
}



function bundlModule (targets, options, label) {
    var b = new Bundl(label);
    b.add.call(b, targets, options);
    return b;
}


bundlModule.args = args;
bundlModule.load = load;
bundlModule.run = run;
bundlModule.webserver = webserver;
bundlModule.task = task;
bundlModule.utils = new Bundl().utils;

module.exports = bundlModule;
