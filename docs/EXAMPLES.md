- [Live Developing](#live-developing)
   - [Start a Bundl Webserver](#start-a-bundl-webserver)
- [Bundles for Browsers](#bundles-for-browsers)
   - [Entry files](#entry-files)
   - [Production-ready (shippable) code](#production-ready-shippable-code)
   - [Concat src files into one large library](#concat-src-files-into-one-large-library)
- [Server-Side Operations](#server-side-operations)
   - [Copy files over to another directory](#copy-files-over-to-another-directory)
   - [Lint your code](#lint-your-code)

---
# Live Developing

## Start a Bundl Webserver

Preview your new code in two simple steps. (1) Save a change to any source file in your editor. (2) Refresh your page in your browser. Each bundle automatically rebuilds (only if it has changed).

Create *server.js*
```js
var Bundl = require('bundl');

new Bundl('./src', { outputDir: './dist' }).webserver({
    rootPath: './dist',
    watch: './src',
    port: '5555',
});
```
Run the following then visit http://localhost:5555/
```
$ node server.js
```
Learn more about how to [configure your webserver](BUILD_ON_DEMAND.md).

---
# Bundles for Browsers

## Entry files

The most powerful plugin for Bundl is [bundl-pack](https://github.com/seebigs/bundl-pack). Use it on entry files and simply require/import your module dependencies within `entry.js`.

```js
var Bundl = require('bundl');
var pack = require('bundl-pack');
var write = require('bundl-write');

new Bundl('entry.js')
    .then(pack())
    .then(write())
    .go();
```

## Production-ready (shippable) code

Use the [bundl-minify](https://github.com/seebigs/bundl-minify) plugin to shrink your code and the `obscure` flag to reduce the size and readability of your module paths.

```js
var Bundl = require('bundl');
var minify = require('bundl-minify');
var pack = require('bundl-pack');
var write = require('bundl-write');

var packOptions = {
    obscure: true,
};

new Bundl('entry.js')
    .then(pack(packOptions))
    .then(minify())
    .then(write())
    .go();
```

## Concat src files into one large library

Pass src files as an array to concat all matched files into the same scope within your bundle.

```js
var Bundl = require('bundl');
var write = require('bundl-write');

new Bundl({ 'entry.js': ['src/one.js', 'src/two.js', 'src/three.js'] })
    .then(write())
    .go();
```

---
# Server-Side Operations

## Copy files over to another directory

You can do this without Bundl, but if you want the convenience, use [bundl-copy](https://github.com/seebigs/bundl-copy)

```js
var Bundl = require('bundl');
var copy = require('bundl-copy');

var copyOptions = {
    dest: 'dist/public',
    flatten: true,
};

new Bundl(targets)
    .then(copy(copyOptions))
    .go();
```

## Lint your code

Let ESLint help you keep your code tidy. Use the [bundl-eslint](https://github.com/seebigs/bundl-eslint) plugin.

```js
var Bundl = require('bundl');
var eslint = require('bundl-eslint');

Bundl.setTask('lint', function () {
    var options = {
        rules: {
            "no-unused-vars": 0,
        }
    };

    return new Bundl('src/javascripts/*')
        .then(eslint(options))
        .go();
});

Bundl.runTask('lint');
```
