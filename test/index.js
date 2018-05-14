const FeatherTest = require('feather-test');
const glob = require('glob');
const args = require('seebigs-args')();

let specs = './specs';

if (args.run) {
    let matcher = __dirname + '/' + specs + '/**/*' + args.run + '**';
    specs = glob.sync(matcher);
    console.log(specs);
}

const myTest = new FeatherTest({
    specs: specs,
    clearCacheBetweenSpecFiles: false,
});

myTest.run();
