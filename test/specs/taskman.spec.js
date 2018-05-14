
var Bundl = require('../../index.js');

describe('taskman', function () {

    describe('task ignores bad inputs', function (expect) {
        Bundl.setTask(true);
        Bundl.setTask('test.task0', 123);
        expect(Bundl.listTasks()).toBe({});
    });

    describe('binds and runs tasks, ignoring bad inputs', function (expect, done) {
        var oneHappened = false;
        var twoHappened = false;
        var threeHappened = false;

        var fn1 = function (callback, data) {
            if (data.foo !== 123) {
                throw new Error('task is missing data!');
            }

            oneHappened = true;
            return true;
        };

        var fn2 = function (callback, data) {
            if (data.foo !== 456) {
                throw new Error('task is missing data!');
            }

            if (oneHappened) {
                twoHappened = true;
            }
            callback();
        };

        var fn3 = function (callback, data) {
            if (data) {
                console.log(data);
                throw new Error('task should not have data!');
            }

            if (oneHappened && twoHappened) {
                threeHappened = true;
            }
            callback();
        }

        Bundl.setTask('test.task1', fn1);
        Bundl.setTask('test.task2', fn2);
        Bundl.setTask('test.task3', fn3);

        expect(Bundl.listTasks()).toBe({
            'test.task1': fn1,
            'test.task2': fn2,
            'test.task3': fn3
        });

        Bundl
            .runTask('test.task1', { foo: 123 })
            .then('test.task2', { foo: 456 })
            .then()
            .then('test.task3')
            .then(function (bundlDone) {
                expect(oneHappened).toBe(true, 'oneHappened');
                expect(twoHappened).toBe(true, 'twoHappened');
                expect(threeHappened).toBe(true, 'threeHappened');
                bundlDone();
                done();
            });
    });

});
