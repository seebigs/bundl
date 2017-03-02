
var concat = require('../../../lib/concat.js');
var path = require('path');

describe('concat', function () {

    describe('turns multiple files into one string', function (expect) {
        var r = {
            src: [
                path.resolve(__dirname + '/../../_concatme/_one.js'),
                __dirname + '/../../_concatme/_two.js'
            ],
            options: {
                concat: { glue: '%' }
            }
        };
        var c = concat(r, { LINES: 88 });
        expect(c.contents).toBe('one\n%two\n');
        expect(c.sourcemaps).toBe([
            {
                source: path.resolve(__dirname + '/../../_concatme/_one.js'),
                original: { line: 1, column: 0 },
                generated: { line: 88, column: 0 },
                totalLines: 2
            },
            {
                source: path.resolve(__dirname) + '/../../_concatme/_two.js',
                original: { line: 1, column: 0 },
                generated: { line: 89, column: 0 },
                totalLines: 2
            }
        ]);
    });

});
