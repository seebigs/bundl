/**
 * Router to handle files that need to be re-bundled
 */

var parseUrl = require('parseurl');
var path = require('path');
var send = require('send');

function shouldRebuild(b, r, rebuildOption) {
    if (typeof r === 'string') {
        r = b.getResources()[r];
    }

    if (r) {
        if (rebuildOption === 'always') {
            return true;
        } else if (rebuildOption === 'never') {
            return false;
        } else if (r.changed || !r.contents || !r.contents.getString()) {
            return true;
        }
    }

    return false;
}

function bundlRouter(bundl, serverOptions) {
    serverOptions = serverOptions || {};

    return function bundlRouter (req, res, next) {
        var bundlResources = bundl.getResources();
        var browserPath = parseUrl(req).pathname.substr(1);

        var r;
        if (bundl.options && typeof bundl.options.liveRequestPathMap === 'function') {
            r = bundlResources[bundl.options.liveRequestPathMap(browserPath)];
        } else {
            r = bundlResources[browserPath];
            if (!r) {
                // try absolute path as resource name instead
                r = bundlResources[path.resolve(serverOptions.root, browserPath)];
            }
        }

        if (r) {
            var stream = send(req, browserPath);

            stream.on('error', function (err) {
                if (err.code === 'ENOENT') {
                    next();
                } else {
                    res.end(err);
                }
            });

            if (shouldRebuild(bundl, r, serverOptions.rebuild)) {
                bundl.go(r.name, function () {
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
