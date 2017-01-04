/**
 * Bundl Module Interface
 */

var BundlInstance = require('./lib/instance.js');
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


function bundlModule (targets, options, label) {
    var b = new BundlInstance(label);
    b.add.call(b, targets, options);
    return b;
}

bundlModule.args = args;
bundlModule.load = load;
bundlModule.run = taskman.run;
bundlModule.webserver = new BundlInstance().webserver;
bundlModule.task = taskman.task;


module.exports = bundlModule;
