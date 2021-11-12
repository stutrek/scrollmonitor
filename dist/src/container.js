import { isOnServer, isInBrowser, eventTypes } from './constants.js';
import { Watcher } from './watcher.js';
function getViewportHeight(element) {
    if (isOnServer) {
        return 0;
    }
    if (element === document.body) {
        return window.innerHeight || document.documentElement.clientHeight;
    }
    else {
        return element.clientHeight;
    }
}
function getContentHeight(element) {
    if (isOnServer) {
        return 0;
    }
    if (element === document.body) {
        // jQuery approach
        // whichever is greatest
        return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
    }
    else {
        return element.scrollHeight;
    }
}
function scrollTop(element) {
    if (isOnServer) {
        return 0;
    }
    if (element === document.body) {
        return (window.pageYOffset ||
            (document.documentElement && document.documentElement.scrollTop) ||
            document.body.scrollTop);
    }
    else {
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
    }
    catch (e) { }
}
var useCapture = browserSupportsPassive ? { capture: false, passive: true } : false;
var ScrollMonitorContainer = /** @class */ (function () {
    function ScrollMonitorContainer(item, parentWatcher) {
        this.eventTypes = eventTypes;
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
        var previousDocumentHeight;
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
    ScrollMonitorContainer.prototype.listenToDOM = function () {
        if (isInBrowser) {
            if (this.item === document.body) {
                window.addEventListener('scroll', this.DOMListener, useCapture);
            }
            else {
                this.item.addEventListener('scroll', this.DOMListener, useCapture);
            }
            window.addEventListener('resize', this.DOMListener);
            this.destroy = function () {
                if (this.item === document.body) {
                    window.removeEventListener('scroll', this.DOMListener, useCapture);
                    this.containerWatcher.destroy();
                }
                else {
                    this.item.removeEventListener('scroll', this.DOMListener, useCapture);
                }
                window.removeEventListener('resize', this.DOMListener);
            };
        }
    };
    ScrollMonitorContainer.prototype.destroy = function () {
        // noop, override for your own purposes.
        // in listenToDOM, for example.
    };
    ScrollMonitorContainer.prototype.DOMListener = function (event) {
        //alert('got scroll');
        this.updateState();
        this.updateAndTriggerWatchers(event);
    };
    ScrollMonitorContainer.prototype.updateState = function () {
        var viewportTop = scrollTop(this.item);
        var viewportHeight = getViewportHeight(this.item);
        var contentHeight = getContentHeight(this.item);
        var needsRecalcuate = viewportHeight !== this.viewportHeight || contentHeight !== this.contentHeight;
        this.viewportTop = viewportTop;
        this.viewportHeight = viewportHeight;
        this.viewportBottom = viewportTop + viewportHeight;
        this.contentHeight = contentHeight;
        if (needsRecalcuate) {
            var i = this.watchers.length;
            while (i--) {
                this.watchers[i].recalculateLocation();
            }
        }
    };
    ScrollMonitorContainer.prototype.updateAndTriggerWatchers = function (event) {
        var i = this.watchers.length;
        while (i--) {
            this.watchers[i].update();
        }
        i = this.watchers.length;
        while (i--) {
            this.watchers[i].triggerCallbacks(event);
        }
    };
    ScrollMonitorContainer.prototype.createContainer = function (input) {
        var item;
        if (typeof input === 'string') {
            item = document.querySelector(input);
        }
        else if (Array.isArray(input) || input instanceof NodeList) {
            item = input[0];
        }
        else {
            item = input;
        }
        var container = new ScrollMonitorContainer(item, this);
        this.updateState();
        container.listenToDOM();
        return container;
    };
    ScrollMonitorContainer.prototype.create = function (input, offsets) {
        var item;
        if (typeof item === 'string') {
            item = document.querySelector(item);
        }
        else if (Array.isArray(input) || input instanceof NodeList) {
            item = input[0];
        }
        else {
            item = input;
        }
        var watcher = new Watcher(this, item, offsets);
        this.watchers.push(watcher);
        return watcher;
    };
    /**
     * @deprecated since version 1.1
     */
    ScrollMonitorContainer.prototype.beget = function (input, offsets) {
        return this.create(input, offsets);
    };
    return ScrollMonitorContainer;
}());
export { ScrollMonitorContainer };
//# sourceMappingURL=container.js.map