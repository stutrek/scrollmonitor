import type { ScrollMonitorContainer } from './container.js';
import type { EventName, Listener, Offsets, ScrollEvent, WatchItem } from './types';
export declare class Watcher {
    container: ScrollMonitorContainer;
    watchItem: WatchItem;
    constructor(container: ScrollMonitorContainer, watchItem: WatchItem, offsets: Offsets);
    height: number;
    top: number;
    bottom: number;
    offsets: {
        top: number;
        bottom: number;
    };
    isInViewport: boolean;
    isFullyInViewport: boolean;
    isAboveViewport: boolean;
    isBelowViewport: boolean;
    locked: boolean;
    callbacks: Record<string, {
        callback: Listener;
        isOne: boolean;
    }[]>;
    triggerCallbacks: (event: ScrollEvent) => void;
    recalculateLocation: () => void;
    visibilityChange: (callback: Listener, isOne: boolean) => void;
    enterViewport: (callback: Listener, isOne: boolean) => void;
    fullyEnterViewport: (callback: Listener, isOne: boolean) => void;
    exitViewport: (callback: Listener, isOne: boolean) => void;
    partiallyExitViewport: (callback: Listener, isOne: boolean) => void;
    locationChange: (callback: Listener, isOne: boolean) => void;
    stateChange: (callback: Listener, isOne: boolean) => void;
    on(event: EventName, callback: Listener, isOne?: boolean): void;
    off(event: EventName, callback: Listener): void;
    one(event: EventName, callback: Listener): void;
    recalculateSize(): void;
    update(): void;
    destroy(): void;
    lock(): void;
    unlock(): void;
}
