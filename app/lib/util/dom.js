'use strict';

module.exports.addClassIf = function(tag, condition, clas) {
  if (condition) {
    return tag + '.' + clas;
  }
  return tag;
};
