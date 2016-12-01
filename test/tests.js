/* global require: false, describe: false, it: false, sinon: false, beforeEach: false, afterEach: false, scrollMonitor: false, chai: false */

var expect = chai.expect;
//mocha.allowUncaught();

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

var requestAnimationFrameDoer = window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function (cb) { setTimeout(cb, 20); };

var getViewportHeight = function() {
	return window.innerHeight || document.documentElement.clientHeight;
};
var requestAnimationFrame = function (cb) {
	setTimeout(function () {
		requestAnimationFrameDoer(cb);
	}, 4);
};

var fixture = document.getElementById('fixture');
if (!fixture) {
	fixture = document.createElement('div');
	document.body.appendChild( fixture );
}
var div;
div = document.createElement('div');
div.style.position = 'absolute';
div.style.top = '0px';
div.style.left = '0px';
div.style.width = '10px';
div.style.backgroundColor = 'silver';
div.style.height = ''+(getViewportHeight() * 2)+'px';
fixture.appendChild(div);

var setup = function (done) {
	// the browser doesn't trigger the scroll event synchronously.
	window.scrollTo(0,0);
	requestAnimationFrame(function () {done();});
};

var destroy =function (done) {
	window.scrollTo(0,0);
	requestAnimationFrame(function () {done();});
};

describe('API', function () {

	it('module should have correct API.', function () {
		expect(scrollMonitor).to.respondTo('create');
		expect(scrollMonitor).to.respondTo('update');
		expect(scrollMonitor).to.respondTo('recalculateLocations');

		expect(scrollMonitor.viewportTop).to.be.a('number');
		expect(scrollMonitor.viewportBottom).to.be.a('number');
		expect(scrollMonitor.viewportHeight).to.be.a('number');
		expect(scrollMonitor.documentHeight).to.be.a('number');

		expect(scrollMonitor.eventTypes).to.eql(['visibilityChange', 'enterViewport', 'fullyEnterViewport', 'exitViewport', 'partiallyExitViewport', 'locationChange', 'stateChange']);
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

	it('should calculate DOM elements correctly', function () {
		var div = document.createElement('div');

		div.style.position = 'relative';
		div.style.top = '10px';
		div.style.width = '100px';
		div.style.height = '15px';
		div.style.backgroundColor = 'gray';

		fixture.appendChild(div);
		var watcher = scrollMonitor.create(div);

		var offset = fixture.offsetTop;
		expect(watcher.top).to.equal(offset+10);
		expect(watcher.bottom).to.equal(offset+25);
		expect(watcher.height).to.equal(15);

		watcher.destroy();
		fixture.removeChild(div);
	});
});

describe('location booleans', function () {
	beforeEach(setup);
	afterEach(destroy);

	it('should calculate fully in viewport correctly', function () {
		var watcher = scrollMonitor.create(10);

		expect(watcher.isInViewport).to.equal(true);
		expect(watcher.isFullyInViewport).to.equal(true);
		expect(watcher.isAboveViewport).to.equal(false);
		expect(watcher.isBelowViewport).to.equal(false);

		watcher.destroy();
	});

	it('should calculate partially below viewport correctly', function () {
		var windowHeight = getViewportHeight();
		var watcher = scrollMonitor.create({top: windowHeight-10, bottom: windowHeight+10});

		expect(watcher.isInViewport).to.equal(true);
		expect(watcher.isFullyInViewport).to.equal(false);
		expect(watcher.isAboveViewport).to.equal(false);
		expect(watcher.isBelowViewport).to.equal(true);

		watcher.destroy();
	});

	it('should calculate partially above viewport correctly', function (done) {
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			var watcher = scrollMonitor.create({top: 0, bottom: 200});

			expect(watcher.isInViewport).to.equal(true);
			expect(watcher.isFullyInViewport).to.equal(false);
			expect(watcher.isAboveViewport).to.equal(true);
			expect(watcher.isBelowViewport).to.equal(false);

			watcher.destroy();
			done();
		});
	});

	it('should calculate below viewport correctly', function () {
		var windowHeight = getViewportHeight();
		var watcher = scrollMonitor.create({top: windowHeight+10, bottom: windowHeight+20});

		expect(scrollMonitor.viewportTop).to.equal(0);
		expect(watcher.isInViewport).to.equal(false);
		expect(watcher.isFullyInViewport).to.equal(false);
		expect(watcher.isAboveViewport).to.equal(false);
		expect(watcher.isBelowViewport).to.equal(true);

		watcher.destroy();
	});

	it('should calculate above viewport correctly', function (done) {
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			var watcher = scrollMonitor.create({top: 0, bottom: 20});

			expect(watcher.isInViewport).to.equal(false);
			expect(watcher.isFullyInViewport).to.equal(false);
			expect(watcher.isAboveViewport).to.equal(true);
			expect(watcher.isBelowViewport).to.equal(false);

			watcher.destroy();
			done();
		});
	});

	it('should calculate larger than and fully in viewport correctly', function (done) {
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			var windowHeight = getViewportHeight();
			var watcher = scrollMonitor.create({top: 0, bottom: windowHeight+200});

			expect(watcher.isInViewport).to.equal(true);
			expect(watcher.isFullyInViewport).to.equal(true);
			expect(watcher.isAboveViewport).to.equal(true);
			expect(watcher.isBelowViewport).to.equal(true);

			watcher.destroy();
			done();
		});
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

