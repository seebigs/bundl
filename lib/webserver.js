/**
 * A webserver that builds resources when requested (if changed)
 */

var bundlRouter = require('./router.js');
var chalk = require('chalk');
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var serveIndex = require('serve-index');
var url = require('url');
var each = require('seebigs-each');
var watch = require('node-watch');

// extend morgan tokens
morgan.token('statusColored', function(req, res){
    var code = res.statusCode;
    if (code >= 200) {
        if (code < 300) {
            // success
            return chalk.green(code);
        } else if (code < 400) {
            // redirect
            return chalk.cyan(code);
        } else if (code < 500) {
            // client error
            return chalk.yellow(code);
        } else if (code < 600) {
            // server error
            return chalk.red(code);
        }
    }
    return code;
});

function setupWatcher(bundl, serverOptions) {
    if (serverOptions.rebuild !== 'never' && serverOptions.rebuild !== 'always') {
        var watchPath = path.resolve(bundl.options.watch || serverOptions.root || process.cwd());

        // inform the user
        bundl.log('Watching for changes in ' + watchPath + '...');

        // watch for changes
        watch(watchPath, {
            recursive: true,
            filter: function (name) {
                return !/node_modules/.test(name); // FIXME
                // let's do this by reading .gitignore and filtering any file/folder that is ignored there?
            }
        }, function(evt, filepath) {
            each(bundl.getDependencyMap(filepath), function (v, bundlePath) {
                var r = bundl.getResources()[bundlePath];
                if (r) {
                    r.changed = true;
                }
            });
        });
    }
}

function createServerAndListen(serverOptions) {
    serverOptions = serverOptions || {};
    var bundl = serverOptions.routes && serverOptions.routes[0];
    var app = express();
    var rootPath = serverOptions.root ? path.resolve(serverOptions.root) : process.cwd();
    serverOptions.root = rootPath; // send the resolved root through on options

    app.set('port', serverOptions.port || 5555);

    // Allow CORS
    app.all('*', function(req, res, next) {
        var referrer = req.get('Referrer');
        var allowOrigin = '*';
        if (referrer) {
            var parsedUrl = url.parse(referrer);
            allowOrigin = parsedUrl.protocol + '//' + parsedUrl.host;
        }
        res.header('Access-Control-Allow-Origin', allowOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        next();
    });

    // enable terminal logger if desired
    if (serverOptions.log !== false) {
        var logFormat = serverOptions.log.format || ':method :url :statusColored :response-time ms - :res[content-length]';

        if (bundl.log.label) {
            logFormat = chalk.magenta(bundl.log.label) + ' ' + logFormat;
        }

        app.use(morgan(logFormat, serverOptions.log.options));
    }

    // rebuild and serve if requested file is a bundle
    each(serverOptions.routes, function (route) {
        app.use(bundlRouter(route, serverOptions));
        setupWatcher(route, serverOptions);
    });

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

function webserver(serverOptions) {
    serverOptions = serverOptions || {};
    if (typeof serverOptions.log === 'undefined') {
        serverOptions.log = {};
    }

    createServerAndListen(serverOptions);
}


module.exports = webserver;
