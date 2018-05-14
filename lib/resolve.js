/**
 * Resolve targets into usable resources
 */

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var resources = require('./resources.js');
var each = require('seebigs-each');


function matchByGlob (match, globOptions, b) {
    if (!match) {
        b.halt(new Error('Targets must not be empty strings'));
    }

    try {
        if (fs.statSync(path.resolve(globOptions.cwd, match)).isDirectory()) { // isDir
            match += match.charAt(match.length - 1) === '/' ? '**' : '/**';
        }
    } catch (err) {
        // do nothing
    }

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

    var targetsMap = {};

    if (typeof targets === 'string') {
        targets = [targets];
    }

    if (Array.isArray(targets)) {
        targetsArrayToFiles(targets, globOptions, bundl).forEach(function (file) {
            targetsMap[file] = [file];
        });

    } else {
        each(targets, function (value, name) {
            if (typeof value === 'string') {
                value = [value];
            }

            if (Array.isArray(value)) {
                targets[name] = targetsArrayToFiles(value, globOptions, bundl);
            }
        });

        targetsMap = targets;
    }

    return resources.create(bundl, targetsMap, options);
}


module.exports = resolveTargets;
