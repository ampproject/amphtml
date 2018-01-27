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
import {Services} from './services';
import {getValueForExpr} from './json';
import {user} from './log';

/**
 * Batch fetches the JSON endpoint at the given element's `src` attribute.
 * Sets the fetch credentials option from the element's `credentials` attribute,
 * if it exists.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @param {string=} opt_expr Dot-syntax reference to subdata of JSON result
 *     to return. If not specified, entire JSON result is returned.
 * @param {string=} opt_expandUrl If 'all', expands the URL without opt-in.
 *     If 'opt', expands the URL with opt-in. Otherwise, doesn't expand.
 * @return {!Promise<!JsonObject|!Array<JsonObject>>} Resolved with JSON
 *     result or rejected if response is invalid.
 */
export function batchFetchJsonFor(
  ampdoc, element, opt_expr = '.', opt_expandUrl = 'none')
{
  const url = assertHttpsUrl(element.getAttribute('src'), element);

  // Replace vars in URL if desired.
  const urlReplacements = Services.urlReplacementsForDoc(ampdoc);
  const srcPromise = (['all', 'opt'].includes(opt_expandUrl))
    ? urlReplacements.expandUrlAsync(url)
    : Promise.resolve(url);

  return srcPromise.then(src => {
    // Throw user error if this element is performing URL substitutions
    // without the soon-to-be-required opt-in (#12498).
    if (opt_expandUrl == 'opt') {
      const unwhitelisted = urlReplacements.collectUnwhitelistedVars(element);
      if (unwhitelisted.length > 0) {
        const TAG = element.tagName;
        user().error(TAG, 'Variable substitutions will soon require opt-in. ' +
            `Please add data-amp-replace="${unwhitelisted.join(' ')}" to ` +
            `the <${TAG}> element. This will stop working soon!`);
      }
    }
    const opts = {};
    if (element.hasAttribute('credentials')) {
      opts.credentials = element.getAttribute('credentials');
    } else {
      opts.requireAmpResponseSourceOrigin = false;
    }
    return Services.batchedXhrFor(ampdoc.win).fetchJson(src, opts);
  }).then(res => res.json()).then(data => {
    if (data == null) {
      throw new Error('Response is undefined.');
    }
    return getValueForExpr(data, opt_expr || '.');
  });
}
