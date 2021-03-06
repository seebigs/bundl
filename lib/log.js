/**
 * Bundl log reporter
 */

var asTable = require('as-table');
var chalk = require('chalk');

function Log (label) {

    function print () {
        var out = [];

        for (var i = 0, len = arguments.length; i < len; i++) {
            if (typeof arguments[i] !== 'undefined') {
                out.push(arguments[i]);
            } else {
                out.push('');
            }
        }

        if (label) {
            out.unshift(chalk.magenta(label));
        }

        console.log.apply(console, out); // eslint-disable-line no-console
    }

    function table(toTable) {
        print();
        print(asTable(toTable));
        print();
    }

    function log () {
        print.apply(null, arguments);
    }

    log.error = function (err, details) {
        print();
        print(chalk.red('BUNDL ERROR'));

        if (err.stack) {
            print(chalk.red(err.stack));
        } else {
            print(chalk.red(err));
        }

        if (details) {
            print();
            print(chalk.red(details));
        }
    };

    log.warn = function (msg) {
        print(chalk.yellow(msg));
    };

    log.section = function (msg) {
        print();
        print(chalk.blue(msg + '\n'));
    };

    var colors = [
        'red',
        'green',
        'blue',
        'yellow',
        'cyan',
        'magenta',
        'gray'
    ];

    colors.forEach(function (color) {
        log[color] = function (msg) {
            print(chalk[color](msg));
        };
    });

    log.label = label;

    log.table = table;

    return log;
}

module.exports = Log;
