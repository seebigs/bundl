/**
 * Convert parsed code into a formatted string
 */

function generateInit(options) {
    options = options || {};
    var processors = options.processors || {};

    function generate(r) {
        if (r.contents) {
            var parsed = r.contents.getParsed();
            if (parsed) {
                var str = '';
                if (typeof processors[r.ext] === 'function') {
                    str = processors[r.ext](r);
                } else if (typeof parsed.generate === 'function') {
                    str = parsed.generate();
                }

                r.contents.set(str);
                r.contents.changeStage('stringy');
            }
        }

        return r;
    }

    return {
        name: 'generate',
        exec: generate,
    };
}

module.exports = generateInit;
