var req = require('./_required.js');

function sample () {
    var foo = req.two;
    return typeof foo;
}

sample();
