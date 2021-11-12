import {
    VISIBILITYCHANGE,
    ENTERVIEWPORT,
    FULLYENTERVIEWPORT,
    EXITVIEWPORT,
    PARTIALLYEXITVIEWPORT,
    LOCATIONCHANGE,
    STATECHANGE,
    eventTypes,
    defaultOffsets,
} from './constants.js';

import type { ScrollMonitorContainer } from './container.js';
import type { EventName, Listener, Offsets, ScrollEvent, WatchItem, WatchItemInput } from './types';

type ListenerItem = {
    callback: Listener;
    isOne: boolean;
};

export class Watcher {
    constructor(
        public container: ScrollMonitorContainer,
        public watchItem: WatchItem,
        offsets: Offsets
    ) {
        var self = this;

        if (!offsets) {
            this.offsets = defaultOffsets;
        } else if (typeof offsets === 'number') {
            this.offsets = { top: offsets, bottom: offsets };
        } else {
            this.offsets = {
                top: 'top' in offsets ? offsets.top : defaultOffsets.top,
                bottom: 'bottom' in offsets ? offsets.bottom : defaultOffsets.bottom,
            };
        }

        for (var i = 0, j = eventTypes.length; i < j; i++) {
            self.callbacks[eventTypes[i]] = [];
        }

        this.locked = false;

        var wasInViewport: boolean;
        var wasFullyInViewport: boolean;
        var wasAboveViewport: boolean;
        var wasBelowViewport: boolean;

        var listenerToTriggerListI;
        var listener;
        let needToTriggerStateChange = false;
        function triggerCallbackArray(listeners: ListenerItem[], event: ScrollEvent) {
            needToTriggerStateChange = true;
            if (listeners.length === 0) {
                return;
            }
            listenerToTriggerListI = listeners.length;
            while (listenerToTriggerListI--) {
                listener = listeners[listenerToTriggerListI];
                listener.callback.call(self, event, self);
                if (listener.isOne) {
                    listeners.splice(listenerToTriggerListI, 1);
                }
            }
        }
        this.triggerCallbacks = function triggerCallbacks(event: ScrollEvent) {
            if (this.isInViewport && !wasInViewport) {
                triggerCallbackArray(this.callbacks[ENTERVIEWPORT], event);
            }
            if (this.isFullyInViewport && !wasFullyInViewport) {
                triggerCallbackArray(this.callbacks[FULLYENTERVIEWPORT], event);
            }

            if (
                this.isAboveViewport !== wasAboveViewport &&
                this.isBelowViewport !== wasBelowViewport
            ) {
                triggerCallbackArray(this.callbacks[VISIBILITYCHANGE], event);

                // if you skip completely past this element
                if (!wasFullyInViewport && !this.isFullyInViewport) {
                    triggerCallbackArray(this.callbacks[FULLYENTERVIEWPORT], event);
                    triggerCallbackArray(this.callbacks[PARTIALLYEXITVIEWPORT], event);
                }
                if (!wasInViewport && !this.isInViewport) {
                    triggerCallbackArray(this.callbacks[ENTERVIEWPORT], event);
                    triggerCallbackArray(this.callbacks[EXITVIEWPORT], event);
                }
            }

            if (!this.isFullyInViewport && wasFullyInViewport) {
                triggerCallbackArray(this.callbacks[PARTIALLYEXITVIEWPORT], event);
            }
            if (!this.isInViewport && wasInViewport) {
                triggerCallbackArray(this.callbacks[EXITVIEWPORT], event);
            }
            if (this.isInViewport !== wasInViewport) {
                triggerCallbackArray(this.callbacks[VISIBILITYCHANGE], event);
            }
            if (needToTriggerStateChange) {
                needToTriggerStateChange = false;
                triggerCallbackArray(this.callbacks[STATECHANGE], event);
            }

            wasInViewport = this.isInViewport;
            wasFullyInViewport = this.isFullyInViewport;
            wasAboveViewport = this.isAboveViewport;
            wasBelowViewport = this.isBelowViewport;
        };

        this.recalculateLocation = function () {
            if (this.locked) {
                return;
            }
            var previousTop = this.top;
            var previousBottom = this.bottom;
            if (this.watchItem.nodeName) {
                // a dom element
                var cachedDisplay = this.watchItem.style.display;
                if (cachedDisplay === 'none') {
                    this.watchItem.style.display = '';
                }

                var containerOffset = 0;
                var container = this.container;
                while (container.containerWatcher) {
                    containerOffset +=
                        container.containerWatcher.top -
                        container.containerWatcher.container.viewportTop;
                    container = container.containerWatcher.container;
                }

                var boundingRect = this.watchItem.getBoundingClientRect();
                this.top = boundingRect.top + this.container.viewportTop - containerOffset;
                this.bottom = boundingRect.bottom + this.container.viewportTop - containerOffset;

                if (cachedDisplay === 'none') {
                    this.watchItem.style.display = cachedDisplay;
                }
            } else if (this.watchItem === +this.watchItem) {
                // number
                if (this.watchItem > 0) {
                    this.top = this.bottom = this.watchItem;
                } else {
                    this.top = this.bottom = this.container.documentHeight - this.watchItem;
                }
            } else {
                // an object with a top and bottom property
                this.top = this.watchItem.top;
                this.bottom = this.watchItem.bottom;
            }

            this.top -= this.offsets.top;
            this.bottom += this.offsets.bottom;
            this.height = this.bottom - this.top;

            if (
                (previousTop !== undefined || previousBottom !== undefined) &&
                (this.top !== previousTop || this.bottom !== previousBottom)
            ) {
                triggerCallbackArray(this.callbacks[LOCATIONCHANGE], undefined);
            }
        };

        this.recalculateLocation();
        this.update();

        wasInViewport = this.isInViewport;
        wasFullyInViewport = this.isFullyInViewport;
        wasAboveViewport = this.isAboveViewport;
        wasBelowViewport = this.isBelowViewport;
    }

