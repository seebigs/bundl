
var Bundl = require('../../index.js');

describe('instance', function () {

    describe('cliArgs', function (expect) {
        var b = new Bundl();
        expect(b.cliArgs._).toBe([]);
    });

    describe('halt', function (expect) {
        var b = new Bundl();
        expect(typeof b.halt).toBe('function');
    });

    describe('isBundl', function (expect) {
        var b = new Bundl();
        expect(b.isBundl).toBe(true);
    });

    describe('log', function (expect) {
        var b = new Bundl();
        expect(typeof b.log).toBe('function');
        expect(typeof b.log.error).toBe('function');
    });

    describe('webserver', function (expect) {
        var b = new Bundl();
        expect(typeof b.webserver).toBe('function');
    });

    describe('getResources', function (expect) {
        var fauxResources = { foo: true };
        var b = new Bundl();
        b._.RESOURCES = fauxResources;
        expect(b.getResources()).toBe(fauxResources);
    });

    describe('getSrcFiles', function (expect) {
        var b = new Bundl();
        b.mapDependency('foo', 'one.js');
        b.mapDependency('bar', 'two.js');
        expect(b.getSrcFiles()).toBe(['one.js', 'two.js']);
    });

    describe('mapDependency and getDependencyMap', function (expect) {
        var b = new Bundl();
        expect(b.getDependencyMap()).toBe({});
        b.mapDependency('bundle_name.js', '/abs/src/file.js');
        expect(b.getDependencyMap()).toBe({
            '/abs/src/file.js': {
                'bundle_name.js': 1
            }
        });
    });

    describe('mergeResources', function (expect) {
        var fauxResources = { foo: true };
        var b = new Bundl();
        b._.RESOURCES = fauxResources;
        b.mergeResources({ bar: true })
        expect(b.getResources()).toBe({
            foo: true,
            bar: true,
        });
    });

});
