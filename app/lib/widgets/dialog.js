'use strict';

var inherits = require('inherits');

var h = require('virtual-dom/h');

var Child = require('../components/child');

var map = require('lodash/collection/map');

var addClassIf = require('../util/dom').addClassIf;


function Dialog(app) {
  Child.call(this);
}

inherits(Dialog, Child);

module.exports = Dialog;

/*
'Save changes to ' + diagram.name + ' before closing?', {
      cancel: { label: 'Cancel' },
      close: { label: 'Don\'t Save'},
      save: { label: 'Save', defaultAction: true }
}
*/

Dialog.prototype.getAnswer = function(evt) {
  console.log(evt);
};

Dialog.prototype.confirm = function(message, buttons, cb) {
  this.triggered = true;

  var buttonsTags = map(buttons, function(button) {
    return h(addClassIf('button', button.defaultAction, 'primary'), {
      'ev-click': this.getAnswer.bind(this),
      autofocus: true
    }, button.label);
  }, this);

  this.dialog = h('.dialog', [
    h('.content', [ h('p', message ) ]),
    h('.buttons', [ buttonsTags ])
  ]);

  // this.attachTo(this.app);
};

Dialog.prototype.toNode = function() {
  return this.render(this.dialog);
};
