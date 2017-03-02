/**
 * Instance of bundl()
 */

var bundles = require('./bundles.js');
var Log = require('./log.js');
var utils = require('seebigs-utils');
var webserver = require('./webserver.js');

var args = utils.args();

function startWebServer (serverOptions) {
    return webserver(this, serverOptions);
}

function shouldRebuild (bundleName, serverOptions) {
    var r = this.RESOURCES[bundleName];

    if (r) {
        if (serverOptions.rebuild === 'changed') {
            if (r.changed) { return true; }
        } else if (serverOptions.rebuild === 'always') {
            return true;
        }
    }

    return false;
}

function mapChanges (srcPath, name) {
    var cmap = this.CHANGEMAP[srcPath] || {};
    cmap[name] = 1;
    this.CHANGEMAP[srcPath] = cmap;
    return this;
}

function getChangeMap () {
    return this.CHANGEMAP;
}

function getResources () {
    return this.RESOURCES;
}

function getSrcFiles () {
    return Object.keys(this.CHANGEMAP);
}


function BundlInstance (label) {
    // storage
    this.CHAIN = [];
    this.CHANGEMAP = {};
    this.RESOURCES = {};
    this.ACTIVE_BUNDLE_COUNT = 0;
    this.LINES = 2; // allow for "preface"

    // bundles
    this.add = bundles.add;
    this.all = bundles.all;
    this.one = bundles.one;

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

    // utils
    this.args = args;

    return this;
}

module.exports = BundlInstance;
