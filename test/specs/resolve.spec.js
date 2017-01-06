
var resolveTargets = require('../../lib/resolve.js');
var path = require('path');

describe('resolveTargets', function (expect) {
    var bundl = { mapChanges: function(){} };
    var options = { targetDir: __dirname + '/../_concatme/' };

    var byString = resolveTargets(bundl, './_one.js', options);
    expect(byString['./_one.js'].src.length).toBe(1);

    var byArray = resolveTargets(bundl, ['./_one.js','./_two.js'], options);
    expect(byArray['./_one.js'].src.length).toBe(1);
    expect(byArray['./_two.js'].src.length).toBe(1);

    var byArray = resolveTargets(bundl, { a: './_one.js', b: ['./_one.js','./_two.js'] }, options);
    expect(byArray.a.src.length).toBe(1);
    expect(byArray.b.src.length).toBe(2);
});
