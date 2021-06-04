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

import {Xhr} from './xhr-impl';
import {getService, registerServiceBuilder} from '../service';
import {getSourceOrigin, removeFragment, resolveRelativeUrl} from '../url';
import {map} from '../core/types/object';

/**
 * A wrapper around the Xhr service which batches the result of GET requests
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class BatchedXhr extends Xhr {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    super(win);

    /** @const {!Object<!Promise<!Response>>} */
    this.fetchPromises_ = map();
  }

  /**
   * Fetch and batch the requests if possible.
   *
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   * @override
   */
  fetch(input, opt_init) {
    const accept =
      (opt_init && opt_init.headers && opt_init.headers['Accept']) || '';
    const isBatchable =
      !opt_init || !opt_init.method || opt_init.method === 'GET';
    const key = this.getMapKey_(input, accept);
    const isBatched = !!this.fetchPromises_[key];

    if (isBatchable && isBatched) {
      return this.fetchPromises_[key].then((response) => response.clone());
    }

    const fetchPromise = super.fetch(input, opt_init);

    if (isBatchable) {
      this.fetchPromises_[key] = fetchPromise.then(
        (response) => {
          delete this.fetchPromises_[key];
          return response.clone();
        },
        (err) => {
          delete this.fetchPromises_[key];
          throw err;
        }
      );
    }

    return fetchPromise;
  }

  /**
   * Creates a map key for a fetch.
   *
   * @param {string} input URL
   * @param {string} responseType
   * @return {string}
   * @private
   */
  getMapKey_(input, responseType) {
    const absoluteUrl = resolveRelativeUrl(
      input,
      getSourceOrigin(this.win.location)
    );
    return removeFragment(absoluteUrl) + responseType;
  }
}

/**
 * @param {!Window} window
 * @return {!BatchedXhr}
 */
export function batchedXhrServiceForTesting(window) {
  installBatchedXhrService(window);
  return getService(window, 'batched-xhr');
}

/**
 * @param {!Window} window
 */
export function installBatchedXhrService(window) {
  registerServiceBuilder(window, 'batched-xhr', BatchedXhr);
}
