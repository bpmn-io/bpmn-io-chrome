var map = require('lodash/collection/map'),
    find = require('lodash/collection/find'),
    assign = require('lodash/object/assign');

var angular = require('angular');


var ngModule = module.exports = angular.module('app.dialog', [
  require('ng-simple-dialog')
]);



var confirmTemplate = require('./confirm.html');


ngModule.factory('dialog', [ 'ngSimpleDialog', function(ngSimpleDialog) {

  return {
    confirm: function(message, choices, done) {

      var buttons = map(choices, function(val, key) {
        return assign({}, val, { key: key });
      });

      var scope = {
        message: message,
        buttons: buttons
      };

      var dialog = ngSimpleDialog({
        template: confirmTemplate,
        scope: scope
      }).open().on('close', done);
    }
  };

}]);