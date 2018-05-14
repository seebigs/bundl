var Bundl = require('../../index.js');
var path = require('path');

describe('run', function () {

    var result = [];

    var b = new Bundl({
        foo: '../_concatme/_one.js', // relative path
        bar: path.resolve('./test/_concatme/_two.js') // absolute path
    });
    b.add({
        zoo: '../_concatme/_three.html',
    });

    b.src({
        name: 'src1',
        stage: 'src',
        exec: function (srcFiles, done) {
            result.push('src1x' + srcFiles.length);
            done();
        }
    });
    b.then({
        name: 'p1',
        stage: 'stringy',
        exec: function (r) {
            result.push(r.name + 'P1');
            return r;
        }
    });
    b.src({
        name: 'src2',
        stage: 'src',
        exec: function (srcFiles, done) {
            result.push('src2x' + srcFiles.length);
            done();
        }
    });
    b.rename({
        remap: {
            zoo: 'zzz',
        },
    });
    b.then({
        name: 'p2',
        stage: 'stringy',
        exec: function (r) {
            result.push(r.name + 'P2');
            return r;
        }
    });
    b.then({
        name: 'p3',
        stage: 'stringy',
        exec: function (r) {
            result.push(r.name + 'P3');
            return r;
        }
    });

    function afterEach (r) {
        result.push(r.name + 'AE');
    }

    describe('bundlOne', function (expect, oneDone) {
        result = [];
        b.go('foo', function () {
            result.push('AA');
            expect(result).toBe([
                'fooP1',
                'fooP2',
                'fooP3',
                'fooAE',
                'AA',
            ]);
            testBundlAll();
            oneDone();
        }, afterEach);
    });

    function testBundlAll() {
        describe('bundlAll', function (expect, allDone) {
            result = [];
            b.go(function () {
                result.push('AA');
                expect(result).toBe([
                    'src1x3',
                    'src2x3',
                    'fooP1',
                    'barP1',
                    'zooP1',
                    'fooP2',
                    'barP2',
                    'zzzP2',
                    'fooP3',
                    'fooAE',
                    'barP3',
                    'barAE',
                    'zzzP3',
                    'zzzAE',
                    'AA',
                ]);
                allDone();
            }, afterEach);
        });
    }

});
