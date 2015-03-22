var map = require('lodash/collection/map'),
    find = require('lodash/collection/find'),
    assign = require('lodash/object/assign');

var angular = require('angular'),
    Dialog = require('simple-dialog');


var ngModule = module.exports = angular.module('app.dialog', [ ]);



var confirmTemplate = require('./confirm.html');

ngModule.factory('ngSimpleDialog', [ '$compile', '$rootScope', function($compile, $rootScope) {

  function getBody(dialog) {
    return dialog.element.querySelector('.dlg-body');
  }

  function NgDialog(options) {

    if (!(this instanceof NgDialog)) {
      return new NgDialog(options);
    }

    Dialog.call(this, options);

    var body = getBody(this);
    var linkBody = $compile(angular.element(body));

    this.on('pre-open', function() {
      var scope = this.scope = $rootScope.$new();

      assign(scope, options.scope || {}, { dialog: this });

      var newBody = linkBody(scope),
          oldBody = getBody(this);

      angular.element(oldBody).replaceWith(newBody);
    });

    this.on('close', function() {
      var scope = this.scope;

      delete this.scope;

      scope.$applyAsync();
      scope.$destroy();
    });

    this.on('open', function() {
      var element = this.element;

      setTimeout(function() {
        angular.element(element).find('[autofocus]').eq(0).focus();
      }, 0);
    });
  }

  NgDialog.prototype = Object.create(Dialog.prototype);


  /**
   * Users may pass a scope argument that will be exposed inside the dialog template.
   *
   * @param  {Object} options
   * @return {SimpleDialog}
   */
  return function(options) {
    return NgDialog(options);
  };
}]);


ngModule.factory('dialog', [ 'ngSimpleDialog', '$rootScope', function(ngSimpleDialog) {

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