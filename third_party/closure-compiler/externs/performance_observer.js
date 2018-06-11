/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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

/**
 * @see https://w3c.github.io/longtasks/#sec-TaskAttributionTiming
 * @typedef {{
 *   name: string,
 *   entryType: string,
 *   startTime: number,
 *   duration: number,
 *   containerType: string,
 *   containerSrc: string,
 *   containerId: string,
 *   containerName: string,
 * }}
 */
var TaskAttributionTiming;

