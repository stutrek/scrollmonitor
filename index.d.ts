declare module 'scrollmonitor' {
  export const scrollMonitor: ScrollMonitorContainer;
  export default scrollMonitor;

  export class ScrollMonitorContainer {
    viewportTop: number;
    viewportBottom: number;
    viewportHeight: number;
    documentHeight: number;

    constructor(containerEl: HTMLElement);

    create: (
      watchItem: HTMLElement | object | number | NodeList | Array<any> | string,
      offsets?: Offsets | number
    ) => Watcher;

    update: () => void;
    recalculateLocations: () => void;

    createContainer: (containerEl: HTMLElement) => ScrollMonitorContainer;
  }

  export interface Watcher {
    isInViewport: boolean;
    isFullyInViewport: boolean;
    isAboveViewport: boolean;
    isBelowViewport: boolean;
    top: number;
    bottom: number;
    height: number;
    watchItem: HTMLElement | object | number;
    offsets: Offsets;

    // Events
    visibilityChange: (callback: () => void) => void;
    stateChange: (callback: () => void) => void;
    enterViewport: (callback: () => void) => void;
    fullyEnterViewport: (callback: () => void) => void;
    exitViewport: (callback: () => void) => void;
    partiallyExitViewport: (callback: () => void) => void;

    // Functions
    on: () => void;
    off: () => void;
    one: () => void;
    recalculateLocation: () => void;
    destroy: () => void;
    lock: () => void;
    unlock: () => void;
    update: () => void;
    triggerCallbacks: () => void;
  }

  export interface Offsets {
    top?: number;
    bottom?: number;
  }
}
