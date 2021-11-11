import type { Watcher } from './watcher.js';

export type EventName =
    | 'visibilityChange'
    | 'enterViewport'
    | 'fullyEnterViewport'
    | 'exitViewport'
    | 'partiallyExitViewport'
    | 'locationChange'
    | 'stateChange';

export type WatchItemInput =
    | HTMLElement
    | { top: number; bottom: number }
    | number
    | NodeList
    | HTMLElement[]
    | string;

export type WatchItem = HTMLElement | { top: number; bottom: number } | number;

export type Offsets =
    | number
    | { top: number; bottom: number }
    | { top: number }
    | { bottom: number };

export type ScrollEvent = Parameters<typeof window.onscroll>[0];

export type Listener = (event: ScrollEvent | undefined, watcher: Watcher) => void;
