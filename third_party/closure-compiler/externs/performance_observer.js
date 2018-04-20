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
 * @see https://w3c.github.io/performance-timeline/
 * @interface
 */
class PerformanceObserver {
  /**
   * @param {function(!PerformanceObserverEntryList)} callback
   */
  constructor(callback) {}

  /**
   * @param {!Object} options
   */
  observe(options) {}

  disconnect() {}
}

/**
 * @see https://w3c.github.io/performance-timeline/#dom-performanceobserverentrylist
 * @interface
 */
class PerformanceObserverEntryList {

  /**
   * @return {!Array<!PerformanceEntry>}
   */
  getEntries() {}

  /**
   * @param {string} type
   * @return {!Array<!PerformanceEntry>}
   */
  getEntriesByType(type) {}

  /**
   * @param {string} name
   * @param {string=} type
   * @return {!Array<!PerformanceEntry>}
   */
  getEntriesByName(name, type) {}
};

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
