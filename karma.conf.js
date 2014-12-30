module.exports = function(config) {
	config.set({
		basePath: './',
		frameworks: ['mocha', 'expect', 'sinon', 'chai'],
		browsers: ['Chrome', 'Firefox', 'Safari', 'Internet Explorer'],
		files: [
			'scrollMonitor.js',
			'test/tests.js'
		]
	});
};