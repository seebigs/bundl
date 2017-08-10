/**
 * Resolve targets into usable resources
 */

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var utils = require('seebigs-utils');


function matchByGlob (match, globOptions, b) {
    if (!match) {
        b.log.error(new Error('Targets must not be empty strings'));
    }

    try {
        if (fs.statSync(path.resolve(globOptions.cwd, match)).isDirectory()) { // isDir
            match += match.charAt(match.length - 1) === '/' ? '**' : '/**';
        }
    } catch (err) {}

    return glob.sync(match, globOptions);
}

function targetsArrayToFiles (targets, globOptions, b) {
    var ignores = [];
    var matches = [];
    var files = [];

    targets.forEach(function (target) {
        if (target.indexOf('!') === 0) {
            ignores.push(target.substr(1));
        } else {
            matches.push(target);
        }
    });

    globOptions.ignore = ignores;

    matches.forEach(function (match) {
        files = files.concat(matchByGlob(match, globOptions, b));
    });

    return files;
}

function resolveTargets (bundl, targets, options) {
    options = options || {};
    var globOptions = {
        absolute: true,
        cwd: options.srcDir,
        mark: true,
        nodir: true
    };

    var resources = {};
    var targetsMap = {};

    if (typeof targets === 'string') {
        targets = [targets];
    }

    if (Array.isArray(targets)) {
        targetsArrayToFiles(targets, globOptions, bundl).forEach(function (file) {
            targetsMap[file] = [file];
        });

    } else {
        utils.each(targets, function (value, name) {
            if (typeof value === 'string') {
                value = [value];
            }

            if (Array.isArray(value)) {
                targets[name] = targetsArrayToFiles(value, globOptions, bundl);
            }
        });

        targetsMap = targets;
    }

    utils.each(targetsMap, function (srcArray, name) {
        if (name) {
            name = name.replace(options.srcDir + '/', '');
            var ext = name.split('.').pop();
            var destPath = path.resolve(path.join(options.outputDir, name));

            if (!Array.isArray(srcArray)) {
                srcArray = [srcArray];
            }

            resources[name] = {
                name: name,
                ext: ext,
                dest: destPath,
                options: options,
                src: [],
                chain: [],
                contents: '',
                sourcemaps: []
            };

            srcArray.forEach(function (src) {
                if (src) {
                    if (typeof src === 'string') {
                        srcPath = path.isAbsolute(src) ? src : path.resolve( path.join(options.srcDir, src) );
                        resources[name].src.push(srcPath);
                        bundl.mapDependency(name, srcPath);

                    } else if (src.contents) {
                        resources[name].src.push(src);
                    }
                }
            });
        }
    });

    return resources;
}


module.exports = resolveTargets;
