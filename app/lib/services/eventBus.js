'use strict';

var Emitter = require('events');

var inherits = require('inherits');

function Events() {}

inherits(Events, Emitter);


function EventBus() {
  this._events = instance;

  this.on = function(event, fn, that) {
    if (that) {
      return this._events.on(event, fn.bind(that));
    }
    this._events.on(event, fn);
  };

  this.emit = function(event, args, that) {
    if (typeof args === 'function') {
      return this._events.emit(event, args.bind(that));
    }

    this._events.emit(event, args);
  };
}

var instance = new Events();

module.exports = instance;

module.exports.class = EventBus;
