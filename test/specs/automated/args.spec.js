
// must set before bundl is required
process.argv.push('--foo');
process.argv.push('--bar=123');

var bundl = require('../../../index.js');

describe('args', function () {

    describe('finds all passed options', function (expect) {
        expect(bundl.args).toBe({
            _: [],
            foo: true,
            bar: '123'
        });
    });

});
