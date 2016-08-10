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
        if (req.method !== 'GET') {
            // method not allowed
            res.statusCode = 405;
            res.setHeader('Allow', 'GET');
            res.setHeader('Content-Length', '0');
            res.end();
            return;
        }

        var path = parseUrl(req).pathname;
        // var requested = opts.root + req.url;
        var requested = req.url.split('/').pop();
        var stream = send(req, path, opts);

        if (bundl.shouldRebuild(requested, opts)) {
            bundl.one(requested, function () {
                stream.pipe(res);
            });
        } else {
            stream.pipe(res);
        }
    };
}

module.exports = bundlRouter;
