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

import {dev} from '../../../src/log';

/**
 * Maintains state in between different AdSense slots on the same page. This
 * class is used primarily to generate state-dependent ad request URL
 * parameters.
 */
export class AdsenseSharedState {

  constructor() {

    /** @private {!Array<!{id: string, format: string, client: string}>} */
    this.previousSlots_ = [];
  }

  /**
   * Registers a new slot with the given format and client, and identified by
   * the given id.
   *
   * @param {string} format Format of the slot of form WxH.
   * @param {string} id A unique identifier for the slot.
   * @param {string} client The slot's ad client ID.
   * @return !{{prevFmts: string, pv: number}} An object containing the
   * state-dependent ad request URL parameters relevant for this slot.
   * */
  addNewSlot(format, id, client) {
    const result = {pv: 2, prevFmts: ''};
    this.previousSlots_.forEach(slot => {
      dev().assert(slot.id != id);
      result.prevFmts += (result.prevFmts ? ',' : '') + slot.format;
      if (slot.client == client) {
        result.pv = 1;
      }
    });
    this.previousSlots_.push({id, format, client});
    return result;
  }

  /**
   * Removes the slot with the given ID.
   * @param {string} id The ID of the slot to be removed.
   */
  removeSlot(id) {
    this.previousSlots_ = this.previousSlots_.filter(slot => {
      return slot.id != id;
    });
  }

  /**
   * Resets to initial state. Currently used only in testing.
   * @visibleForTesting
   */
  reset() {
    this.previousSlots_ = [];
  }
}
