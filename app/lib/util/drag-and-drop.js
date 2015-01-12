var domEvent = require('min-dom/lib/event'),
    domQuery = require('min-dom/lib/query');

var dropCls = 'dropping';

function DnDFileController(selector, onDropCallback) {

  var $el = domQuery(selector);
  var $elClasses = domClasses($el);

  var overCount = 0;

  this.dragenter = function(e) {
    e.stopPropagation();
    e.preventDefault();
    overCount++;

    $elClasses.add(dropCls);
  };

  this.dragover = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  this.dragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();

    if (--overCount <= 0) {
      $elClasses.remove(dropCls);
      overCount = 0;
    }
  };

  this.drop = function(e) {
    e.stopPropagation();
    e.preventDefault();

    $elClasses.remove(dropCls);

    onDropCallback(e.dataTransfer);
  };

  domEvent.on($el, 'dragenter', this.dragenter);
  domEvent.on($el, 'dragover', this.dragover);
  domEvent.on($el, 'dragleave', this.dragleave);
  domEvent.on($el, 'drop', this.drop);
}

module.exports.Controller = DnDFileController;