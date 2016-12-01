exports.VISIBILITYCHANGE = 'visibilityChange';
exports.ENTERVIEWPORT = 'enterViewport';
exports.FULLYENTERVIEWPORT = 'fullyEnterViewport';
exports.EXITVIEWPORT = 'exitViewport';
exports.PARTIALLYEXITVIEWPORT = 'partiallyExitViewport';
exports.LOCATIONCHANGE = 'locationChange';
exports.STATECHANGE = 'stateChange';

exports.eventTypes = [
	exports.VISIBILITYCHANGE,
	exports.ENTERVIEWPORT,
	exports.FULLYENTERVIEWPORT,
	exports.EXITVIEWPORT,
	exports.PARTIALLYEXITVIEWPORT,
	exports.LOCATIONCHANGE,
	exports.STATECHANGE
];

exports.isOnServer = (typeof window === 'undefined');
exports.isInBrowser = !exports.isOnServer;

exports.defaultOffsets = {top: 0, bottom: 0};
