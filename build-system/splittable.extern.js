var System = {};
/**
 * @param {string} module
 * @return {!Promise}
 */
System.import = function(module) {};

/**
 * @type {!Window}
 */
window.global;

/**
 * @typedef {function(!PerformanceObserverEntryList, !PerformanceObserver): void}
 */
var PerformanceObserverCallback;

/**
 * See:
 * https://w3c.github.io/performance-timeline/#the-performanceobserver-interface
 * @constructor
 * @param {!PerformanceObserverCallback} callback
 */
function PerformanceObserver(callback) {}

/**
 * @param {!PerformanceObserverInit} options
 */
PerformanceObserver.prototype.observe = function(options) {};

/** @return {void} */
PerformanceObserver.prototype.disconnect = function() {};

/**
 * @record
 */
function PerformanceObserverInit() {}

/** @type {undefined|!Array<string>} */
PerformanceObserverInit.prototype.entryTypes;
/** @type {undefined|boolean} */
PerformanceObserverInit.prototype.buffered;

/**
 * @constructor
 */
function PerformanceObserverEntryList() {}

/** @return {!Array<!PerformanceEntry>} */
PerformanceObserverEntryList.prototype.getEntries = function() {};
/**
 * @param {string} type
 * @return {!Array<!PerformanceEntry>}
 */
PerformanceObserverEntryList.prototype.getEntriesByName = function(type) {};
/**
 * @param {string} name
 * @param {string=} opt_type
 * @return {!Array<!PerformanceEntry>}
 */
PerformanceObserverEntryList.prototype.getEntriesByType = function(
    name, opt_type) {};
