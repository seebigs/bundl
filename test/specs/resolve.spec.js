var Bundl = require('../../index.js');
var fs = require('fs');
var path = require('path');

var projectPath = path.resolve('./test');

var opt = {
    srcDir: '../_loadme'
};

var oneLoadMe = {
    '_one.js': {
        name: '_one.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_one.js',
        options: {
            srcDir: projectPath + '/_loadme',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_loadme/_one.js'],
        sourcemaps: [],
        chain: [],
    },
};

var oneLoadNoOpts = {
    '_loadme/_one.js': {
        name: '_loadme/_one.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_loadme/_one.js',
        options: {
            srcDir: projectPath + '/specs',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_loadme/_one.js'],
        sourcemaps: [],
        chain: [],
    },
};

var twoTwos = {};
twoTwos['_concatme/_two.js'] = {
    name: '_concatme/_two.js',
    ext: 'js',
    dest: projectPath + '/specs/bundled/_concatme/_two.js',
    options: {
        srcDir: projectPath + '/specs',
        outputDir: projectPath + '/specs/bundled'
    },
    src: [projectPath + '/_concatme/_two.js'],
    sourcemaps: [],
    chain: [],
};
twoTwos['_loadme/_two.js'] = {
    name: '_loadme/_two.js',
    ext: 'js',
    dest: projectPath + '/specs/bundled/_loadme/_two.js',
    options: {
        srcDir: projectPath + '/specs',
        outputDir: projectPath + '/specs/bundled'
    },
    src: [projectPath + '/_loadme/_two.js'],
    sourcemaps: [],
    chain: [],
};

var concatMeOneTwo = {
    '_concatme/_one.js': {
        name: '_concatme/_one.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_concatme/_one.js',
        options: {
            srcDir: projectPath,
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        sourcemaps: [],
        chain: [],
    },
    '_concatme/_two.js': {
        name: '_concatme/_two.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_concatme/_two.js',
        options: {
            srcDir: projectPath,
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_concatme/_two.js'],
        sourcemaps: [],
        chain: [],
    }
};

var loadMeOneTwo = {};
loadMeOneTwo['_loadme/_one.js'] = {
    name: '_loadme/_one.js',
    ext: 'js',
    dest: projectPath + '/specs/bundled/_loadme/_one.js',
    options: {
        srcDir: projectPath + '/specs',
        outputDir: projectPath + '/specs/bundled'
    },
    src: [projectPath + '/_loadme/_one.js'],
    sourcemaps: [],
    chain: [],
};
loadMeOneTwo['_loadme/_two.js'] = {
    name: '_loadme/_two.js',
    ext: 'js',
    dest: projectPath + '/specs/bundled/_loadme/_two.js',
    options: {
        srcDir: projectPath + '/specs',
        outputDir: projectPath + '/specs/bundled'
    },
    src: [projectPath + '/_loadme/_two.js'],
    sourcemaps: [],
    chain: [],
};

var oneTwoAcross = {
    '_concatme/_one.js': {
        name: '_concatme/_one.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_concatme/_one.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        sourcemaps: [],
        chain: [],
    },
    '_loadme/_two.js': {
        name: '_loadme/_two.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_loadme/_two.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_loadme/_two.js'],
        sourcemaps: [],
        chain: [],
    }
};

var oneByOneTwoByTwo = {
    '_concatme/_one.js': {
        name: '_concatme/_one.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_concatme/_one.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_concatme/_one.js'],
        sourcemaps: [],
        chain: [],
    },
    '_loadme/_one.js': {
        name: '_loadme/_one.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_loadme/_one.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_loadme/_one.js'],
        sourcemaps: [],
        chain: [],
    },
    '_concatme/_two.js': {
        name: '_concatme/_two.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_concatme/_two.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_concatme/_two.js'],
        sourcemaps: [],
        chain: [],
    },
    '_loadme/_two.js': {
        name: '_loadme/_two.js',
        ext: 'js',
        dest: projectPath + '/specs/bundled/_loadme/_two.js',
        options: {
            srcDir: projectPath + '',
            outputDir: projectPath + '/specs/bundled'
        },
        src: [projectPath + '/_loadme/_two.js'],
        sourcemaps: [],
        chain: [],
    }
};

