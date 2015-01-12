var map = require('lodash/collection/map'),
    find = require('lodash/collection/find'),
    assign = require('lodash/object/assign');

module.exports.confirm = function(message, choices, done) {

  var buttons = map(choices, function(val, key) {
    return assign({}, val, { key: key });
  });

  done(find(buttons, function(b) { return b.defaultAction; }).key);
};