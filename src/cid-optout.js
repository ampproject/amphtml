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

import dev from './log';
import storageForDoc from './services';

const STORAGE_KEY = 'amp-cid-optout';

/**
 * User will be opted out of Cid issuance for all scopes.
 *
 * When opted-out Cid service will reject all `get` requests.
 */
export function globallyOptOutOfCid(ampdoc) {
  const storagePromise = storageForDoc(ampdoc);
  storagePromise.then(storage => {
    storage.set(STORAGE_KEY, true);
  }).catch(reason => {
    dev().error('cid-optout', 'Failed to write to storage', reason);
  });
}

/**
 * Returns whether user has globally opted out of Cid issuance.
 *
 * @return {Promise<boolean>}
 */
export function hasGloballyOptedOutOfCid(ampdoc) {
  const storagePromise = storageForDoc(ampdoc);
  return storagePromise.then(storage => {
    return storage.get(STORAGE_KEY);
  }).catch(reason => {
    dev().error('cid-optout', 'Failed to read storage', reason);
    return false;
  });
}
