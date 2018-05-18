/**
 * Bundl Class
 */

var cliArgs = require('seebigs-args')();
var execa = require('execa');
var extend = require('seebigs-extend');
var glob = require('glob');
var halt = require('./halt.js');
var Log = require('./log.js');
var nodeWatch = require('node-watch');
var taskman = require('./taskman.js');
var webserver = require('./webserver.js');

var log = new Log();

function load(loadPath) {
    var globOptions = { nodir: true, realpath: true };

    if (Array.isArray(loadPath)) {
        loadPath.forEach(function (lp) {
            load(lp);
        });

    } else if (loadPath) {
        var files;
        try {
            files = glob.sync(loadPath, globOptions);
            if (!files.length) {
                files = glob.sync(loadPath + '/*', globOptions);
            }

        } catch (err) {
            log.error(err);
            return;
        }

        if (files.length) {
            files.forEach(function (file) {
                require(file);
            });
        }
    }

    taskman.runFromCLI();
}

function shell(cmd, cmdArgs, opts) {
    opts = extend({ reject: false }, opts);
    cmdArgs = cmdArgs || [];
    if (!cliArgs.quiet && !opts.quiet) {
        log(cmd + ' ' + cmdArgs.join(' '));
    }

    var exec = execa(cmd, cmdArgs, opts);
    exec.stdout.pipe(process.stdout);
    exec.stderr.pipe(process.stderr);
    exec.then(function (result) {
        if (result.code > 0) {
            log(result.stderr);
            process.exit(result.code);
        }
    });
    exec.catch(function (err) {
        log();
        log(err.stack || err);
        process.exit();
    });

    return exec;
}

function watch(path, onchange, filter) {
    var options =  { recursive: true };

    if (typeof filter === 'function') {
        options.filter = filter;
    }

    nodeWatch(path, options, onchange);
}

module.exports = {
    cliArgs: cliArgs,
    halt: halt,
    load: load,
    log: log,
    listTasks: taskman.listTasks,
    runTask: taskman.runTask,
    setTask: taskman.setTask,
    shell: shell,
    watch: watch,
    webserver: webserver,
};
