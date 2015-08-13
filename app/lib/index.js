var domReady = require('domReady');
var raf = require('raf');

var delegator = require('dom-delegator');

var App = require('./app');

delegator();

// Try without domReady


domReady(function() {
  var app = new App('body');

  global.app = app;

  app.on('changed', function(component) {
    raf(function() {
      component.update();
    });
  });

  app.run();
});
