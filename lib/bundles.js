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
    var opts = Object.assign({}, options);
    var bundl = this;
    var relativeTo = discoverRelativePath(new Error());
    opts.srcDir = opts.srcDir ? path.resolve(relativeTo, opts.srcDir) : relativeTo;
    opts.outputDir = opts.outputDir ? path.resolve(relativeTo, opts.outputDir) : relativeTo + 'bundled';

    bundl.options = opts; // save to top of instance

    var resources = resolve(bundl, targets, opts, relativeTo);

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

function bundlAll (afterAll, afterEach) {
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
        bundl.log.warn('There are no files to bundle.');
        if (typeof afterAll === 'function') {
            afterAll.call(bundl, bundl.RESOURCES);
        }
    }
}

function bundlOne (bundleName, afterAll, afterEach) {
    var bundl = this;
    var r = bundl.RESOURCES[bundleName];

    if (r) {
        bundlResource(bundl, r, afterAll, afterEach);
    } else {
        bundl.log.warn('Target bundle ' + bundleName + ' not found in resources.');
    }
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

function bundlResource (bundl, r, afterEach, eachAllDone) {
    var start = process.hrtime();
    var concatted = {};

    if (!r.options.quiet && !bundl.args.quiet) {
        bundl.log('-> ' + r.name + ' ...');
    }

    concatted = concat(r, bundl);
    r.contents = concatted.contents;
    r.sourcemaps = concatted.sourcemaps;

    // stop here and ignore an empty resource
    if (!r.contents) {
        bundl.log.error('Missing contents: ' + r.name, r.src);
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
        if (typeof plugin.one === 'function') {
            setTimeout(function () {
                var extReturn = plugin.one.call(bundl, r.contents, r, eachDone);
                if (typeof extReturn !== 'undefined') {
                    eachDone(extReturn);
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

    function eachDone (result) {
        if (typeof result === 'string') {
            r.contents = result;
            moveAlong();

        } else if (typeof result === 'object') {
            r.contents = result.contents;
            utils.each(result.changemap, function (resourceName, modPath) {
                bundl.mapDependency.call(bundl, resourceName, modPath);
            });
            if (result.sourcemaps) {
                r.sourcemaps = result.sourcemaps;
            }
            moveAlong();

        } else {
            // bundl.log.error(new Error('Plugin.one must return contents or call done(contents)'));
            moveAlong();
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
    go: go
};
