'use strict';

var inherits = require('inherits');

var h = require('virtual-dom/h');

var Child = require('../components/child');

var _ = require('lodash');


function Tabs(editor) {
  Child.call(this);

  // Bootstrap
  this.editor = editor;
}

inherits(Tabs, Child);

module.exports = Tabs;


Tabs.prototype.renderTabs = function() {
  return _.map(this.editor.diagrams, function(diagram) {
    var active = diagram.active,
        anchor = [];

    if (diagram.unsaved) {
      anchor.push(h('span', '*'));
    }

    anchor.push(diagram.name);

    // 'this.closeDiagram.bind(this)'
    anchor.push(h('button.close', {
      'ev-click': this.editor.closeDiagram.bind(this),
      'data-diagram': diagram.id
    }, 'x'));

    return h('li.entry' + '.' + diagram.active, [
      h('a', { title: diagram.path }, anchor)
    ]);
  }, this);
};

Tabs.prototype.toNode = function() {
  var isEditorOpen = '.active';

  return h('.tabbar.tabbar-default', [
    h('ul', [
      this.renderTabs(),
      h('li.entry' + isEditorOpen, [
        h('a', { 'ev-click': this.newDiagram }, '+')
      ])
    ])
  ]);
};
