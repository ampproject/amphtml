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

import {Services} from './services';
import {assertHttpsUrl} from './url';
import {getValueForExpr} from './json';
import {user} from './log';

/**
 * @enum {number}
 */
export const UrlReplacementPolicy = {
  NONE: 0,
  OPT_IN: 1,
  ALL: 2,
};

/**
 * Batch fetches the JSON endpoint at the given element's `src` attribute.
 * Sets the fetch credentials option from the element's `credentials` attribute,
 * if it exists.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @param {string=} opt_expr Dot-syntax reference to subdata of JSON result
 *     to return. If not specified, entire JSON result is returned.
 * @param {UrlReplacementPolicy=} opt_urlReplacement If ALL, replaces all URL vars.
 *     If OPT_IN, replaces whitelisted URL vars. Otherwise, don't expand.
 * @return {!Promise<!JsonObject|!Array<JsonObject>>} Resolved with JSON
 *     result or rejected if response is invalid.
 */
export function batchFetchJsonFor(
  ampdoc,
  element,
  opt_expr = '.',
  opt_urlReplacement = UrlReplacementPolicy.NONE)
{
  const url = assertHttpsUrl(element.getAttribute('src'), element);

  // Replace vars in URL if desired.
  const urlReplacements = Services.urlReplacementsForDoc(ampdoc);
  const srcPromise = (opt_urlReplacement >= UrlReplacementPolicy.OPT_IN)
    ? urlReplacements.expandUrlAsync(url)
    : Promise.resolve(url);

  return srcPromise.then(src => {
    // Throw user error if this element is performing URL substitutions
    // without the soon-to-be-required opt-in (#12498).
    if (opt_urlReplacement == UrlReplacementPolicy.OPT_IN) {
      urlReplacements.collectUnwhitelistedVars(element).then(unwhitelisted => {
        if (unwhitelisted.length > 0) {
          const TAG = element.tagName;
          user().error(TAG, 'URL variable substitutions in CORS fetches ' +
              'triggered by amp-bind will soon require opt-in. Please add ' +
              `data-amp-replace="${unwhitelisted.join(' ')}" to the ` +
              `<${TAG}> element. See "bit.ly/amp-var-subs" for details.`);
        }
      });
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
