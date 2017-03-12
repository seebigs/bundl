/**
 * Router to handle files that need to be re-bundled
 */

var parseUrl = require('parseurl');
var resolve = require('path').resolve;
var send = require('send');

function bundlRouter (bundl, rootPath, serverOptions) {

    var opts = Object.create(serverOptions || Object.prototype);
    opts.root = resolve(rootPath);

    return function bundlRouter (req, res, next) {
        var bundlResources = bundl.getResources();
        var browserPath = parseUrl(req).pathname.substr(1);
        var localPath = browserPath;
        var r = bundlResources[localPath];

        if (!r) {
            // try absolute localPath instead
            localPath = resolve(rootPath, localPath);
            r = bundlResources[localPath];
        }

        if (r) {
            var stream = send(req, browserPath, opts);

            stream.on('error', function (err) {
                if (err.code === 'ENOENT') {
                    next();
                } else {
                    res.end(err);
                }
            });

            if (bundl.shouldRebuild(r, opts)) {
                bundl.one(localPath, function () {
                    stream.pipe(res);
                });
            } else {
                stream.pipe(res);
            }

        } else {
            // not a bundled file, pass through
            next();
        }
    };
}

module.exports = bundlRouter;
