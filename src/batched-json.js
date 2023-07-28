import {getValueForExpr} from '#core/types/object';

import {Services} from '#service';

import {user} from '#utils/log';

import {assertHttpsUrl} from './url';

/**
 * Detail of each `options` property:
 * expr - Dot-syntax reference to subdata of JSON result to return. If not specified,
 *     entire JSON result is returned.
 * url - Url to fetch; defaults to element's `src` attribute
 * urlReplacement - If ALL, replaces all URL vars. If OPT_IN, replaces allowlisted
 *     URL vars. Otherwise, don't expand.
 * refresh - Forces refresh of browser cache.
 * xssiPrefix - Prefix to optionally strip from the response before calling parseJson.
 *
 * @typedef {{
 *  expr:(string|undefined),
 *  urlReplacement: (UrlReplacementPolicy_Enum|undefined),
 *  refresh: (boolean|undefined),
 *  xssiPrefix: (string|undefined),
 *  url: (string|undefined),
 * }}
 */
export let BatchFetchOptionsDef;

/**
 * @enum {number}
 */
export const UrlReplacementPolicy_Enum = {
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
 * @param {!BatchFetchOptionsDef} options options bag for modifying the request.
 * @return {!Promise<!JsonObject|!Array<JsonObject>>} Resolved with JSON
 *     result or rejected if response is invalid.
 */
export function batchFetchJsonFor(ampdoc, element, options = {}) {
  const {
    expr = '.',
    refresh = false,
    url = element.getAttribute('src'),
    urlReplacement = UrlReplacementPolicy_Enum.NONE,
    xssiPrefix = undefined,
  } = options;
  assertHttpsUrl(url, element);
  const xhr = Services.batchedXhrFor(ampdoc.win);
  return requestForBatchFetch(element, url, urlReplacement, refresh)
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
 * @param {string} url
 * @param {!UrlReplacementPolicy_Enum} replacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces allowlisted URL vars. Otherwise, don't expand.
 * @param {boolean} refresh Forces refresh of browser cache.
 * @return {!Promise<!FetchRequestDef>}
 */
export function requestForBatchFetch(element, url, replacement, refresh) {
  // Replace vars in URL if desired.
  const urlReplacements = Services.urlReplacementsForDoc(element);
  const promise =
    replacement >= UrlReplacementPolicy_Enum.OPT_IN
      ? urlReplacements.expandUrlAsync(url)
      : Promise.resolve(url);

  return promise.then((xhrUrl) => {
    // Throw user error if this element is performing URL substitutions
    // without the soon-to-be-required opt-in (#12498).
    if (replacement === UrlReplacementPolicy_Enum.OPT_IN) {
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
