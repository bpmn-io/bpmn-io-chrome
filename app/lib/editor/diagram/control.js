var domify = require('min-dom/lib/domify');

var BpmnJS = require('bpmn-js/lib/Modeler');

function createBpmnJS(element) {
  return new BpmnJS({ container: element, position: 'absolute' });
}


function DiagramControl(diagramFile) {

  var $el = domify('<div>'),
      modeler = this.modeler = createBpmnJS($el);

  var self = this;

  var commandStackIdx = -1,
      attachedScope;

  function apply() {
    if (attachedScope) {
      attachedScope.$applyAsync();
    }
  }

  modeler.on('commandStack.changed', function(e) {
    var commandStack = modeler.get('commandStack');

    self.canUndo = commandStack.canUndo();
    self.canRedo = commandStack.canRedo();

    diagramFile.unsaved = (commandStackIdx !== commandStack._stackIdx);
  });

  modeler.on('commandStack.changed', apply);


  this.resetEditState = function() {
    var commandStack = modeler.get('commandStack');

    commandStackIdx = commandStack._stackIdx;
  };

  this.save = function(done) {

    modeler.saveXML({ format: true }, function(err, xml) {
      done(err, xml);
    });
  };

  this.attach = function(scope, element) {

    attachedScope = scope;

    element.appendChild($el);

    function imported(err, warnings) {
      console.log(arguments);
    }

    if (!modeler.diagram) {
      if (diagramFile.contents) {
        modeler.importXML(diagramFile.contents, imported);
      } else {
        modeler.createDiagram(imported);
      }
    }
  };

  this.detach = function() {
    var parent = $el.parentNode;

    if (parent) {
      parent.removeChild($el);
    }
  };

  this.undo = function() {
    modeler.get('commandStack').undo();
  };

  this.redo = function() {
    modeler.get('commandStack').redo();
  };

  this.destroy = function() {
    modeler.destroy();
  };
}


module.exports = DiagramControl;