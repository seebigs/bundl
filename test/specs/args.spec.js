
// must set before bundl is required
process.argv.push('--foo');
process.argv.push('--bar=123');

var Bundl = require('../../index.js');

describe('args', function () {

    describe('finds all passed options', function (expect) {
        delete Bundl.cliArgs.run; // in case the test suite is run with an arg
        expect(Bundl.cliArgs).toBe({
            _: [],
            foo: true,
            bar: 123,
        });
    });

});
