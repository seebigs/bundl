
var bundl = require('../../../index.js');

describe('instance', function () {

    describe('shouldRebuild', function () {

        describe('when options are set to "changed"', function (expect) {
            var serverOptions = { rebuild: 'changed' };
            var b = bundl();
            b.RESOURCES.foo = { changed: true };
            b.RESOURCES.bar = { changed: false };
            expect(b.shouldRebuild('foo', serverOptions)).toBe(true);
            expect(b.shouldRebuild('bar', serverOptions)).toBe(false);
        });

        describe('when options are set to "always"', function (expect) {
            var serverOptions = { rebuild: 'always' };
            var b = bundl();
            b.RESOURCES.foo = { changed: true };
            b.RESOURCES.bar = { changed: false };
            expect(b.shouldRebuild('foo', serverOptions)).toBe(true);
            expect(b.shouldRebuild('bar', serverOptions)).toBe(true);
        });

        describe('when options are set to "never"', function (expect) {
            var serverOptions = { rebuild: 'never' };
            var b = bundl();
            b.RESOURCES.foo = { changed: true };
            b.RESOURCES.bar = { changed: false };
            expect(b.shouldRebuild('foo', serverOptions)).toBe(false);
            expect(b.shouldRebuild('bar', serverOptions)).toBe(false);
        });

    });

    describe('mapChanges', function (expect) {
        var b = bundl();
        expect(b.getChangeMap()).toBe({});
        b.mapChanges('/abs/src/file.js', 'bundle_name.js');
        expect(b.getChangeMap()).toBe({
            '/abs/src/file.js': {
                'bundle_name.js': 1
            }
        });
    });

});
