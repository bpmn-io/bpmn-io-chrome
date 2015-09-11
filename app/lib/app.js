'use strict';

var h = require('virtual-dom/h');

var Root = require('./components/root');

var Header = require('./views/header');
var Editor = require('./views/editor');

var inherits = require('inherits');

function App($parent) {
  Root.call(this, $parent);

  // Bootstrap Views
  this.header = new Header(this);
  this.editor = new Editor(this);
}

inherits(App, Root);

module.exports = App;


App.prototype.run = function activateView() {
  this.emit('app.init');

  this.changed();
};

App.prototype.render = function render() {
  return h('.container', [
    this.header.render(),
    h('.bio-content', [
      h('.bio-diagrams.tabs', [
        this.editor.render()
      ])
    ])
  ]);
};
