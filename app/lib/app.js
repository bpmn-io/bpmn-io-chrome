var viewer;

(function() {

  var BpmnViewer = require('bpmn-js/lib/Modeler');

  function updateBpmn() {
    var vb = viewer.get('canvas').viewbox();

    viewer.importXML(xmlTextArea.value, function(err) {
      viewer.get('canvas').viewbox(vb);
    });
  }

  function updateXml() {
    viewer.saveXML({'format': true}, function updateXml(err, result) {
      if(!err) {
        xmlTextArea.value = result;
      } else {
        // TODO: handle error
      }
    });
  }

  function undo() {
    if (viewer.diagram) {
      viewer.diagram.get('commandStack').undo();
    }
  }

  function redo() {
    if (viewer.diagram) {
      viewer.diagram.get('commandStack').redo();
    }
  }

  viewer = new BpmnViewer({ container: '#canvas', height: '100%', width: '100%' });
  var xmlTextArea = document.querySelector('#xml textarea');

  viewer.on('commandStack.changed', updateXml);
  viewer.on('import.success', updateXml);

  xmlTextArea.onblur = updateBpmn;


  var undoButton = document.querySelector('#undo');
  var redoButton = document.querySelector('#redo');

  undoButton.addEventListener('click', undo);
  redoButton.addEventListener('click', redo);

  // window undo/redo key bindings
  window.onkeyup = function(e) {
    var evt = window.event? event: e;
    if (evt.ctrlKey && evt.keyCode == 90) {
      undo();
    }
    else if (evt.ctrlKey && evt.keyCode == 89) {
      redo();
    }
  };
})();