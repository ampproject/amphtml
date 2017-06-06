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

import {assertHttpsUrl} from './url';
import {batchedXhrFor, urlReplacementsForDoc} from './services';
import {getValueForExpr} from './json';

/**
 * Batch fetches the JSON endpoint at the given element's `src` attribute.
 * Sets the fetch credentials option from the element's `credentials` attribute,
 * if it exists.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @param {string=} opt_expr Dot-syntax reference to subdata of JSON result
 *     to return. If not specified, entire JSON result is returned.
 * @return {!Promise<JSONType>} Resolved with JSON result or rejected if
 *     response is invalid.
 */
export function fetchBatchedJsonFor(ampdoc, element, opt_expr) {
  const url = assertHttpsUrl(element.getAttribute('src'), element);
  return urlReplacementsForDoc(ampdoc).expandAsync(url).then(src => {
    const opts = {};
    if (element.hasAttribute('credentials')) {
      opts.credentials = element.getAttribute('credentials');
    } else {
      opts.requireAmpResponseSourceOrigin = false;
    }
    return batchedXhrFor(ampdoc.win).fetchJson(src, opts);
  }).then(res => res.json()).then(data => {
    if (data == null) {
      throw new Error('Response is undefined.');
    }
    return getValueForExpr(data, opt_expr || '.');
  });
}
