var domReady = require('domReady');
var raf = require('raf');

var delegator = require('dom-delegator');

var App = require('./app');

var eventBus = require('./services/eventBus');

delegator();

domReady(function() {
  var app = new App('body');

  global.app = app;

  eventBus.on('changed', function(component) {
    raf(function() {
      component.update();
    });
  });

  app.run();
});
