/**
 * new Bundl()
 */

var chain = require('./chain.js');
var cliArgs = require('seebigs-args')();
var run = require('./run.js');
var resources = require('./resources.js');
var halt = require('./halt.js');
var Log = require('./log.js');
var router = require('./router.js');
var webserver = require('./webserver.js');

var log = new Log();

function middleware(serverOptions) {
    return router(this, serverOptions);
}

function startWebServer(serverOptions) {
    serverOptions = serverOptions || {};
    if (this.isBundl) {
        serverOptions.routes = serverOptions.routes || [];
        serverOptions.routes.push(this);
    }
    return webserver(serverOptions);
}

module.exports = {

    // adding resources
    add: chain.add,

    // chain steps
    debug: chain.debug,
    rename: chain.rename,
    src: chain.src,
    then: chain.then,
    thenif: chain.thenif,
    write: chain.write,

    // running bundles
    go: run.go,
    forEach: run.forEach,

    // managing resources and maps
    getDependencyMap: resources.getDependencyMap,
    getResources: resources.getResources,
    getSrcFiles: resources.getSrcFiles,
    mapDependency: resources.mapDependency,
    mergeResources: resources.mergeResources,

    // logging
    halt: halt,
    log: log,

    // args
    cliArgs: cliArgs,

    // webserver
    middleware: middleware,
    webserver: startWebServer,

};
