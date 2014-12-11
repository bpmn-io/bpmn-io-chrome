var viewer;

(function() {

  var BpmnModeler = require('bpmn-js/lib/Modeler'),
      DiagramJsOrigin = require('diagram-js-origin'),
      _ = require('lodash');

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

  viewer = new BpmnModeler({
    container: '#canvas',
    additionalModules: [
      DiagramJsOrigin
    ]
  });

  var xmlTextArea = document.querySelector('#xml textarea');

  viewer.on('commandStack.changed', updateXml);
  viewer.on('import.success', updateXml);

  xmlTextArea.onkeyup = _.debounce(updateBpmn, 500);


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

  var sourceButton = document.querySelector('[show-tab="xml"]');
  sourceButton.addEventListener('click', function(e) {
    document.body.classList.toggle('show-source');

    if (!document.body.matches('.show-source, .show-diagram')) {
      document.body.classList.add('show-diagram');
    }
    e.preventDefault();
  });

  var diagramButton = document.querySelector('[show-tab="diagram"]');
  diagramButton.addEventListener('click', function(e) {
    document.body.classList.toggle('show-diagram');

    if (!document.body.matches('.show-source, .show-diagram')) {
      document.body.classList.add('show-source');
    }

    e.preventDefault();
  });
})();
