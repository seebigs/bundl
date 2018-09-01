var crypto = require('crypto');
var path = require('path');
var each = require('seebigs-each');

function createContentsObject() {
    var stage = 'stringy';
    var hash;
    var string;
    var parsed;
    return {
        getStage: function () {
            return stage;
        },
        getString: function () {
            return string;
        },
        getHash: function () {
            return hash;
        },
        getParsed: function () {
            return parsed;
        },
        set: function (contents) {
            if (typeof contents === 'string') {
                string = contents;
                hash = createHash(contents);
            }
        },
        changeStage: function (toStage) {
            // NOTE: We do not delete parsed so that .minify() can use it without reparsing
            if (toStage === 'parsed') {
                string = void 0;
            }
            stage = toStage;
        },
    };
}

function createHash(str) {
    return crypto.createHash('sha1').update(str).digest('base64');
}

function stripCommonPath(srcDir, name) {
    var uncommon = [];
    var srcSplit = srcDir.split('/');
    var nameSplit = name.split('/');
    for (var i = 0, len = nameSplit.length; i < len; i++) {
        if (uncommon.length || srcSplit[i] !== nameSplit[i]) {
            uncommon.push(nameSplit[i]);
        }
    }
    return uncommon.join('/');
}

function create (bundl, targetsMap, options) {
    var resources = {};

    each(targetsMap, function (srcArray, name) {
        if (name) {
            name = stripCommonPath(options.srcDir, name);
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
                sourcemaps: [],
                contents: createContentsObject(),
                chain: [],
            };

            srcArray.forEach(function (src) {
                if (src) {
                    if (typeof src === 'string') {
                        var srcPath = path.isAbsolute(src) ? src : path.resolve( path.join(options.srcDir, src) );
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

/**
 * Get a map of source files to a list of bundles that use them
 * { srcFile: { bundleOne: 1, bundleTwo: 1 } }
 */
function getDependencyMap (srcFile) {
    return srcFile ? this._.CHANGEMAP[srcFile] : this._.CHANGEMAP;
}

/**
 * Get a collection of resources
 * { bundleName: { name, dest, options, src, chain, parsed, sourcemaps } }
 */
function getResources (firstOnly) {
    if (firstOnly) {
        var first;
        each(this._.RESOURCES, function (r) {
            first = r;
            return false;
        });
        return first;
    }

    return this._.RESOURCES;
}

/**
 * Get an Array of all matched source files
 */
function getSrcFiles () {
    return Object.keys(this._.CHANGEMAP);
}

/**
 * Add a mapping to indicate that a resource depends on a given source file
 */
function mapDependency (resourceName, srcPath) {
    var cmap = this._.CHANGEMAP[srcPath] || {};
    cmap[resourceName] = 1;
    this._.CHANGEMAP[srcPath] = cmap;
    return this;
}

/**
 * Combine two groups of resources
 */
function mergeResources (otherResources) {
    var bundl = this;
    var resources = bundl._.RESOURCES;

    each(otherResources, function (r, dupName) {
        resources[dupName] = r;
        each(r.src, function (src) {
            mapDependency.call(bundl, dupName, src);
        });
    });

    return bundl;
}

module.exports = {
    create: create,
    getDependencyMap: getDependencyMap,
    getResources: getResources,
    getSrcFiles: getSrcFiles,
    mapDependency: mapDependency,
    mergeResources: mergeResources,
};
