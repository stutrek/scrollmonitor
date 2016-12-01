var {
	VISIBILITYCHANGE,
	ENTERVIEWPORT,
	FULLYENTERVIEWPORT,
	EXITVIEWPORT,
	PARTIALLYEXITVIEWPORT,
	LOCATIONCHANGE,
	STATECHANGE,
	eventTypes,
	defaultOffsets
} = require('./constants');

function ElementWatcher (containerWatcher, watchItem, offsets) {
	var self = this;

	this.watchItem = watchItem;
	this.container = containerWatcher;

	if (!offsets) {
		this.offsets = defaultOffsets;
	} else if (offsets === +offsets) {
		this.offsets = {top: offsets, bottom: offsets};
	} else {
		this.offsets = {
			top: offsets.top || defaultOffsets.top,
			bottom: offsets.bottom || defaultOffsets.bottom
		};
	}

	this.callbacks = {}; // {callback: function, isOne: true }

	for (var i = 0, j = eventTypes.length; i < j; i++) {
		self.callbacks[eventTypes[i]] = [];
	}

	this.locked = false;

	var wasInViewport;
	var wasFullyInViewport;
	var wasAboveViewport;
	var wasBelowViewport;

	var listenerToTriggerListI;
	var listener;
	function triggerCallbackArray (listeners, event) {
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
	this.triggerCallbacks = function triggerCallbacks (event) {

		if (this.isInViewport && !wasInViewport) {
			triggerCallbackArray( this.callbacks[ENTERVIEWPORT], event );
		}
		if (this.isFullyInViewport && !wasFullyInViewport) {
			triggerCallbackArray( this.callbacks[FULLYENTERVIEWPORT], event );
		}


		if (this.isAboveViewport !== wasAboveViewport &&
			this.isBelowViewport !== wasBelowViewport) {

			triggerCallbackArray( this.callbacks[VISIBILITYCHANGE], event );

			// if you skip completely past this element
			if (!wasFullyInViewport && !this.isFullyInViewport) {
				triggerCallbackArray( this.callbacks[FULLYENTERVIEWPORT], event );
				triggerCallbackArray( this.callbacks[PARTIALLYEXITVIEWPORT], event );
			}
			if (!wasInViewport && !this.isInViewport) {
				triggerCallbackArray( this.callbacks[ENTERVIEWPORT], event );
				triggerCallbackArray( this.callbacks[EXITVIEWPORT], event );
			}
		}

		if (!this.isFullyInViewport && wasFullyInViewport) {
			triggerCallbackArray( this.callbacks[PARTIALLYEXITVIEWPORT], event );
		}
		if (!this.isInViewport && wasInViewport) {
			triggerCallbackArray( this.callbacks[EXITVIEWPORT], event );
		}
		if (this.isInViewport !== wasInViewport) {
			triggerCallbackArray( this.callbacks[VISIBILITYCHANGE], event );
		}
		switch( true ) {
			case wasInViewport !== this.isInViewport:
			case wasFullyInViewport !== this.isFullyInViewport:
			case wasAboveViewport !== this.isAboveViewport:
			case wasBelowViewport !== this.isBelowViewport:
				triggerCallbackArray( this.callbacks[STATECHANGE], event );
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
		if (this.watchItem.nodeName) { // a dom element
			var cachedDisplay = this.watchItem.style.display;
			if (cachedDisplay === 'none') {
				this.watchItem.style.display = '';
			}

			var containerOffset = 0;
			var container = this.container;
			while (container.containerWatcher) {
				containerOffset += container.containerWatcher.top - container.containerWatcher.container.viewportTop;
				container = container.containerWatcher.container;
			}

			var boundingRect = this.watchItem.getBoundingClientRect();
			this.top = boundingRect.top + this.container.viewportTop - containerOffset;
			this.bottom = boundingRect.bottom + this.container.viewportTop - containerOffset;

			if (cachedDisplay === 'none') {
				this.watchItem.style.display = cachedDisplay;
			}

		} else if (this.watchItem === +this.watchItem) { // number
			if (this.watchItem > 0) {
				this.top = this.bottom = this.watchItem;
			} else {
				this.top = this.bottom = this.container.documentHeight - this.watchItem;
			}

		} else { // an object with a top and bottom property
			this.top = this.watchItem.top;
			this.bottom = this.watchItem.bottom;
		}

		this.top -= this.offsets.top;
		this.bottom += this.offsets.bottom;
		this.height = this.bottom - this.top;

		if ( (previousTop !== undefined || previousBottom !== undefined) && (this.top !== previousTop || this.bottom !== previousBottom) ) {
			triggerCallbackArray( this.callbacks[LOCATIONCHANGE], null );
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
	on: function (event, callback, isOne) {

		// trigger the event if it applies to the element right now.
		switch( true ) {
			case event === VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
			case event === ENTERVIEWPORT && this.isInViewport:
			case event === FULLYENTERVIEWPORT && this.isFullyInViewport:
			case event === EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
			case event === PARTIALLYEXITVIEWPORT && this.isAboveViewport:
				callback.call(this, this.container.latestEvent, this);
				if (isOne) {
					return;
				}
		}

		if (this.callbacks[event]) {
			this.callbacks[event].push({callback: callback, isOne: isOne||false});
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
		this.isAboveViewport = this.top < this.container.viewportTop;
		this.isBelowViewport = this.bottom > this.container.viewportBottom;

		this.isInViewport = (this.top < this.container.viewportBottom && this.bottom > this.container.viewportTop);
		this.isFullyInViewport = (this.top >= this.container.viewportTop && this.bottom <= this.container.viewportBottom) || (this.isAboveViewport && this.isBelowViewport);

	},
	destroy: function() {
		var index = this.container.watchers.indexOf(this),
			self  = this;
		this.container.watchers.splice(index, 1);
		for (var i = 0, j = eventTypes.length; i < j; i++) {
			self.callbacks[eventTypes[i]].length = 0;
		}
	},
	// prevent recalculating the element location
	lock: function() {
		this.locked = true;
	},
	unlock: function() {
		this.locked = false;
	}
};

var eventHandlerFactory = function (type) {
	return function( callback, isOne ) {
		this.on.call(this, type, callback, isOne);
	};
};

for (var i = 0, j = eventTypes.length; i < j; i++) {
	var type =  eventTypes[i];
	ElementWatcher.prototype[type] = eventHandlerFactory(type);
}

module.exports = ElementWatcher;
