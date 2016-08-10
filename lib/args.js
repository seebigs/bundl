/**
 * Bundl node args handler
 */

var minimist = require('minimist');

// parse args
var args = minimist(process.argv.slice(2), {
    alias: { h: 'help' }
});

var npmConfigArgs = process.env.npm_config_argv;
if (npmConfigArgs) {
    JSON.parse(npmConfigArgs).original.slice(2).forEach(function (config) {
        var pair = config.split('=');
        args[pair[0].split('--')[1]] = pair[1] || true;
    });
}

module.exports = args;
