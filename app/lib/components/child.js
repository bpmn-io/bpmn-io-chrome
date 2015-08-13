'use strict';

var h = require('virtual-dom/h');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var createElement = require('virtual-dom/create-element');

var inherits = require('inherits');

var Base = require('./base');


function Child(parent, className) {
  Base.call(this);

  this.parent = parent;

  this.node = h(className);

  this.$el = createElement(this.node);
}

inherits(Child, Base);

module.exports = Child;

Child.prototype.attachTo = function attachTo(parent) {
  if ( this.parent !== parent) {
    this.detach();
  }

  this.parent = parent;

  this.changed();

  return this;
};

Child.prototype.detach = function detach() {
  var parent = this.parent;

  if (parent) {
    this.emit('detach', parent);

    this.parent = null;

    this.changed();

    parent.changed();
  }
};

Child.prototype.isAttached = function isAttached() {
  return !!this.parent;
};

Child.prototype.render = function render() {
  return new Tree(this);
};

Child.prototype.update = function update() {
  this.render().init();
};


function Tree(component) {
  this.component = component;

  this.key = this.component.key;
}

Tree.prototype.type = 'Widget';

Tree.prototype.init = function init() {
  var $el = this.component.$el;
  return this.update(null, $el) || $el;
};

Tree.prototype.update = function update(previous, $el) {
  var component = this.component;

  if (component.dirty === false) {
    return;
  }

  var node = component.node,
      newNode = component.toNode(),
      patches = diff(node, newNode);

  component.$el = patch($el, patches);

  component.node = newNode;
  component.dirty = false;

  if (component.$el !== $el) {
    return component.$el;
  }
};

Tree.prototype.destroy = function destroy() {
  console.log('destroyed');
};
