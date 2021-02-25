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

import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';

/** @const */
const TAG = 'amp-subscriptions';

/** @const */
const STORAGE_KEY = 'amp-subscriptions:metering-store';

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
   *   ampdoc: !../../../src/service/ampdoc-impl.AmpDoc,
   *   platformKey: string,
   * }} params
   */
  constructor({ampdoc, platformKey}) {
    /** @private {Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);

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
  }

  /**
   * Saves metering state for a given publication ID.
   *
   * @param {!MeteringStateDef} meteringState
   * @return {!Promise}
   */
  saveMeteringState(meteringState) {
    const meteringStateString = JSON.stringify(meteringState);

    const meteringStateChangedPromise = this.loadMeteringStateString_().then(
      (existingMeteringStateString) => {
        const changed = meteringStateString !== existingMeteringStateString;

        // Log when an existing metering state is updated.
        if (existingMeteringStateString && changed) {
          user().info(
            TAG,
            `Meter state changed from ${existingMeteringStateString} to ${meteringStateString}`
          );
        }

        return changed;
      }
    );

    return meteringStateChangedPromise.then((meteringStateChanged) => {
      if (!meteringStateChanged) {
        // Bail. Fetching metering entitlements again is redundant,
        // until the metering state changes.
        return Promise.resolve();
      }

      return (
        this.storagePromise_
          // Save state.
          .then((storage) =>
            storage.setNonBoolean(STORAGE_KEY, meteringStateString)
          )
          // Reset flag.
          .then(() => {
            this.entitlementsWereFetchedWithCurrentMeteringState = false;
          })
          // Handle failure.
          .catch(() => {
            dev().warn(TAG, 'Failed to save metering state.');
          })
      );
    });
  }

  /**
   * Loads metering state for a given publication ID.
   *
   * @return {!Promise<?MeteringStateDef>}
   */
  loadMeteringState() {
    return (
      this.loadMeteringStateString_()
        // Parse state.
        .then((value) => (value && JSON.parse(value)) || null)
        // Handle failure.
        .catch(() => {
          dev().warn(TAG, 'Failed to load metering state.');
          return null;
        })
    );
  }

  /**
   * Loads metering state string (unparsed) for a given publication ID.
   *
   * @private
   * @return {!Promise<string|undefined>}
   */
  loadMeteringStateString_() {
    return this.storagePromise_.then((storage) => storage.get(STORAGE_KEY));
  }
}
