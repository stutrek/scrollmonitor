var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./src/container.js", "./src/watcher.js", "./src/types", "./src/constants.js", "./src/container.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.Watcher = exports.ScrollMonitorContainer = void 0;
    var container_js_1 = require("./src/container.js");
    __createBinding(exports, container_js_1, "ScrollMonitorContainer");
    var watcher_js_1 = require("./src/watcher.js");
    __createBinding(exports, watcher_js_1, "Watcher");
    __exportStar(require("./src/types"), exports);
    var constants_js_1 = require("./src/constants.js");
    var container_js_2 = require("./src/container.js");
    if (constants_js_1.isInBrowser) {
        var scrollMonitor = new container_js_2.ScrollMonitorContainer(document.body);
        scrollMonitor.updateState();
        scrollMonitor.listenToDOM();
        //@ts-ignore
        window.scrollMonitor = scrollMonitor;
    }
    exports["default"] = scrollMonitor;
});
//# sourceMappingURL=index.js.map