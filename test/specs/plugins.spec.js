var exampleBuild = require('../example/build.js');
var fs = require('fs');

describe('plugins.spec', function (expect, done) {
    exampleBuild.go(function () {
            var outfile = fs.readFileSync('test/_out/sample.packed.min.js', 'utf8').split('//# sourceMappingURL=');
            var expected = fs.readFileSync('test/plugins_expected.js', 'utf8');
            expect(outfile[0]+'\n').toBe(expected, '(wrong bundle contents)');

            require('../_out/sample.packed.min.js');
            expect(global.exampleBuildSuccess).toBe(5, '(bundle failed when executed or did not contain the right number of modules)');

            var duplicated = fs.readFileSync('test/_out/dupes/_init.js', 'utf8');
            expect(duplicated).toBe(fs.readFileSync('test/_packme/_init.js', 'utf8'), '(duplicate plugin failed)');

            done();
        });
});

// describe('sourcemaps align correctly', function (expect, done) {
//     var sourcemapCoords = [];
//     var b = bundl({ 'srcmap.js': '../../_packme/_required.js' }, { outputDir: '../../_out', clean: true })
//         .then(pack({ paths: ['./test/_packme'] }))
//         .then({
//             one: function (r) {
//                 r.sourcemaps.forEach(function (smap) {
//                     sourcemapCoords.push(smap.generated.line);
//                 });
//                 return r;
//             }
//         })
//         .then(write())
//         .go(function () {
//             var outfile = fs.readFileSync('test/_out/srcmap.js', 'utf8').split('\n');
//             sourcemapCoords.forEach(function (modLine) {
//                 expect(outfile[modLine - 1]).toBe('// @module');
//             });
//             done();
//         });
// });
