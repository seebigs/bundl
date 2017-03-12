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
            mapChanges.call(bundl, src, dupName);
        });
    });

    return this;
}

function startWebServer (serverOptions) {
    var b = this.isBundle ? this : new BundlInstance();
    return webserver(b, serverOptions);
}

function shouldRebuild (r, serverOptions) {
    if (typeof r === 'string') {
        r = this.RESOURCES[r];
    }

    if (r) {
        if (serverOptions.rebuild === 'changed') {
            if (r.changed || r.contents === '') { return true; }
        } else if (serverOptions.rebuild === 'always') {
            return true;
        }
    }

    return false;
}

function mapChanges (srcPath, bundleName) {
    var cmap = this.CHANGEMAP[srcPath] || {};
    cmap[bundleName] = 1;
    this.CHANGEMAP[srcPath] = cmap;
    return this;
}

/**
 * Map a source file to a list of bundles that use it
 * { srcFile: { bundleOne: 1, bundleTwo: 1 } }
 */
function getChangeMap (srcFile) {
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

function getSrcFiles () {
    return Object.keys(this.CHANGEMAP);
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
    this.all = bundles.all;
    this.one = bundles.one;
    this.forEach = forEach;

    // webserver
    this.webserver = startWebServer;
    this.shouldRebuild = shouldRebuild;

    // maps
    this.mapChanges = mapChanges;
    this.getChangeMap = getChangeMap;
    this.getResources = getResources;
    this.getSrcFiles = getSrcFiles;

    // logging
    this.log = new Log(label);

    // options
    this.args = args;
    this.options = {};

    return this;
}

module.exports = BundlInstance;
