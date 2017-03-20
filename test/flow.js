var bundl = require('../index.js');

var targets = './_concatme';
var options = {};
var asyncDelay = 200;

/* SYNC RETURN */

var firstSyncReturn = {
    one: function (contents, r) {
        console.log('firstSyncReturn', r.name);
        return contents;
    },
    all: function (resources, srcFiles, done) {
        console.log('ALL-firstSyncReturn');
        done();
    }
};

var secondSyncReturn = {
    one: function (contents, r) {
        console.log('secondSyncReturn', r.name);
        return contents;
    },
    all: function (resources, srcFiles, done) {
        console.log('ALL-secondSyncReturn');
        done();
    }
};

var thirdSyncReturn = {
    one: function (contents, r) {
        console.log('thirdSyncReturn', r.name);
        return contents;
    },
    all: function (resources, srcFiles, done) {
        console.log('ALL-thirdSyncReturn');
        done();
    }
};

/* SYNC DONE */

var firstSyncDone = {
    one: function (contents, r, done) {
        console.log('firstSyncDone', r.name);
        done();
    },
    all: function (resources, srcFiles, done) {
        console.log('ALL-firstSyncDone');
        done();
    }
};

var secondSyncDone = {
    one: function (contents, r, done) {
        console.log('secondSyncDone', r.name);
        done(contents);
    },
    all: function (resources, srcFiles, done) {
        console.log('ALL-secondSyncDone');
        done();
    }
};

var thirdSyncDone = {
    one: function (contents, r, done) {
        console.log('thirdSyncDone', r.name);
        done();
    },
    all: function (resources, srcFiles, done) {
        console.log('ALL-thirdSyncDone');
        done();
    }
};

/* ASYNC DONE */

var firstAsync = {
    one: function (contents, r, done) {
        setTimeout(function () {
            console.log('firstAsync', r.name);
            done();
        }, asyncDelay);
    },
    all: function (resources, srcFiles, done) {
        setTimeout(function () {
            console.log('ALL-firstAsync');
            done();
        }, asyncDelay);
    }
};

var secondAsync = {
    one: function (contents, r, done) {
        setTimeout(function () {
            console.log('secondAsync', r.name);
            done(contents);
        }, asyncDelay);
    },
    all: function (resources, srcFiles, done) {
        setTimeout(function () {
            console.log('ALL-secondAsync');
            done();
        }, asyncDelay);
    }
};

var thirdAsync = {
    one: function (contents, r, done) {
        setTimeout(function () {
            console.log('thirdAsync', r.name);
            done();
        }, asyncDelay);
    },
    all: function (resources, srcFiles, done) {
        setTimeout(function () {
            console.log('ALL-thirdAsync');
            done();
        }, asyncDelay);
    }
};


bundl.task('flow', function (done) {
    console.log();
    bundl(targets, options)
        .then(firstSyncReturn)
        .then(secondSyncReturn)
        .then(thirdSyncReturn)
        .go(function () {
            console.log('\n');
            bundl(targets, options)
                .then(firstSyncDone)
                .then(secondSyncDone)
                .then(thirdSyncDone)
                .go(function () {
                    console.log('\n');
                    bundl(targets, options)
                        .then(firstAsync)
                        .then(secondAsync)
                        .then(thirdAsync)
                        .go(function () {
                            console.log();
                            done();
                        });
                });
        });
});

bundl.run('flow');
