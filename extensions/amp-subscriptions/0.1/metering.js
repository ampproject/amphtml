/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-subscriptions';

/**
 * Describes metering state for a single publication.
 * @typedef {{
 *   id: string,
 *   attributes: !Array<{
 *     name: string,
 *     timestamp: string,
 *   }>,
 * }}
 */
let MeteringStateDef;

/** Handles metering functionality. */
export class Metering {
  /**
   *
   * @param {{
   *   platformKey: string,
   * }} params
   */
  constructor({platformKey}) {
    /**
     * Remembers if metering entitlements were fetched
     * with the current metering state.
     *
     * This helps avoid redundant fetches.
     * @type {boolean}
     */
    this.entitlementsWereFetchedWithCurrentMeteringState = false;

    /**
     * Key for the subscription platform with metering enabled.
     * @const
     */
    this.platformKey = platformKey;

    /**
     * Metering state for user.
     * Currently this isn't persisted. It's just saved in memory.
     * @private
     */
    this.meteringStateString_ = '';
  }

  /**
   * Saves metering state for a given publication ID.
   *
   * @param {!MeteringStateDef} meteringState
   * @return {!Promise}
   */
  saveMeteringState(meteringState) {
    const meteringStateString = JSON.stringify(meteringState);

    const meteringStateChangedPromise = Promise.resolve(
      this.meteringStateString_
    ).then((existingMeteringStateString) => {
      const changed = meteringStateString !== existingMeteringStateString;

      // Log when an existing metering state is updated.
      if (existingMeteringStateString && changed) {
        user().info(
          TAG,
          `Meter state changed from ${existingMeteringStateString} to ${meteringStateString}`
        );
      }

      return changed;
    });

    return meteringStateChangedPromise.then((meteringStateChanged) => {
      if (!meteringStateChanged) {
        // Bail. Fetching metering entitlements again is redundant,
        // until the metering state changes.
        return;
      }

      this.meteringStateString_ = meteringStateString;
      this.entitlementsWereFetchedWithCurrentMeteringState = false;
    });
  }

  /**
   * Loads metering state for a given publication ID.
   *
   * @return {!Promise<?MeteringStateDef>}
   */
  loadMeteringState() {
    if (!this.meteringStateString_) {
      return Promise.resolve(null);
    }

    return Promise.resolve(JSON.parse(this.meteringStateString_));
  }
}
