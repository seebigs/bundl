/**
 * Bundl
 */

var bundlClassMethods = require('./lib/bundl_class.js');
var bundlInstanceMethods = require('./lib/bundl_instance.js');
var discoverRelativePath = require('discover-source-path');
var each = require('seebigs-each');
var path = require('path');

class Bundl {
    constructor(targets, options) {
        var _this = this;
        var relativeTo = discoverRelativePath(3); // careful when moving!
        var opts = Object.assign({}, options);
        opts.srcDir = opts.srcDir ? path.resolve(relativeTo, opts.srcDir) : relativeTo;
        opts.outputDir = opts.outputDir ? path.resolve(relativeTo, opts.outputDir) : relativeTo + '/bundled';
        opts.watch = opts.watch ? path.resolve(relativeTo, opts.watch) : void 0;

        _this.options = opts;
        _this.isBundl = true;
        _this._ = {
            CHAIN_STAGE: 'stringy',
            CHAIN_SRC: [],
            CHANGEMAP: {},
            RESOURCES: {},
            ACTIVE_BUNDLE_COUNT: 0,
            LINES: 2, // allow for "preface"
        };

        each(bundlInstanceMethods, function (method, name) {
            _this[name] = method;
        });

        _this.add.call(_this, targets);
    }
}

each(bundlClassMethods, function (method, name) {
    Bundl[name] = method;
});

module.exports = Bundl;
