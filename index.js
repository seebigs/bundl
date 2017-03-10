/**
 * Bundl Module Interface
 */

var BundlInstance = require('./lib/instance.js');
var execa = require('execa');
var glob = require('glob');
var Log = require('./lib/log.js');
var taskman = require('./lib/taskman.js');
var utils = require('seebigs-utils');

var args = utils.args();
var log = new Log();


function load (loadPath) {
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

function shell (cmd, args, opts) {
    opts = opts || { reject: false };
    var exec = execa(cmd, args, opts);
    exec.stdout.pipe(process.stdout);
    exec.stderr.pipe(process.stderr);
    return exec;
}


// Don't rename this function (see discoverRelativePath)
function bundlModule (targets, options, label) {
    var b = new BundlInstance(label);
    b.add.call(b, targets, options);
    return b;
}

bundlModule.args = args;
bundlModule.load = load;
bundlModule.run = taskman.run;
bundlModule.shell = shell;
bundlModule.task = taskman.task;
bundlModule.webserver = new BundlInstance().webserver;

module.exports = bundlModule;
