'use strict';

var inherits = require('inherits');

var h = require('virtual-dom/h');

var BpmnJS = require('bpmn-js/lib/Modeler'),
    DiagramJsOrigin = require('diagram-js-origin');

var Child = require('../components/child');


function DiagramControl(editor, diagramFile) {
  Child.call(this);

  this.editor = editor;

  var modeler = this.modeler = this.createBpmnJS(this.editor.$el);

  var commandStackIdx = -1,
      attachedScope;

  this.diagramFile = diagramFile;

  // EXTERNAL EVENTS
  this.on('control.diagram.undo', this.undo.bind(this));

  this.on('control.diagram.redo', this.undo.bind(this));

  function unbindKeyboard() {
    var keyboard = modeler.get('keyboard');

    keyboard.unbind();
  }

  this.on('detach', unbindKeyboard);

  function attach() {
    if (!modeler.diagram) {
      if (diagramFile.contents) {
        modeler.importXML(diagramFile.contents, imported);
      } else {
        modeler.createDiagram(imported);
      }
    } else {
      this.bindKeyboard();
    }
  }

  this.on('attach', attach.bind(this));

  function removeModeler() {
    modeler.destroy();
  }

  this.on('destroy', removeModeler);

  // INTERNAL EVENTS
  modeler.on('commandStack.changed', function(e) {
    var commandStack = modeler.get('commandStack');

    this.canUndo = commandStack.canUndo();
    this.canRedo = commandStack.canRedo();

    diagramFile.unsaved = (commandStackIdx !== commandStack._stackIdx);
  }.bind(this));

  modeler.on('commandStack.changed', this.editor.changed.bind(this));

  function imported(err, warnings) {
    var canvas = modeler.get('canvas');

    if (this.viewbox) {
      canvas.viewbox(this.viewbox);
    }

    this.bindKeyboard();
  }

  modeler.on('import.success', this.save.bind(this));

  function saveViewbox(event) {
    event.preventDefault();

    this.viewbox = event.viewbox;
  }

  modeler.on('canvas.viewbox.changed', saveViewbox.bind(this));

  modeler.on('commandStack.changed', this.save.bind(this));
}

inherits(DiagramControl, Child);

module.exports = DiagramControl;


DiagramControl.prototype.createBpmnJS = function(element) {
  return new BpmnJS({
    container: element,
    position: 'absolute',
    additionalModules: [
      DiagramJsOrigin
    ]
  });
};

DiagramControl.prototype.resetEditState = function() {
  var commandStack = this.modeler.get('commandStack');

  var commandStackIdx = commandStack._stackIdx;

  this.diagramFile.unsaved = false;
};

DiagramControl.prototype.redrawDiagram = function() {
  if (this.xml !== this.diagramFile.contents) {
    this.modeler.importXML(this.xml, this.imported);

    this.diagramFile.unsaved = true;
  }
};

DiagramControl.prototype.bindKeyboard = function() {
  var keyboard = this.modeler.get('keyboard');

  keyboard.bind(document);
};

DiagramControl.prototype.save = function(done) {

  this.modeler.saveXML({ format: true }, function(err, xml) {
    if (typeof done === 'function') {
      done(err, xml);
    }

    this.xml = this.diagramFile.contents = xml;

    this.changed();
  });
};

DiagramControl.prototype.undo = function() {
  this.modeler.get('commandStack').undo();
};

DiagramControl.prototype.redo = function() {
  this.modeler.get('commandStack').redo();
};
