# Bundl

**Develop frontend bundles with ease**

> For options, configurations, and extended features, have a look at: \
> [API Documentation](docs/api) :: [Extensions](docs/extensions) :: [Examples](docs/examples)

## Get Started
---

### Install
```
$ cd ~/myProject
$ npm install bundl --save-dev
```

### Create Your Build Script
Make a new file at `~/myProject/bundl.js`
```js
var bundl = require('bundl');

// Extensions
var dependencies = require('bundl-dependencies');
var minify = require('bundl-minify');
var write = require('bundl-write');

// Configure
var bundlOptions = {
    targetDir: 'src',
    clean: true
};
var targets = {
    'my_project_bundle.js': 'entry.js'
};

// Setup build-chain
var myProjectBundl = bundl(targets, bundlOptions)
    .then(dependencies())
    .thenif(bundl.args.min, minify())
    .then(write());

// Start the build
myProjectBundl.all();
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
    "build": "node bundl"
  }
}
```
```
$ npm run build
```

## Build Resources On-Demand!
---
When you make a change to one source file, you shouldn't have to wait for **every** bundle to rebuild before you can see your changes live in a browser.
```js
var myProjectBundl = bundl(targets, bundlOptions)
    .then(dependencies())
    .then(write());

myProjectBundl.webserver({
    port: '5555',
    rebuild: 'changed',
    watch: './src'
});
```
Run the build script above to launch your webserver
```
$ node bundl
```
Now, open a browser to `http://localhost:5555`

HTTP Requests for a bundled resource will check to see if any of the source files that comprise this bundle have changed since last request. If so, the webserver will rebuild the requested bundle before sending it back to the browser.

*NOTE: this is built for rapid development, not as a production-ready webserver*

## Task Management
---
### Define Tasks
```js
var bundl = require('bundl');

bundl.task('doit:sync', function () {
    console.log('  My name is: ' + this.name);
    return 123;
});

bundl.task('doit:async', function (done) {
    console.log('  My name is: ' + this.name);
    setTimeout(function(){
        if (typeof done === 'function') {
            done(456);
        }
    }, 100);
});

bundl.task('doit', function () {
    bundl.run('doit:async', doitCallback);
    bundl.run('doit:sync', doitCallback);
});

function doitCallback (result, name) {
    console.log(name + ' = ' + result);
}

bundl.load(); // runs any tasks passed via command line
```
### Run Tasks
Run using the API
```js
bundl.run('doit');
```
Run from command line
```
$ node bundl doit
```

## Debugging
---
Add `.debug()` to your build chain to print which src files will be bundled into which dest files
```
bundl(targets, bundlOptions).debug();
```
Add `--verbose` as a command line option to print more info about what's happeneing
```
$ node bundl --verbose
```
