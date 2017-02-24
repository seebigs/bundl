
var bundl = require('../../../index.js');
var path = require('path');

var projectPath = path.resolve('./test');

describe('targets', function () {

    var loadMeOne = {
        '../../_loadme/_one.js': {
            name: '../../_loadme/_one.js',
            dest: projectPath + '/_loadme/_one.js',
            options: {
                outputDir: projectPath + '/specs/automated/'
            },
            src: [projectPath + '/_loadme/_one.js'],
            chain: [],
            contents: '',
            sourcemap: []
        }
    };

    var loadMeTwo = {
        '../../**/*_two*': {
            name: '../../**/*_two*',
            dest: projectPath + '/**/*_two*',
            options: {
                outputDir: projectPath + '/specs/automated/'
            },
            src: [projectPath + '/_concatme/_two.js', projectPath + '/_loadme/_two.js'],
            chain: [],
            contents: '',
            sourcemap: []
        }
    };

    var loadMeMultiFiles = {
        '../../_concatme/_one.js': {
            name: '../../_concatme/_one.js',
            dest: projectPath + '/_concatme/_one.js',
            options: {
                outputDir: projectPath + '/specs/automated/'
            },
            src: [projectPath + '/_concatme/_one.js'],
            chain: [],
            contents: '',
            sourcemap: []
        },
        '../../_loadme/_two.js': {
            name: '../../_loadme/_two.js',
            dest: projectPath + '/_loadme/_two.js',
            options: {
                outputDir: projectPath + '/specs/automated/'
            },
            src: [projectPath + '/_loadme/_two.js'],
            chain: [],
            contents: '',
            sourcemap: []
        }
    };

    var loadMeMultiGlobs = {
        '../../**/*_one*': {
            name: '../../**/*_one*',
            dest: projectPath + '/**/*_one*',
            options: {
                outputDir: projectPath + '/specs/automated/'
            },
            src: [projectPath + '/_concatme/_one.js', projectPath + '/_loadme/_one.js'],
            chain: [],
            contents: '',
            sourcemap: []
        },
        '../../**/*_two*': {
            name: '../../**/*_two*',
            dest: projectPath + '/**/*_two*',
            options: {
                outputDir: projectPath + '/specs/automated/'
            },
            src: [projectPath + '/_concatme/_two.js', projectPath + '/_loadme/_two.js'],
            chain: [],
            contents: '',
            sourcemap: []
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
        expect(bundl('../../_loadme/_one.js').getResources()).toBe(loadMeOne);
    });

    describe('handles string dir', function (expect) {
        expect(bundl(path.resolve('./test/_loadme')).getSrcFiles().length).toBe(2);
        expect(bundl('../../_loadme/').getSrcFiles().length).toBe(2);
    });

    describe('handles string glob', function (expect) {
        var b = bundl('../../**/*_two*');
        expect(b.getResources()).toBe(loadMeTwo);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles array of one file', function (expect) {
        expect(bundl(['../../_loadme/_one.js']).getResources()).toBe(loadMeOne);
    });

    describe('handles array of multiple files', function (expect) {
        expect(bundl(['../../_concatme/_one.js','../../_loadme/_two.js']).getResources()).toBe(loadMeMultiFiles);
    });

    describe('handles array of multiple globs', function (expect) {
        expect(bundl(['../../**/*_one*','../../**/*_two*']).getResources()).toBe(loadMeMultiGlobs)
    });

    describe('handles object with files', function (expect) {
        var b = bundl({
            'foo': '../../_loadme/_one.js',
            'bar': '../../_loadme/_two.js'
        });
        expect(Object.keys(b.getResources())).toBe(['foo', 'bar']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles object with globs', function (expect) {
        var b = bundl({
            'foo': '../../**/*_one*',
            'bar': '../../**/*_two*'
        });
        expect(b.getSrcFiles().length).toBe(4);
    });

    describe('handles object with arrays', function (expect) {
        var b = bundl({
            'foo': ['../../_loadme/_one.js','../../_loadme/_two.js']
        });
        expect(Object.keys(b.getResources())).toBe(['foo']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles object with object.contents', function (expect) {
        var b = bundl({
            'foo': { contents: 'blah' }
        });
        expect(b.getResources().foo.src[0].contents).toBe('blah');
    });

});
