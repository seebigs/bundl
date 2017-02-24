var bundl = require('../../../index.js');
var fs = require('fs');
var nodeAsBrowser = require('node-as-browser').init();
var path = require('path');
var stackRemap = require('../../__stack_remap.js');     // FIXME: should publish to npm

var pack = require('../../../../bundl-pack');
var minify = require('../../../../bundl-minify');
var rename = require('../../../../bundl-rename');
var replace = require('../../../../bundl-replace');
var sourcemap = require('../../../../bundl-sourcemap');
var wrap = require('../../../../bundl-wrap');
var write = require('../../../../bundl-write');


var targets = {
    'sample.js': [
        '../_packme/_sample.js',
        '../_packme/_init.js',
        '../_packme/_init.js'
    ]
};

var options = {
    outputDir: 'test/_out',
    clean: true
};

describe('common plugins', function (expect, done) {
    var b = bundl(targets, options)
        .then(pack({ paths: ['./test/_packme'] }))
        // .then(sourcemap())
        .then(replace.direct(pack.requirer.toString(), 'function require(){ window.success=true; }'))
        .then(wrap({ before: 'window', after: 'window' }))
        .then(rename('.ext.js'))
        .then(minify())
        .then(write())
        .all(function () {
            var outfile = fs.readFileSync('test/_out/sample.ext.js', 'utf8').split('//# sourceMappingURL=');
            var expected = fs.readFileSync('test/specs/plugins/expected.js', 'utf8');
            expect(outfile[0]+'\n').toBe(expected);

            stackRemap.init(b.getResources()['sample.js'].sourcemaps);
            require('../../_out/sample.ext.js');

            expect(window.success).toBe(true);

            done();
        });
});