    height: number;
    top: number;
    bottom: number;
    offsets: { top: number; bottom: number };

    isInViewport: boolean;
    isFullyInViewport: boolean;
    isAboveViewport: boolean;
    isBelowViewport: boolean;

    locked: boolean = false;

    callbacks: Record<string, { callback: Listener; isOne: boolean }[]> = {};
    triggerCallbacks: (event: ScrollEvent) => void;
    recalculateLocation: () => void;

    visibilityChange: (callback: Listener, isOne: boolean) => void;
    enterViewport: (callback: Listener, isOne: boolean) => void;
    fullyEnterViewport: (callback: Listener, isOne: boolean) => void;
    exitViewport: (callback: Listener, isOne: boolean) => void;
    partiallyExitViewport: (callback: Listener, isOne: boolean) => void;
    locationChange: (callback: Listener, isOne: boolean) => void;
    stateChange: (callback: Listener, isOne: boolean) => void;

    on(event: EventName, callback: Listener, isOne = false) {
        // trigger the event if it applies to the element right now.
        switch (true) {
            case event === VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
            case event === ENTERVIEWPORT && this.isInViewport:
            case event === FULLYENTERVIEWPORT && this.isFullyInViewport:
            case event === EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
            case event === PARTIALLYEXITVIEWPORT && this.isInViewport && this.isAboveViewport:
                callback.call(this, this);
                if (isOne) {
                    return;
                }
        }

        if (this.callbacks[event]) {
            this.callbacks[event].push({ callback, isOne });
        } else {
            throw new Error(
                'Tried to add a scroll monitor listener of type ' +
                    event +
                    '. Your options are: ' +
                    eventTypes.join(', ')
            );
        }
    }
    off(event: EventName, callback: Listener) {
        if (this.callbacks[event]) {
            for (var i = 0, item; (item = this.callbacks[event][i]); i++) {
                if (item.callback === callback) {
                    this.callbacks[event].splice(i, 1);
                    break;
                }
            }
        } else {
            throw new Error(
                'Tried to remove a scroll monitor listener of type ' +
                    event +
                    '. Your options are: ' +
                    eventTypes.join(', ')
            );
        }
    }
    one(event: EventName, callback: Listener) {
        this.on(event, callback, true);
    }
    recalculateSize() {
        if (this.watchItem instanceof HTMLElement) {
            this.height = this.watchItem.offsetHeight + this.offsets.top + this.offsets.bottom;
            this.bottom = this.top + this.height;
        }
    }
    update() {
        this.isAboveViewport = this.top < this.container.viewportTop;
        this.isBelowViewport = this.bottom > this.container.viewportBottom;

        this.isInViewport =
            this.top < this.container.viewportBottom && this.bottom > this.container.viewportTop;
        this.isFullyInViewport =
            (this.top >= this.container.viewportTop &&
                this.bottom <= this.container.viewportBottom) ||
            (this.isAboveViewport && this.isBelowViewport);
    }
    destroy() {
        var index = this.container.watchers.indexOf(this),
            self = this;
        this.container.watchers.splice(index, 1);
        self.callbacks = {};
    }
    // prevent recalculating the element location
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
}

var eventHandlerFactory = function (type: EventName) {
    return function (callback: Listener, isOne = false) {
        this.on.call(this, type, callback, isOne);
    };
};

for (var i = 0, j = eventTypes.length; i < j; i++) {
    var type = eventTypes[i];
    Watcher.prototype[type] = eventHandlerFactory(type);
}
