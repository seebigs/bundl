var Bundl = require('../../index.js');

describe('chain', function () {

    describe('.debug', function (expect) {
        var b = new Bundl();
        var logs = [];
        b.log = function (msg, msg2) {
            logs.push(msg + (msg2 ? ' ' + msg2 : ''));
        };
        b._.RESOURCES = {
            'bundle_one.js': {
                dest: 'destination',
                src: [
                    '/abs/src/one',
                    '/abs/src/two'
                ]
            }
        };
        b.debug();
        expect(logs).toBe([
            'destination',
            '   ^-- /abs/src/one',
            '   ^-- /abs/src/two'
        ]);
    });

    // describe('.parse / .generate / .minify', function (expect) {
    //     var b = new Bundl();
    //     expect(b._.CHAIN_STAGE).toBe('stringy');
    //     b.parse();
    //     expect(b._.CHAIN_STAGE).toBe('parsed');
    //     b.generate();
    //     expect(b._.CHAIN_STAGE).toBe('stringy');
    //     b.parse();
    //     expect(b._.CHAIN_STAGE).toBe('parsed');
    //     b.minify();
    //     expect(b._.CHAIN_STAGE).toBe('stringy');
    // });

    describe('.rename', function (expect) {
        var b = new Bundl({ 'foo': 'src1' });
        b.rename();
        expect(b.getResources().foo.chain[0].name).toBe('rename');
    });

    describe('.src', function (expect) {
        var srcPlugin = {
            name: 'srcPlugin',
            stage: 'src',
            exec: function(){},
        };

        var b = new Bundl();
        var errMsg = '';
        b.halt = function(e){
            errMsg = e;
        };

        b.src(srcPlugin);
        expect(b._.CHAIN_SRC).toBe([srcPlugin]);
        b.src({ name: 'BAD' });
        expect(errMsg).toBe('BAD plugin is not configured for the src stage');
    });

    describe('.then', function (expect) {
        var plugin1 = {
            name: 'plugin1',
            stage: 'stringy',
            exec: function(){},
        };
        var plugin2 = {
            name: 'plugin2',
            stage: 'stringy',
            exec: function(){},
        };

        var b = new Bundl({ 'foo': 'src1.js' });
        var errMsg = '';
        b.halt = function(e){
            errMsg = e;
        };
        b.then(plugin1);
        b.then(plugin2);
        expect(b.getResources().foo.chain).toBe([
            plugin1,
            plugin2,
        ]);
        b.then('hello');
        expect(errMsg).toBe('Plugin must be an object');
        b.then({ name: 'BAD2', stage: 'nonsense' });
        expect(errMsg).toContain('BAD2 plugin is designed for use in stage "nonsense" not "stringy"');
    });

    describe('.thenif', function (expect) {
        var plugin1 = {
            name: 'plugin1',
            stage: 'stringy',
            exec: function(){},
        };
        var plugin2 = {
            name: 'plugin2',
            stage: 'stringy',
            exec: function(){},
        };

        var b = new Bundl({ 'foo': 'src1.js' })
            .thenif(false, plugin2, plugin1)
            .thenif(true, plugin1, plugin2);

        expect(b.getResources().foo.chain).toBe([
            plugin1,
            plugin1,
        ]);
    });

    describe('.write', function (expect) {
        var b = new Bundl({ 'foo': 'src1' });
        b.write();
        expect(b.getResources().foo.chain[0].name).toBe('write');
    });

});
