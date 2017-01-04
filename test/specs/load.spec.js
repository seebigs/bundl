
var bundl = require('../../index.js');
var path = require('path');

var loadPath = path.resolve(__dirname + '/../_loadme');

function clearModuleCache () {
    delete require.cache[loadPath + '/_one.js'];
    delete require.cache[loadPath + '/_two.js'];
}

describe('load', function () {

    describe('requires all files at the provided path', function (expect) {
        global.loaded = '';

        clearModuleCache();
        bundl.load(loadPath);
        clearModuleCache();
        bundl.load(loadPath + '/*');
        clearModuleCache();
        bundl.load(loadPath + '/_one.js');

        expect(global.loaded).toBe('one-two-one-two-one-');
    });

    describe('accepts an array', function (expect) {
        global.loaded = '';

        clearModuleCache();
        bundl.load([
            loadPath + '/_one.js',
            loadPath + '/_two.js'
        ]);

        expect(global.loaded).toBe('one-two-');
    });

});
