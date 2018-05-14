var bundlRename = require('../../bundl-rename'); // FIXME
var bundlWrite = require('../../bundl-write'); // FIXME
var path = require('path');
var resolve = require('./resolve.js');
var each = require('seebigs-each');
// var generator = require('./generator.js');
// var minifier = require('./minifier.js');
// var parser = require('./parser.js');

function add (targets) {
    var bundl = this;
    var resources = resolve(bundl, targets, bundl.options);
    Object.assign(bundl._.RESOURCES, resources);
    return bundl;
}

function debug () {
    var bundl = this;
    var hasResources = false;

    each(bundl._.RESOURCES, function (r) {
        hasResources = true;
        bundl.log(r.dest);
        if (r.src.length) {
            each(r.src, function (s) {
                bundl.log('   ^--', s);
            });
        } else {
            bundl.log('   ^--', path.resolve(r.name), '(not found)');
        }
    });

    if (!hasResources) {
        bundl.log.warn('No matched resources');
        bundl.log('options:', bundl.options);
    }

    return bundl;
}

// Heads up: these plugins do not exec in bundlOne mode
function src (plugin) {
    var bundl = this;

    if (typeof plugin === 'object') {
        if (plugin.stage === 'src') {
            bundl._.CHAIN_SRC.push(plugin);
        } else {
            bundl.halt(plugin.name + ' plugin is not configured for the src stage');
        }

    } else if (typeof plugin !== 'undefined') {
        bundl.halt((plugin && plugin.name) + ' plugin must be an object');
    }

    return bundl;
}

function then (plugin) {
    var bundl = this;

    if (typeof plugin === 'object') {
        if (!plugin.stage || plugin.stage === bundl._.CHAIN_STAGE) {
            each(bundl._.RESOURCES, function (resource) {
                resource.chain.push(plugin);
            });

        } else {
            bundl.halt(`${plugin.name} plugin is designed for use in stage "${plugin.stage}" not "${bundl._.CHAIN_STAGE}"\nSee https://github.com/seebigs/bundl/wiki/Build-Stages`);
        }

    } else if (typeof plugin !== 'undefined') {
        bundl.halt('Plugin must be an object');
    }

    return bundl;
}

function thenif (condition, truthy, falsy) {
    var bundl = this;
    var result = !!condition;

    if (typeof condition === 'function') {
        result = condition();
    }

    return then.call(bundl, result ? truthy : falsy);
}

/* Stage Controllers */
//   Build Stages are experimental
//
// function generate (options) {
//     var bundl = this;
//     then.call(this, generator.call(this, options));
//     bundl._.CHAIN_STAGE = 'stringy';
//     return bundl;
// }
//
// function minify (options) {
//     var bundl = this;
//     then.call(this, minifier.call(this, options));
//     bundl._.CHAIN_STAGE = 'stringy';
//     return bundl;
// }
//
// function parse (options) {
//     var bundl = this;
//     then.call(this, parser.call(this, options));
//     bundl._.CHAIN_STAGE = 'parsed';
//     return bundl;
// }

/* Convenience */

function rename () {
    return then.call(this, bundlRename.apply(this, arguments));
}

function write () {
    return then.call(this, bundlWrite.apply(this, arguments));
}

module.exports = {
    add: add,
    debug: debug,
    rename: rename,
    src: src,
    then: then,
    thenif: thenif,
    write: write,
};
