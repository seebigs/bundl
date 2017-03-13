/**
 * Define relationships between src files and bundles
 */

var concat = require('./concat.js');
var deepExtend = require('deep-extend');
var del = require('del');
var path = require('path');
var prettyTime = require('pretty-hrtime');
var resolve = require('./resolve.js');
var utils = require('seebigs-utils');

var args = utils.args();


// use a hack to find the dir from which bundl.add was called
function discoverRelativePath (err) {
    err = err.stack.split('\n');
    err.shift();
    err.shift();
    var line = err.shift();
    if (line.indexOf(' bundlModule ') !== -1) {
        line = err.shift();
    }
    var pathPieces = line.split('/');
    pathPieces.shift();
    pathPieces.pop();
    return '/' + pathPieces.join('/') + '/';
}

function add (targets, options) {
    options = options || {};
    var bundl = this;
    var relativeTo = discoverRelativePath(new Error());
    options.srcDir = options.srcDir ? path.resolve(relativeTo, options.srcDir) : relativeTo;
    options.outputDir = options.outputDir ? path.resolve(relativeTo, options.outputDir) : relativeTo + 'bundled';

    bundl.options = options; // save to top of instance

    var resources = resolve(bundl, targets, options, relativeTo);

    function chainThen (plugin) {
        if (typeof plugin === 'object') {
            bundl.CHAIN.push(plugin);
            utils.each(resources, function (resource) {
                resource.chain.push(plugin);
            });

        } else if (typeof plugin !== 'undefined') {
            bundl.log.error('Plugin must be an object');
        }

        return bundl;
    }

    function chainThenIf (condition, truthy, falsy) {
        var result = !!condition;

        if (typeof condition === 'function') {
            result = condition();
        }

        return chainThen(result ? truthy : falsy);
    }

    function chainDebug () {
        utils.each(bundl.RESOURCES, function (r) {
            bundl.log(r.dest);
            if (r.src.length) {
                utils.each(r.src, function (s) {
                    bundl.log('   ^--', s);
                });
            } else {
                bundl.log('   ^--', path.resolve(r.name), '(not found)');
            }
        });

        return bundl;
    }

    Object.assign(bundl.RESOURCES, resources);

    bundl.debug = chainDebug;
    bundl.then = chainThen;
    bundl.thenif = chainThenIf;

    return bundl;
}

function all (afterAll, afterEach) {
    var bundl = this;

    // clean first
    cleanAll(bundl);

    function eachAllDone () {
        var chainCount = 0;

        function done () {
            chainCount++;
            if (chainCount >= bundl.CHAIN.length) {
                if (typeof afterAll === 'function') {
                    afterAll.call(bundl, bundl.RESOURCES);
                }
            }
        }

        if (bundl.CHAIN.length) {
            utils.each(bundl.CHAIN, function (plugin) {
                if (typeof plugin.all === 'function') {
                    var extReturn = plugin.all.call(bundl, bundl.RESOURCES, bundl.getSrcFiles(), done);
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

    // build each resource
    var totalBundled = 0;
    utils.each(bundl.RESOURCES, function (r) {
        if (bundlResource(bundl, r, afterEach, eachAllDone)) {
            totalBundled++;
        }
    });

    if (!totalBundled) {
        bundl.log.warning('There are no files to bundle.');
        if (typeof afterAll === 'function') {
            afterAll.call(bundl, bundl.RESOURCES);
        }
    }

    return bundl;
}

function one (bundleName, success, error) {
    var bundl = this;
    var r = bundl.RESOURCES[bundleName];

    if (r) {
        bundlResource(bundl, r, success, null, error);
    } else {
        bundl.log('Target bundle ' + bundleName + ' not found in resources.');
        if (typeof error === 'function') {
            error();
        }
    }

    return bundl;
}

function bundlResource (bundl, r, afterEach, eachAllDone, error) {
    var start = process.hrtime();
    var concatted = {};

    if (!r.options.quiet) {
        bundl.log('-> ' + r.name + ' ...');
    }

    concatted = concat(r, bundl);
    r.contents = concatted.contents;
    r.sourcemaps = concatted.sourcemaps;

    // stop here and ignore an empty resource
    if (!r.contents) {
        bundl.log('Missing contents: ' + r.name, r.src);
        return false;
    }

    bundl.ACTIVE_BUNDLE_COUNT++;

    // walk the build chain
    var chainIndex = 0;
    if (r.chain.length) {
        walk();
    } else {
        setTimeout(moveAlong, 0);
    }

    function walk () {
        var plugin = r.chain[chainIndex];
        var iterator = plugin.one || plugin.each; // until we switch over all usages
        if (typeof iterator === 'function') {
            var extReturn = iterator.call(bundl, r.contents, r, eachDone);
            if (typeof extReturn !== 'undefined') {
                setTimeout(function () {
                    eachDone(extReturn);
                }, 0);
            }

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

    function eachDone (result) {
        var resultType = Object.prototype.toString.call(result);

        if (typeof result === 'string') {
            r.contents = result;
            moveAlong();

        } else if (typeof result === 'object') {
            r.contents = result.contents;
            utils.each(result.changemap, function (resourceName, modPath) {
                bundl.mapChanges.call(bundl, modPath, resourceName);
            });
            if (result.sourcemaps) {
                r.sourcemaps = result.sourcemaps;
            }
            moveAlong();

        } else {
            bundl.log.error(new Error('Plugin.one must return contents or call done(contents)'));
        }
    }

    function success () {
        r.changed = false;
        if (args.verbose) {
            bundl.log('Finished ' + r.name + ' ' + prettyTime(process.hrtime(start)));
        }

        if (typeof afterEach === 'function') {
            afterEach(r);
        }

        bundl.ACTIVE_BUNDLE_COUNT--;
        if (!bundl.ACTIVE_BUNDLE_COUNT) {
            if (typeof eachAllDone === 'function') {
                eachAllDone();
            }
        }
    }

    return true;
}

function cleanAll (bundl) {
    var opts;
    var force = false;
    var toBeCleaned = {};

    utils.each(bundl.RESOURCES, function (r) {
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

    if (toBeCleaned.length && args.verbose) {
        bundl.log('Cleaning ' + toBeCleaned + '...');
    }

    try {
        del.sync(toBeCleaned, { force: force });

    } catch (e) {
        if (e.message.indexOf('force') !== -1) {
            bundl.log.error('Cannot delete files/folders outside the current working directory. Use options: { clean: \'force\' }');
        } else {
            bundl.log.error(e.stack);
        }
    }
}


module.exports = {
    add: add,
    all: all,
    one: one
};
