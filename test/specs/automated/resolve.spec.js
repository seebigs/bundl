var bundl = require('../../../index.js');
var fs = require('fs');
var path = require('path');

var projectPath = path.resolve('./test');

var opt = {
    srcDir: '../../_loadme'
};

var oneLoadMe = {
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

var twoTwos = {};
twoTwos[projectPath + '/_concatme/_two.js'] = {
    name: projectPath + '/_concatme/_two.js',
    dest: projectPath + '/specs/automated/bundled' + projectPath + '/_concatme/_two.js',
    options: {
        srcDir: projectPath + '/specs/automated/',
        outputDir: projectPath + '/specs/automated/bundled'
    },
    src: [projectPath + '/_concatme/_two.js'],
    chain: [],
    contents: '',
    sourcemaps: []
};
twoTwos[projectPath + '/_loadme/_two.js'] = {
    name: projectPath + '/_loadme/_two.js',
    dest: projectPath + '/specs/automated/bundled' + projectPath + '/_loadme/_two.js',
    options: {
        srcDir: projectPath + '/specs/automated/',
        outputDir: projectPath + '/specs/automated/bundled'
    },
    src: [projectPath + '/_loadme/_two.js'],
    chain: [],
    contents: '',
    sourcemaps: []
};

var concatMeOneTwo = {
    '_concatme/_one.js': {
        name: '_concatme/_one.js',
        dest: projectPath + '/specs/automated/bundled/_concatme/_one.js',
        options: {
            srcDir: projectPath,
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '_concatme/_two.js': {
        name: '_concatme/_two.js',
        dest: projectPath + '/specs/automated/bundled/_concatme/_two.js',
        options: {
            srcDir: projectPath,
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_two.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    }
};

var loadMeOneTwo = {};
loadMeOneTwo[projectPath + '/_loadme/_one.js'] = {
    name: projectPath + '/_loadme/_one.js',
    dest: projectPath + '/specs/automated/bundled' + projectPath + '/_loadme/_one.js',
    options: {
        srcDir: projectPath + '/specs/automated/',
        outputDir: projectPath + '/specs/automated/bundled'
    },
    src: [projectPath + '/_loadme/_one.js'],
    chain: [],
    contents: '',
    sourcemaps: []
};
loadMeOneTwo[projectPath + '/_loadme/_two.js'] = {
    name: projectPath + '/_loadme/_two.js',
    dest: projectPath + '/specs/automated/bundled' + projectPath + '/_loadme/_two.js',
    options: {
        srcDir: projectPath + '/specs/automated/',
        outputDir: projectPath + '/specs/automated/bundled'
    },
    src: [projectPath + '/_loadme/_two.js'],
    chain: [],
    contents: '',
    sourcemaps: []
};

var oneTwoAcross = {
    '_concatme/_one.js': {
        name: '_concatme/_one.js',
        dest: projectPath + '/specs/automated/bundled/_concatme/_one.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '_loadme/_two.js': {
        name: '_loadme/_two.js',
        dest: projectPath + '/specs/automated/bundled/_loadme/_two.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_loadme/_two.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    }
};

var oneByOneTwoByTwo = {
    '_concatme/_one.js': {
        name: '_concatme/_one.js',
        dest: projectPath + '/specs/automated/bundled/_concatme/_one.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '_loadme/_one.js': {
        name: '_loadme/_one.js',
        dest: projectPath + '/specs/automated/bundled/_loadme/_one.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_loadme/_one.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '_concatme/_two.js': {
        name: '_concatme/_two.js',
        dest: projectPath + '/specs/automated/bundled/_concatme/_two.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_concatme/_two.js'],
        chain: [],
        contents: '',
        sourcemaps: []
    },
    '_loadme/_two.js': {
        name: '_loadme/_two.js',
        dest: projectPath + '/specs/automated/bundled/_loadme/_two.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/automated/bundled'
        },
        src: [projectPath + '/_loadme/_two.js'],
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

    describe('handles string relative file', function (expect) {
        var r = bundl('_one.js', opt).getResources();
        expect(r).toBe(oneLoadMe.r);
        expect(fs.readFileSync(r['_one.js'].src[0], 'utf8')).toBe(oneLoadMe.contents);
    });

    describe('handles string absolute file', function (expect) {
        expect(bundl(path.resolve('./test/_loadme/_one.js'), opt).getResources()).toBe(oneLoadMe.r);
    });

    describe('handles string dir', function (expect) {
        expect(bundl(path.resolve('./test/_loadme')).getResources()).toBe(loadMeOneTwo);
        expect(bundl('../../_loadme/').getResources()).toBe(loadMeOneTwo);
    });

    describe('handles string glob', function (expect) {
        var b = bundl('../../**/*_two*');
        expect(b.getResources()).toBe(twoTwos);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles array of one file', function (expect) {
        expect(bundl(['_one.js'], opt).getResources()).toBe(oneLoadMe.r);
    });

    describe('handles array of multiple files', function (expect) {
        expect(bundl(['./_concatme/_one.js', './_loadme/_two.js'], { srcDir: '../../' }).getResources()).toBe(oneTwoAcross);
    });

    describe('handles array of multiple globs', function (expect) {
        expect(bundl(['**/*_one*', '**/*_two*'], { srcDir: '../../' }).getResources()).toBe(oneByOneTwoByTwo);
    });

    describe('handles array with ignores', function (expect) {
        expect(bundl(['./_concatme/**', '!./**/*.html'], { srcDir: '../../' }).getResources()).toBe(concatMeOneTwo);
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

});
