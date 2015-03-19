var map = require('lodash/collection/map'),
    find = require('lodash/collection/find'),
    assign = require('lodash/object/assign');

var angular = require('angular'),
    ngDialog = require('ng-dialog');


var ngModule = module.exports = angular.module('app.dialog', [
  ngDialog.name
]);


var confirmTemplate = require('./confirm.html');

ngModule.factory('dialog', [ 'ngDialog', '$rootScope', function(ngDialog, $rootScope) {

  return {
    confirm: function(message, choices, done) {

      var buttons = map(choices, function(val, key) {
        return assign({}, val, { key: key });
      });

      var scope = assign($rootScope.$new(), {
        message: message,
        buttons: buttons
      });

      var dialog = ngDialog.open({
        template: confirmTemplate,
        plain: true,
        scope: scope
      });

      dialog.closePromise.then(function(result) {

        scope.$destroy();

        done(result.value);
      });
    }
  };

}]);