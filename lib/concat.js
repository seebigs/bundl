/**
 * Concat a collection of files into one string
 */

var fs = require('fs');

function readFile (filepath, bundl) {
    try {
        return fs.readFileSync(filepath, 'utf-8');

    } catch (err) {
        if (err.code === 'ENOENT') {
            bundl.halt('Target file not found at ' + filepath, err.stack);
        } else {
            bundl.halt(err);
        }

        return '';
    }
}

module.exports = function (r, bundl) {
    var options = r.options && r.options.concat || {};
    var glue = typeof options.glue === 'string' ? options.glue : '\n';
    var newLineRegex = /\r\n|\r|\n/;
    var glueLines = glue.split(newLineRegex).length - 1;
    var toSourcemap = [];
    var toConcat = [];

    r.src.forEach(function (src) {
        var contentsStr = '';
        var smap = {
            source: '__injected.js',
            original: { line: 1, column: 0 },
            generated: { line: bundl._.LINES, column: 0 }
        };

        if (typeof src === 'string') {
            contentsStr = readFile(src, bundl);
            smap.source = src;
        } else if (src.contents) {
            contentsStr = src.contents;
        }

        var totalLines = contentsStr.split(newLineRegex).length;
        smap.totalLines = totalLines;
        bundl._.LINES += totalLines - 1 + glueLines;

        toConcat.push(contentsStr);
        toSourcemap.push(smap);
    });

    bundl._.LINES -= glueLines;

    return {
        contentsString: toConcat.join(glue),
        sourcemaps: toSourcemap
    };
};
