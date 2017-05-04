/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {IntersectionObserverPolyFill} from '../../../src/intersection-observer-polyfill';

/**
 * Returns the singleton instance of the refresher from the window object, or
 * creates and returns one if one has not yet been constructed.
 *
 * @param {!Window} win
 * @return {!Refresher}
 */
export function getRefresherFor(win) {
  const nameInWindow = 'AMP_A4A_REFRESHER';
  return win[nameInWindow] || (win[nameInWindow] = new Refresher(win));
}

const VISIBILITY_THRESHOLD = 0.5;

class Refresher {

  /**
   * @param {!Window}
   */
  constructor(win) {

    /** @const @private {!Window} */
    this.win_ = win;

    /**
     * A mapping of amp-ad base elements to their respective
     * IntersectionObservers.
     *
     * @const @private {!Object<string, !IntersectionObserver>}
     */
    this.intersectionObservers_ = {};

    /**
     * Used to distinguish elements in this.intersectionObservers_. This is
     * incremented with each newly registered element.
     *
     * @private {number}
     */
    this.elementReferenceId_ = 0;
  }

  registerElement(element) {
    const uniqueId = `elementReference.${this.elementReferenceId_++}`;
    const ioConfig = {threshold: VISIBILITY_THRESHOLD};
    const ioCallback = ioEntries => {
      console.log(ioEntries);
    };
    const intersectionObserver = 'IntersectionObserver' in this.win_
        ? this.win_['IntersectionObserver'](ioCallback, ioConfig)
        : new IntersectionObserverPolyfill(ioCallback, ioConfig);
    this.intersectionObservers_[uniqueId] = intersectionObserver;
    intersectionObserver.observe(element);
  }
