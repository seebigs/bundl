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
        '_sample.js',
        '_init.js',
        '_init.js'
    ]
};

var options = {
    srcDir: '../../_packme',
    outputDir: '../../_out',
    clean: true
};

describe('common plugins', function (expect, done) {
    var b = bundl(targets, options)
        .then(pack({ paths: ['./test/_packme'] }))
        // .then(sourcemap())
        .then(copy({ dest: 'test/_out/dupes', flatten: true, filter: function(e,n){ return n.indexOf('_another')!==-1; } }))
        .then(replace.direct(pack.requirer.toString(), 'function require(mods,as){ window.success=mods.length; }'))
        .then(wrap({ before: 'window', after: 'window' }))
        .then(rename('.ext.js'))
        .then(minify({ warnings: false }))
        .then(write())
        .go(function (resources) {
            var outfile = fs.readFileSync('test/_out/sample.ext.js', 'utf8').split('//# sourceMappingURL=');
            var expected = fs.readFileSync('test/specs/plugins/expected.js', 'utf8');
            expect(outfile[0]+'\n').toBe(expected, '(wrong bundle contents)');

            stackRemap.reset();
            stackRemap.add(resources['sample.js'].sourcemaps);
            require('../../_out/sample.ext.js');
            expect(window.success).toBe(4, '(bundle failed when executed)');

            var duplicated = fs.readFileSync('test/_out/dupes/_another1.js', 'utf8');
            expect(duplicated).toBe(fs.readFileSync('test/_packme/_another1.js', 'utf8'), '(duplicate plugin failed)');

            done();
        });
});

describe('sourcemaps align correctly', function (expect, done) {
    var sourcemapCoords = [];
    var b = bundl({ 'srcmap.js': '../../_packme/_required.js' }, { outputDir: '../../_out', clean: true })
        .then(pack({ paths: ['./test/_packme'] }))
        .then({
            one: function (contents, r) {
                r.sourcemaps.forEach(function (smap) {
                    sourcemapCoords.push(smap.generated.line);
                });
                return contents;
            }
        })
        .then(write())
        .go(function () {
            var outfile = fs.readFileSync('test/_out/srcmap.js', 'utf8').split('\n');
            sourcemapCoords.forEach(function (modLine) {
                expect(outfile[modLine - 1]).toBe('// @module');
            });
            done();
        });
});
