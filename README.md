# bpmn-io-chrome app

This is a offline modeler for BPMN 2.0 diagrams based on [bpmn-js](https://github.com/bpmn-io/bpmn-js).

![screenshot of the bpmn-js chrome app](https://raw.githubusercontent.com/bpmn-io/bpmn-js-chrome/master/docs/screenshot.png)


[Get it from the Chrome Webstore](https://chrome.google.com/webstore/detail/bpmnio/hhikcjnalmkhinbomccdibaolelcpjli)


## Integrate with your OS

It is possible to create a simple wrapper for the app that allows you to open local `.bpmn` files.


#### Windows executable

Create a `bpmn-io.bat` file, i.e. on your desktop:

```plain
chrome --app-id=hhikcjnalmkhinbomccdibaolelcpjli $@
```

__Hint:__ You can make this file the default application for opening `*.bpmn` files via `Open With ...`.


#### Linux / Mac OS X executable

Create a `bpmn-io` executable, i.e. under `/usr/local/bin`:

```bash
#!/bin/bash
chrome --app-id=hhikcjnalmkhinbomccdibaolelcpjli $@
```

Execute it as `bpmn-io [bpmn-file]` or drop elements from your file system on it.



## Build from Sources

It is entirely possible to build the app from the sources.

#### Package + Run

To install the dependencies and build the app execute

```
npm install
grunt
```

Open the app in you browser via

```
chrome --load-and-launch-app="$(pwd)/dist" resources/simple.bpmn
```


#### Development Setup

To automatically recompile the app and open it in your browser execute

```
grunt auto-build
```

You may customize the chromium-based browser via the `CHROME_BIN` environment variable.


## License

MIT
