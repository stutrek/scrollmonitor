export declare const VISIBILITYCHANGE = "visibilityChange";
export declare const ENTERVIEWPORT = "enterViewport";
export declare const FULLYENTERVIEWPORT = "fullyEnterViewport";
export declare const EXITVIEWPORT = "exitViewport";
export declare const PARTIALLYEXITVIEWPORT = "partiallyExitViewport";
export declare const LOCATIONCHANGE = "locationChange";
export declare const STATECHANGE = "stateChange";
export declare const eventTypes: readonly ["visibilityChange", "enterViewport", "fullyEnterViewport", "exitViewport", "partiallyExitViewport", "locationChange", "stateChange"];
export declare const isOnServer: boolean;
export declare const isInBrowser: boolean;
export declare const defaultOffsets: {
    readonly top: 0;
    readonly bottom: 0;
};
