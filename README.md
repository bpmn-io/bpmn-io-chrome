# bpmn-js as a chrome app


## Run

```
grunt
```

```
chrome --load-and-launch-app="$(pwd)/dist" resources/simple.bpmn
```



## Continuous deployment

```
grunt auto-build
```



## A simple binary

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