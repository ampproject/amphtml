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
 * @param {!Object} options options bag for modifying the request.
 * @param {string|undefined} options.expr Dot-syntax reference to subdata of JSON result.
 *     to return. If not specified, entire JSON result is returned.
 * @param {UrlReplacementPolicy|undefined} options.urlReplacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces allowlisted URL vars. Otherwise, don't expand.
 * @param {boolean|undefined} options.refresh Forces refresh of browser cache.
 * @param {string|undefined} options.xssiPrefix Prefix to optionally
 *     strip from the response before calling parseJson.
 * @return {!Promise<!JsonObject|!Array<JsonObject>>} Resolved with JSON
 *     result or rejected if response is invalid.
 */
export function batchFetchJsonFor(
  ampdoc,
  element,
  {
    expr = '.',
    urlReplacement = UrlReplacementPolicy.NONE,
    refresh = false,
    xssiPrefix = undefined,
  } = {}
) {
  assertHttpsUrl(element.getAttribute('src'), element);
  const xhr = Services.batchedXhrFor(ampdoc.win);
  return requestForBatchFetch(element, urlReplacement, refresh)
    .then((data) => {
      return xhr.fetchJson(data.xhrUrl, data.fetchOpt);
    })
    .then((res) => Services.xhrFor(ampdoc.win).xssiJson(res, xssiPrefix))
    .then((data) => {
      if (data == null) {
        throw new Error('Response is undefined.');
      }
      return getValueForExpr(data, expr || '.');
    })
    .catch((err) => {
      throw user().createError('failed fetching JSON data', err);
    });
}

/**
 * Handles url replacement and constructs the FetchInitJsonDef required for a
 * fetch.
 * @param {!Element} element
 * @param {!UrlReplacementPolicy} replacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces allowlisted URL vars. Otherwise, don't expand.
 * @param {boolean} refresh Forces refresh of browser cache.
 * @return {!Promise<!FetchRequestDef>}
 */
export function requestForBatchFetch(element, replacement, refresh) {
  const url = element.getAttribute('src');

  // Replace vars in URL if desired.
  const urlReplacements = Services.urlReplacementsForDoc(element);
  const promise =
    replacement >= UrlReplacementPolicy.OPT_IN
      ? urlReplacements.expandUrlAsync(url)
      : Promise.resolve(url);

  return promise.then((xhrUrl) => {
    // Throw user error if this element is performing URL substitutions
    // without the soon-to-be-required opt-in (#12498).
    if (replacement == UrlReplacementPolicy.OPT_IN) {
      const invalid = urlReplacements.collectDisallowedVarsSync(element);
      if (invalid.length > 0) {
        throw user().createError(
          'URL variable substitutions in CORS ' +
            'fetches from dynamic URLs (e.g. via amp-bind) require opt-in. ' +
            `Please add data-amp-replace="${invalid.join(' ')}" to the ` +
            `<${element.tagName}> element. See https://bit.ly/amp-var-subs.`
        );
      }
    }
    const fetchOpt = {};
    if (element.hasAttribute('credentials')) {
      fetchOpt.credentials = element.getAttribute('credentials');
    }
    // https://hacks.mozilla.org/2016/03/referrer-and-cache-control-apis-for-fetch/
    if (refresh) {
      fetchOpt.cache = 'reload';
    }
    return {'xhrUrl': xhrUrl, 'fetchOpt': fetchOpt};
  });
}
