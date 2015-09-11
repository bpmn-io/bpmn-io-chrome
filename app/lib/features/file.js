'use strict';

var inherits = require('inherits');

var h = require('virtual-dom/h');

var EventBus = require('../services/eventBus').class;

var files = require('../util/files'),
    workspace = require('../util/workspace');

function File() {
  EventBus.call(this);

  this.currentDiagram = null;

  this.on('file.diagram.open', this.openDiagram.bind(this));
}

inherits(File, EventBus);

module.exports = File;


File.prototype.isActive = function(diagram) {
  return this.currentDiagram === diagram;
};

File.prototype.isUnsaved = function() {
  return this.currentDiagram && this.currentDiagram.unsaved;
};

File.prototype.isOpen = function() {
  return this.currentDiagram;
};

File.prototype.saveDiagram = function(diagram, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  function handleSaving(err) {
    console.log(err);

    if (!err) {
      diagram.control.resetEditState();
    }

    // apply changes
    this.changed();
    // $scope.$applyAsync();

    return done(err);
  }

  diagram.control.save(function(err, xml) {
    if (err) {
      return done(err);
    } else {
      diagram.contents = xml;

      files.saveFile(diagram, options, handleSaving.bind(this));
    }
  }.bind(this));
};

File.prototype.save = function(create) {
  var active = this.currentDiagram;

  if (active) {
    this.saveDiagram(active, { create: create || false }, function(err) {
      console.log(err);
    });
  }
};


/**
 * Open diagram file via the File and show it
 */
File.prototype.openDiagram = function() {

  var self = this;

  files.openFile(function(err, file) {

    if (err) {
      return console.error(err);
    }

    self._openDiagram(file);

    // apply changes
    this.changed();
    // $scope.$applyAsync();
  }.bind(this));
};

File.prototype._openDiagram = function(file) {
  if (file) {
    this.emit('tabs.diagram.new', file);

    this.persist();
  }
};

File.prototype.persist = function() {
  workspace.save(this, function() {
    console.log(arguments);
  });
};
