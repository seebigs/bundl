var concat = require('./concat.js');
var del = require('del');
var path = require('path');
var prettyMS = require('pretty-ms');
var each = require('seebigs-each');

function bundlOne (bundleName, callback) {
    var bundl = this;
    var r = bundl._.RESOURCES[bundleName];

    if (r) {
        bundl.log.gray('Bundl starting ' + bundleName);
        bundlResource(bundl, r, {}, callback);
    } else {
        bundl.log.warn('Target bundle ' + bundleName + ' not found in resources.');
    }
}

function bundlAll (afterAll, afterEach) {
    var bundl = this;

    // clean first
    cleanAll(bundl);

    bundl.log.gray('Bundl starting...');

    // exec src chain, then exec each resource chain
    bundlSrcChain(bundl, function () {

        // build each resource
        var pluginTimes = {};
        var totalBundled = 0;
        each(bundl._.RESOURCES, function (r) {
            if (bundlResource(bundl, r, pluginTimes, afterEach, allDone)) {
                totalBundled++;
            }
        });

        if (!totalBundled) {
            bundl.log.warn('There are no files to bundle.');
            allDone();
        }

        function allDone () {
            if (typeof afterAll === 'function') {
                afterAll.call(bundl, bundl._.RESOURCES);
            }
        }

    });

}

function bundlSrcChain (bundl, callback) {
    var chainCount = 0;

    function done () {
        chainCount++;
        if (chainCount >= bundl._.CHAIN_SRC.length) {
            if (typeof callback === 'function') {
                callback(bundl);
            }
        }
    }

    if (bundl._.CHAIN_SRC.length) {
        each(bundl._.CHAIN_SRC, function (plugin) {
            if (typeof plugin.exec === 'function') {
                bundl.log('Starting ' + plugin.name + ' src plugin...');
                var extReturn = plugin.exec.call(bundl, bundl.getSrcFiles(), done);
                if (typeof extReturn !== 'undefined') {
                    done();
                }

            } else {
                done();
            }
        });

    } else {
        done();
    }
}

function bundlResource (bundl, r, pluginTimes, afterEach, afterAll) {
    var concatted = concat(r, bundl);
    var contentsString = concatted.contentsString;

    // stop here and ignore an empty resource
    if (!r.contents || !contentsString) {
        bundl.halt('Missing contents: ' + r.name, r.src);
    }

    r.sourcemaps = concatted.sourcemaps;
    r.contents.set(contentsString);

    bundl._.ACTIVE_BUNDLE_COUNT++;

    // walk the build chain
    var chainIndex = 0;
    if (r.chain.length) {
        walk();
    } else {
        setTimeout(moveAlong, 0);
    }

    function walk () {
        var plugin = r.chain[chainIndex];
        var canExec = typeof plugin.exec === 'function';
        var validExt = Array.isArray(plugin.ext) ? plugin.ext.indexOf(r.ext) !== -1 : true;

        if (canExec && validExt) {
            setTimeout(function () {
                if (r.contents) {
                    if (!plugin.stage || plugin.stage === r.contents.getStage()) {
                        var now = Date.now();
                        if (!pluginTimes[plugin.name]) {
                            pluginTimes[plugin.name] = [];
                        }
                        var doneContext = {
                            pluginName: plugin.name,
                            resourceName: r.name,
                            startTime: now,
                        };
                        if (bundl.cliArgs.verbose) {
                            bundl.log('Starting ' + plugin.name + ' for ' + r.name);
                        }
                        var extReturn = plugin.exec.call(bundl, r, eachDone.bind(doneContext));
                        if (typeof extReturn !== 'undefined') {
                            eachDone.call(doneContext);
                        }
                    } else {
                        bundl.halt(plugin.name + ' plugin expected to run in stage "' + plugin.stage + '" not "' + r.contents.getStage() + '"');
                    }
                } else {
                    if (bundl.cliArgs.verbose) {
                        bundl.log('Oops: resource ' + r.name  + ' is missing its contents');
                    }
                }
            }, 0);

        } else {
            setTimeout(moveAlong, 0);
        }
    }

    function moveAlong () {
        chainIndex++;
        if (chainIndex >= r.chain.length) {
            success();
        } else {
            walk();
        }
    }

    function eachDone () {
        if (bundl.cliArgs.verbose && this.pluginName) {
            var totalMS = Date.now() - this.startTime;
            pluginTimes[this.pluginName].push(totalMS);
            bundl.log.gray('Finished ' + this.pluginName + ' for ' + this.resourceName + ' in ' + prettyMS(totalMS));
        }
        moveAlong();
    }

    function success () {
        r.changed = false;

        if (typeof afterEach === 'function') {
            afterEach(r);
        }

        bundl._.ACTIVE_BUNDLE_COUNT--;
        if (!bundl._.ACTIVE_BUNDLE_COUNT) {
            if (bundl.cliArgs.verbose) {
                printTotalTimes();
            }
            if (typeof afterAll === 'function') {
                afterAll();
            }
        }
    }

    function printTotalTimes() {
        var toTable = [];
        var totalOfAll = 0;
        each(pluginTimes, function (pluginTimeArray, pluginName) {
            var sum = pluginTimeArray.reduce(function(a, b) { return a + b; });
            var pluginAvg = sum / pluginTimeArray.length;
            totalOfAll += pluginAvg;
            toTable.push({
                'Step': pluginName,
                'Weight': '',
                'Average': prettyMS(pluginAvg),
                _time: pluginAvg,
            });
        });
        toTable.sort(function (a, b) {
            return a._time < b._time;
        });
        each(toTable, function (tt) {
            tt['Weight'] = Math.round(tt._time / totalOfAll * 100) + '%';
            delete tt._time;
        });
        bundl.log.table(toTable);
    }

    return true;
}

function cleanAll (bundl) {
    var opts;
    var force = false;
    var toBeCleaned = {};

    each(bundl._.RESOURCES, function (r) {
        opts = r.options.clean;
        if (opts) {
            if (typeof opts === 'string') {
                opts = { dir: opts };
            } else if (typeof opts !== 'object') {
                opts = {};
            }

            toBeCleaned[opts.dir && path.resolve(opts.dir) || path.dirname(r.dest)] = 1;

            if (opts.force) {
                force = true;
            }
        }
    });

    toBeCleaned = Object.keys(toBeCleaned);
    toBeCleaned = toBeCleaned.map(function (c) {
        return c + '/**/*';
    });

    if (toBeCleaned.length && bundl.cliArgs.verbose) {
        bundl.log('Cleaning ' + toBeCleaned + '...');
    }

    try {
        del.sync(toBeCleaned, { force: force });

    } catch (e) {
        if (e.message.indexOf('force') !== -1) {
            bundl.halt('Cannot delete files/folders outside the current working directory. Use options: { clean: \'force\' }');
        } else {
            bundl.halt(e);
        }
    }
}

function forEach (iterator) {
    each(this.getResources(), iterator);
}

function go () {
    var args = arguments;
    var bundl = this;

    if (typeof args[0] === 'string') {
        bundlOne.apply(bundl, args);
    } else {
        bundlAll.apply(bundl, args);
    }

    return bundl;
}

module.exports = {
    forEach: forEach,
    go: go,
};
