var { isOnServer, isInBrowser, eventTypes } = require('./constants');
var Watcher = require('./watcher');

function getViewportHeight (element) {
	if (isOnServer) {
		return 0;
	}
	if (element === document.body) {
		return window.innerHeight || document.documentElement.clientHeight;
	} else {
		return element.clientHeight;
	}
}

function getContentHeight (element) {
	if (isOnServer) {
		return 0;
	}

	if (element === document.body) {
		// jQuery approach
		// whichever is greatest
		return Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.documentElement.clientHeight
		);
	} else {
		return element.scrollHeight;
	}
}

function scrollTop (element) {
	if (isOnServer) {
		return 0;
	}
	if (element === document.body) {
		return window.pageYOffset ||
			(document.documentElement && document.documentElement.scrollTop) ||
			document.body.scrollTop;
	} else {
		return element.scrollTop;
	}
}


class ScrollMonitorContainer {
	constructor (item, parentWatcher) {
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
		this.eventTypes = eventTypes;

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
				while( calculateViewportI-- ) {
					self.watchers[calculateViewportI].recalculateLocation();
				}
				previousDocumentHeight = self.documentHeight;
			}
		}

		var updateAndTriggerWatchersI;
		function updateAndTriggerWatchers() {
			// update all watchers then trigger the events so one can rely on another being up to date.
			updateAndTriggerWatchersI = self.watchers.length;
			while( updateAndTriggerWatchersI-- ) {
				self.watchers[updateAndTriggerWatchersI].update();
			}

			updateAndTriggerWatchersI = self.watchers.length;
			while( updateAndTriggerWatchersI-- ) {
				self.watchers[updateAndTriggerWatchersI].triggerCallbacks();
			}

		}

		this.update = function() {
			calculateViewport();
			updateAndTriggerWatchers();
		};
		this.recalculateLocations = function() {
			this.documentHeight = 0;
			this.update();
		};

	}

	listenToDOM () {
		if (isInBrowser) {
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

	destroy () {
		// noop, override for your own purposes.
		// in listenToDOM, for example.
	}

	DOMListener (event) {
		//alert('got scroll');
		this.setStateFromDOM(event);
	}

	setStateFromDOM (event) {
		var viewportTop = scrollTop(this.item);
		var viewportHeight = getViewportHeight(this.item);
		var contentHeight = getContentHeight(this.item);

		this.setState(viewportTop, viewportHeight, contentHeight, event);
	}

	setState (newViewportTop, newViewportHeight, newContentHeight, event) {
		var needsRecalcuate = (newViewportHeight !== this.viewportHeight || newContentHeight !== this.contentHeight);

		this.latestEvent = event;
		this.viewportTop = newViewportTop;
		this.viewportHeight = newViewportHeight;
		this.viewportBottom = newViewportTop + newViewportHeight;
		this.contentHeight = newContentHeight;

		if (needsRecalcuate) {
			let i = this.watchers.length;
			while (i--) {
				this.watchers[i].recalculateLocation();
			}
		}
		this.updateAndTriggerWatchers(event);
	}

	updateAndTriggerWatchers (event) {
		let i = this.watchers.length;
		while (i--) {
			this.watchers[i].update();
		}

		i = this.watchers.length;
		while (i--) {
			this.watchers[i].triggerCallbacks(event);
		}
	}

	createCustomContainer () {
		return new ScrollMonitorContainer();
	}

	createContainer (item) {
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

	create (item, offsets) {
		if (typeof item === 'string') {
			item = document.querySelector(item);
		} else if (item && item.length > 0) {
			item = item[0];
		}
		var watcher = new Watcher(this, item, offsets);
		this.watchers.push(watcher);
		return watcher;
	}

	beget (item, offsets) {
		return this.create(item, offsets);
	}
}

module.exports = ScrollMonitorContainer;

