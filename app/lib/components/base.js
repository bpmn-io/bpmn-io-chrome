'use strict';

var inherits = require('inherits');

var EventBus = require('../services/eventBus').class;

var count = 0;

function Base() {
  EventBus.call(this);

  this.key = 'c' + count++;
}

inherits(Base, EventBus);

module.exports = Base;


Base.prototype.render = function() {

  if (typeof this.toNode === 'function') {
    return this.toNode();
  }

  throw new Error('sublcass responsibility');
};


Base.prototype.changed = function(child) {

  var component = child || this;

  if (component === this) {
    this.dirty = true;
  }

  this.emit('changed', component);

  if (this.parent) {
    this.parent.changed(component);
  }
};
