/**
 * Run this script, then open http://localhost:5555/test/_packme/_sample.js
 */

var Bundl = require('../index.js');

var targets = './_packme';
var options = {};

new Bundl(targets, options)
    .then({
        exec: function (r) {
            r.contents.set('OOOOOOO');
            return r;
        },
    })
    .webserver();
