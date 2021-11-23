(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultOffsets = exports.isInBrowser = exports.isOnServer = exports.eventTypes = exports.STATECHANGE = exports.LOCATIONCHANGE = exports.PARTIALLYEXITVIEWPORT = exports.EXITVIEWPORT = exports.FULLYENTERVIEWPORT = exports.ENTERVIEWPORT = exports.VISIBILITYCHANGE = void 0;
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
        exports.STATECHANGE,
    ];
    exports.isOnServer = typeof window === 'undefined';
    exports.isInBrowser = !exports.isOnServer;
    exports.defaultOffsets = { top: 0, bottom: 0 };
});
//# sourceMappingURL=constants.js.map