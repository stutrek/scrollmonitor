import { Offsets, WatchItemInput, ScrollEvent } from './types.js';
import { Watcher } from './watcher.js';
export declare class ScrollMonitorContainer {
    item: HTMLElement;
    watchers: Watcher[];
    viewportTop: number;
    viewportBottom: number;
    documentHeight: number;
    viewportHeight: number;
    contentHeight: number;
    containerWatcher: Watcher | undefined;
    update: () => void;
    recalculateLocations: () => void;
    eventTypes: readonly ["visibilityChange", "enterViewport", "fullyEnterViewport", "exitViewport", "partiallyExitViewport", "locationChange", "stateChange"];
    constructor(item: HTMLElement, parentWatcher?: ScrollMonitorContainer);
    listenToDOM(): void;
    destroy(): void;
    DOMListener(event: ScrollEvent): void;
    updateState(): void;
    updateAndTriggerWatchers(event: ScrollEvent): void;
    createContainer(input: HTMLElement | NodeList | HTMLElement[] | string): ScrollMonitorContainer;
    create(input: WatchItemInput, offsets?: Offsets): Watcher;
    /**
     * @deprecated since version 1.1
     */
    beget(input: WatchItemInput, offsets?: Offsets): Watcher;
}
