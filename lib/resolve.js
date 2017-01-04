/**
 * Resolve targets into usable resources
 */

var glob = require('glob');
var utils = require('seebigs-utils');


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
                        bundl.mapChanges(srcPath, name);

                    } else if (target.contents) {
                        resources[name].src.push(target);
                    }
                }
            });
        }
    });

    return resources;
}


module.exports = resolveTargets;
