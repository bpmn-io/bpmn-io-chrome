/**
 * The main file that creates the bpmn-io-chrome app main window
 */
chrome.app.runtime.onLaunched.addListener(function(launchData) {

  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = 1024;
  var height = 768;

  chrome.app.window.create('lib/index.html', {
    id: 'bpmn-js-chrome',
    outerBounds: {
      width: width,
      height: height,
      left: Math.round((screenWidth - width) / 2),
      top: Math.round((screenHeight - height) / 2)
    }
  }, function(win) {
    win.contentWindow.launchData = launchData;
  });
});
