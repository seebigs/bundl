# API Instance Methods
```js
const Bundl = require('bundl');
const b = new Bundl();
```

---
# Adding Resources
---

## add
Pass targets directly when creating a new bundl pipeline.
```js
new Bundl(targets);
```

-or-

Add more targets to an existing collection.
```js
b.add(moreTargets);
```

Learn more about how to match specific targets on our [Targets](TARGETS.md) page.

---
# Creating Pipelines
---

## then
Add an operation into your bundl chain. Takes a Plugin Object. Use our [Popular Plugins](https://github.com/seebigs/bundl/wiki/Popular-Plugins) or if you feel ambitious you can always [write your own](https://github.com/seebigs/bundl/wiki/Writing-Your-Own-Plugin)! For convenience, `then` is chainable.
```js
b.then(somePlugin()).then(nextPlugin());
```

## thenif
Add a conditional operation into your bundl chain. Works just like [then](#then) but with a condition check.
```js
b.thenif(isDev, someDevPlugin()).thenif(isTrue, truthyPlugin(), falseyPlugin());
```

## src
Add a operation into your bundl chain that runs across all matched src files.
```js
b.src(doSomethingWithSrcFiles());
```

## debug
List info about the matched targets for debugging.
```js
b.debug();
```

## rename
Rename bundles. A convenience wrapper for [bundl-rename](https://github.com/seebigs/bundl-rename)
```js
b.rename('.new.ext');
```

## write
Write bundles to disk. A convenience wrapper for [bundl-write](https://github.com/seebigs/bundl-write)
```js
b.write('../dist');
```

---
# Running a Pipeline
---

## go
By default, `go` runs the full pipeline for ALL of the matched targets. Callbacks are optional.
```js
b.go(afterAll, afterEach);
```
When the first argument is the name of a specific bundle, `go` runs the full pipeline for just ONE of the matched targets. Callback is optional.
```js
b.go('two.js', callback);
```

## forEach
A convenient way to iterate over each source file in [getSrcFiles](#getsrcfiles)
```js
b.forEach(function (filename) {
    console.log(filename);
});
```

---
# Working with Resources
---

## getDependencyMap
Get a map of source files to a list of bundles that use them.
```js
b.getDependencyMap();
// { 'src_one.js': { 'bundle_one.js': true, 'bundle_two.js': true }, 'src_two.js': {'bundle_two.js': true } }
```
Or, get the map for a specific source file.
```js
b.getDependencyMap('src_one.js');
// { 'bundle_one.js': true, 'bundle_two.js': true }
```

## getResources
Get the full collection of matched resources.
```js
b.getResources();
// { 'bundle_one.js': { name, dest, options, src, chain, contents, sourcemaps, changed }, 'bundle_two.js': ... }
```

## getSrcFiles
Get an Array of all matched source files.
```js
b.getSrcFiles();
// [ 'src_one.js', 'src_two.js' ]
```

## mapDependency
Add a mapping to indicate that a bundle depends on a given source file.
```js
b.mapDependency('bundle_one.js', '/full/path/src_three.js');
```

## mergeResources
Combine two sets of resources
```js
const c = new Bundl(newTargets);
b.mergeResources(c.getResources());
```

---
# Build On Demand
---

## webserver
See our full page on how to use the [Bundl Webserver](BUILD_ON_DEMAND.md)

## middleware
Use to route within an existing server [Bundl as Middleware](BUILD_ON_DEMAND.md#use-as-middleware)
