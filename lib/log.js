/**
 * Bundl log reporter
 */

var chalk = require('chalk');

function logConstructor (label) {

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

        console.log.apply(console, out);
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
        process.exit(1);
    };

    log.warning = function (msg) {
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

    log.new = function (useLabel) {
        return new logConstructor(useLabel);
    };

    return log;
}

module.exports = new logConstructor();
