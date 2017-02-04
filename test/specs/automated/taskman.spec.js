
var utils = require('seebigs-utils');
var taskman = require('../../../lib/taskman.js');

describe('taskman', function () {

    describe('ignores bad inputs', function (expect) {
        taskman.task(true);
        var tasks = taskman.task('test.task0', 123);
        expect(tasks).toBe({});
    });

    describe('binds and runs tasks, ignoring bad inputs', function (expect, done) {
        var oneHappened = false;
        var twoHappened = false;

        var fn1 = function () {
            oneHappened = true;
            return true;
        };

        var fn2 = function (innerDone) {
            if (oneHappened) {
                twoHappened = true;
            }
            innerDone();
        };

        taskman.task('test.task1', fn1);
        var tasks = taskman.task('test.task2', fn2);

        expect(tasks).toBe({
            'test.task1': fn1,
            'test.task2': fn2
        });

        taskman.run('test.task1').then('test.task2');

        setTimeout(function () {
            expect(oneHappened).toBe(true, 'oneHappened');
            expect(twoHappened).toBe(true, 'twoHappened');
            done();
        }, 10);
    });

});
