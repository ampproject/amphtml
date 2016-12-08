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

export class AdsenseSharedState {

  constructor() {

    /**
     * @const {!Array<string>}
     * @private
     */
    this.prevFmts_ = [];

    /**
     * @const {!Object<string, number>}
     * @private
     */
    this.pv_ = {};
  }

  /**
   * Returns the formats of the previous slots as a comma separated list.
   * @return {string}
   */
  getPrevFmts() {
    return this.prevFmts_.join(',');
  }

  /**
   * Adds a format to the list of previous formats.
   * @param {string} format The format to add.
   */
  addFormat(format) {
    this.prevFmts_.push(format);
  }

  /**
   * Returns the page view, 2 for the first slot, and 1 for all subsequent slots
   * with the same ad client ID.
   * @param {string} adClientId The ad client id.
   * @return {number} The page view.
   */
  getPv(adClientId) {
    if (this.pv_[adClientId]) {
      this.pv_[adClientId] = 1;
    } else {
      this.pv_[adClientId] = 2;
    }
    return this.pv_[adClientId];
  }

}
