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

    /** @private {!Array<string>} */
    this.prevFmts_ = [];

    /** @private {!Object<string, number>} */
    this.adkFormatIndexMap_ = {};

    /** @private {number} */
    this.formatIndex_ = 0;

    /** @private {!Object<string, number>} */
    this.pv_ = {};
  }

  /**
   * Returns the formats of the previous slots as a comma separated list.
   * @param {string} format The format to add.
   * @param {string} id Unique identifier for slot.
   * @return {string}
   */
  updateAndGetPrevFmts(format, id) {
    // The return value.
    const prevFmts = this.prevFmts_.join(',');
    // Associate the insertion index with the given id for future removal.
    this.adkFormatIndexMap_[id] = this.formatIndex_++;

    this.prevFmts_.push(format);
    return prevFmts;
  }

  /**
   * Removes the format associated with the given adkey.
   * @param {string} id The unique ID associated with the format to be removed.
   */
  removePreviousFormat(id) {
    // Get index of format associated with given adk.
    const n = this.adkFormatIndexMap_[id];
    // Delete the association.
    delete this.adkFormatIndexMap_[id];

    // Decrement next insertion index.
    this.formatIndex_--;

    this.prevFmts_.splice(n, 1);
    // Decrement all indexes greater than n to compensate for the removal of the
    // nth item in the array.
    for (const key in this.adkFormatIndexMap_) {
      if (this.adkFormatIndexMap_[key] > n) {
        this.adkFormatIndexMap_[key]--;
      }
    }
  }

  /**
   * Returns the page view, 2 for the first slot, and 1 for all subsequent slots
   * with the same ad client ID.
   * @param {string} adClientId The ad client id.
   * @return {number} The page view.
   */
  updateAndGetPv(adClientId) {
    this.pv_[adClientId] = this.pv_[adClientId] ? 1 : 2;
    return this.pv_[adClientId];
  }

  /**
   * Resets to initial state.
   */
  reset() {
    this.prevFmts_ = [];
    this.pv_ = {};
  }
}
