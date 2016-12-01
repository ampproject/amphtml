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


import {dev, user} from './log';
import {documentInfoForDoc} from './document-info';
import {getLengthNumeral} from '../src/layout';
import {tryParseJson} from './json';
import {getMode} from './mode';
import {getModeObject} from './mode-object';
import {dashToCamelCase} from './string';
import {parseUrl, assertHttpsUrl} from './url';
import {viewerForDoc} from './viewer';
import {urls} from './config';
import {setStyle} from './style';
import {domFingerprint} from './utils/dom-fingerprint';


/** @type {!Object<string,number>} Number of 3p frames on the for that type. */
let count = {};

/** @type {string} */
let overrideBootstrapBaseUrl;

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!Element} element
 * @param {string=} opt_type
 * @param {Object=} opt_context
 * @return {!Object} Contains
 *     - type, width, height, src attributes of <amp-ad> tag. These have
 *       precedence over the data- attributes.
 *     - data-* attributes of the <amp-ad> tag with the "data-" removed.
 *     - A _context object for internal use.
 */
function getFrameAttributes(parentWindow, element, opt_type, opt_context) {
  const startTime = Date.now();
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');
  const type = opt_type || element.getAttribute('type');
  user().assert(type, 'Attribute type required for <amp-ad>: %s', element);
  const attributes = {};
  // Do these first, as the other attributes have precedence.
  addDataAndJsonAttributes_(element, attributes);
  attributes.width = getLengthNumeral(width);
  attributes.height = getLengthNumeral(height);
  attributes.type = type;
  const docInfo = documentInfoForDoc(element);
  const viewer = viewerForDoc(element);
  let locationHref = parentWindow.location.href;
  // This is really only needed for tests, but whatever. Children
  // see us as the logical origin, so telling them we are about:srcdoc
  // will fail ancestor checks.
  if (locationHref == 'about:srcdoc') {
    locationHref = parentWindow.parent.location.href;
  }
  attributes._context = {
    referrer: viewer.getUnconfirmedReferrerUrl(),
    canonicalUrl: docInfo.canonicalUrl,
    sourceUrl: docInfo.sourceUrl,
    pageViewId: docInfo.pageViewId,
    location: {
      href: locationHref,
    },
    tagName: element.tagName,
    mode: getModeObject(),
    canary: !!(parentWindow.AMP_CONFIG && parentWindow.AMP_CONFIG.canary),
    hidden: !viewer.isVisible(),
    amp3pSentinel: generateSentinel(parentWindow),
    initialIntersection: element.getIntersectionChangeEntry(),
    domFingerprint: domFingerprint(element),
    startTime,
  };
  Object.assign(attributes._context, opt_context);
  const adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes.src = adSrc;
  }
  return attributes;
}

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!Window} parentWindow
 * @param {!Element} parentElement
 * @param {string=} opt_type
 * @param {Object=} opt_context
 * @return {!Element} The iframe.
 */
export function getIframe(parentWindow, parentElement, opt_type, opt_context) {
  // Check that the parentElement is already in DOM. This code uses a new and
  // fast `isConnected` API and thus only used when it's available.
  dev().assert(
      parentElement['isConnected'] === undefined ||
      parentElement['isConnected'] === true,
      'Parent element must be in DOM');
  const attributes =
      getFrameAttributes(parentWindow, parentElement, opt_type, opt_context);
  const iframe = parentWindow.document.createElement('iframe');
  if (!count[attributes.type]) {
    count[attributes.type] = 0;
  }

  const baseUrl = getBootstrapBaseUrl(parentWindow);
  const host = parseUrl(baseUrl).hostname;
  // Pass ad attributes to iframe via the fragment.
  const src = baseUrl + '#' + JSON.stringify(attributes);
  const name = host + '_' + attributes.type + '_' + count[attributes.type]++;

  iframe.src = src;
  iframe.name = name;
  iframe.ampLocation = parseUrl(src);
  iframe.width = attributes.width;
  iframe.height = attributes.height;
  iframe.setAttribute('scrolling', 'no');
  setStyle(iframe, 'border', 'none');
  /** @this {!Element} */
  iframe.onload = function() {
    // Chrome does not reflect the iframe readystate.
    this.readyState = 'complete';
  };
  iframe.setAttribute(
      'data-amp-3p-sentinel', attributes._context.amp3pSentinel);
  return iframe;
}

/**
 * Copies data- attributes from the element into the attributes object.
 * Removes the data- from the name and capitalizes after -. If there
 * is an attribute called json, parses the JSON and adds it to the
 * attributes.
 * @param {!Element} element
 * @param {!Object} attributes The destination.
 * visibleForTesting
 */
export function addDataAndJsonAttributes_(element, attributes) {
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (attr.name.indexOf('data-') != 0) {
      continue;
    }
    attributes[dashToCamelCase(attr.name.substr(5))] = attr.value;
  }
  const json = element.getAttribute('json');
  if (json) {
    const obj = tryParseJson(json);
    if (obj === undefined) {
      throw user().createError(
          'Error parsing JSON in json attribute in element %s',
          element);
    }
    for (const key in obj) {
      attributes[key] = obj[key];
    }
  }
}

/**
 * Preloads URLs related to the bootstrap iframe.
 * @param {!Window} window
 * @param {!./preconnect.Preconnect} preconnect
 */
