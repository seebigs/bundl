var bundl = require('../../../index.js');
var fs = require('fs');
var nodeAsBrowser = require('node-as-browser').init();
var path = require('path');
var stackRemap = require('stack-remap').install();

var copy = require('../../../../bundl-copy');
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
        .then(copy({ dest: 'test/_out/dupes', flatten: true, filter: function(e,n){ return n.indexOf('_another')!==-1; } }))
        .then(replace.direct(pack.requirer.toString(), 'function require(){ window.success=true; }'))
        .then(wrap({ before: 'window', after: 'window' }))
        .then(rename('.ext.js'))
        .then(minify())
        .then(write())
        .all(function () {
            var outfile = fs.readFileSync('test/_out/sample.ext.js', 'utf8').split('//# sourceMappingURL=');
            var expected = fs.readFileSync('test/specs/plugins/expected.js', 'utf8');
            expect(outfile[0]+'\n').toBe(expected, '(wrong bundle contents)');

            stackRemap.reset();
            stackRemap.add(b.getResources()['sample.js'].sourcemaps);
            require('../../_out/sample.ext.js');
            expect(window.success).toBe(true, '(bundle failed when executed)');

            var duplicated = fs.readFileSync('test/_out/dupes/_another1.js', 'utf8');
            expect(duplicated).toBe(fs.readFileSync('test/_packme/_another1.js', 'utf8'), '(duplicate plugin failed)');

            done();
        });
});
