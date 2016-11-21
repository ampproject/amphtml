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

/**
 * Allows tracking of AMP elements in the viewport.
 *
 * This class allows a caller to specify conditions to evaluate when an element
 * is in viewport and for how long. If the conditions are satisfied, a provided
 * callback is called. IntersectionObserver is used.
 */
export class VisibilityV2 {
  /** @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc = ampdoc;
  }

  /**
   * @param {!JSONType} config
   * @param {function(!JSONType)} callback
   * @param {boolean} shouldBeVisible True if the element should be visible
   *  when callback is called. False otherwise.
   * @param {!Element} analyticsElement The amp-analytics element that the
   *  config is associated with.
   */
  listenOnce(config, callback, shouldBeVisible,
      /*eslint  no-unused-vars: 0*/ analyticsElement) {
    // TODO: make this happen!
  }
}
