var Bundl = require('../index.js');

var targets = './_concatme';
var options = {};
var asyncDelay = 200;

/* SYNC RETURN */

var firstSyncReturn = {
    name: 'firstSyncReturn',
    exec: function (r) {
        console.log('firstSyncReturn', r.name);
        return r;
    },
};

var secondSyncReturn = {
    name: 'secondSyncReturn',
    exec: function (r) {
        console.log('secondSyncReturn', r.name);
        return r;
    },
};

var thirdSyncReturn = {
    name: 'thirdSyncReturn',
    exec: function (r) {
        console.log('thirdSyncReturn', r.name);
        return r;
    },
};

/* SYNC DONE */

var firstSyncDone = {
    name: 'firstSyncDone',
    exec: function (r, done) {
        console.log('firstSyncDone', r.name);
        done();
    },
};

var secondSyncDone = {
    name: 'secondSyncDone',
    exec: function (r, done) {
        console.log('secondSyncDone', r.name);
        done(r);
    },
};

var thirdSyncDone = {
    name: 'thirdSyncDone',
    exec: function (r, done) {
        console.log('thirdSyncDone', r.name);
        done();
    },
};

/* ASYNC DONE */

var firstAsync = {
    name: 'firstAsync',
    exec: function (r, done) {
        setTimeout(function () {
            console.log('firstAsync', r.name);
            done();
        }, asyncDelay);
    },
};

var secondAsync = {
    name: 'secondAsync',
    exec: function (r, done) {
        setTimeout(function () {
            console.log('secondAsync', r.name);
            done(r);
        }, asyncDelay);
    },
};

var thirdAsync = {
    name: 'thirdAsync',
    exec: function (r, done) {
        setTimeout(function () {
            console.log('thirdAsync', r.name);
            done();
        }, asyncDelay);
    },
};


Bundl.setTask('flow', function (done) {
    console.log();
    new Bundl(targets, options)
        .then(firstSyncReturn)
        .then(secondSyncReturn)
        .then(thirdSyncReturn)
        .go(function () {
            console.log();
            new Bundl(targets, options)
                .then(firstSyncDone)
                .then(secondSyncDone)
                .then(thirdSyncDone)
                .go(function () {
                    console.log();
                    new Bundl(targets, options)
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

Bundl.runTask('flow');
