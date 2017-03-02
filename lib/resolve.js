/**
 * Resolve targets into usable resources
 */

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var utils = require('seebigs-utils');


function matchByGlob (match, globOptions, b, relativeTo) {
    if (!match) {
        b.log.error(new Error('Targets must not be empty strings'));
    }

    try {
        if (fs.statSync(path.resolve(relativeTo, match)).isDirectory()) { // isDir
            match += match.charAt(match.length - 1) === '/' ? '*' : '/*';
        }
    } catch (err) {}

    return glob.sync(match, globOptions);
}

function resolveTargets (bundl, targets, options, relativeTo) {
    options = options || {};

    var targetsMap = {};
    var resources = {};
    var matches = [];
    var ignores = [];
    var destPath;

    var globOptions = { cwd: options.srcDir, mark: true, absolute: true };

    if (typeof targets === 'string') {
        targetsMap[targets] = matchByGlob(targets, globOptions, bundl, relativeTo);

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
            targetsMap[match] = matchByGlob(match, globOptions, bundl, relativeTo);
        });

    } else {
        var tmp = [];
        utils.each(targets, function (srcArray, name) {
            if (typeof srcArray === 'string') {
                targets[name] = matchByGlob(srcArray, globOptions, bundl, relativeTo);

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
                chain: [],
                contents: '',
                sourcemaps: []
            };

            srcArray.forEach(function (target) {
                if (target) {
                    if (typeof target === 'string') {
                        srcPath = path.isAbsolute(target) ? target : path.resolve( path.join(options.srcDir, target) );
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
