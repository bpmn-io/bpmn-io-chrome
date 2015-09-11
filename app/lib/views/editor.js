'use strict';

var inherits = require('inherits');

var h = require('virtual-dom/h');

var View = require('../components/view');

var files = require('../util/files'),
    workspace = require('../util/workspace'),
    assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map'),
    find = require('lodash/collection/find'),
    flatten = require('lodash/array/flatten'),
    DiagramControl = require('../features/diagramControl');

var onDrop = require('../util/on-drop');

var addClassIf = require('../util/dom').addClassIf;


function Editor(app) {
  View.call(this, 'Editor', app);

  this.app = app;

  this.currentDiagram = null;
  this.diagrams = [];
  this.views = {
    diagram: true,
    xml: false
  };

  this.numOfDiagrams = 0;

  debugger;

  this.on('app.init', this.init.bind(this));
  // this.eventBus.on('change', this.currentDiagram.control.redrawDiagram.bind(this));
}

inherits(Editor, View);

module.exports = Editor;


Editor.prototype.canUndo = function() {
  return this.currentDiagram && this.currentDiagram.control.canUndo;
};

Editor.prototype.canRedo = function() {
  return this.currentDiagram && this.currentDiagram.control.canRedo;
};

Editor.prototype.isUnsaved = function() {
  return this.currentDiagram && this.currentDiagram.unsaved;
};

Editor.prototype.isOpen = function() {
  return this.currentDiagram;
};

Editor.prototype.undo = function() {
  if (this.currentDiagram) {
    this.currentDiagram.control.undo();
  }
};

Editor.prototype.redo = function() {
  if (this.currentDiagram) {
    this.currentDiagram.control.redo();
  }
};

