
var BundlInstance = require('../../../lib/instance.js');
var path = require('path');

function bundl (targets) {
    var b = new BundlInstance();
    return b.add.call(b, targets);
}

describe('bundles', function () {

    describe('add', function () {

        describe('.then', function (expect) {
            var b = bundl().then({ abc: 123 });
            expect(b.CHAIN).toBe([
                { abc: 123 }
            ]);
        });

        describe('.thenif', function (expect) {
            var b = bundl()
                .thenif(true, { one:'yes' }, { one:'no' })
                .thenif(false, { two:'yes' }, { two:'no' });
            expect(b.CHAIN).toBe([
                { one: 'yes' },
                { two: 'no' }
            ]);
        });

        describe('.debug', function (expect) {
            var b = bundl();
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
            b.debug();
            expect(logs).toBe([
                'destination',
                '   ^-- /abs/src/one',
                '   ^-- /abs/src/two'
            ]);
        });

    });

    describe('go', function () {

        describe('bundlAll', function (expect, done) {
            var result = '';
            var b = bundl({
                foo: '../../_concatme/_one.js', // relative path
                bar: path.resolve('./test/_concatme/_two.js') // absolute path
            });
            b.then({
                one: function (contents, r) {
                    result += r.name + 1;
                    return 'each1';
                }
            });
            b.then({
                one: function (contents, r) {
                    result += r.name + 2;
                    return 'each2';
                }
            });
            b.then({
                all: function (resources, files) {
                    for (var name in resources) {
                        if (resources.hasOwnProperty(name)) {
                            result += '-' + name.split('/').pop();
                        }
                    }
                    files.forEach(function (f) {
                        result += '-' + f.split('/').pop();
                    });
                    return true;
                }
            });

            function afterAll () {
                result += '-allDone';
                expect(result).toBe('foo1bar1foo2bar2-afterfoo-afterbar-foo-bar-_one.js-_two.js-allDone');
                done();
            }

            function afterEach (r) {
                result += '-after' + r.name;
            }

            b.go(afterAll, afterEach);
        });

        describe('bundlOne', function (expect, done) {
            var result = '';
            var b = bundl({
                foo: '../../_concatme/_one.js', // relative path
                bar: path.resolve('./test/_concatme/_two.js') // absolute path
            });
            b.then({
                one: function (contents, r) {
                    result += r.name + 1;
                    return 'each1';
                }
            });
            b.then({
                one: function (contents, r) {
                    result += r.name + 2;
                    return 'each2';
                }
            });

            b.go('foo', function () {
                result += '-afterAll';
                expect(result).toBe('foo1foo2-afterAll');
                done();
            }, function () {
                result += '-afterEach';
            });
        });

    });

});
