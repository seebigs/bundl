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
    var rootPath = serverOptions.root ? path.resolve(serverOptions.root) : process.cwd();
    serverOptions.root = rootPath; // send the resolved root through on options

    app.set('port', serverOptions.port || 5555);

    // enable terminal logger if desired
    if (serverOptions.log !== false) {
        var logFormat = serverOptions.log.format || ':method :url :statusColored :response-time ms - :res[content-length]';

        if (bundl.log.label) {
            logFormat = chalk.styles.magenta.open + bundl.log.label + chalk.styles.magenta.close + ' ' + logFormat;
        }

        app.use(morgan(logFormat, serverOptions.log.options));
    }

    // rebuild and serve if requested file is a bundle
    app.use(bundlRouter(bundl, serverOptions));

    // serve if requested static file is not a bundle
    app.use(express.static(rootPath));

    // show directory listing if directory
    if (serverOptions.serveIndex !== false) {
        app.use(serveIndex(rootPath, { icons: true }));
    }

    // respond with error code
    app.use(function (req, res) {
        res.statusCode = 404;
        res.send('');
    });

    app.listen(app.get('port'));

    bundl.log('Starting Bundl Webserver (localhost:' + app.get('port') + ' -> ' + rootPath + ')');
}

function bundlWebServer (bundl, serverOptions) {
    serverOptions = serverOptions || {};
    if (typeof serverOptions.log === 'undefined') {
        serverOptions.log = {};
    }

    function prepareStartServer () {
        if (serverOptions.rebuild !== 'never' && serverOptions.rebuild !== 'always') {
            var watchPath = path.resolve(serverOptions.watch || serverOptions.root || process.cwd());

            // inform the user
            bundl.log('Watching for changes in ' + watchPath + '...');

            // watch for changes
            watch(watchPath, {
                recursive: true,
                filter: function (name) {
                    return !/node_modules/.test(name);
                }
            }, function(evt, filepath) {
                utils.each(bundl.getDependencyMap(filepath), function (v, bundlePath) {
                    var r = bundl.getResources()[bundlePath];
                    if (r) {
                        r.changed = true;
                    }
                });
            });
        }

        startServer(bundl, serverOptions);
    }

    prepareStartServer();
}


module.exports = bundlWebServer;
