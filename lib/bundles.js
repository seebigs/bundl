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
    var pathPieces = line.split(' (/').pop().split('/');
    pathPieces.pop();
    return '/' + pathPieces.join('/') + '/';
}

function add (targets, opts) {
    var bundl = this;
    var options = deepExtend({ targetDir: discoverRelativePath(new Error()) }, opts);
    var resources = resolve(bundl, targets, options);

    function chainThen (extension) {
        if (typeof extension === 'object') {
            bundl.CHAIN.push(extension);
            utils.each(resources, function (resource) {
                resource.chain.push(extension);
            });

        } else if (typeof extension !== 'undefined') {
            bundl.log.error('Extension must be an object');
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
        var extReturn;

        function done () {
            chainCount++;
            if (chainCount >= bundl.CHAIN.length) {
                if (typeof afterAll === 'function') {
                    afterAll();
                }
            }
        }

        if (bundl.CHAIN.length) {
            utils.each(bundl.CHAIN, function (extension) {
                if (typeof extension.all === 'function') {
                    extReturn = extension.all.call(bundl, Object.keys(bundl.CHANGEMAP), done);
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
        bundlResource(bundl, r, afterEach, eachAllDone);
        totalBundled++;
    });

    if (!totalBundled) {
        bundl.log.warning('There are no files to bundle.');
        if (typeof afterAll === 'function') {
            afterAll();
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

function bundlResource (bundl, r, afterEach, afterAll, error) {
    var start = process.hrtime();

    if (args.verbose) {
        bundl.log('Bundling ' + r.name + ' ...');
    }

    bundl.ACTIVE_BUNDLE_COUNT++;

    // concat src files
    r.contents = concat(r.src, r.options.concat, bundl);

    // walk the build chain
    var chainIndex = 0;
    if (r.chain.length) {
        walk();
    } else {
        moveAlong();
    }

    function walk () {
        var extension = r.chain[chainIndex];
        if (typeof extension.each === 'function') {
            var extReturn = extension.each.call(bundl, r.contents, r, eachDone);
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
        if (typeof result === 'string') {
            r.contents = result;
            moveAlong();

        } else {
            bundl.log.error(new Error('Extension.each must return contents (as a string) or call done(contents)'));
        }
    }

    function success () {
        r.changed = false;
        if (args.verbose) {
            bundl.log('Finished ' + r.name + ' ' + prettyTime(process.hrtime(start)));
        }

        if (typeof afterEach === 'function') {
            afterEach(r.name, r.contents);
        }

        bundl.ACTIVE_BUNDLE_COUNT--;
        if (!bundl.ACTIVE_BUNDLE_COUNT) {
            if (typeof afterAll === 'function') {
                afterAll();
            }
        }
    }
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