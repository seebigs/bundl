
var Log = require('../../lib/log.js');

describe('log', function () {

    describe('log.error exists', function (expect) {
        var log = new Log();
        expect(typeof log.error).toBe('function');
    });

    describe('log.warn exists', function (expect) {
        var log = new Log();
        expect(typeof log.warn).toBe('function');
    });

    describe('log.section exists', function (expect) {
        var log = new Log();
        expect(typeof log.section).toBe('function');
    });

});
