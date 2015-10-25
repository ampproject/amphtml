/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getService} from './service';
import {assert} from './asserts';
import {parseUrl} from './url';

/**
 * @param {!Window} win
 * @return {{canonicalUrl: string}} Info about the doc
 *     - canonicalUrl: The doc's canonical.
 */
export function documentInfoFor(win) {
 	return getService(win, 'documentInfo', () => {
    return {
      canonicalUrl: parseUrl(assert(
          win.document.querySelector('link[rel=canonical]'),
              'AMP files are required to have a <link rel=canonical> tag.')
              .href).href
    };
  });
}
