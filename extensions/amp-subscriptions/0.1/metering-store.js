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
import {dev} from '../../../src/log';

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

/** Stores metering information for different publications. */
export class MeteringStore {
  /**
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = Services.storageForDoc(ampdoc);
  }

  /**
   * Saves metering state for a given publication ID.
   *
   * @param {!MeteringStateDef} meteringState
   * @return {!Promise}
   */
  saveMeteringState(meteringState) {
    const state = JSON.stringify(meteringState);

    return (
      this.storagePromise_
        .then((storage) => storage.setNonBoolean(STORAGE_KEY, state))
        // Do nothing if we fail to write to localstorage.
        .catch(() => {
          dev().warn(TAG, 'Failed to save metering state.');
        })
    );
  }

  /**
   * Loads metering state for a given publication ID.
   *
   * @return {!Promise<!MeteringStateDef>}
   */
  loadMeteringState() {
    return (
      this.storagePromise_
        .then((storage) => storage.get(STORAGE_KEY))
        .then((value) => JSON.parse(value))
        // Return an empty object if we fail to load from localstorage.
        .catch((err) => {
          console.log(err);
          dev().warn(TAG, 'Failed to load metering state.');
          return {};
        })
    );
  }
}
