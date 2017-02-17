
var bundles = require('../../lib/bundles.js');
var BundlInstance = require('../../lib/instance.js');

function bundl (targets) {
    var b = new BundlInstance();
    return b.add.call(b, targets);
}

describe('targets', function () {

    var loadMeOne = {
        '../_loadme/_one.js': {
            name: '../_loadme/_one.js',
            dest: '/Users/chris.bigelow/Projects/bundl/_loadme/_one.js',
            options: {
                targetDir: '/Users/chris.bigelow/Projects/bundl/test/specs/'
            },
            src: ['/Users/chris.bigelow/Projects/bundl/test/_loadme/_one.js'],
            chain: []
        }
    };

    var loadMeTwo = {
        '../_loadme/_one.js': {
            name: '../_loadme/_one.js',
            dest: '/Users/chris.bigelow/Projects/bundl/_loadme/_one.js',
            options: {
                targetDir: '/Users/chris.bigelow/Projects/bundl/test/specs/'
            },
            src: ['/Users/chris.bigelow/Projects/bundl/test/_loadme/_one.js'],
            chain: []
        },
        '../_loadme/_two.js': {
            name: '../_loadme/_two.js',
            dest: '/Users/chris.bigelow/Projects/bundl/_loadme/_two.js',
            options: {
                targetDir: '/Users/chris.bigelow/Projects/bundl/test/specs/'
            },
            src: ['/Users/chris.bigelow/Projects/bundl/test/_loadme/_two.js'],
            chain: []
        }
    };

    describe('handles undefined', function (expect) {
        expect(bundl().getResources()).toBe({});
    });

    describe('handles empty array', function (expect) {
        expect(bundl([]).getResources()).toBe({});
    });

    describe('handles empty object', function (expect) {
        expect(bundl({}).getResources()).toBe({});
    });

    describe('handles string file', function (expect) {
        expect(bundl('../_loadme/_one.js').getResources()).toBe(loadMeOne);
    });

    xdescribe('handles string dir', function (expect) {
        expect(bundl('../_loadme').getSrcFiles().length).toBe(2);
    });

    xdescribe('handles string glob', function (expect) {
        var b = bundl('../**/*_two*');
        expect(b.getResources()).toBe('???');
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles array of one file', function (expect) {
        expect(bundl(['../_loadme/_one.js']).getResources()).toBe(loadMeOne);
    });

    describe('handles array of multiple files', function (expect) {
        expect(bundl(['../_loadme/_one.js','../_loadme/_two.js']).getResources()).toBe(loadMeTwo);
    });

    xdescribe('handles array of multiple globs', function (expect) {
        expect(bundl(['../**/*_one*','../**/*_two*']).getResources()).toBe('???');
    });

    describe('handles object with files', function (expect) {
        var b = bundl({
            'foo': '../_loadme/_one.js',
            'bar': '../_loadme/_two.js'
        });
        expect(Object.keys(b.getResources())).toBe(['foo', 'bar']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles object with globs', function (expect) {
        var b = bundl({
            'foo': '../**/*_one*'
        });
        expect(Object.keys(b.getResources())).toBe(['foo']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles object with arrays', function (expect) {
        var b = bundl({
            'foo': ['../_loadme/_one.js','../_loadme/_two.js']
        });
        expect(Object.keys(b.getResources())).toBe(['foo']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    xdescribe('handles object with object.contents', function (expect) {
        var b = bundl({
            'foo': { contents: 'blah' }
        });
    });

});
