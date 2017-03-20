var { isInBrowser } = require('./src/constants');

var ScrollMonitorContainer = require('./src/container');

var scrollMonitor = new ScrollMonitorContainer(isInBrowser ? document.body : null);
scrollMonitor.setStateFromDOM(null);
scrollMonitor.listenToDOM();

module.exports = scrollMonitor;
