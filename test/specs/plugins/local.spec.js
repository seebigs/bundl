var bundl = require('../../../index.js');
var fs = require('fs');
var path = require('path');

var pack = require('../../../../bundl-pack');
var minify = require('../../../../bundl-minify');
var rename = require('../../../../bundl-rename');
var replace = require('../../../../bundl-replace');
var wrap = require('../../../../bundl-wrap');
var write = require('../../../../bundl-write');


var targets = {
    'sample.js': '../_packme/_sample.js'
};

var options = {
    outputDir: 'test/_out',
    clean: true
};

describe('common plugins', function (expect, done) {
    bundl(targets, options)
        .then(pack())
        .then(replace(pack.prelude.toString(), 'PRELUDE', true))
        .then(wrap({ before: 'bob', after: 'bob' }))
        .then(rename('.ext.js'))
        .then(minify())
        .then(write())
        .all(function () {
            var outfile = fs.readFileSync('test/_out/sample.ext.js', 'utf8').split('//# sourceMappingURL=');
            expect(outfile[0]).toBe('bob,function(){_bundl([[function(n,o,r){function t(){var n=e.two;return typeof n}var e=n("./_required.js");t()},{"./_required.js":1}],[function(n,o,r){o.exports={one:1,two:2}},{}]]),PRELUDE}(),bob;');
            done();
        });
});
