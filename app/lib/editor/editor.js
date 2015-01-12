var files = require('../util/files'),
    dialog = require('../util/dialog'),
    workspace = require('../util/workspace'),
    assign = require('lodash/object/assign'),
    DiagramControl = require('./diagram/control');


function Editor($scope) {

  var idx = 0;

  this.active = null;
  this.diagrams = [];

  this.canUndo = function() {
    return this.active && this.active.control.canUndo;
  };

  this.canRedo = function() {
    return this.active && this.active.control.canRedo;
  };

  this.isUnsaved = function() {
    return this.active && this.active.unsaved;
  };

  this.undo = function() {
    if (this.active) {
      this.active.control.undo();
    }
  };

  this.redo = function() {
    if (this.active) {
      this.active.control.redo();
    }
  };

  this.saveDiagram = function(diagram, done) {

    diagram.control.save(function(err, xml) {
      if (err) {
        return done(err);
      } else {
        diagram.contents = xml;

        files.saveFile(diagram, function(err) {

          console.log(err);

          if (!err) {
            diagram.control.resetEditState();
          }

          $scope.$applyAsync();

          return done(err);
        });
      }
    });
  };

  this.save = function() {

    var active = this.active;

    if (active) {
      this.saveDiagram(active, function(err) {
        console.log(err);
      });
    }
  };

  this.newDiagram = function() {

    var diagram = {
      name: 'diagram_' + (idx++) + '.bpmn',
      path: '[unsaved]'
    };

    this.showDiagram(diagram);
  };

  this.isActive = function(diagram) {
    return this.active === diagram;
  };

  /**
   * Open diagram file via the editor and show it
   */
  this.openDiagram = function() {

    var self = this;

    files.openFile(function(err, file) {

      if (err) {
        return console.error(err);
      }

      if (file) {
        self.diagrams.push(file);
        self.showDiagram(file);

        self.persist();
      }

      $scope.$applyAsync();
    });
  };

  /**
   * Show diagram (or null)
   *
   * @param  {DiagramFile} [diagram]
   */
  this.showDiagram = function(diagram) {
    this.active = diagram;

    var diagrams = this.diagrams;

    if (diagram) {
      if (diagrams.indexOf(diagram) === -1) {
        diagrams.push(diagram);
      }

      if (!diagram.control) {
        diagram.control = new DiagramControl(diagram);
      }
    }

    this.persist();
  };

  this._closeDiagram = function(diagram) {
    var diagrams = this.diagrams,
        idx = diagrams.indexOf(diagram);

    diagrams.splice(idx, 1);

    if (diagram.control) {
      diagram.control.destroy();
    }

    if (this.isActive(diagram)) {
      this.showDiagram(diagrams[idx] || diagrams[idx - 1]);
    }

    $scope.$applyAsync();
  };

  /**
   * Close the selected diagram, asking the user for
   * the unsaved action, if any.
   *
   * @param  {DiagramFile} diagram
   */
  this.closeDiagram = function(diagram) {

    var self = this;

    if (diagram.control.unsaved) {
      dialog.confirm('Save changes to ' + diagram.name + ' before closing?', {
        cancel: { label: 'Cancel' },
        close: { label: 'Don\'t Save', defaultAction: true },
        save: { label: 'Save' }
      }, function(result) {
        if (result === 'save') {
          self.saveDiagram(diagram, function(err) {
            self._closeDiagram(diagram);
          });
        }

        if (result === 'close') {
          self._closeDiagram(diagram);
        }
      });
    } else {
      self._closeDiagram(diagram);
    }
  };

  this.persist = function() {
    workspace.save(this, function() {
      console.log(arguments);
    });
  };


  this.init = function() {

    var self = this;

    workspace.restore(function(err, config) {
      if (!err) {
        assign(self, config);
      }

      var openEntry = workspace.getOpenEntry();

      if (openEntry) {
        files.loadFile(openEntry, function(err, diagram) {

          console.log(diagram);

          if (!err) {
            self.showDiagram(diagram);
          }

          $scope.$applyAsync();
        });
      } else {
        self.showDiagram(config.active);
        $scope.$applyAsync();
      }
    });
  };

  this.init();
}

module.exports = Editor;