Editor.prototype.saveDiagram = function(diagram, options, done) {
  if (typeof options === 'function') {
    done = options;
    options = {};
  }

  function handleSaving(err) {
    console.log(err);

    if (!err) {
      diagram.control.resetEditState();
    }

    this.changed();

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

Editor.prototype.save = function(create) {
  var active = this.currentDiagram;

  if (active) {
    this.saveDiagram(active, { create: create || false }, function(err) {
      console.log(err);
    });
  }
};

Editor.prototype.newDiagram = function() {
  var id = this.numOfDiagrams++;

  var diagram = {
    id: id,
    name: 'diagram_' + id + '.bpmn',
    path: '[unsaved]'
  };

  this.showDiagram(diagram);

  this.emit('diagram.new', diagram);

  this.changed();
};

Editor.prototype.isActive = function(diagram) {
  return this.currentDiagram === diagram;
};

/**
 * Open diagram file via the editor and show it
 */
Editor.prototype.openDiagram = function() {

  files.openFile(function(err, file) {

    if (err) {
      return console.error(err);
    }

    this._openDiagram(file);

    this.changed();
  }.bind(this));
};

Editor.prototype._openDiagram = function(file) {
  if (file) {
    this.diagrams.push(file);
    this.showDiagram(file);

    this.persist();
  }
};

/**
 * Show diagram (or null)
 *
 * @param  {DiagramFile} [diagram]
 */
Editor.prototype.showDiagram = function(diagram) {
  this.currentDiagram = diagram;

  var diagrams = this.diagrams;

  if (diagram) {
    if (diagrams.indexOf(diagram) === -1) {
      diagrams.push(diagram);
    }

    if (!diagram.control) {
      diagram.control = new DiagramControl(this, diagram);
    }
  }

  this.persist();
};

Editor.prototype._closeDiagram = function(diagram) {
  var diagrams = this.diagrams,
      idx = diagrams.indexOf(diagram);

  diagrams.splice(idx, 1);

  if (diagram.control) {
    diagram.control.destroy();
  }

  if (this.isActive(diagram)) {
    this.showDiagram(diagrams[idx] || diagrams[idx - 1]);
  }

  this.changed();
};

/**
 * Close the selected diagram, asking the user for
 * the unsaved action, if any.
 *
 * @param  {DiagramFile} diagram
 */
Editor.prototype.closeDiagram = function(diagram) {

  // if (diagram.unsaved) {
  //   dialog.confirm('Save changes to ' + diagram.name + ' before closing?', {
  //     cancel: { label: 'Cancel' },
  //     close: { label: 'Don\'t Save'},
  //     save: { label: 'Save', defaultAction: true }
  //   }, function(result) {
  //     if (result === 'save') {
  //       this.saveDiagram(diagram, function(err) {
  //         this._closeDiagram(diagram);
  //       });
  //     }

  //     if (result === 'close') {
  //       this._closeDiagram(diagram);
  //     }
  //   }.bind(this));
  // } else {
  //   this._closeDiagram(diagram);
  // }
  this._closeDiagram(diagram);

  this.changed();
};

Editor.prototype.persist = function() {
  workspace.save(this, function() {
    console.log(arguments);
  });
};

Editor.prototype.toggleView = function(name) {
  var view = name;

  return function() {
    var views = Object.keys(this.views);
    var idx = views.indexOf(view);

    this.views[view] = !this.views[view];

    if(!this.views.diagram && !this.views.xml) {
      views.splice(idx, 1);
      this.views[views[0]] = true;
    }

    this.changed();

  }.bind(this);
};

Editor.prototype.isActiveView = function(name) {
  return this.views[name];
};


Editor.prototype.onDiagramDrop = function(callback) {

  // Support dropping a single file onto this app.
  var dnd = onDrop('body', function(data) {
    console.log(data);

    var entry;

    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      if (item.kind == 'file' && item.webkitGetAsEntry()) {
        entry = item.webkitGetAsEntry();
        break;
      }
    }

    if (entry) {
      files.loadFile(entry, callback);
    } else {
      callback(new Error('not a diagram file'));
    }
  });
};

Editor.prototype.init = function() {

  console.debug('[editor]', 'restoring workspace');
  debugger;

  workspace.restore(function(err, config) {
    console.debug('[editor]', 'done');

    if (!err) {
      assign(this, config);
    }

    var openEntry = workspace.getOpenEntry();

    if (openEntry) {
      console.debug('[editor]', 'open diagram', openEntry);

      files.loadFile(openEntry, function(err, diagram) {

        if (!err) {
          this.showDiagram(diagram);
        }

        // apply changes
        this.changed();
        // $scope.$applyAsync();
      }.bind(this));
    } else {
      this.showDiagram(config.active);

      // apply changes
      this.changed();
      // $scope.$applyAsync();
    }
  }.bind(this));



  this.onDiagramDrop(function(err, file) {

    if (err) {
      return console.error(err);
    }

    this._openDiagram(file);

    // apply changes
    this.changed();
    // $scope.$applyAsync();
  }.bind(this));

  function modifierPressed(event) {
    return event.metaKey || event.ctrlKey;
  }

  document.addEventListener('keydown', function(e) {

    if (!modifierPressed(e)) {
      return;
    }

    // save - 83 (S) + meta/ctrl
    if (e.keyCode === 83) {
      e.preventDefault();
      this.save();
    }

    // save as - 83 (S) + meta/ctrl + shift
    if (e.keyCode === 83 && e.shiftKey) {
      e.preventDefault();
      this.save(true);
    }

    // open - 79 (O) + meta/ctrl
    if (e.keyCode === 79) {
      e.preventDefault();
      this.openDiagram();
    }

    // new diagram - (T/N) 84 + meta/ctrl
    if (e.keyCode === 84 || e.keyCode === 78) {
      e.preventDefault();
      this.newDiagram();
    }

    // close tab - (W) - 87 + meta/ctrl
    if (e.keyCode === 87 && this.currentDiagram) {
      e.preventDefault();
      this.closeDiagram(this.currentDiagram);
    }
  }.bind(this));
};

Editor.prototype.selectDiagram = function(evt) {
  var name = evt.target['data-diagram'];

  var diagram = find(this.diagrams, function(elem) {
    return elem.name === name;
  });

  this.showDiagram(diagram);
};

Editor.prototype.renderTabs = function() {
  var tabs = map(this.diagrams, function(diagram) {
    var active = diagram.active,
        anchor = [];

    if (diagram.unsaved) {
      anchor.push(h('span', '*'));
    }

    anchor.push(diagram.name);

    anchor.push(h('button.close', {
      'ev-click': this.closeDiagram.bind(this),
      'data-diagram': diagram.id
    }, 'x'));

    return h('li.entry' + '.' + diagram.active, [
      h('a', {
        title: diagram.name,
        'ev-click': this.selectDiagram.bind(this),
        'data-diagram': diagram.id
      }, anchor)
    ]);
  }, this);

  return flatten([
    tabs,
    h(addClassIf('li.entry', this.isOpen(), 'active'), [
      h('a', { 'ev-click': this.newDiagram.bind(this) }, '+')
    ])
  ]);
};

Editor.prototype.renderDiagrams = function() {
  var viewSelector,
      diagramTabSelector = 'li',
      xmlTabSelector = 'li';

  if (this.isActiveView('diagram')) {
    viewSelector = '.content.show-diagram';
    diagramTabSelector = 'li.active-diagram';
  }

  if (this.isActiveView('xml')) {
    viewSelector = '.content.show-xml';
    xmlTabSelector = 'li.active-xml';
  }
  if (!this.isOpen()) {
    return h(viewSelector, [
      h('.bio-diagram', [
        h('.bio-landing-page', [
          h('h1', 'No open BPMN diagram'),
          h('p', [
            h('button', { 'ev-click': this.newDiagram.bind(this) }, 'create diagram'),
            h('button', { 'ev-click': this.openDiagram.bind(this) }, 'open from file system')
          ])
        ])
      ])
    ]);
  }

  var diagrams = map(this.diagrams, function(diagram) {
    if (!this.isActive(diagram)) {
      return;
    }

    return h('.bio-diagram.tabs', [
      h('.tab', { 'data-tab': 'diagram'}),
      h('.tab', { 'data-tab': 'xml' }, [
        h('textarea', { spellcheck: false })
      ]),
      h('.tabbar.tabbar-bottom', [
        h('ul', [
          h(diagramTabSelector, [
            h('a', { 'ev-click': this.toggleView('diagram').bind(this) }, 'Diagram')
          ]),
          h(xmlTabSelector, [
            h('a', { 'ev-click': this.toggleView('xml').bind(this) }, 'XML')
          ])
        ])
      ])
    ]);
  }, this);

  return h(viewSelector, diagrams);
};


Editor.prototype.toNode = function() {
  return this.renderView([
    h('.tabbar.tabbar-default', [
      h('ul', [
        this.renderTabs(),
        this.renderDiagrams()
      ])
    ])
  ]);
};
