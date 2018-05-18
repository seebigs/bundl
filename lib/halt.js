var Log = require('./log.js');

var log = new Log();

function halt(err) {
    if (typeof err === 'string') {
        log.error(new Error(err));
    } else {
        log.error(err);
    }
    process.exit(1);
}

module.exports = halt;
