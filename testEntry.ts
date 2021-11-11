import { isInBrowser } from './src/constants.js';
import { ScrollMonitorContainer } from './src/container.js';

if (isInBrowser) {
    var scrollMonitor = new ScrollMonitorContainer(document.body);
    scrollMonitor.updateState();
    scrollMonitor.listenToDOM();
    //@ts-ignore
    window.scrollMonitor = scrollMonitor;
}

export default scrollMonitor;
