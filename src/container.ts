import { isOnServer, isInBrowser, eventTypes } from './constants.js';
import { WatchItem, Offsets, WatchItemInput, ScrollEvent } from './types.js';
import { Watcher } from './watcher.js';

function getViewportHeight(element: HTMLElement) {
    if (isOnServer) {
        return 0;
    }
    if (element === document.body) {
        return window.innerHeight || document.documentElement.clientHeight;
    } else {
        return element.clientHeight;
    }
}

function getContentHeight(element: HTMLElement) {
    if (isOnServer) {
        return 0;
    }

    if (element === document.body) {
        // jQuery approach
        // whichever is greatest
        return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.documentElement.clientHeight
        );
    } else {
        return element.scrollHeight;
    }
}

function scrollTop(element: HTMLElement) {
    if (isOnServer) {
        return 0;
    }
    if (element === document.body) {
        return (
            window.pageYOffset ||
            (document.documentElement && document.documentElement.scrollTop) ||
            document.body.scrollTop
        );
    } else {
        return element.scrollTop;
    }
}

var browserSupportsPassive = false;
if (isInBrowser) {
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function () {
                browserSupportsPassive = true;
            },
        });
        window.addEventListener('test', null, opts);
    } catch (e) {}
}
const useCapture = browserSupportsPassive ? { capture: false, passive: true } : false;

export class ScrollMonitorContainer {
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

    eventTypes = eventTypes;

    constructor(item: HTMLElement, parentWatcher?: ScrollMonitorContainer) {
        var self = this;

        this.item = item;
        this.watchers = [];
        this.viewportTop = null;
        this.viewportBottom = null;
        this.documentHeight = getContentHeight(item);
        this.viewportHeight = getViewportHeight(item);
        this.DOMListener = function () {
            ScrollMonitorContainer.prototype.DOMListener.apply(self, arguments);
        };

        if (parentWatcher) {
            this.containerWatcher = parentWatcher.create(item);
        }

        var previousDocumentHeight: number;

        var calculateViewportI;
        function calculateViewport() {
            self.viewportTop = scrollTop(item);
            self.viewportBottom = self.viewportTop + self.viewportHeight;
            self.documentHeight = getContentHeight(item);
            if (self.documentHeight !== previousDocumentHeight) {
                calculateViewportI = self.watchers.length;
                while (calculateViewportI--) {
                    self.watchers[calculateViewportI].recalculateLocation();
                }
                previousDocumentHeight = self.documentHeight;
            }
        }

        var updateAndTriggerWatchersI;
        function updateAndTriggerWatchers() {
            // update all watchers then trigger the events so one can rely on another being up to date.
            updateAndTriggerWatchersI = self.watchers.length;
            while (updateAndTriggerWatchersI--) {
                self.watchers[updateAndTriggerWatchersI].update();
            }

            updateAndTriggerWatchersI = self.watchers.length;
            while (updateAndTriggerWatchersI--) {
                self.watchers[updateAndTriggerWatchersI].triggerCallbacks(undefined);
            }
        }

        this.update = function () {
            calculateViewport();
            updateAndTriggerWatchers();
        };
        this.recalculateLocations = function () {
            this.documentHeight = 0;
            this.update();
        };
    }

    listenToDOM() {
        if (isInBrowser) {
            if (this.item === document.body) {
                window.addEventListener('scroll', this.DOMListener, useCapture);
            } else {
                this.item.addEventListener('scroll', this.DOMListener, useCapture);
            }
            window.addEventListener('resize', this.DOMListener);

            this.destroy = function () {
                if (this.item === document.body) {
                    window.removeEventListener('scroll', this.DOMListener, useCapture);
                    this.containerWatcher.destroy();
                } else {
                    this.item.removeEventListener('scroll', this.DOMListener, useCapture);
                }
                window.removeEventListener('resize', this.DOMListener);
            };
        }
    }

    destroy() {
        // noop, override for your own purposes.
        // in listenToDOM, for example.
    }

    DOMListener(event: ScrollEvent) {
        //alert('got scroll');
        this.updateState();
        this.updateAndTriggerWatchers(event);
    }

    updateState() {
        var viewportTop = scrollTop(this.item);
        var viewportHeight = getViewportHeight(this.item);
        var contentHeight = getContentHeight(this.item);

        var needsRecalcuate =
            viewportHeight !== this.viewportHeight || contentHeight !== this.contentHeight;

        this.viewportTop = viewportTop;
        this.viewportHeight = viewportHeight;
        this.viewportBottom = viewportTop + viewportHeight;
        this.contentHeight = contentHeight;

        if (needsRecalcuate) {
            let i = this.watchers.length;
            while (i--) {
                this.watchers[i].recalculateLocation();
            }
        }
    }

    updateAndTriggerWatchers(event: ScrollEvent) {
        let i = this.watchers.length;
        while (i--) {
            this.watchers[i].update();
        }

        i = this.watchers.length;
        while (i--) {
            this.watchers[i].triggerCallbacks(event);
        }
    }

    createContainer(input: HTMLElement | NodeList | HTMLElement[] | string) {
        let item: HTMLElement;
        if (typeof input === 'string') {
            item = document.querySelector(input) as HTMLElement;
        } else if (Array.isArray(input) || input instanceof NodeList) {
            item = input[0] as HTMLElement;
        } else {
            item = input;
        }
        var container = new ScrollMonitorContainer(item, this);
        this.updateState();
        container.listenToDOM();
        return container;
    }

    create(input: WatchItemInput, offsets?: Offsets) {
        let item: WatchItem;
        if (typeof item === 'string') {
            item = document.querySelector(item);
        } else if (Array.isArray(input) || input instanceof NodeList) {
            item = input[0] as HTMLElement;
        } else {
            item = input as WatchItem;
        }
        var watcher = new Watcher(this, item, offsets);
        this.watchers.push(watcher);
        return watcher;
    }

    /**
     * @deprecated since version 1.1
     */
    beget(input: WatchItemInput, offsets?: Offsets) {
        return this.create(input, offsets);
    }
}