function cleanForComparison(resources) {
    for (var name in resources) {
        if (resources.hasOwnProperty(name)) {
            delete resources[name].contents;
        }
    }
    return resources;
}


describe('resolve', function () {

    describe('handles undefined', function (expect) {
        expect(new Bundl().getResources()).toBe({});
    });

    describe('handles empty array', function (expect) {
        expect(new Bundl([]).getResources()).toBe({});
    });

    describe('handles empty object', function (expect) {
        expect(new Bundl({}).getResources()).toBe({});
    });

    describe('handles string relative file', function (expect) {
        var resources = new Bundl('_one.js', opt).getResources();
        cleanForComparison(resources);
        expect(resources).toBe(oneLoadMe);
    });

    describe('handles string absolute file', function (expect) {
        var resources = new Bundl(path.resolve('./test/_loadme/_one.js'), opt).getResources();
        cleanForComparison(resources);
        expect(resources).toBe(oneLoadMe);
    });

    describe('handles string file with no options', function (expect) {
        var resources = new Bundl('../_loadme/_one.js').getResources();
        cleanForComparison(resources);
        expect(resources).toBe(oneLoadNoOpts);
    });

    describe('handles string dir', function (expect) {
        expect(cleanForComparison(new Bundl(path.resolve('./test/_loadme')).getResources())).toBe(loadMeOneTwo);
        expect(cleanForComparison(new Bundl('../_loadme/').getResources())).toBe(loadMeOneTwo);
    });

    describe('handles string glob', function (expect) {
        var b = new Bundl('../**/*_two*');
        expect(cleanForComparison(b.getResources())).toBe(twoTwos);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles array of one file', function (expect) {
        var resources = new Bundl(['_one.js'], opt).getResources();
        cleanForComparison(resources);
        expect(resources).toBe(oneLoadMe);
    });

    describe('handles array of multiple files', function (expect) {
        var resources = new Bundl(['./_concatme/_one.js', './_loadme/_two.js'], { srcDir: '../' }).getResources();
        cleanForComparison(resources);
        expect(resources).toBe(oneTwoAcross);
    });

    describe('handles array of multiple globs', function (expect) {
        var resources = new Bundl(['**/*_one*', '**/*_two*'], { srcDir: '../' }).getResources();
        cleanForComparison(resources);
        expect(resources).toBe(oneByOneTwoByTwo);
    });

    describe('handles array with ignores', function (expect) {
        var resources = new Bundl(['./_concatme/**', '!./**/*.html'], { srcDir: '../' }).getResources();
        cleanForComparison(resources);
        expect(resources).toBe(concatMeOneTwo);
    });

    describe('handles object with files', function (expect) {
        var b = new Bundl({
            'foo': '../_loadme/_one.js',
            'bar': '../_loadme/_two.js'
        });
        expect(Object.keys(b.getResources())).toBe(['foo', 'bar']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles object with globs', function (expect) {
        var b = new Bundl({
            'foo': '../**/*_one*',
            'bar': '../**/*_two*'
        });
        expect(b.getSrcFiles().length).toBe(4);
    });

    describe('handles object with arrays', function (expect) {
        var b = new Bundl({
            'foo': ['../_loadme/_one.js','../_loadme/_two.js']
        });
        expect(Object.keys(b.getResources())).toBe(['foo']);
        expect(b.getSrcFiles().length).toBe(2);
    });

    describe('handles object with object.contents', function (expect) {
        var b = new Bundl({
            'foo': { contents: 'blah' }
        });
        expect(b.getResources().foo.src[0].contents).toBe('blah');
    });

    describe('handles different types of files', function (expect, done) {
        var list = [];
        new Bundl(['../_concatme/_one.js', '../_concatme/_three.html', '../_concatme/_two.js'])
            .then({
                name: 'tester',
                stage: 'stringy',
                exec: function (r) {
                    list.push(r.contents.getString());
                    return r;
                },
            })
            .go(function () {
                expect(list.length).toBe(3);
                expect(list[1]).toBe('<h1>THREE</h1>\n');
                done();
            });
    });

});
