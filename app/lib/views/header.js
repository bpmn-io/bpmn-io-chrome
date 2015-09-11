'use strict';

var inherits = require('inherits');

var h = require('virtual-dom/h');

var map = require('lodash/collection/map');

var View = require('../components/view');

/*
  Figure out who takes care of executing the actions
 */

function Header(app) {
  View.call(this, 'header', app);

  this.app = app;

  this.elements = [
    {
      type: 'button',
      class: 'icon-new',
      title: 'create new BPMN diagram',
      click: this._emit('tabs.diagrams.new').bind(this)
    },
    {
      type: 'button',
      class: 'icon-open',
      title: 'open a BPMN diagram',
      click: this._emit('file.diagram.open').bind(this)
    },
    {
      type: 'button',
      class: 'icon-save-normal',
      title: 'save BPMN diagram',
      click: this._emit('file.diagram.save').bind(this)
    },
    {
      type: 'button',
      class: 'icon-save-as',
      title: 'save BPMN diagram as..',
      click: this._emit('file.diagram.saveAs').bind(this)
    },
    {
      type: 'span',
      class: 'placeholder'
    },
    {
      type: 'button',
      class: 'icon-undo',
      title: 'undo',
      click: this._emit('control.diagram.undo').bind(this)
    },
    {
      type: 'button',
      class: 'icon-redo',
      title: 'redo',
      click: this._emit('control.diagram.redo').bind(this)
    }
  ];

}

inherits(Header, View);

module.exports = Header;


Header.prototype._emit = function(evt) {
  var event = evt;

  return function() {
    this.emit(event);
  };
};

Header.prototype.renderElements = function() {
  return map(this.elements, function(elem) {
    var tag = elem.type + '.' + elem.class;

    if (!elem.click) {
      return h(tag);
    }

    return h(tag, {
      title: elem.title,
      'ev-click': elem.click
    });
  });
};

Header.prototype.toNode = function() {
  return h('.bio-header', [
    h('a.logo', {
      href: 'http://bpmn.io',
      target: '_blank'
    }, [
      h('span.icon-bpmn-io')
    ]),
    h('nav.menu-bar', this.renderElements())
  ]);
};
