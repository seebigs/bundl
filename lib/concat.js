/**
 * Concat a collection of files into one string
 */

var fs = require('fs');

function readFile (filepath, bundl) {
    try {
        return fs.readFileSync(filepath, 'utf-8');

    } catch (err) {
        if (err.code === 'ENOENT') {
            bundl.log.error('Target file not found at ' + filepath, err.stack);
        } else {
            bundl.log.error(err);
        }

        return '';
    }
}

module.exports = function (srcArray, options, bundl) {
    var contents = [];

    srcArray.forEach(function (src) {
        if (typeof src === 'string') {
            contents.push(readFile(src, bundl));
        } else if (src.contents) {
            contents.push(src.contents);
        }
    });

    return contents.join(options.glue);
};
