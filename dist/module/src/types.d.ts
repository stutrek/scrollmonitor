import type { Watcher } from './watcher.js';
export declare type EventName = 'visibilityChange' | 'enterViewport' | 'fullyEnterViewport' | 'exitViewport' | 'partiallyExitViewport' | 'locationChange' | 'stateChange';
export declare type WatchItemInput = HTMLElement | {
    top: number;
    bottom: number;
} | number | NodeList | HTMLElement[] | string;
export declare type WatchItem = HTMLElement | {
    top: number;
    bottom: number;
} | number;
export declare type Offsets = number | {
    top: number;
    bottom: number;
} | {
    top: number;
} | {
    bottom: number;
};
export declare type ScrollEvent = Parameters<typeof window.onscroll>[0];
export declare type Listener = (event: ScrollEvent | undefined, watcher: Watcher) => void;
