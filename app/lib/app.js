'use strict';

var h = require('virtual-dom/h');

var Root = require('./components/root');

var WriteView = require('./views/write');
var ReadView = require('./views/read');

var inherits = require('inherits');

function App($parent) {
  Root.call(this, $parent);
}

inherits(App, Root);

module.exports = App;

App.prototype.run = function activateView() {
  this.activateView();
};

App.prototype.activateView = function activateView(view) {
  this.activeView = view;

  this.emit('view.activate', view);

  this.changed();
};

App.prototype.render = function render() {
  return h('.bpmn-chrome', [ this.activeView.render() ]);
};