export function preloadBootstrap(window, preconnect) {
  const url = getBootstrapBaseUrl(window);
  preconnect.preload(url, 'document');

  // While the URL may point to a custom domain, this URL will always be
  // fetched by it.
  const scriptUrl = getMode().localDev
      ? getAdsLocalhost(window) + '/dist.3p/current/integration.js'
      : `${urls.thirdParty}/$internalRuntimeVersion$/f.js`;
  preconnect.preload(scriptUrl, 'script');
}

/**
 * Returns the base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {boolean=} opt_strictForUnitTest
 * @return {string}
 * @visibleForTesting
 */
export function getBootstrapBaseUrl(parentWindow, opt_strictForUnitTest) {
  // The value is cached in a global variable called `bootstrapBaseUrl`;
  const bootstrapBaseUrl = parentWindow.bootstrapBaseUrl;
  if (bootstrapBaseUrl) {
    return bootstrapBaseUrl;
  }
  return parentWindow.bootstrapBaseUrl =
      getCustomBootstrapBaseUrl(parentWindow, opt_strictForUnitTest)
          || getDefaultBootstrapBaseUrl(parentWindow);
}

export function setDefaultBootstrapBaseUrlForTesting(url) {
  overrideBootstrapBaseUrl = url;
}

export function resetBootstrapBaseUrlForTesting(win) {
  win.bootstrapBaseUrl = undefined;
}

/**
 * Returns the default base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {string=} opt_srcFileBasename
 * @return {string}
 */
export function getDefaultBootstrapBaseUrl(parentWindow, opt_srcFileBasename) {
  const srcFileBasename = opt_srcFileBasename || 'frame';
  if (getMode().localDev || getMode().test) {
    if (overrideBootstrapBaseUrl) {
      return overrideBootstrapBaseUrl;
    }
    return getAdsLocalhost(parentWindow)
        + '/dist.3p/'
        + (getMode().minified ? `$internalRuntimeVersion$/${srcFileBasename}`
            : `current/${srcFileBasename}.max`)
        + '.html';
  }
  return 'https://' + getSubDomain(parentWindow) +
      `.${urls.thirdPartyFrameHost}/$internalRuntimeVersion$/` +
      `${srcFileBasename}.html`;
}

function getAdsLocalhost(win) {
  if (urls.localDev) {
    return `//${urls.thirdPartyFrameHost}`;
  }
  return 'http://ads.localhost:'
      + (win.location.port || win.parent.location.port);
}

/**
 * Sub domain on which the 3p iframe will be hosted.
 * Because we only calculate the URL once per page, this function is only
 * called once and hence all frames on a page use the same URL.
 * @return {string}
 * @visibleForTesting
 */
export function getSubDomain(win) {
  return 'd-' + getRandom(win);
}

/**
 * Generates a random non-negative integer.
 * @param {!Window} win
 * @return {string}
 */
export function getRandom(win) {
  let rand;
  if (win.crypto && win.crypto.getRandomValues) {
    // By default use 2 32 bit integers.
    const uint32array = new Uint32Array(2);
    win.crypto.getRandomValues(uint32array);
    rand = String(uint32array[0]) + uint32array[1];
  } else {
    // Fall back to Math.random.
    rand = String(win.Math.random()).substr(2) + '0';
  }
  return rand;
}

/**
 * Returns the custom base URL for 3p bootstrap iframes if it exists.
 * Otherwise null.
 * @param {!Window} parentWindow
 * @param {boolean=} opt_strictForUnitTest
 * @return {?string}
 */
function getCustomBootstrapBaseUrl(parentWindow, opt_strictForUnitTest) {
  const meta = parentWindow.document
      .querySelector('meta[name="amp-3p-iframe-src"]');
  if (!meta) {
    return null;
  }
  const url = assertHttpsUrl(meta.getAttribute('content'), meta);
  user().assert(url.indexOf('?') == -1,
      '3p iframe url must not include query string %s in element %s.',
      url, meta);
  // This is not a security primitive, we just don't want this to happen in
  // practice. People could still redirect to the same origin, but they cannot
  // redirect to the proxy origin which is the important one.
  const parsed = parseUrl(url);
  user().assert((parsed.hostname == 'localhost' && !opt_strictForUnitTest) ||
      parsed.origin != parseUrl(parentWindow.location.href).origin,
      '3p iframe url must not be on the same origin as the current doc' +
      'ument %s (%s) in element %s. See https://github.com/ampproject/amphtml' +
      '/blob/master/spec/amp-iframe-origin-policy.md for details.', url,
      parsed.origin, meta);
  return url + '?$internalRuntimeVersion$';
}

/**
 * Returns a randomized sentinel value for 3p iframes.
 * The format is "%d-%d" with the first value being the depth of current
 * window in the window hierarchy and the second a random integer.
 * @param {!Window} parentWindow
 * @return {string}
 * @visibleForTesting
 */
export function generateSentinel(parentWindow) {
  let windowDepth = 0;
  for (let win = parentWindow; win && win != win.parent; win = win.parent) {
    windowDepth++;
  }
  return String(windowDepth) + '-' + getRandom(parentWindow);
}

/**
 * Resets the count of each 3p frame type
 * @visibleForTesting
 */
export function resetCountForTesting() {
  count = {};
}
