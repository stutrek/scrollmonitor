(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./src/constants.js", "./src/container.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var constants_js_1 = require("./src/constants.js");
    var container_js_1 = require("./src/container.js");
    if (constants_js_1.isInBrowser) {
        var scrollMonitor = new container_js_1["default"](document.body);
        scrollMonitor.updateState();
        scrollMonitor.listenToDOM();
        //@ts-ignore
        window.scrollMonitor = scrollMonitor;
    }
    exports["default"] = scrollMonitor;
});
//# sourceMappingURL=index.js.map