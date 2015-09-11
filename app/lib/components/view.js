var h = require('virtual-dom/h');

var inherits = require('inherits');

var Child = require('./child');


function View(name, app) {
  Child.call(this);

  this.app = app;
  this.name = name;

  function activated(view) {

    this.active = view === this;

    if (this.active) {
      this.attachTo(app);
    } else {
      this.detach();
    }
  }

  // this.eventBus.on('view.activate', activated.bind(this));
}

inherits(View, Child);

module.exports = View;


View.prototype.renderView = function renderView(opts, children) {
  var viewSelector = '.view.' + this.name.toLowerCase() + '-view';

  if (this.active) {
      viewSelector += '.active';
  }

  return h(viewSelector, opts, children);
};
