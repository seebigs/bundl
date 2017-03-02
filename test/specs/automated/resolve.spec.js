var bundl = require('../../../index.js');
var fs = require('fs');
var path = require('path');

var projectPath = path.resolve('./test');

var opt = {
    srcDir: '../../_loadme'
};

var loadMeOne = {
    contents: fs.readFileSync(projectPath + '/_loadme/_one.js', 'utf8'),
    r: {
        '_one.js': {
            name: '_one.js',
            dest: projectPath + '/specs/automated/bundled/_one.js',
            options: {
                srcDir: projectPath + '/_loadme',
                outputDir: projectPath + '/specs/automated/bundled'
            },
            src: [projectPath + '/_loadme/_one.js'],
            chain: [],
            contents: '',
            sourcemaps: []
        }
    }
};

var loadMeTwo = {
    '../../**/*_two*': {
        name: '../../**/*_two*',
        dest: projectPath + '/specs/**/*_two*',
        options: {
            srcDir: projectPath + '/specs/automated/',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_two.js',
            projectPath + '/_loadme/_two.js'
        ],
        chain: [],
        contents: '',
        sourcemaps: []
    }
};

var loadMeMultiFiles = {
    '../../_concatme/_one.js': {
        name: '../../_concatme/_one.js',
        dest: projectPath + '/specs/_concatme/_one.js',
        options: {
            srcDir: projectPath + '/specs/automated/',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '../../_loadme/_two.js': {
        name: '../../_loadme/_two.js',
        dest: projectPath + '/specs/_loadme/_two.js',
        options: {
            srcDir: projectPath + '/specs/automated/',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_loadme/_two.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    }
};

var loadMeMultiGlobs = {
    '../../**/*_one*': {
        name: '../../**/*_one*',
        dest: projectPath + '/specs/**/*_one*',
        options: {
            srcDir: projectPath + '/specs/automated/',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_one.js',
            projectPath + '/_loadme/_one.js'
        ],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '../../**/*_two*': {
        name: '../../**/*_two*',
        dest: projectPath + '/specs/**/*_two*',
        options: {
            srcDir: projectPath + '/specs/automated/',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_two.js',
            projectPath + '/_loadme/_two.js'
        ],
        chain: [],
        contents: '',
        sourcemaps: []
    }
};


describe('resolve', function () {

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
        var r = bundl('_one.js', opt).getResources();
        expect(r).toBe(loadMeOne.r);
        expect(fs.readFileSync(r['_one.js'].src[0], 'utf8')).toBe(loadMeOne.contents);
    });

    describe('handles string dir', function (expect) {
        expect(bundl(path.resolve('./test/_loadme')).getSrcFiles().length).toBe(2, 'absolute');
        expect(bundl('../../_loadme/').getSrcFiles().length).toBe(2, 'relative');
    });

    describe('handles string glob', function (expect) {
        var b = bundl('../../**/*_two*');
        expect(b.getResources()).toBe(loadMeTwo);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles array of one file', function (expect) {
        expect(bundl(['_one.js'], opt).getResources()).toBe(loadMeOne.r);
    });

    describe('handles array of multiple files', function (expect) {
        expect(bundl(['../../_concatme/_one.js', '../../_loadme/_two.js']).getResources()).toBe(loadMeMultiFiles);
    });

    describe('handles different types of files', function (expect, done) {
        var list = [];
        bundl(['../../_concatme/_one.js', '../../_concatme/_three.html', '../../_concatme/_two.js'])
            .then({
                one: function (contents) {
                    list.push(contents);
                    return contents;
                }
            })
            .all(function () {
                expect(list.length).toBe(3);
                expect(list[1]).toBe('<h1>THREE</h1>\n');
                done();
            });
    });

    describe('handles array of multiple globs', function (expect) {
        expect(bundl(['../../**/*_one*', '../../**/*_two*']).getResources()).toBe(loadMeMultiGlobs)
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
