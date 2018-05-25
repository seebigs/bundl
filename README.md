# Bundl
> Become a master of bundles
* [API Documentation](docs/API.md)
* [Popular Plugins](docs/PLUGINS.md)
* [Examples](docs/EXAMPLES.md)

## What Is Bundl?
Bundl builds and packages files for your frontend codebase. It switches the paradigm of when resources are built vs when they are needed ([Bundl On-Demand](docs/BUILD_ON_DEMAND.md)). Use it as a task manager or use it to package your source code with additional resources (like styles and images) into a JavaScript bundle that can be served to your web browser.

## Why Use Bundl?
* Build resoucres only when requested by your browser (and only if they've changed) ([Example](docs/BUILD_ON_DEMAND.md))
* Easily concat, require, and wrap all of your various resources to generate the bundle you really need ([Example](docs/EXAMPLES.md#bundles-for-browsers))
* Run other tasks like linting, file system operations, etc. ([Example](docs/EXAMPLES.md#server-side-operations))
* Write next generation ES6 JavaScript today with a transpiler plugin ([Example](https://github.com/seebigs/bundl-pack-babel))

---
## Get Started

### Install
```
$ cd ~/myProject
$ npm install bundl --save-dev
```

### Create Your Build Script
Make a new file at `~/myProject/bundl.js`
```js
var Bundl = require('bundl');

// Plugins
var pack = require('bundl-pack');
var minify = require('bundl-minify');
var write = require('bundl-write');

// Configure
var bundlOptions = {
    outputDir: 'dist/javascripts',
    clean: true
};
var targets = {
    'my_project_bundle.js': 'src/entry.js'
};

// Setup a build pipeline
var myProjectBundl = new Bundl(targets, bundlOptions)
    .then(pack())
    .thenif(Bundl.cliArgs.min, minify())
    .then(write());

// Start the build
myProjectBundl.go();
```

### Run Your Script
```
$ cd ~/myProject
$ node bundl --min
```

### Run via NPM (optional)
Add scripts to your `package.json`
```json
{
  "name": "myProject",
  "version": "0.0.1",
  "dependencies": {
    "bundl": "^1.0.0"
  },
  "scripts": {
    "build": "node bundl.js"
  }
}
```
```
$ npm run build
```

---
## How to Use
* [Live Developing](docs/EXAMPLES.md#live-developing)
* [Bundles for Browsers](docs/EXAMPLES.md#bundles-for-browsers)
* [Server-Side Operations](docs/EXAMPLES.md#server-side-operations)
* [Task Runner](docs/TASK_RUNNER.md)
* [Specifying Targets](docs/TARGETS.md)

---
## Build Resources Live On-Demand!

When you make a change to one source file, you shouldn't have to switch back to command line to run a task before you can see your changes live in a browser. You also shouldn't need to wait for **every** bundle to rebuild if you only want to see one or two of them. Use Bundl's dev server instead...
```js
// Setup a build pipeline
var myProjectBundl = new Bundl(targets, bundlOptions)
    .then(pack())
    .then(write());

// Start live dev mode
myProjectBundl.webserver();
```
Now, open a browser to `http://localhost:5555`

HTTP Requests for a bundled resource will check to see if any of the source files within this bundle have changed since last request. If so, the webserver will rebuild the requested bundle before sending it back to the browser.

Learn how to [configure a devserver for your project](docs/BUILD_ON_DEMAND.md)

---
## Debugging
Add `--verbose` as a command line option to print more info about what's happening
```
$ node bundl --verbose
```
Add `.debug()` to your build chain to print which src files will be bundled into which dest files
```
new Bundl(targets, bundlOptions).debug();
```
