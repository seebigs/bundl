When you make a change to one source file, you shouldn't have to switch back to command line to run a command before you can see your changes live in a browser. You also shouldn't need to wait for **every** bundle to rebuild if you only want to see one or two of them. Use Bundl's dev server instead...

**Start a local webserver to automatically run your bundl pipeline as files change.**

```js
const Bundl = require('bundl');
const pack = require('bundl-pack');
const write = require('bundl-write');

const b = new Bundl('./src', { outputDir: './dist' })
    .then(pack())
    .then(write());

b.webserver({
    // see options below
});
```

HTTP Requests for a bundled resource will check to see if any of the source files within this bundle have changed since last request. If so, the webserver will rebuild the requested bundle before sending it back to the browser.

*NOTE: this is intended for rapid development, not as a production-ready webserver*

# Options

## log
Controls how messages are logged into the console as urls are requested. See [morgan](https://github.com/expressjs/morgan) for more details.
```js
{
    log: false // disables logging
}
```
The default logging format is:
```js
{
    log: {
        format: ':method :url :status :response-time ms - :res[content-length]',
        options: {}
    }
}
```

## port
Specify the port where the server should listen. Default is `5555`.
```js
{
    port: 5678
}
```

## rebuild
Should bundled resources be rebuilt when requested? Default behavior is to rebuild only when dependencies have changed since the last build. Other options are `always` and `never`.
```js
{
    rebuild: 'never'
}
```

## root
Specify the root directory to serve files from. Default is `process.cwd()`.
```js
{
    root: '../dist'
}
```

## routes
Specify the Bundl build chain(s) to run when files have changed. When a devserver is started from a Bundl instance, the instance itself will be included as a route by default.
```js
Bundl.webserver({
    routes: [bundl1, bundl2],
});
```
```js
const b = new Bundl(targets);
b.webserver({
    // routes: [b],  <-- implied by default
});
```

## serveIndex
Should the server show a list of directory contents when browsing urls? Default is `true`.
```js
{
    serveIndex: false
}
```

## watch
Specify the path to watch for changes to dependencies. Default is [root](#root).
```js
{
    watch: './src/javascripts'
}
```

# Use as Middleware
```js
const b = new Bundl(targets);
const app = express();
app.use(b.middleware());
```
