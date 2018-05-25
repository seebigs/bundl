# Popular Plugins

## Modules & Dependencies
Name|Description
:---|:---
[bundl-pack](https://github.com/seebigs/bundl-pack)|Use `require()` in your source code, then package your modules for use in-browser.
[bundl-pack-babel](https://github.com/seebigs/bundl-pack-babel)|Transpile ES6 code into browser-compatible bundles. Use `import` in your source code.
[bundl-pack-less](https://github.com/seebigs/bundl-pack-less)|Require/import LESS files directly.

## Output
Name|Description
:---|:---
[bundl-copy](https://github.com/seebigs/bundl-copy)|Copy matched src files into another directory.
[bundl-rename](https://github.com/seebigs/bundl-rename)|Rename destination paths on resources.
[bundl-write](https://github.com/seebigs/bundl-write)|Write bundles to disk.

## Transforms
Name|Description
:---|:---
[bundl-minify](https://github.com/seebigs/bundl-minify)|Uglify and compress your bundles before distribution.
[bundl-optimizejs](https://github.com/seebigs/bundl-optimizejs)|Optimize your code for faster initial load by wrapping eagerly-invoked functions.
[bundl-replace](https://github.com/seebigs/bundl-replace)|Replace strings within your bundles.
[bundl-wrap](https://github.com/seebigs/bundl-wrap)|Wrap bundles with additional code.

## Code Style
Name|Description
:---|:---
[bundl-eslint](https://github.com/seebigs/bundl-eslint)|Lint your code to validate code style and prevent potential errors.

---

# What is a Plugin?

Plugins can be used as part of a Bundl pipeline to modify the contents of a resource, perform operations on source files, and so much more.

Plugins are added to the Bundl pipeline using `.then( )`.

Plugins will be executed in the order that they have been added when the pipeline is triggered by `.go( )`.

```js
var Bundl = require('bundl');

var b = new Bundl(['one.js', 'two.js'])
    .then(firstPlugin)
    .then(secondPlugin)
    .then(thirdPlugin);

b.go();
// one.js -> firstPlugin
// two.js -> firstPlugin
// one.js -> secondPlugin
// two.js -> secondPlugin
// one.js -> thirdPlugin
// two.js -> thirdPlugin
```

---

# Writing Your Own Plugin

A plugin is an Object with the following format:
```js
{
    // your plugin's name
    // usually published to npm as bundl-rainbowize or bundl-plugin-rainbowize
    name: 'rainbowize',

    // a list of file extensions that this plugin will operate on
    // if not set, plugin will operate on ALL file types
    ext: ['js', 'json'],

    // invoked once for each targeted resource
    // see the `#exec` section below for more details
    exec: function (r, done) { ... }
}
```

## exec

A method to be invoked once per resource.

Arguments:
- `r` A reference to the current [resource object](RESOURCES.md)
- `done` Optionally used to signal the end of async operations within the plugin

Returns
- This method must either return `r` or call `done()` to allow the Bundl pipeline to continue.

Often, a plugin will want to modify the contents of the resource. This is done by using the built-in content methods on the resource itself.
```js
{
    exec: function (r, done) {
        var newContents = r.contents.getString().replace('SAD_DAY', r.name + 'rainbows!');
        r.contents.set(newContents);
        done(r);
    }
}
```

## Setting Plugin Options

A common pattern used by plugins is to offer a constructor function. This allows the end user to pass closured options into the plugin and have them available when the plugin is finally invoked.

```js
function myPlugin (options) {
    var defaults = {
        setting: true,
    };

    options = Object.assign(defaults, options);

    function exec (r) {
        var contentsWithYesNo = r.contents.getString();
        contentsWithYesNo += options.setting ? 'yes' : 'no';
        r.contents.set(contentsWithYesNo);
        return r;
    }

    return {
        name: 'myPlugin',
        exec: exec,
    };
}

new Bundl(targets)
    .then(myPlugin({ setting: false }));
```
