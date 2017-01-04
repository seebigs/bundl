/**
 * A webserver that builds resources when requested (if changed)
 */

var bundlRouter = require('./router.js');
var chalk = require('chalk');
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var serveIndex = require('serve-index');
var utils = require('seebigs-utils');
var watch = require('node-watch');

// extend morgan tokens
morgan.token('statusColored', function(req, res){
    var code = res.statusCode;

    if (code >= 200) {
        if (code < 300) {
            // success
            return chalk.styles.green.open + code + chalk.styles.green.close;
        } else if (code < 400) {
            // redirect
            return chalk.styles.cyan.open + code + chalk.styles.cyan.close;
        } else if (code < 500) {
            // client error
            return chalk.styles.yellow.open + code + chalk.styles.yellow.close;
        } else if (code < 600) {
            // server error
            return chalk.styles.red.open + code + chalk.styles.red.close;
        }
    }

    return code;
});

function startServer (bundl, serverOptions) {
    serverOptions = serverOptions || {};

    var app = express();
    var rootPath = serverOptions.rootPath || process.cwd();

    app.set('port', serverOptions.port || 5555);

    if (serverOptions.logFormat !== false) {
        var logFormat = serverOptions.logFormat || ':method :url :statusColored :response-time ms - :res[content-length]';

        if (bundl.log.label) {
            logFormat = chalk.styles.magenta.open + bundl.log.label + chalk.styles.magenta.close + ' ' + logFormat;
        }

        app.use(morgan(logFormat, serverOptions.logOptions));
    }

    // rebuild if requested file is a bundle
    app.get('/*.*', bundlRouter(bundl, rootPath, serverOptions));

    // serve if requested static file is not a bundle
    app.use(express.static(rootPath));

    // show directory listing if directory
    if (serverOptions.serveIndex !== false) {
        app.use(serveIndex(rootPath, { icons: true }));
    }

    app.listen(app.get('port'));

    bundl.log.section('Starting Bundl Webserver (port:' + app.get('port') + ' -> ' + rootPath + ')');
}

function bundlWebServer (bundl, serverOptions) {
    serverOptions = serverOptions || {};

    // must bundle all to generate a CHANGEMAP anyway
    bundl.log('Bundling all files to prepare for serving...');
    bundl.log();

    bundl.all(function () {
        if(serverOptions.rebuild === 'changed') {
            var watchPath = path.resolve(serverOptions.watch || serverOptions.rootPath || process.cwd());

            // inform the user
            bundl.log();
            bundl.log('Watching for changes in ' + watchPath + '...');

            // watch for changes
            watch(watchPath, function(filepath) {
                var r, changed = bundl.CHANGEMAP[filepath];
                utils.each(changed, function (v, bundlePath) {
                    r = bundl.RESOURCES[bundlePath];
                    if (r) {
                        r.changed = true;
                    }
                });
            });
        }

        startServer(bundl, serverOptions);
    });
}


module.exports = bundlWebServer;
