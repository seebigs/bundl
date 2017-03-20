/**
 * Instance of bundl()
 */

var bundles = require('./bundles.js');
var Log = require('./log.js');
var utils = require('seebigs-utils');
var webserver = require('./webserver.js');

var args = utils.args();

function forEach (iterator) {
    utils.each(this.getResources(), iterator);
}

function merge (otherResources) {
    var bundl = this;
    var resources = bundl.RESOURCES;
    var changemap = bundl.CHANGEMAP;

    utils.each(otherResources, function (r, dupName) {
        resources[dupName] = r;
        utils.each(r.src, function (src) {
            mapDependency.call(bundl, dupName, src);
        });
    });

    return bundl;
}

/**
 * Add a mapping to indicate that a bundle depends on a given source file
 */
function mapDependency (bundleName, srcPath) {
    var cmap = this.CHANGEMAP[srcPath] || {};
    cmap[bundleName] = 1;
    this.CHANGEMAP[srcPath] = cmap;
    return this;
}

/**
 * Get a map of source files to a list of bundles that use them
 * { srcFile: { bundleOne: 1, bundleTwo: 1 } }
 */
function getDependencyMap (srcFile) {
    return srcFile ? this.CHANGEMAP[srcFile] : this.CHANGEMAP;
}

/**
 * Get a collection of resources
 * { bundleName: { name, dest, options, src, chain, contents, sourcemaps } }
 */
function getResources (firstOnly) {
    if (firstOnly) {
        var first;
        utils.each(this.RESOURCES, function (r) {
            first = r;
            return false;
        });
        return first;
    }

    return this.RESOURCES;
}

/**
 * Get an Array of all matched source files
 */
function getSrcFiles () {
    return Object.keys(this.CHANGEMAP);
}

/**
 * Start a new webserver with the matched resources
 */
function startWebServer (serverOptions) {
    var b = this.isBundle ? this : new BundlInstance();
    return webserver(b, serverOptions);
}


function BundlInstance (label) {
    // identify
    this.isBundle = true;

    // storage
    this.CHAIN = [];
    this.CHANGEMAP = {};
    this.RESOURCES = {};
    this.ACTIVE_BUNDLE_COUNT = 0;
    this.LINES = 2; // allow for "preface"

    // adding resources
    this.add = bundles.add;
    this.merge = merge;

    // running bundles
    this.go = bundles.go;
    this.forEach = forEach;

    // resources and maps
    this.getDependencyMap = getDependencyMap;
    this.getResources = getResources;
    this.getSrcFiles = getSrcFiles;
    this.mapDependency = mapDependency;

    // logging
    this.log = new Log(label);

    // options
    this.args = args;
    this.options = {};

    // webserver
    this.webserver = startWebServer;

    return this;
}

module.exports = BundlInstance;
