var assign = require('lodash/object/assign');


/**
 * Wait until IO is ready for writing
 *
 * @param {Writer} writer
 * @param {Function} done
 */
function whenReady(writer, done) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();

  // wait for a few seconds
  function reentrant() {

    if (writer.readyState === writer.WRITING && Date.now() - start < 4000) {
      return setTimeout(reentrant, 100);
    }

    if (writer.readyState === writer.WRITING) {
      writer.abort();
      return done(new Error('timeout waiting for io (readyState is ' + writer.readyState + ')'));
    }

    return done();
  }

  setTimeout(reentrant, 100);
}


/**
 * Writes a given file entry with the passed blob
 */
function writeFile(fileEntry, blob, done) {

  if (!fileEntry) {
    return done(new Error('no writable entry'));
  }

  if (!blob) {
    return done(new Error('no data given'));
  }

  fileEntry.createWriter(function(writer) {

    writer.onerror = function(err) {
      console.error('write error');
      console.error(err);

      return done(err);
    };

    writer.truncate(blob.size);
    whenReady(writer, function(err) {

      if (err) {
        return done(err);
      }

      writer.seek(0);

      writer.onwriteend = function() {
        return done(null);
      };

      writer.write(blob);
    });
  }, done);
}


function readFileAsText(fileEntry, done) {

  fileEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = done;
    reader.onload = function(e) {
      done(null, e.target.result);
    };

    reader.readAsText(file);
  });
}


function DiagramFile(entry, contents, path) {
  this.contents = contents;
  this.entry = entry;
  this.name = entry.name;
  this.path = path;
}


/**
 * Load a file entry from the local disk to a diagram file
 */
function loadFile(entry, done) {

  entry.file(function(file) {
    readFileAsText(entry, function(err, contents) {
      if (err) {
        return done(err);
      }

      chrome.fileSystem.getDisplayPath(entry, function(path) {
        return done(null, new DiagramFile(entry, contents, path));
      });
    });
  });
}


function chooseEntry(options, done) {

  try {
    chrome.fileSystem.chooseEntry(options, function(entry) {
      if (chrome.runtime.lastError) {
        // user canceled?
      }

      return done(null, entry);
    });
  } catch (err) {
    return done(null);
  }
}

function openFile(done) {

  var accepts = [ {
    mimeTypes: [ 'text/*' ],
    extensions: [ 'bpmn', 'xml' ]
  } ];

  chooseEntry({ type: 'openFile', accepts: accepts }, function(err, entry) {
    if (err || !entry) {
      return done(err);
    }

    loadFile(entry, done);
  });
}

/**
 * Save the given diagram file
 *
 * @param {DiagramFile} diagramFile
 * @param {Object} [options]
 * @param {Boolean} [options.create=false]
 *
 * @param {Function} done
 */
function saveFile(diagramFile, options, done) {

  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  var create = options.create;

  var blob = new Blob([ diagramFile.contents ], { type: 'text/plain' });

  if (diagramFile.entry && create !== true) {
    // save existing file
    writeFile(diagramFile.entry, blob, done);
  } else {
    // choose new file to save
    chooseEntry({ type: 'saveFile', suggestedName: diagramFile.name }, function(err, entry) {
      if (err) {
        return done(err);
      }

      if (!entry) {
        return done(new Error('no entry choosen'));
      }

      writeFile(entry, blob, function(err) {

        if (err) {
          return done(err);
        }

        chrome.fileSystem.getDisplayPath(entry, function(path) {
          diagramFile.entry = entry;
          diagramFile.name = entry.name;
          diagramFile.path = path;

          return done();
        });
      });
    });
  }
}


module.exports.loadFile = loadFile;

module.exports.openFile = openFile;

module.exports.saveFile = saveFile;


// use local storage to retain access to this file
// chrome.storage.local.set({ 'chosenFile': chrome.fileSystem.retainEntry(theEntry)});


/*
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


function saveXml(fileEntry) {
  viewer.saveXML(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }

    var bpmnXml = result;
    var blob = new Blob([bpmnXml], {type: 'text/plain'});
    writeFileEntry(fileEntry, blob, function(e) {
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
  chrome.fileSystem.chooseEntry({ type: 'openFile', accepts: accepts }, function(theEntry) {
    if (!theEntry) {
      output.textContent = 'No file selected.';
      return;
    }
    // use local storage to retain access to this file
    chrome.storage.local.set({ 'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
    loadFileEntry(theEntry);
  });
});

saveFileButton.addEventListener('click', function(e) {
  var config = {type: 'saveFile', suggestedName: chosenEntry.name};
  chrome.fileSystem.chooseEntry(config, function(fileEntry) {
    saveXml(fileEntry);
    displayEntryData(fileEntry);
  });
});


// Support dropping a single file onto this app.
var dnd = new DnDFileController('body', function(data) {
  chosenEntry = null;
  for (var i = 0; i < data.items.length; i++) {
    var item = data.items[i];
    if (item.kind == 'file' && item.webkitGetAsEntry()) {
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

*/
