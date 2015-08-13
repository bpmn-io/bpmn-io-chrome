'use strict';

var Emitter = require('events');

var inherits = require('inherits');

var count = 0;

function Base() {
  this.key = 'c' + count++;
}

inherits(Base, Emitter);

module.exports = Base;


Base.prototype.render = function() {

  if (typeof this.toNode === 'function') {
    return this.toNode();
  }

  throw new Error('subclass responsibility');
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
