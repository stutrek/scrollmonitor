/* global require: false, describe: false, it: false, expect: false, sinon: false */
define(function(require) {

	var scrollMonitor = require('../scrollMonitor');
	
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

	describe('API', function () {
		it('module should have correct API.', function () {
			expect(scrollMonitor).to.respondTo('create');
			expect(scrollMonitor).to.respondTo('update');
			expect(scrollMonitor).to.respondTo('recalculateLocations');

			expect(scrollMonitor.viewportTop).to.be.a('number');
			expect(scrollMonitor.viewportBottom).to.be.a('number');
			expect(scrollMonitor.viewportHeight).to.be.a('number');
			expect(scrollMonitor.documentHeight).to.be.a('number');
		});
		it('watcher should have correct API.', function () {
			var watcher = scrollMonitor.create(10);

			expect(watcher).to.respondTo('on');
			expect(watcher).to.respondTo('off');
			expect(watcher).to.respondTo('one');
			expect(watcher).to.respondTo('lock');
			expect(watcher).to.respondTo('unlock');
			expect(watcher).to.respondTo('destroy');
			expect(watcher).to.respondTo('update');
			expect(watcher).to.respondTo('triggerCallbacks');

			eventTypes.forEach(function(type) {
				expect(watcher).to.respondTo(type);
			});

			expect(watcher.isInViewport).to.be.a('boolean');
			expect(watcher.isFullyInViewport).to.be.a('boolean');
			expect(watcher.isAboveViewport).to.be.a('boolean');
			expect(watcher.isBelowViewport).to.be.a('boolean');
			expect(watcher.top).to.be.a('number');
			expect(watcher.bottom).to.be.a('number');
			expect(watcher.height).to.be.a('number');
			expect(watcher.watchItem).to.be.a('number');
			expect(watcher.offsets).to.be.an('object');

			watcher.destroy();
		});
	});

	describe('calculating locations', function () {
		var fixture = document.getElementById('fixture');

		it('should calculate numbers correctly', function () {
			var watcher10 = scrollMonitor.create(10);
			var watcher15 = scrollMonitor.create(15);

			expect(watcher10.top).to.equal(10);
			expect(watcher15.top).to.equal(15);

			expect(watcher10.bottom).to.equal(10);
			expect(watcher15.bottom).to.equal(15);
			
			expect(watcher10.height).to.equal(0);
			expect(watcher15.height).to.equal(0);

			expect(watcher10.offsets).to.eql({top: 0, bottom: 0});
			expect(watcher15.offsets).to.eql({top: 0, bottom: 0});

			watcher10.destroy();
			watcher15.destroy();
		});

		it('should calculate objects correctly', function () {
			var watcher = scrollMonitor.create({top: 100, bottom: 102});

			expect(watcher.top).to.equal(100);
			expect(watcher.bottom).to.equal(102);
			expect(watcher.height).to.equal(2);

			watcher.destroy();
		});

		it('should calculate things with a property of "0" correctly', function () {
			var watcher = scrollMonitor.create([10]);

			expect(watcher.top).to.equal(10);
			expect(watcher.bottom).to.equal(10);
			expect(watcher.height).to.equal(0);

			watcher.destroy();
		});

	});
	describe('setting offsets', function () {
		it('should not have offsets by default', function () {
			var watcher = scrollMonitor.create(10);
			expect(watcher.offsets).to.eql({top: 0, bottom: 0});
			watcher.destroy();
		});
		it('should add offsets as a number', function () {
			var watcher = scrollMonitor.create(10, 10);
			expect(watcher.offsets).to.eql({top: 10, bottom: 10});
			watcher.destroy();
		});
		it('should add offsets as a with just the top in an object', function () {
			var watcher = scrollMonitor.create(10, {top: 10});
			expect(watcher.offsets).to.eql({top: 10, bottom: 0});
			watcher.destroy();
		});
		it('should add offsets as a with just the bottom in an object', function () {
			var watcher = scrollMonitor.create(10, {bottom: 10});
			expect(watcher.offsets).to.eql({top: 0, bottom: 10});
			watcher.destroy();
		});
		it('should add offsets as a with both properties in an object', function () {
			var watcher = scrollMonitor.create(10, {top: 5, bottom: 10});
			expect(watcher.offsets).to.eql({top: 5, bottom: 10});
			watcher.destroy();
		});
	});

	describe('callbacks', function () {
		function noop () {}
		it('arrays should exist to hold callbacks.', function () {
			var watcher = scrollMonitor.create(10);
			eventTypes.forEach(function(type) {
				expect(watcher.callbacks[type]).to.be.an('array');
				expect(watcher.callbacks[type].length).to.equal(0);				
			});
			watcher.destroy();
		});
		it('should add event listeners.', function () {
			var watcher = scrollMonitor.create(10);
			eventTypes.forEach(function(type) {
				watcher.on(type, noop);
				expect(watcher.callbacks[type].length).to.equal(1);
				expect(watcher.callbacks[type][0].callback).to.equal(noop);
				expect(watcher.callbacks[type][0].isOne).to.equal(false);
			});
			watcher.destroy();
		});
		it('should remove event listeners.', function () {
			var watcher = scrollMonitor.create(10);
			eventTypes.forEach(function(type) {
				watcher.on(type, noop);
				watcher.off(type, noop);
				expect(watcher.callbacks[type].length).to.equal(0);
			});
			watcher.destroy();
		});
		it('should add "one" event listeners as "one" event listeners.', function () {
			var watcher = scrollMonitor.create(10);
			eventTypes.forEach(function(type) {
				var spy = sinon.spy();
				watcher.one(type, spy);
				if (type === 'enterViewport' || type === 'fullyEnterViewport') {
					expect(watcher.callbacks[type].length).to.equal(0);
					expect(spy.called).to.equal(true);
				} else {
					expect(watcher.callbacks[type].length).to.equal(1);
					expect(spy.called).to.equal(false);
					expect(watcher.callbacks[type][0].callback).to.equal(spy);
					expect(watcher.callbacks[type][0].isOne).to.equal(true);
				}
			});
			watcher.destroy();
		});
		it('should automatically call listeners when they are already in the viewport.', function () {
			var watcher = scrollMonitor.create(10);
			eventTypes.forEach(function(type) {
				var spy = sinon.spy();
				watcher.on(type, spy);
				if (type === 'enterViewport' || type === 'fullyEnterViewport') {
					expect(spy.called).to.equal(true);
				} else {
					expect(spy.called).to.equal(false);
				}
			});
			watcher.destroy();
		});

		it('should automatically call listeners when they are already in the viewport.', function () {
			var watcher = scrollMonitor.create(10);
			eventTypes.forEach(function(type) {
				var spy = sinon.spy();
				watcher.on(type, spy);
				if (type === 'enterViewport' || type === 'fullyEnterViewport') {
					expect(spy.called).to.equal(true);
				} else {
					expect(spy.called).to.equal(false);
				}
			});
			watcher.destroy();
		});
	});
});