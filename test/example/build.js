var Bundl = require('../../index.js');

var copy = require('bundl-copy');
var eslint = require('bundl-eslint');
var minify = require('bundl-minify');
var pack = require('bundl-pack');
var replace = require('bundl-replace');
var wrap = require('bundl-wrap');

var targets = {
    'sample.js': [
        '_sample.js',
        '_init.js',
        '_init.js'
    ]
};

var options = {
    srcDir: '../_packme',
    outputDir: '../_out',
    clean: true,
};

module.exports = new Bundl(targets, options)
    .src(eslint({ rules: { 'no-undef':'off', 'no-unused-vars':'off' } }))
    .src(copy({ dest: 'test/_out/dupes', flatten: true, filter: function(e,n){ return n.indexOf('_init')!==-1; } }))
    .write()
    .rename('.packed.js')
    .then(pack({ paths: ['./test/_packme'], obscure: true, }))
    .then(replace.direct(pack.requirer.toString(), 'function require(mods,as){ global.exampleBuildSuccess=mods.length; }'))
    .then(wrap({ before: '(function (){', after: '})()' }))
    .write()
    .rename('.min.js')
    .then(minify())
    .write()
