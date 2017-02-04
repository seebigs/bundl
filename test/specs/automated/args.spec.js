
// must set before bundl is required
process.argv.push('--foo');
process.argv.push('--bar=123');
process.env.npm_config_argv = '{"original":["ignored","task","--more","--better=stuff"]}';

var bundl = require('../../../index.js');

describe('args', function () {

    describe('finds all passed options', function (expect) {
        expect(bundl.args).toBe({
            _: ['task'],
            foo: true,
            bar: '123',
            more: true,
            better: 'stuff'
        });
    });

});
