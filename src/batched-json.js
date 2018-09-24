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
 * @param {UrlReplacementPolicy=} opt_urlReplacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces whitelisted URL vars. Otherwise, don't expand..
 * @return {!Promise<!JsonObject|!Array<JsonObject>>} Resolved with JSON
 *     result or rejected if response is invalid.
 */
export function batchFetchJsonFor(
  ampdoc,
  element,
  opt_expr = '.',
  opt_urlReplacement = UrlReplacementPolicy.NONE)
{
  assertHttpsUrl(element.getAttribute('src'), element);
  return requestForBatchFetch(ampdoc, element, opt_urlReplacement)
      .then(data => {
        return Services.batchedXhrFor(ampdoc.win)
            .fetchJson(data['xhrUrl'], data['fetchOpt']);
      }).then(res => res.json()).then(data => {
        if (data == null) {
          throw new Error('Response is undefined.');
        }
        return getValueForExpr(data, opt_expr || '.');
      });
}

/**
 * Handles url replacement and constructs the FetchInitJsonDef required for a
 * fetch.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @param {!UrlReplacementPolicy} opt_urlReplacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces whitelisted URL vars. Otherwise, don't expand.
 * @return {!Promise<!./service/xhr-impl.FetchRequestDef>}
 */
export function requestForBatchFetch(
  ampdoc,
  element,
  opt_urlReplacement) {
  const url = element.getAttribute('src');
  // Replace vars in URL if desired.
  const urlReplacements = Services.urlReplacementsForDoc(ampdoc);
  const srcPromise = (opt_urlReplacement >= UrlReplacementPolicy.OPT_IN)
    ? urlReplacements.expandUrlAsync(url) : Promise.resolve(url);
  return srcPromise.then(xhrUrl => {
    // Throw user error if this element is performing URL substitutions
    // without the soon-to-be-required opt-in (#12498).
    if (opt_urlReplacement == UrlReplacementPolicy.OPT_IN) {
      const invalid = urlReplacements.collectUnwhitelistedVarsSync(element);
      if (invalid.length > 0) {
        throw user().createError('URL variable substitutions in CORS ' +
            'fetches from dynamic URLs (e.g. via amp-bind) require opt-in. ' +
            `Please add data-amp-replace="${invalid.join(' ')}" to the ` +
           `<${element.tagName}> element. See https://bit.ly/amp-var-subs.`);
      }
    }
    const fetchOpt = {};
    if (element.hasAttribute('credentials')) {
      fetchOpt.credentials = element.getAttribute('credentials');
    } else {
      fetchOpt.requireAmpResponseSourceOrigin = false;
    }
    return {xhrUrl, fetchOpt};
  });
}
