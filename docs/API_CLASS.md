# API Class Methods
```js
const Bundl = require('bundl');
```

## cliArgs
Get any of the arguments passed from command line.
```
$ node mybundl.js --flag --other=stuff
```
```js
Bundl.cliArgs.flag // true
Bundl.cliArgs.other // "stuff"
```

## load
Load all matched scripts.
```js
Bundl.load('./build/*');
```

## listTasks
List all named tasks that have been defined.
```js
Bundl.listTasks(); // { taskOne: [Function], taskTwo: [Function] }
```

## runTask
Run a named task. Chain a series of tasks using `then`.
```js
Bundl.runTask('build').then('test');
```

## setTask
Define tasks to be run. A task must return `true` or call `done` when it is complete. If `hideFromSummary` is true the task will be omitted from the summary table when `--verbose` is used.
```js
const hideFromSummary = true;

Bundl.task('test:unit', function (done) {
    // do unit tests
    done();
}, hideFromSummary);

Bundl.run('test:unit');
```

## shell
Execute shell commands from within your scripts. See [execa](https://github.com/sindresorhus/execa) for advanced usage options.
```js
Bundl.shell('ls', ['-l']);
```

## watch
Monitor files and fire a callback when files have changed. This is a convenience wrapper for [node-watch](https://github.com/yuanchuan/node-watch)
```js
Bundl.watch(path, onChange, filter)
```
