import { isOnServer } from './src/constants';

import ScrollMonitorContainer from './src/container';

var scrollMonitor = new ScrollMonitorContainer(isOnServer ? null : document.body);

function init () {
	scrollMonitor.setStateFromDOM(null);
	scrollMonitor.listenToDOM();
}
if (document.body) {
	init();
} else {
	document.addEventListener('DOMContentLoaded', init);
}

module.exports = scrollMonitor;
