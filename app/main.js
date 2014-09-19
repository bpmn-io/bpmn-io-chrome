chrome.app.runtime.onLaunched.addListener(function(launchData) {
  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = 1024;
  var height = 768;

  chrome.app.window.create('index.html', {
    id: "bpmn-js-chrome",
    innerBounds: {
      width: width,
      height: height,
    }
  }, function(win) {
    win.contentWindow.launchData = launchData;
  });

});
