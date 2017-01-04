
var bundles = require('../../lib/bundles.js');
var BundlInstance = require('../../lib/instance.js');

describe('bundles', function () {

    describe('add', function () {

        describe('.then', function (expect) {
            var b = new BundlInstance();
            bundles.add.call(b).then({ abc: 123 });
            expect(b.CHAIN).toBe([
                { abc: 123 }
            ]);
        });

        describe('.thenif', function (expect) {
            var b = new BundlInstance();
            bundles.add.call(b)
                .thenif(true, { one:'yes' }, { one:'no' })
                .thenif(false, { two:'yes' }, { two:'no' });
            expect(b.CHAIN).toBe([
                { one: 'yes' },
                { two: 'no' }
            ]);
        });

        describe('.debug', function (expect) {
            var b = new BundlInstance();
            var logs = [];
            b.log = function (msg, msg2) {
                logs.push(msg + (msg2 ? ' ' + msg2 : ''));
            };
            b.RESOURCES = {
                'bundle_one.js': {
                    dest: 'destination',
                    src: [
                        '/abs/src/one',
                        '/abs/src/two'
                    ]
                }
            };
            bundles.add.call(b).debug();
            expect(logs).toBe([
                'destination',
                '   ^-- /abs/src/one',
                '   ^-- /abs/src/two'
            ]);
        });

    });

    xdescribe('all', function (expect) {
        // setup a test chain and watch bundl walk it for each resource
        // verify afterAll, afterEach, extension.each and extension.all
    });

    xdescribe('one', function (expect) {
        // setup a test chain and watch bundl walk it, ending with success callback
    });

});
