var BpmnViewer = require('bpmn-js/lib/Modeler');

var viewer = new BpmnViewer({ container: '#canvas', height: '100%', width: '100%' });

function undoCommand() {
  if (viewer.diagram) {
    viewer.diagram.get('commandStack').undo();
  }
};

function redoCommand() {
  if (viewer.diagram) {
    viewer.diagram.get('commandStack').redo();
  }
};
