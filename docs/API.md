# API

## Installing
```
$ npm install bundl --save-dev
```

## Using
```js
const Bundl = require('bundl');
const b = new Bundl(options);
```

## Class Methods

- [Class Methods](API_CLASS.md)
  - [Bundl.cliArgs](API_CLASS.md#cliArgs)
  - [Bundl.load](API_CLASS.md#load)
  - [Bundl.listTasks](API_CLASS.md#listTasks)
  - [Bundl.runTask](API_CLASS.md#runTask)
  - [Bundl.setTask](API_CLASS.md#setTask)
  - [Bundl.shell](API_CLASS.md#shell)
  - [Bundl.watch](API_CLASS.md#watch)

## Instance Methods

- [Instance Methods](API_INSTANCE.md)
  - [b.add](API_INSTANCE.md#add)
  - [b.cliArgs](API_INSTANCE.md#cliArgs)
  - [b.debug](API_INSTANCE.md#debug)
  - [b.forEach](API_INSTANCE.md#forEach)
  - [b.getDependencyMap](API_INSTANCE.md#getDependencyMap)
  - [b.getResources](API_INSTANCE.md#getResources)
  - [b.getSrcFiles](API_INSTANCE.md#getSrcFiles)
  - [b.go](API_INSTANCE.md#go)
  - [b.mapDependency](API_INSTANCE.md#mapDependency)
  - [b.mergeResources](API_INSTANCE.md#mergeResources)
  - [b.middleware](API_INSTANCE.md#middleware)
  - [b.rename](API_INSTANCE.md#rename)
  - [b.src](API_INSTANCE.md#src)
  - [b.then](API_INSTANCE.md#then)
  - [b.thenif](API_INSTANCE.md#thenif)
  - [b.webserver](API_INSTANCE.md#webserver)
  - [b.write](API_INSTANCE.md#write)

## Bundl Options

- [Options](API_OPTIONS.md)
  - [clean](API_OPTIONS.md#clean)
  - [concat](API_OPTIONS.md#concat)
  - [liveRequestPathMap](API_OPTIONS.md#liveRequestPathMap)
  - [outputDir](API_OPTIONS.md#outputDir)
  - [quiet](API_OPTIONS.md#quiet)
  - [srcDir](API_OPTIONS.md#srcDir)
  - [watch](API_OPTIONS.md#watch)
