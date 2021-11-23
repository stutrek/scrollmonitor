(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./constants.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Watcher = void 0;
    var constants_js_1 = require("./constants.js");
    var Watcher = /** @class */ (function () {
        function Watcher(container, watchItem, offsets) {
            this.container = container;
            this.watchItem = watchItem;
            this.locked = false;
            this.callbacks = {};
            var self = this;
            if (!offsets) {
                this.offsets = constants_js_1.defaultOffsets;
            }
            else if (typeof offsets === 'number') {
                this.offsets = { top: offsets, bottom: offsets };
            }
            else {
                this.offsets = {
                    top: 'top' in offsets ? offsets.top : constants_js_1.defaultOffsets.top,
                    bottom: 'bottom' in offsets ? offsets.bottom : constants_js_1.defaultOffsets.bottom,
                };
            }
            for (var i = 0, j = constants_js_1.eventTypes.length; i < j; i++) {
                self.callbacks[constants_js_1.eventTypes[i]] = [];
            }
            this.locked = false;
            var wasInViewport;
            var wasFullyInViewport;
            var wasAboveViewport;
            var wasBelowViewport;
            var listenerToTriggerListI;
            var listener;
            var needToTriggerStateChange = false;
            function triggerCallbackArray(listeners, event) {
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
            this.triggerCallbacks = function triggerCallbacks(event) {
                if (this.isInViewport && !wasInViewport) {
                    triggerCallbackArray(this.callbacks[constants_js_1.ENTERVIEWPORT], event);
                }
                if (this.isFullyInViewport && !wasFullyInViewport) {
                    triggerCallbackArray(this.callbacks[constants_js_1.FULLYENTERVIEWPORT], event);
                }
                if (this.isAboveViewport !== wasAboveViewport &&
                    this.isBelowViewport !== wasBelowViewport) {
                    triggerCallbackArray(this.callbacks[constants_js_1.VISIBILITYCHANGE], event);
                    // if you skip completely past this element
                    if (!wasFullyInViewport && !this.isFullyInViewport) {
                        triggerCallbackArray(this.callbacks[constants_js_1.FULLYENTERVIEWPORT], event);
                        triggerCallbackArray(this.callbacks[constants_js_1.PARTIALLYEXITVIEWPORT], event);
                    }
                    if (!wasInViewport && !this.isInViewport) {
                        triggerCallbackArray(this.callbacks[constants_js_1.ENTERVIEWPORT], event);
                        triggerCallbackArray(this.callbacks[constants_js_1.EXITVIEWPORT], event);
                    }
                }
                if (!this.isFullyInViewport && wasFullyInViewport) {
                    triggerCallbackArray(this.callbacks[constants_js_1.PARTIALLYEXITVIEWPORT], event);
                }
                if (!this.isInViewport && wasInViewport) {
                    triggerCallbackArray(this.callbacks[constants_js_1.EXITVIEWPORT], event);
                }
                if (this.isInViewport !== wasInViewport) {
                    triggerCallbackArray(this.callbacks[constants_js_1.VISIBILITYCHANGE], event);
                }
                if (needToTriggerStateChange) {
                    needToTriggerStateChange = false;
                    triggerCallbackArray(this.callbacks[constants_js_1.STATECHANGE], event);
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
                }
                else if (this.watchItem === +this.watchItem) {
                    // number
                    if (this.watchItem > 0) {
                        this.top = this.bottom = this.watchItem;
                    }
                    else {
                        this.top = this.bottom = this.container.documentHeight - this.watchItem;
                    }
                }
                else {
                    // an object with a top and bottom property
                    this.top = this.watchItem.top;
                    this.bottom = this.watchItem.bottom;
                }
                this.top -= this.offsets.top;
                this.bottom += this.offsets.bottom;
                this.height = this.bottom - this.top;
                if ((previousTop !== undefined || previousBottom !== undefined) &&
                    (this.top !== previousTop || this.bottom !== previousBottom)) {
                    triggerCallbackArray(this.callbacks[constants_js_1.LOCATIONCHANGE], undefined);
                }
            };
            this.recalculateLocation();
            this.update();
            wasInViewport = this.isInViewport;
            wasFullyInViewport = this.isFullyInViewport;
            wasAboveViewport = this.isAboveViewport;
            wasBelowViewport = this.isBelowViewport;
        }
        Watcher.prototype.on = function (event, callback, isOne) {
            if (isOne === void 0) { isOne = false; }
            // trigger the event if it applies to the element right now.
            switch (true) {
                case event === constants_js_1.VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
                case event === constants_js_1.ENTERVIEWPORT && this.isInViewport:
                case event === constants_js_1.FULLYENTERVIEWPORT && this.isFullyInViewport:
                case event === constants_js_1.EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
                case event === constants_js_1.PARTIALLYEXITVIEWPORT && this.isInViewport && this.isAboveViewport:
                    callback.call(this, this);
                    if (isOne) {
                        return;
                    }
            }
            if (this.callbacks[event]) {
                this.callbacks[event].push({ callback: callback, isOne: isOne });
            }
            else {
                throw new Error('Tried to add a scroll monitor listener of type ' +
                    event +
                    '. Your options are: ' +
                    constants_js_1.eventTypes.join(', '));
            }
        };
        Watcher.prototype.off = function (event, callback) {
            if (this.callbacks[event]) {
                for (var i = 0, item; (item = this.callbacks[event][i]); i++) {
                    if (item.callback === callback) {
                        this.callbacks[event].splice(i, 1);
                        break;
                    }
                }
            }
            else {
                throw new Error('Tried to remove a scroll monitor listener of type ' +
                    event +
                    '. Your options are: ' +
                    constants_js_1.eventTypes.join(', '));
            }
        };
        Watcher.prototype.one = function (event, callback) {
            this.on(event, callback, true);
        };
        Watcher.prototype.recalculateSize = function () {
            if (this.watchItem instanceof HTMLElement) {
                this.height = this.watchItem.offsetHeight + this.offsets.top + this.offsets.bottom;
                this.bottom = this.top + this.height;
            }
        };
        Watcher.prototype.update = function () {
            this.isAboveViewport = this.top < this.container.viewportTop;
            this.isBelowViewport = this.bottom > this.container.viewportBottom;
            this.isInViewport =
                this.top < this.container.viewportBottom && this.bottom > this.container.viewportTop;
            this.isFullyInViewport =
                (this.top >= this.container.viewportTop &&
                    this.bottom <= this.container.viewportBottom) ||
                    (this.isAboveViewport && this.isBelowViewport);
        };
        Watcher.prototype.destroy = function () {
            var index = this.container.watchers.indexOf(this), self = this;
            this.container.watchers.splice(index, 1);
            self.callbacks = {};
        };
        // prevent recalculating the element location
        Watcher.prototype.lock = function () {
            this.locked = true;
        };
        Watcher.prototype.unlock = function () {
            this.locked = false;
        };
        return Watcher;
    }());
    exports.Watcher = Watcher;
    var eventHandlerFactory = function (type) {
        return function (callback, isOne) {
            if (isOne === void 0) { isOne = false; }
            this.on.call(this, type, callback, isOne);
        };
    };
    for (var i = 0, j = constants_js_1.eventTypes.length; i < j; i++) {
        var type = constants_js_1.eventTypes[i];
        Watcher.prototype[type] = eventHandlerFactory(type);
    }
});
//# sourceMappingURL=watcher.js.map