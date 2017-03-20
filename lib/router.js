/**
 * Router to handle files that need to be re-bundled
 */

var parseUrl = require('parseurl');
var resolve = require('path').resolve;
var send = require('send');

function shouldRebuild (b, r, rebuildOption) {
    if (typeof r === 'string') {
        r = b.getResources()[r];
    }

    if (r) {
        if (rebuildOption === 'always') {
            return true;
        } else if (rebuildOption === 'never') {
            return false;
        } else if (r.changed || r.contents === '') {
            return true;
        }
    }

    return false;
}

function bundlRouter (bundl, serverOptions) {

    var opts = Object.create(serverOptions || Object.prototype);

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

            if (shouldRebuild(bundl, r, opts.rebuild)) {
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