describe('callback application', function () {
	function noop () {}
	it('should create arrays to hold callbacks.', function () {
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

describe('events as the user scrolls', function () {
	beforeEach(setup);
	afterEach(destroy);

	it('should call enterViewport immediately if the element is already in the viewport.', function () {

		var watcher = scrollMonitor.create(div);
		var spy = sinon.spy();

		watcher.enterViewport(spy);
		expect(spy.called).to.equal(true);
		watcher.destroy();
	});

	it('should call enterViewport and fullyEnterViewport callbacks immediately if the element is fully in the viewport', function () {

		div.style.top = '0px';

		var watcher = scrollMonitor.create(10);
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		watcher.enterViewport(spy1);
		watcher.fullyEnterViewport(spy2);
		expect(spy1.called).to.equal(true);
		expect(spy2.called).to.equal(true);

		watcher.destroy();
	});

	it('should call exitViewport immediately if the element is already above the viewport.', function (done) {
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			var watcher = scrollMonitor.create(10);
			var spy = sinon.spy();

			watcher.exitViewport(spy);
			expect(spy.called).to.equal(true);
			done();
		});
	});

	it('should call partiallyExitViewport immediately if the element is already above the viewport.', function (done) {
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			var watcher = scrollMonitor.create(10);
			var spy = sinon.spy();

			watcher.partiallyExitViewport(spy);
			expect(spy.called).to.equal(true);
			watcher.destroy();
			done();
		});
	});

	it('should call exitViewport and partiallyExitViewport when the element exits the viewport.', function (done) {
		var watcher = scrollMonitor.create(10);
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		watcher.exitViewport(spy1);
		watcher.partiallyExitViewport(spy2);
		expect(spy1.called).to.equal(false);
		expect(spy2.called).to.equal(false);
		
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			expect(spy1.called).to.equal(true);
			expect(spy2.called).to.equal(true);
			done();
		});
	});

	it('should call enterViewport and fullyEnterViewport when the element enters the viewport.', function (done) {
		var watcher = scrollMonitor.create(getViewportHeight()+10);
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		watcher.enterViewport(spy1);
		watcher.fullyEnterViewport(spy2);
		expect(spy1.called).to.equal(false);
		expect(spy2.called).to.equal(false);
		
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			expect(spy1.called).to.equal(true);
			expect(spy2.called).to.equal(true);
			done();
		});
	});

	it('should only call partiallyExitViewport when the element partially exits the viewport.', function (done) {
		var watcher = scrollMonitor.create({top: 10, bottom: 200});
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		watcher.exitViewport(spy1);
		watcher.partiallyExitViewport(spy2);
		expect(spy1.called).to.equal(false);
		expect(spy2.called).to.equal(false);
		
		window.scrollTo(0,100);
		requestAnimationFrame(function () {
			expect(spy1.called).to.equal(false);
			expect(spy2.called).to.equal(true);
			done();
		});
	});

	it('should only call enterViewport when the element halfway enters the viewport.', function (done) {
		var watcher = scrollMonitor.create({top: getViewportHeight()+10,  bottom: (getViewportHeight()*2)+100});
		var spy1 = sinon.spy();
		var spy2 = sinon.spy();

		watcher.enterViewport(spy1);
		watcher.fullyEnterViewport(spy2);
		expect(spy1.called).to.equal(false);
		expect(spy2.called).to.equal(false);
		
		window.scrollTo(0,getViewportHeight()+20);
		requestAnimationFrame(function () {
			expect(spy1.called).to.equal(true);
			expect(spy2.called).to.equal(false);
			done();
		});
	});

});

describe('arguments and context', function() {

	it('should use the watcher as the context.', function () {
		var watcher = scrollMonitor.create(10);
		watcher.enterViewport(function () {
			expect(this).to.equal(watcher);
		});
		watcher.destroy();
	});

	it('should use the scroll event as the only argument.', function () {
		var watcher = scrollMonitor.create(10);
		watcher.enterViewport(function (arg) {
			expect(arg.type).to.equal('scroll');
		});
		watcher.destroy();
	});

});
