/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {
  checkCorsUrl,
  getSourceUrl,
  isProxyOrigin,
  parseUrlDeprecated,
  resolveRelativeUrl,
} from './url';
import {parseSrcset} from './srcset';
import {startsWith} from './string';
import {urls} from './config';
import {user} from './log';

const TAG = 'URL-REWRITE';

/** @private @const {string} */
const ORIGINAL_TARGET_VALUE = '__AMP_ORIGINAL_TARGET_VALUE_';

/**
 * The same as rewriteAttributeValue() but actually updates the element and
 * modifies other related attribute(s) for special cases, i.e. `target` for <a>.
 * @param {!Element} element
 * @param {string} attrName
 * @param {string} attrValue
 * @param {!Location=} opt_location
 * @param {boolean=} opt_updateProperty
 * @return {string}
 */
export function rewriteAttributesForElement(
  element,
  attrName,
  attrValue,
  opt_location,
  opt_updateProperty
) {
  const tag = element.tagName.toLowerCase();
  const attr = attrName.toLowerCase();
  const rewrittenValue = rewriteAttributeValue(tag, attr, attrValue);
  // When served from proxy (CDN), changing an <a> tag from a hash link to a
  // non-hash link requires updating `target` attribute per cache modification
  // rules. @see amp-cache-modifications.md#url-rewrites
  const isProxy = isProxyOrigin(opt_location || self.location);
  if (isProxy && tag === 'a' && attr === 'href') {
    const oldValue = element.getAttribute(attr);
    const newValueIsHash = rewrittenValue[0] === '#';
    const oldValueIsHash = oldValue && oldValue[0] === '#';

    if (newValueIsHash && !oldValueIsHash) {
      // Save the original value of `target` so it can be restored (if needed).
      if (!element[ORIGINAL_TARGET_VALUE]) {
        element[ORIGINAL_TARGET_VALUE] = element.getAttribute('target');
      }
      element.removeAttribute('target');
    } else if (oldValueIsHash && !newValueIsHash) {
      // Restore the original value of `target` or default to `_top`.
      element.setAttribute('target', element[ORIGINAL_TARGET_VALUE] || '_top');
    }
  }
  if (opt_updateProperty) {
    // Must be done first for <input> elements to correctly update the UI for
    // the first change on Safari and Chrome.
    element[attr] = rewrittenValue;
  }
  element.setAttribute(attr, rewrittenValue);
  return rewrittenValue;
}

/**
 * If (tagName, attrName) is a CDN-rewritable URL attribute, returns the
 * rewritten URL value. Otherwise, returns the unchanged `attrValue`.
 * See resolveUrlAttr() for rewriting rules.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @return {string}
 * @private
 * @visibleForTesting
 */
export function rewriteAttributeValue(tagName, attrName, attrValue) {
  if (isUrlAttribute(attrName)) {
    return resolveUrlAttr(tagName, attrName, attrValue, self.location);
  }
  return attrValue;
}

/**
 * @param {string} attrName Lowercase attribute name.
 * @return {boolean}
 */
export function isUrlAttribute(attrName) {
  return attrName == 'src' || attrName == 'href' || attrName == 'srcset';
}

/**
 * Rewrites the URL attribute values. URLs are rewritten as following:
 * - If URL is absolute, it is not rewritten
 * - If URL is relative, it's rewritten as absolute against the source origin
 * - If resulting URL is a `http:` URL and it's for image, the URL is rewritten
 *   again to be served with AMP Cache (cdn.ampproject.org).
 *
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @param {!Location} windowLocation
 * @return {string}
 * @private
 * @visibleForTesting
 */
export function resolveUrlAttr(tagName, attrName, attrValue, windowLocation) {
  checkCorsUrl(attrValue);
  const isProxyHost = isProxyOrigin(windowLocation);
  const baseUrl = parseUrlDeprecated(getSourceUrl(windowLocation));

  if (attrName == 'href' && !startsWith(attrValue, '#')) {
    return resolveRelativeUrl(attrValue, baseUrl);
  }

  if (attrName == 'src') {
    if (tagName == 'amp-img') {
      return resolveImageUrlAttr(attrValue, baseUrl, isProxyHost);
    }
    return resolveRelativeUrl(attrValue, baseUrl);
  }

  if (attrName == 'srcset') {
    let srcset;
    try {
      srcset = parseSrcset(attrValue);
    } catch (e) {
      // Do not fail the whole template just because one srcset is broken.
      // An AMP element will pick it up and report properly.
      user().error(TAG, 'Failed to parse srcset: ', e);
      return attrValue;
    }
    return srcset.stringify(url =>
      resolveImageUrlAttr(url, baseUrl, isProxyHost)
    );
  }

  return attrValue;
}

/**
 * Non-HTTPs image URLs are rewritten via proxy.
 * @param {string} attrValue
 * @param {!Location} baseUrl
 * @param {boolean} isProxyHost
 * @return {string}
 */
function resolveImageUrlAttr(attrValue, baseUrl, isProxyHost) {
  const src = parseUrlDeprecated(resolveRelativeUrl(attrValue, baseUrl));

  // URLs such as `data:` or proxy URLs are returned as is. Unsafe protocols
  // do not arrive here - already stripped by the sanitizer.
  if (src.protocol == 'data:' || isProxyOrigin(src) || !isProxyHost) {
    return src.href;
  }

  // Rewrite as a proxy URL.
  return (
    `${urls.cdn}/i/` +
    (src.protocol == 'https:' ? 's/' : '') +
    encodeURIComponent(src.host) +
    src.pathname +
    (src.search || '') +
    (src.hash || '')
  );
}
