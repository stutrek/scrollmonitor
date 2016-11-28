import { isOnServer } from './src/constants';

import RootItem from './src/root';
import Watcher from './src/watcher';

var scrollMonitor = new RootItem(isOnServer ? null : document.body);
scrollMonitor.setStateFromDOM(null);
scrollMonitor.listenToDOM();

// export { RootItem, Watcher };

module.exports = scrollMonitor;
