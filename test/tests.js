/* global require: false, describe: false, it: false, expect: false */
define(function(require) {

	var scrollMonitor = require('../scrollMonitor');

	describe('API', function () {
		it('module should have correct API.', function () {
			console.log(scrollMonitor);
			expect(scrollMonitor).to.respondTo('create');
			expect(scrollMonitor).to.respondTo('update');
			expect(scrollMonitor).to.respondTo('recalculateLocations');

			expect(scrollMonitor.viewportTop).to.be.a('number');
			expect(scrollMonitor.viewportBottom).to.be.a('number');
			expect(scrollMonitor.viewportHeight).to.be.a('number');
			expect(scrollMonitor.documentHeight).to.be.a('number');
		});
	});

});