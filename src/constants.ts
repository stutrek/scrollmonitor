export const VISIBILITYCHANGE = 'visibilityChange';
export const ENTERVIEWPORT = 'enterViewport';
export const FULLYENTERVIEWPORT = 'fullyEnterViewport';
export const EXITVIEWPORT = 'exitViewport';
export const PARTIALLYEXITVIEWPORT = 'partiallyExitViewport';
export const LOCATIONCHANGE = 'locationChange';
export const STATECHANGE = 'stateChange';

export const eventTypes = [
    VISIBILITYCHANGE,
    ENTERVIEWPORT,
    FULLYENTERVIEWPORT,
    EXITVIEWPORT,
    PARTIALLYEXITVIEWPORT,
    LOCATIONCHANGE,
    STATECHANGE,
] as const;

export const isOnServer = typeof window === 'undefined';
export const isInBrowser = !isOnServer;

export const defaultOffsets = { top: 0, bottom: 0 } as const;
