
var concat = require('../../../lib/concat.js');
var path = require('path');

describe('concat', function () {

    describe('turns multiple files into one string', function (expect) {
        var str = concat([
            path.resolve(__dirname + '/../../_concatme/_one.js'),
            __dirname + '/../../_concatme/_two.js'
        ], { glue: '%' });
        expect(str).toBe('one\n%two\n');
    });

});
