/*
Copyright 2012 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eric Bidelman (ericbidelman@chromium.org)
Updated: Joe Marini (joemarini@google.com)
*/

var chosenEntry = null;
var bpmnXml = null;
var newDiagramButton = document.querySelector('#new_diagram');
var chooseFileButton = document.querySelector('#choose_file');
var chooseDirButton = document.querySelector('#choose_dir');
var saveFileButton = document.querySelector('#save_file');;
var output = document.querySelector('output');

function errorHandler(e) {
  console.error(e);
}

function displayEntryData(theEntry) {
  document.querySelector('#file_path').innerText = theEntry.name;
}

function readAsText(fileEntry, callback) {
  fileEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = errorHandler;
    reader.onload = function(e) {
      callback(e.target.result);
    };

    reader.readAsText(file);
  });
}


function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    }
    else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}


function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    output.textContent = 'Nothing selected.';
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    }
    else {
      chosenEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}


// for files, read the text content into the textarea
function loadFileEntry(_chosenEntry) {
  chosenEntry = _chosenEntry;
  chosenEntry.file(function(file) {
    displayEntryData(file);
    readAsText(chosenEntry, function(result) {
      viewXml(result);
    });
  });
}


function loadInitialFile(launchData) {
  if (launchData && launchData.items && launchData.items[0]) {
    loadFileEntry(launchData.items[0].entry);
  } else {
    // see if the app retained access to an earlier file or directory
    chrome.storage.local.get('chosenFile', function(items) {
      if (items.chosenFile) {
        // if an entry was retained earlier, see if it can be restored
        chrome.fileSystem.isRestorable(items.chosenFile, function(bIsRestorable) {
          // the entry is still there, load the content
          console.info("Restoring " + items.chosenFile);
          chrome.fileSystem.restoreEntry(items.chosenFile, function(chosenEntry) {
            if (chosenEntry) {
              chosenEntry.isFile ? loadFileEntry(chosenEntry) : loadDirEntry(chosenEntry);
            }
          });
        });
      }
    });
  }
}


function viewXml(xml) {
  viewer.importXML(xml, function(err) {
    if (!err) {
      console.log('success!');
      viewer.get('canvas').zoom('fit-viewport');
    } else {
      console.log('something went wrong:', err);
    }
  });
}


function saveXml(writableEntry) {
  viewer.saveXML(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }

    var bpmnXml = result;
    var blob = new Blob([bpmnXml], {type: 'text/plain'});
    writeFileEntry(writableEntry, blob, function(e) {
      console.log('File saved');
    });
  });
}

newDiagramButton.addEventListener('click', function(e) {
  viewer.createDiagram(function(err, warn) {
    console.log("Created new diagram");
  });
});

chooseFileButton.addEventListener('click', function(e) {
  var accepts = [{
    mimeTypes: ['text/*'],
    extensions: ['bpmn', 'xml']
  }];
  chrome.fileSystem.chooseEntry({type: 'openFile', accepts: accepts}, function(theEntry) {
    if (!theEntry) {
      output.textContent = 'No file selected.';
      return;
    }
    // use local storage to retain access to this file
    chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
    loadFileEntry(theEntry);
  });
});

saveFileButton.addEventListener('click', function(e) {
  var config = {type: 'saveFile', suggestedName: chosenEntry.name};
  chrome.fileSystem.chooseEntry(config, function(writableEntry) {
    saveXml(writableEntry);
    displayEntryData(writableEntry);
  });
});


// Support dropping a single file onto this app.
var dnd = new DnDFileController('body', function(data) {
  chosenEntry = null;
  for (var i = 0; i < data.items.length; i++) {
    var item = data.items[i];
    if (item.kind == 'file' &&
        item.webkitGetAsEntry()) {
      chosenEntry = item.webkitGetAsEntry();
      break;
    }
  };

  readAsText(chosenEntry, function(result) {
    viewXml(result);
  });
  // Update display.
  displayEntryData(chosenEntry);
});


loadInitialFile(launchData);
