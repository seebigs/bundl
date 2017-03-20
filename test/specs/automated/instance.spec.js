
var bundl = require('../../../index.js');

describe('instance', function () {

    describe('getResources', function (expect) {
        var fauxResources = { foo: true };
        var b = bundl();
        b.RESOURCES = fauxResources;
        expect(b.getResources()).toBe(fauxResources);
    });

    describe('getSrcFiles', function (expect) {
        var b = bundl();
        b.CHANGEMAP = {
            'one.js': 1,
            'two.js': 1
        };
        expect(b.getSrcFiles()).toBe(['one.js', 'two.js']);
    });

    describe('mapDependency and getDependencyMap', function (expect) {
        var b = bundl();
        expect(b.getDependencyMap()).toBe({});
        b.mapDependency('bundle_name.js', '/abs/src/file.js');
        expect(b.getDependencyMap()).toBe({
            '/abs/src/file.js': {
                'bundle_name.js': 1
            }
        });
    });

});
