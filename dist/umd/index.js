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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Watcher = exports.ScrollMonitorContainer = void 0;
    var container_js_1 = require("./src/container.js");
    Object.defineProperty(exports, "ScrollMonitorContainer", { enumerable: true, get: function () { return container_js_1.ScrollMonitorContainer; } });
    var watcher_js_1 = require("./src/watcher.js");
    Object.defineProperty(exports, "Watcher", { enumerable: true, get: function () { return watcher_js_1.Watcher; } });
    __exportStar(require("./src/types"), exports);
    var constants_js_1 = require("./src/constants.js");
    var container_js_2 = require("./src/container.js");
    // this is needed for the type, but if we're not in a browser the only
    // way listenToDOM will be called is if you call scrollmonitor.createContainer
    // and you can't do that until you have a DOM element.
    var scrollMonitor = new container_js_2.ScrollMonitorContainer(constants_js_1.isInBrowser ? document.body : undefined);
    if (constants_js_1.isInBrowser) {
        scrollMonitor.updateState();
        scrollMonitor.listenToDOM();
    }
    //@ts-ignore
    window.scrollMonitor = scrollMonitor;
    exports.default = scrollMonitor;
});
//# sourceMappingURL=index.js.map