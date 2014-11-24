window.onkeyup = function(e) {
  var evt = window.event? event: e;
  if (evt.ctrlKey && evt.keyCode == 90) {
    undoCommand();
  }
  else if (evt.ctrlKey && evt.keyCode == 89) {
    redoCommand();
  }
};
