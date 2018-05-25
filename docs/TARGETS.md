# Targets

*Let's talk about how to gather files into the Bundl pipeline...*

Imagine a directory structure like:
```
myAppDir/
   |- one.js
   |- two.js
   |- three.js
```

## Map Object
Specify the names of your bundles and the src files to be contained within each. This is the most powerful (and preferred) way to set your targets. Each bundle can contain files, arrays, globs, or direct contents. The map object follows the pattern `{ bundleName: sources }`
```js
var b = new Bundl({
   'bundle_one.js': 'one.js',
   'bundle_dir.js': 'myAppDir',
   'bundle_odd.js': ['one.js', 'three.js'],
   'bundle_glob.js': ['*.js'],
   'bundle_direct.js': { contents: 'foo' },
});
```
```js
b.getResources();
// {
//    'bundle_one.js': {
//       src: ['one.js']
//    },
//    'bundle_dir.js': {
//       src: ['one.js', 'two.js', 'three.js']
//    },
//    'bundle_odd.js': {
//       src: ['one.js', 'three.js']
//    },
//    'bundle_glob.js': {
//       src: ['one.js', 'two.js', 'three.js']
//    },
//    'bundle_direct.js': {
//       src: []
//    },
// }

b.getSrcFiles();
// ['one.js', 'two.js', 'three.js']
```

## One file
Matches just the file provided. This src file will be output into a bundle of the same name.
```js
var b = new Bundl('one.js');
```
```js
b.getResources();
// {
//    'one.js': {
//       src: ['one.js']
//    }
// }

b.getSrcFiles();
// ['one.js']
```

## One directory
Matches each file within the provided directory. Each file will be output into a bundle of the same name.
```js
var b = new Bundl('myAppDir');
```
```js
b.getResources();
// {
//    'one.js': {
//       src: ['one.js']
//    },
//    'two.js': {
//       src: ['two.js']
//    },
//   'three.js': {
//       src: ['three.js']
//    }
// }

b.getSrcFiles();
// ['one.js', 'two.js', 'three.js']
```

## Array of files
Matches only the files provided. Each file will be output into a bundle of the same name.
```js
var b = bundl(['one.js', 'three.js']);
```
```js
b.getResources();
// {
//    'one.js': {
//       src: ['one.js']
//    },
//    'three.js': {
//       src: ['three.js']
//    }
// }

b.getSrcFiles();
// ['one.js', 'three.js']
```

## One glob
Matches multiple files based on [glob patterns](https://github.com/isaacs/node-glob). Useful for server-side operations. Does not output well unless renamed!
```js
var b = bundl('*.js');
```
```js
b.getResources();
// {
//    '*.js': {
//       src: ['one.js', 'two.js', 'three.js']
//    }
// }

b.getSrcFiles();
// ['one.js', 'two.js', 'three.js']
```

## Array of globs
Matches multiple files based on [glob patterns](https://github.com/isaacs/node-glob). Useful for server-side operations. Does not output well unless renamed!
```js
var b = bundl(['*.js', '*.css']);
```
```js
b.getResources();
// {
//    '*.js': {
//       src: ['one.js', 'two.js', 'three.js']
//    },
//    '*.css': {
//       src: ['a.css', 'b.css']
//    }
// }

b.getSrcFiles();
// ['one.js', 'two.js', 'three.js', 'a.css', 'b.css']
```
