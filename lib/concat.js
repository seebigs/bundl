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

module.exports = function (r, bundl) {
    options = r.options && r.options.concat || {};
    var glue = typeof options.glue === 'string' ? options.glue : '\n';
    var newLineRegex = /\r\n|\r|\n/;
    var glueLines = glue.split(newLineRegex).length - 1;
    var toSourcemap = [];
    var toConcat = [];

    r.src.forEach(function (src) {
        var contents = '';
        var smap = {
            source: '__injected.js',
            original: { line: 1, column: 0 },
            generated: { line: bundl.LINES, column: 0 }
        };

        if (typeof src === 'string') {
            contents = readFile(src, bundl);
            smap.source = src;
        } else if (src.contents) {
            contents = src.contents;
        }

        var totalLines = contents.split(newLineRegex).length;
        smap.totalLines = totalLines;
        bundl.LINES += totalLines - 1 + glueLines;

        toConcat.push(contents);
        toSourcemap.push(smap);
    });

    bundl.LINES -= glueLines;

    return {
        contents: toConcat.join(glue),
        sourcemaps: toSourcemap
    };
};
