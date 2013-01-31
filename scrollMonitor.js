(function( factory ) {
	if (typeof define !== 'undefined' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		var jQuery = require('jquery');
		module.exports = factory( $ );
	} else {
		window.scrollMonitor = factory( $ );
	}
})(function( $ ) {
	
	var exports = {};

	var VISIBILITYCHANGE = 'visibilityChange';
	var ENTERVIEWPORT = 'enterViewport';
	var FULLYENTERVIEWPORT = 'fullyEnterViewport';
	var EXITVIEWPORT = 'exitViewport';
	var PARTIALLYEXITVIEWPORT = 'partiallyExitViewport';
	var LOCATIONCHANGE = 'locationChange';
	var STATECHANGE = 'stateChange';

	var eventTypes = [
		VISIBILITYCHANGE,
		ENTERVIEWPORT,
		FULLYENTERVIEWPORT,
		EXITVIEWPORT,
		PARTIALLYEXITVIEWPORT,
		LOCATIONCHANGE,
		STATECHANGE
	];

	var defaultOffsets = {top: 0, bottom: 0};


	function ScrollMonitor( $viewport, $container ) {
		var self = this;

		this.watchers = [];
		this.$viewport = $viewport;
		if ($container) {
			this.$container = $container;
		}

		this.viewportTop = null;
		this.viewportBottom = null;
		this.documentHeight = null;
		this.viewportHeight = this.$viewport.height();

		function scrollMonitorListener(event) {
			self.latestEvent = event;
			self.calculateViewport();
			self.updateAndTriggerWatchers();
		}

		var recalculateAndTriggerTimer;
		function debouncedRecalcuateAndTrigger() {
			clearTimeout(recalculateAndTriggerTimer);
			recalculateAndTriggerTimer = setTimeout( $.proxy(self.recalculateWatchLocationsAndTrigger, self), 100 );
		}

		this.$viewport.on('scroll', scrollMonitorListener);
		this.$viewport.on('resize', debouncedRecalcuateAndTrigger);

		this.calculateViewport();
	}

	ScrollMonitor.prototype = {
		calculateViewport: function() {
			var calculateViewportI;
			this.viewportTop = this.$viewport.scrollTop();
			this.viewportBottom = this.viewportTop + this.viewportHeight;
			this.documentHeight = this.$container ? this.$container.height() : this.$viewport.prop("scrollHeight");
			if (this.documentHeight !== this.previousDocumentHeight) {
				calculateViewportI = this.watchers.length;
				while( calculateViewportI-- ) {
					this.watchers[calculateViewportI].recalculateLocation();
				}
				this.previousDocumentHeight = this.documentHeight;
			}
		},
		recalculateWatchLocationsAndTrigger: function() {
			this.viewportHeight = this.$viewport.height();
			this.calculateViewport();
			this.updateAndTriggerWatchers();
		},
		updateAndTriggerWatchers: function() {
			var updateAndTriggerWatchersI;
			// update all watchers then trigger the events so one can rely on another being up to date.
			updateAndTriggerWatchersI = this.watchers.length;
			while( updateAndTriggerWatchersI-- ) {
				this.watchers[updateAndTriggerWatchersI].update();
			}

			updateAndTriggerWatchersI = this.watchers.length;
			while( updateAndTriggerWatchersI-- ) {
				this.watchers[updateAndTriggerWatchersI].triggerCallbacks();
			}
		},
		create: function( element, offsets ) {
			if (typeof element === 'string') {
				element = $(element)[0];
			}
			if (element instanceof $) {
				element = element[0];
			}
			var watcher = new ElementWatcher( element, offsets, this );
			this.watchers.push(watcher);
			watcher.update();
			return watcher;
		},
		update: function() {
			this.latestEvent = null;
			this.calculateViewport();
			this.updateAndTriggerWatchers();
		},
		recalculateLocations: function() {
			this.documentHeight = 0;
			this.update();
		}
	};

	function ElementWatcher( watchItem, offsets, scrollMonitor ) {
		var self = this;

		this.watchItem = watchItem;
		this.scrollMonitor = scrollMonitor;
		
		if (!offsets) {
			this.offsets = defaultOffsets;
		} else if (offsets === +offsets) {
			this.offsets = {top: offsets, bottom: offsets};
		} else {
			this.offsets = $.extend({}, defaultOffsets, offsets);
		}

		this.callbacks = {}; // {callback: function, isOne: true }

		eventTypes.forEach(function(type) {
			self.callbacks[type] = [];
		});

		this.locked = false;

		var wasInViewport;
		var wasFullyInViewport;
		var wasAboveViewport;
		var wasBelowViewport;

		var listenerToTriggerListI;
		var listener;
		function triggerCallbackArray( listeners ) {
			if (listeners.length === 0) {
				return;
			}
			listenerToTriggerListI = listeners.length;
			while( listenerToTriggerListI-- ) {
				listener = listeners[listenerToTriggerListI];
				listener.callback.call( self, self.scrollMonitor.latestEvent );
				if (listener.isOne) {
					listeners.splice(listenerToTriggerListI, 1);
				}
			}
		}
		this.triggerCallbacks = function triggerCallbacks() {
			
			if (this.isInViewport && !wasInViewport) {
				triggerCallbackArray( this.callbacks[ENTERVIEWPORT] );
			}
			if (this.isFullyInViewport && !wasFullyInViewport) {
				triggerCallbackArray( this.callbacks[FULLYENTERVIEWPORT] );
			}

			
			if (this.isAboveViewport !== wasAboveViewport && 
				this.isBelowViewport !== wasBelowViewport) {

				triggerCallbackArray( this.callbacks[VISIBILITYCHANGE] );
				
				// if you skip completely past this element
				if (!wasFullyInViewport && !this.isFullyInViewport) {
					triggerCallbackArray( this.callbacks[FULLYENTERVIEWPORT] );
					triggerCallbackArray( this.callbacks[PARTIALLYEXITVIEWPORT] );
				}
				if (!wasInViewport && !this.isInViewport) {
					triggerCallbackArray( this.callbacks[ENTERVIEWPORT] );
					triggerCallbackArray( this.callbacks[EXITVIEWPORT] );
				}
			}

			if (!this.isFullyInViewport && wasFullyInViewport) {
				triggerCallbackArray( this.callbacks[PARTIALLYEXITVIEWPORT] );
			}
			if (!this.isInViewport && wasInViewport) {
				triggerCallbackArray( this.callbacks[EXITVIEWPORT] );
			}
			if (this.isInViewport !== wasInViewport) {
				triggerCallbackArray( this.callbacks[VISIBILITYCHANGE] );
			}
			switch( true ) {
				case wasInViewport !== this.isInViewport:
				case wasFullyInViewport !== this.isFullyInViewport:
				case wasAboveViewport !== this.isAboveViewport:
				case wasBelowViewport !== this.isBelowViewport:
					triggerCallbackArray( this.callbacks[STATECHANGE] );
			}

			wasInViewport = this.isInViewport;
			wasFullyInViewport = this.isFullyInViewport;
			wasAboveViewport = this.isAboveViewport;
			wasBelowViewport = this.isBelowViewport;

		};

		this.recalculateLocation = function() {
			if (this.locked) {
				return;
			}
			var previousTop = this.top;
			var previousBottom = this.bottom;
			if (this.watchItem.nodeName) { // a dom element
				var cachedDisplay = this.watchItem.style.display;
				if (cachedDisplay === 'none') {
					this.watchItem.style.display = '';
				}
				
				if (!this.$watchItem) {
					this.$watchItem = $(this.watchItem);
				}
				var elementLocation = this.scrollMonitor.$container ? this.$watchItem.offset() : this.$watchItem.position();
				this.top = elementLocation.top;
				this.bottom = elementLocation.top + this.watchItem.offsetHeight;

				if (cachedDisplay === 'none') {
					this.watchItem.style.display = cachedDisplay;
				}

			} else if (this.watchItem === +this.watchItem) { // number
				if (this.watchItem > 0) {
					this.top = this.bottom = this.watchItem;
				} else {
					this.top = this.bottom = this.scrollMonitor.documentHeight - this.watchItem;
				}

			} else { // an object with a top and bottom property
				this.top = this.watchItem.top;
				this.bottom = this.watchItem.bottom;
			}

			this.top -= this.offsets.top;
			this.bottom += this.offsets.bottom;
			this.height = this.bottom - this.top;

			if ( (previousTop !== undefined || previousBottom !== undefined) && (this.top !== previousTop || this.bottom !== previousBottom) ) {
				triggerCallbackArray( this.callbacks[LOCATIONCHANGE] );
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
		on: function( event, callback, isOne ) {

			// trigger the event if it applies to the element right now.
			switch( true ) {
				case event === VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
				case event === ENTERVIEWPORT && this.isInViewport:
				case event === FULLYENTERVIEWPORT && this.isFullyInViewport:
				case event === EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
				case event === PARTIALLYEXITVIEWPORT && this.isAboveViewport:
					callback();
					if (isOne) {
						return;
					}
			}

			if (this.callbacks[event]) {
				this.callbacks[event].push({callback: callback, isOne: isOne});
			} else {
				throw new Error('Tried to add a scroll monitor listener of type '+event+'. Your options are: '+eventTypes.join(', '));
			}
		},
		off: function( event, callback ) {
			if (this.callbacks[event]) {
				for (var i = 0, item; item = this.callbacks[event][i]; i++) {
					if (item.callback === callback) {
						this.callbacks[event].splice(i, 1);
						break;
					}
				}
			} else {
				throw new Error('Tried to remove a scroll monitor listener of type '+event+'. Your options are: '+eventTypes.join(', '));
			}
		},
		one: function( event, callback ) {
			this.on( event, callback, true);
		},
		recalculateSize: function() {
			this.height = this.watchItem.offsetHeight + this.offsets.top + this.offsets.bottom;
			this.bottom = this.top + this.height;
		},
		update: function() {
			this.isAboveViewport = this.top < this.scrollMonitor.viewportTop;
			this.isBelowViewport = this.bottom > this.scrollMonitor.viewportBottom;

			this.isInViewport = (this.top <= this.scrollMonitor.viewportBottom && this.bottom >= this.scrollMonitor.viewportTop);
			this.isFullyInViewport = (this.top >= this.scrollMonitor.viewportTop && this.bottom <= this.scrollMonitor.viewportBottom) ||
								 (this.isAboveViewport && this.isBelowViewport);

		},
		destroy: function() {
			var index = this.scrollMonitor.watchers.indexOf(this),
				self  = this;
			this.scrollMonitor.watchers.splice(index, 1);
			eventTypes.forEach(function(type) {
				self.callbacks[type].length = 0;
			});
		},
		// prevent recalculating the element location
		lock: function() {
			this.locked = true;
		},
		unlock: function() {
			this.locked = false;
		}
	};

	eventTypes.forEach(function( type ) {
		ElementWatcher.prototype[type] = function( callback, isOne) {
			this.on.call(this, type, callback, isOne);
		};
	});


	var windowScrollMonitor = new ScrollMonitor( $(window), $(document) );

	exports.viewportTop = windowScrollMonitor.viewportTop;
	exports.viewportBottom = windowScrollMonitor.viewportBottom;
	exports.documentHeight = windowScrollMonitor.documentHeight;
	exports.viewportHeight = windowScrollMonitor.viewportHeight;

	exports.beget = exports.create = function( element, offsets, $container ) {
		var scrollMonitor = $container ? $container.data('scrollMonitor') : windowScrollMonitor;
		if ($container && !scrollMonitor) {
			scrollMonitor = new ScrollMonitor($container);
			$container.data('scrollMonitor', scrollMonitor);
		}
		return scrollMonitor.create(element, offsets);
	};
	exports.update = function( $container ) {
		if ($container && $container.data('scrollMonitor')) {
			$container.data('scrollMonitor').update();
		} else {
			windowScrollMonitor.update();
		}
	};
	exports.recalculateLocations = function( $container ) {
		if ($container && $container.data('scrollMonitor')) {
			$container.data('scrollMonitor').recalculateLocations();
		} else {
			windowScrollMonitor.recalculateLocations();
		}
	};
	return exports;
});