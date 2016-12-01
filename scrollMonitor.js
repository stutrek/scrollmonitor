(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("scrollMonitor", [], factory);
	else if(typeof exports === 'object')
		exports["scrollMonitor"] = factory();
	else
		root["scrollMonitor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _constants = __webpack_require__(1);
	
	var _container = __webpack_require__(4);
	
	var _container2 = _interopRequireDefault(_container);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var scrollMonitor = new _container2.default(_constants.isInBrowser ? document.body : null);
	scrollMonitor.setStateFromDOM(null);
	scrollMonitor.listenToDOM();
	
	if (_constants.isInBrowser) {
		window.scrollMonitor = scrollMonitor;
	}
	
	module.exports = scrollMonitor;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var VISIBILITYCHANGE = exports.VISIBILITYCHANGE = 'visibilityChange';
	var ENTERVIEWPORT = exports.ENTERVIEWPORT = 'enterViewport';
	var FULLYENTERVIEWPORT = exports.FULLYENTERVIEWPORT = 'fullyEnterViewport';
	var EXITVIEWPORT = exports.EXITVIEWPORT = 'exitViewport';
	var PARTIALLYEXITVIEWPORT = exports.PARTIALLYEXITVIEWPORT = 'partiallyExitViewport';
	var LOCATIONCHANGE = exports.LOCATIONCHANGE = 'locationChange';
	var STATECHANGE = exports.STATECHANGE = 'stateChange';
	
	var eventTypes = exports.eventTypes = [VISIBILITYCHANGE, ENTERVIEWPORT, FULLYENTERVIEWPORT, EXITVIEWPORT, PARTIALLYEXITVIEWPORT, LOCATIONCHANGE, STATECHANGE];
	
	var isOnServer = exports.isOnServer = typeof window === 'undefined';
	var isInBrowser = exports.isInBrowser = !isOnServer;
	
	var defaultOffsets = exports.defaultOffsets = { top: 0, bottom: 0 };

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = ElementWatcher;
	
	var _constants = __webpack_require__(1);
	
	function ElementWatcher(containerWatcher, watchItem, offsets) {
		var self = this;
	
		this.watchItem = watchItem;
		this.container = containerWatcher;
	
		if (!offsets) {
			this.offsets = _constants.defaultOffsets;
		} else if (offsets === +offsets) {
			this.offsets = { top: offsets, bottom: offsets };
		} else {
			this.offsets = {
				top: offsets.top || _constants.defaultOffsets.top,
				bottom: offsets.bottom || _constants.defaultOffsets.bottom
			};
		}
	
		this.callbacks = {}; // {callback: function, isOne: true }
	
		for (var i = 0, j = _constants.eventTypes.length; i < j; i++) {
			self.callbacks[_constants.eventTypes[i]] = [];
		}
	
		this.locked = false;
	
		var wasInViewport;
		var wasFullyInViewport;
		var wasAboveViewport;
		var wasBelowViewport;
	
		var listenerToTriggerListI;
		var listener;
		function triggerCallbackArray(listeners, event) {
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
				triggerCallbackArray(this.callbacks[_constants.ENTERVIEWPORT], event);
			}
			if (this.isFullyInViewport && !wasFullyInViewport) {
				triggerCallbackArray(this.callbacks[_constants.FULLYENTERVIEWPORT], event);
			}
	
			if (this.isAboveViewport !== wasAboveViewport && this.isBelowViewport !== wasBelowViewport) {
	
				triggerCallbackArray(this.callbacks[_constants.VISIBILITYCHANGE], event);
	
				// if you skip completely past this element
				if (!wasFullyInViewport && !this.isFullyInViewport) {
					triggerCallbackArray(this.callbacks[_constants.FULLYENTERVIEWPORT], event);
					triggerCallbackArray(this.callbacks[_constants.PARTIALLYEXITVIEWPORT], event);
				}
				if (!wasInViewport && !this.isInViewport) {
					triggerCallbackArray(this.callbacks[_constants.ENTERVIEWPORT], event);
					triggerCallbackArray(this.callbacks[_constants.EXITVIEWPORT], event);
				}
			}
	
			if (!this.isFullyInViewport && wasFullyInViewport) {
				triggerCallbackArray(this.callbacks[_constants.PARTIALLYEXITVIEWPORT], event);
			}
			if (!this.isInViewport && wasInViewport) {
				triggerCallbackArray(this.callbacks[_constants.EXITVIEWPORT], event);
			}
			if (this.isInViewport !== wasInViewport) {
				triggerCallbackArray(this.callbacks[_constants.VISIBILITYCHANGE], event);
			}
			switch (true) {
				case wasInViewport !== this.isInViewport:
				case wasFullyInViewport !== this.isFullyInViewport:
				case wasAboveViewport !== this.isAboveViewport:
				case wasBelowViewport !== this.isBelowViewport:
					triggerCallbackArray(this.callbacks[_constants.STATECHANGE], event);
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
				if (this.container.containerWatcher) {
					containerOffset = this.container.containerWatcher.top;
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
	
			if ((previousTop !== undefined || previousBottom !== undefined) && (this.top !== previousTop || this.bottom !== previousBottom)) {
				triggerCallbackArray(this.callbacks[_constants.LOCATIONCHANGE], null);
			}
		};
	
		this.recalculateLocation();
		this.update();
	
		wasInViewport = this.isInViewport;
		wasFullyInViewport = this.isFullyInViewport;
		wasAboveViewport = this.isAboveViewport;
		wasBelowViewport = this.isBelowViewport;
	}
	
	ElementWatcher.prototype = {
		on: function on(event, callback, isOne) {
	
			// trigger the event if it applies to the element right now.
			switch (true) {
				case event === _constants.VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
				case event === _constants.ENTERVIEWPORT && this.isInViewport:
				case event === _constants.FULLYENTERVIEWPORT && this.isFullyInViewport:
				case event === _constants.EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
				case event === _constants.PARTIALLYEXITVIEWPORT && this.isAboveViewport:
					callback.call(this, this.container.latestEvent, this);
					if (isOne) {
						return;
					}
			}
	
			if (this.callbacks[event]) {
				this.callbacks[event].push({ callback: callback, isOne: isOne || false });
			} else {
				throw new Error('Tried to add a scroll monitor listener of type ' + event + '. Your options are: ' + _constants.eventTypes.join(', '));
			}
		},
		off: function off(event, callback) {
			if (this.callbacks[event]) {
				for (var i = 0, item; item = this.callbacks[event][i]; i++) {
					if (item.callback === callback) {
						this.callbacks[event].splice(i, 1);
						break;
					}
				}
			} else {
				throw new Error('Tried to remove a scroll monitor listener of type ' + event + '. Your options are: ' + _constants.eventTypes.join(', '));
			}
		},
		one: function one(event, callback) {
			this.on(event, callback, true);
		},
		recalculateSize: function recalculateSize() {
			this.height = this.watchItem.offsetHeight + this.offsets.top + this.offsets.bottom;
			this.bottom = this.top + this.height;
		},
		update: function update() {
			this.isAboveViewport = this.top < this.container.viewportTop;
			this.isBelowViewport = this.bottom > this.container.viewportBottom;
	
			this.isInViewport = this.top < this.container.viewportBottom && this.bottom > this.container.viewportTop;
			this.isFullyInViewport = this.top >= this.container.viewportTop && this.bottom <= this.container.viewportBottom || this.isAboveViewport && this.isBelowViewport;
		},
		destroy: function destroy() {
			var index = this.container.watchers.indexOf(this),
			    self = this;
			this.container.watchers.splice(index, 1);
			for (var i = 0, j = _constants.eventTypes.length; i < j; i++) {
				self.callbacks[_constants.eventTypes[i]].length = 0;
			}
		},
		// prevent recalculating the element location
		lock: function lock() {
			this.locked = true;
		},
		unlock: function unlock() {
			this.locked = false;
		}
	};
	
	var eventHandlerFactory = function eventHandlerFactory(type) {
		return function (callback, isOne) {
			this.on.call(this, type, callback, isOne);
		};
	};
	
	for (var i = 0, j = _constants.eventTypes.length; i < j; i++) {
		var type = _constants.eventTypes[i];
		ElementWatcher.prototype[type] = eventHandlerFactory(type);
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _constants = __webpack_require__(1);
	
	var _watcher = __webpack_require__(3);
	
	var _watcher2 = _interopRequireDefault(_watcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function getViewportHeight(element) {
		if (_constants.isOnServer) {
			return 0;
		}
		if (element === document.body) {
			return window.innerHeight || document.documentElement.clientHeight;
		} else {
			return element.clientHeight;
		}
	}
	
	function getContentHeight(element) {
		if (_constants.isOnServer) {
			return 0;
		}
	
		if (element === document.body) {
			// jQuery approach
			// whichever is greatest
			return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
		} else {
			return element.scrollHeight;
		}
	}
	
	function scrollTop(element) {
		if (_constants.isOnServer) {
			return 0;
		}
		if (element === document.body) {
			return window.pageYOffset || document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
		} else {
			return element.scrollTop;
		}
	}
	
	var ScrollMonitorContainer = function () {
		function ScrollMonitorContainer(item, parentWatcher) {
			_classCallCheck(this, ScrollMonitorContainer);
	
			var self = this;
	
			this.item = item;
			this.watchers = [];
			this.viewportTop = null;
			this.viewportBottom = null;
			this.documentHeight = getContentHeight(item);
			this.viewportHeight = getViewportHeight(item);
			this.DOMListener = this.DOMListener.bind(this);
	
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
					self.watchers[updateAndTriggerWatchersI].triggerCallbacks();
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
	
		_createClass(ScrollMonitorContainer, [{
			key: 'listenToDOM',
			value: function listenToDOM() {
				if (_constants.isInBrowser) {
					if (window.addEventListener) {
						if (this.item === document.body) {
							window.addEventListener('scroll', this.DOMListener);
						} else {
							this.item.addEventListener('scroll', this.DOMListener);
						}
						window.addEventListener('resize', this.DOMListener);
					} else {
						// Old IE support
						if (this.item === document.body) {
							window.attachEvent('onscroll', this.DOMListener);
						} else {
							this.item.attachEvent('onscroll', this.DOMListener);
						}
						window.attachEvent('onresize', this.DOMListener);
					}
					this.destroy = function () {
						if (window.addEventListener) {
							if (this.item === document.body) {
								window.removeEventListener('scroll', this.DOMListener);
								this.containerWatcher.destroy();
							} else {
								this.item.removeEventListener('scroll', this.DOMListener);
							}
							window.removeEventListener('resize', this.DOMListener);
						} else {
							// Old IE support
							if (this.item === document.body) {
								window.detachEvent('onscroll', this.DOMListener);
								this.containerWatcher.destroy();
							} else {
								this.item.detachEvent('onscroll', this.DOMListener);
							}
							window.detachEvent('onresize', this.DOMListener);
						}
					};
				}
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				// noop, override for your own purposes.
				// in listenToDOM, for example.
			}
		}, {
			key: 'DOMListener',
			value: function DOMListener(event) {
				this.setStateFromDOM(event);
				this.updateAndTriggerWatchers(event);
			}
		}, {
			key: 'setStateFromDOM',
			value: function setStateFromDOM(event) {
				var viewportTop = scrollTop(this.item);
				var viewportHeight = getViewportHeight(this.item);
				var contentHeight = getContentHeight(this.item);
	
				this.setState(viewportTop, viewportHeight, contentHeight, event);
			}
		}, {
			key: 'setState',
			value: function setState(newViewportTop, newViewportHeight, newContentHeight, event) {
				var needsRecalcuate = newViewportHeight !== this.viewportHeight || newContentHeight !== this.contentHeight;
	
				this.latestEvent = event;
				this.viewportTop = newViewportTop;
				this.viewportHeight = newViewportHeight;
				this.viewportBottom = newViewportTop + newViewportHeight;
				this.contentHeight = newContentHeight;
	
				if (needsRecalcuate) {
					var i = this.watchers.length;
					while (i--) {
						this.watchers[i].recalculateLocation();
					}
				}
				this.updateAndTriggerWatchers(event);
			}
		}, {
			key: 'updateAndTriggerWatchers',
			value: function updateAndTriggerWatchers(event) {
				var i = this.watchers.length;
				while (i--) {
					this.watchers[i].update();
				}
	
				i = this.watchers.length;
				while (i--) {
					this.watchers[i].triggerCallbacks(event);
				}
			}
		}, {
			key: 'createCustomContainer',
			value: function createCustomContainer() {
				return new ScrollMonitorContainer();
			}
		}, {
			key: 'createContainer',
			value: function createContainer(item) {
				if (typeof item === 'string') {
					item = document.querySelector(item);
				} else if (item && item.length > 0) {
					item = item[0];
				}
				var container = new ScrollMonitorContainer(item, this);
				container.setStateFromDOM();
				container.listenToDOM();
				return container;
			}
		}, {
			key: 'create',
			value: function create(item, offsets) {
				if (typeof item === 'string') {
					item = document.querySelector(item);
				} else if (item && item.length > 0) {
					item = item[0];
				}
				var watcher = new _watcher2.default(this, item, offsets);
				this.watchers.push(watcher);
				return watcher;
			}
		}, {
			key: 'beget',
			value: function beget(item, offsets) {
				return this.create(item, offsets);
			}
		}]);
	
		return ScrollMonitorContainer;
	}();
	
	exports.default = ScrollMonitorContainer;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=scrollMonitor.js.map