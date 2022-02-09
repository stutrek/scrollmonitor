export var VISIBILITYCHANGE = 'visibilityChange';
export var ENTERVIEWPORT = 'enterViewport';
export var FULLYENTERVIEWPORT = 'fullyEnterViewport';
export var EXITVIEWPORT = 'exitViewport';
export var PARTIALLYEXITVIEWPORT = 'partiallyExitViewport';
export var LOCATIONCHANGE = 'locationChange';
export var STATECHANGE = 'stateChange';
export var eventTypes = [
    VISIBILITYCHANGE,
    ENTERVIEWPORT,
    FULLYENTERVIEWPORT,
    EXITVIEWPORT,
    PARTIALLYEXITVIEWPORT,
    LOCATIONCHANGE,
    STATECHANGE,
];
export var isOnServer = typeof window === 'undefined';
export var isInBrowser = !isOnServer;
export var defaultOffsets = { top: 0, bottom: 0 };
//# sourceMappingURL=constants.js.map