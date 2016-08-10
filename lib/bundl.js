/**
 * Bundl
 */

var del = require('del');
var glob = require('glob');
var path = require('path');
var prettyTime = require('pretty-hrtime');
var utils = require('bundl-utils');
var watch = require('node-watch');

var args = require('./args.js');
var concat = require('./concat.js');
var log = require('./log.js');
var webserver = require('./webserver.js');


var defaultOptions = {
    targetDir: '.', // use cwd
    outputDir: 'bundled',
    concat: {
        glue: '\n'
    },
    clean: false,
    verbose: false
};

function bundlAdd (targets, opts) {
    var bundl = this;
    var options = utils.deepExtend({}, defaultOptions, opts);

    var resources = resolveTargets(bundl, targets, options);

    function bundlChain (extension) {
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

    function bundlChainConditional (condition, truthy, falsy) {
        var result = !!condition;

        if (typeof condition === 'function') {
            result = condition();
        }

        return bundlChain(result ? truthy : falsy);
    }

    function bundlChainDebug () {
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

    bundl.debug = bundlChainDebug;
    bundl.then = bundlChain;
    bundl.thenif = bundlChainConditional;

    return bundl;
}

function bundlAll (afterAll, afterEach) {
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

function bundlOne (bundleName, success, error) {
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

    if (r.options.verbose || args.verbose) {
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
        var ext = r.chain[chainIndex];
        if (typeof ext.each === 'function') {
            var extReturn = ext.each.call(bundl, r.contents, r, eachDone);
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
        if (typeof result !== 'undefined') {
            r.contents = result;
            moveAlong();

        } else {
            bundl.log.error(new Error('Extension.each must return contents or call done(contents)'));
        }
    }

    function success () {
        r.changed = false;
        if (r.options.verbose || args.verbose) {
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
    var goVerbose = false;
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
            if (r.options.verbose) {
                goVerbose = true;
            }
        }
    });

    toBeCleaned = Object.keys(toBeCleaned);
    toBeCleaned = toBeCleaned.map(function (c) {
        return c + '/**/*';
    });

    if (toBeCleaned.length && (goVerbose || args.verbose)) {
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

function getChangeMap () {
    return this.CHANGEMAP;
}

function getResources () {
    return this.RESOURCES;
}

function mapChanges (bundl, srcPath, name) {
    var cmap = bundl.CHANGEMAP[srcPath] || {};
    cmap[name] = 1;
    bundl.CHANGEMAP[srcPath] = cmap;
}

function matchByGlob (match, globOptions, b) {
    if (!match) {
        b.log.error(new Error('Targets must not be empty strings'));
    }

    return glob.sync(match, globOptions);
}

function resolveTargets (bundl, targets, options) {
    var targetsMap = {};
    var resources = {};
    var matches = [];
    var ignores = [];
    var destPath;

    var globOptions = { cwd: options.targetDir };

    if (typeof targets === 'string') {
        targetsMap[targets] = matchByGlob(targets, globOptions, bundl);

    } else if (Array.isArray(targets)) {
        targets.forEach(function (target) {
            if (target.indexOf('!') === 0) {
                ignores.push(target.substr(1));
            } else {
                matches.push(target);
            }
        });

        globOptions.ignore = ignores;

        matches.forEach(function (match) {
            targetsMap[match] = matchByGlob(match, globOptions, bundl);
        });

    } else {
        var tmp = [];
        utils.each(targets, function (srcArray, name) {
            if (typeof srcArray === 'string') {
                targets[name] = matchByGlob(srcArray, globOptions, bundl);

            } else if (Array.isArray(srcArray)) {
                srcArray.forEach(function (src) {
                    if (src.indexOf('!') === 0) {
                        ignores.push(src.substr(1));
                    } else {
                        matches.push(src);
                    }
                });

                globOptions.ignore = ignores;

                matches.forEach(function (match) {
                    tmp = tmp.concat(matchByGlob(match, globOptions, bundl));
                });
                targets[name] = tmp;
            }
        });

        targetsMap = targets;
    }

    utils.each(targetsMap, function (srcArray, name) {
        if (name) {
            destPath = path.resolve( path.join(options.outputDir, name) );

            if (!Array.isArray(srcArray)) {
                srcArray = [srcArray];
            }

            resources[name] = {
                name: name,
                dest: destPath,
                options: options,
                src: [],
                chain: []
            };

            srcArray.forEach(function (target) {
                if(target) {
                    if (typeof target === 'string') {
                        srcPath = path.resolve( path.join(options.targetDir, target) );
                        resources[name].src.push(srcPath);
                        mapChanges(bundl, srcPath, name);

                    } else if (target.contents) {
                        resources[name].src.push(target);
                    }
                }
            });
        }
    });

    return resources;
}

function bundlWebServer (serverOptions) {
    var bundl = this;
    serverOptions = serverOptions || {};

    // must bundle all to generate a CHANGEMAP anyway
    bundl.log('Bundling all files to prepare for serving...');
    bundl.log();

    bundl.all(function () {
        if(serverOptions.rebuild === 'changed') {
            var watchPath = path.resolve(serverOptions.watch || serverOptions.rootPath || process.cwd());

            // inform the user
            bundl.log();
            bundl.log('Watching for changes in ' + watchPath + '...');

            // watch for changes
            watch(watchPath, function(filepath) {
                var r, changed = bundl.CHANGEMAP[filepath];
                utils.each(changed, function (v, bundlePath) {
                    r = bundl.RESOURCES[bundlePath];
                    if (r) {
                        r.changed = true;
                    }
                });
            });
        }

        webserver.startServer(bundl, serverOptions);
    });
}

function shouldRebuild (bundleName, serverOptions) {
    var bundl = this;
    var r = bundl.RESOURCES[bundleName];

    if (serverOptions.rebuild === 'changed') {
        if (r && r.changed) {
            return true;
        }

    } else if (serverOptions.rebuild === 'always') {
        if (r) {
            return true;
        }

    }

    return false;
}


function Bundl (label) {
    // storage
    this.CHAIN = [];
    this.CHANGEMAP = {};
    this.RESOURCES = {};
    this.ACTIVE_BUNDLE_COUNT = 0;

    // bundles
    this.add = bundlAdd;
    this.all = bundlAll;
    this.one = bundlOne;

    // webserver
    this.webserver = bundlWebServer;
    this.shouldRebuild = shouldRebuild;

    // maps
    this.mapChanges = mapChanges;
    this.getChangeMap = getChangeMap;
    this.getResources = getResources;

    // logging
    this.log = log.new(label);

    // utils
    this.args = args;
    this.utils = utils;

    return this;
}

module.exports = Bundl;
