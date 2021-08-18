/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

export default new (class {
  // Forbidden term: pr*loadExtension
  /* eslint-disable local/no-forbidden-terms */
  /**
   * @param {string} name
   * @return {!Promise}
   */
  preloadExtension(name) {
    /* eslint-enable local/no-forbidden-terms */
    // We know for sure that we try to load `amp-crypto-polyfill`.
    // In its place, we install it synchronously in the same bundle from amp.js
    if (name !== 'amp-crypto-polyfill') {
      throw new Error(name);
    }
    return Promise.resolve();
  }
})();
