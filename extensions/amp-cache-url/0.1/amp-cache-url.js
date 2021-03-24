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

import * as ampToolboxCacheUrl from '@ampproject/toolbox-cache-url';

export class AmpCacheUrlService {
  /**
   * Create cache url service
   */
  constructor() {}

  /**
   *
   * @param {string} url
   * @param {string=} cache
   * @return {!Promise<string>}
   */
  createCacheUrl(url, cache = 'cdn.ampproject.org') {
    return ampToolboxCacheUrl.createCacheUrl(cache, url);
  }
}

AMP.extension('amp-cache-url', '0.1', (AMP) => {
  AMP.registerServiceForDoc('cache-url', AmpCacheUrlService);
});
