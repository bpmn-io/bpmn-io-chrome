'use strict';

var h = require('virtual-dom/h');

var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var createElement = require('virtual-dom/create-element');

var inherits = require('inherits');

var Base = require('./base');

function Root($parent) {

  Base.call(this);

  this.node = h('div');

  this.$el =createElement(this.node);

  if ($parent) {
    this.attachTo($parent);
  }
}

module.exports = Root;

inherits(Root, Base);


Root.prototype.attachTo = function attachTo($parent) {
  if (typeof $parent === 'string') {
    $parent = document.querySelector($parent);
  }

  $parent.appendChild(this.$el);

  return this;
};

Root.prototype.detach = function detach() {
  var $el = this.$el,
      $parent = $el.parentNode;

  if ($parent) {
    this.emit('detach', $parent);

    $parent.removeChild($el);
  }
};

Root.prototype.update = function update() {
  var $el = this.$el,
      $parent = $el.parentNode;

  if (!parent) {
    return;
  }

  var node = this.node,
      newNode = this.render();

  var patches = diff(node, newNode);

  this.$el = patch($el, patches);
  this.node = newNode;

  this.dirty = false;
};
