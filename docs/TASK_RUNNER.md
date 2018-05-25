## Task Runner

### Define Tasks
```js
var Bundl = require('bundl');

Bundl.setTask('doit:sync', function () {
    console.log('  My name is: ' + this.name);
    return 123;
});

Bundl.setTask('doit:async', function (done) {
    console.log('  My name is: ' + this.name);
    setTimeout(function(){
        if (typeof done === 'function') {
            done(456);
        }
    }, 100);
});

Bundl.setTask('doit', function () {
    Bundl.runTask('doit:async', doitCallback);
    Bundl.runTask('doit:sync', doitCallback);
});

function doitCallback (result, name) {
    console.log(name + ' = ' + result);
}

Bundl.load('./myTasks/*'); // runs any tasks passed via command line that are defined in the `myTasks` directory
```

### Run Tasks
Run using the API
```js
Bundl.runTask('doFirst').then('doSecond');
```
Run from command line
```
$ node bundl doFirst doSecond
```
