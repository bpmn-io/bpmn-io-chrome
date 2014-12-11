# bpmn-js chrome app

This is a offline modeler for BPMN 2.0 diagrams based on [bpmn-js](https://github.com/bpmn-io/bpmn-js).

![screenshot of the bpmn-js chrome app](https://raw.githubusercontent.com/bpmn-io/bpmn-js-chrome/master/docs/bpmn-io-chrome.png)


[Get it from the Chrome Webstore](https://chrome.google.com/webstore/detail/bpmnio/hhikcjnalmkhinbomccdibaolelcpjli)


## Build

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


### Operating System Integration


#### A simple binary

(put to `/usr/local/bin` or the like)

```bash
#!/bin/bash

APP_DIR=path-to/bpmn-js-chrome/dist

chrome --load-and-launch-app="$APP_DIR" $@
```

Execute it as

```
bpmn-io foo.bpmn
```
