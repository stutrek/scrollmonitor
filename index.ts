export { ScrollMonitorContainer } from './src/container.js';
export { Watcher } from './src/watcher.js';
export * from './src/types';

import { isInBrowser } from './src/constants.js';
import { ScrollMonitorContainer } from './src/container.js';

// this is needed for the type, but if we're not in a browser the only
// way listenToDOM will be called is if you call scrollmonitor.createContainer
// and you can't do that until you have a DOM element.
const scrollMonitor = new ScrollMonitorContainer(
    isInBrowser ? document.body : (undefined as unknown as HTMLElement)
);
if (isInBrowser) {
    scrollMonitor.updateState();
    scrollMonitor.listenToDOM();
    //@ts-ignore
    window.scrollMonitor = scrollMonitor;
}

export default scrollMonitor;
