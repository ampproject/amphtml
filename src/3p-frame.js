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

import {assertHttpsUrl, parseUrlDeprecated} from './url';
import {dev, devAssert, user, userAssert} from './log';
import {dict} from './utils/object';
import {getContextMetadata} from '../src/iframe-attributes';
import {getMode} from './mode';
import {internalRuntimeVersion} from './internal-version';
import {isExperimentOn} from './experiments';
import {setStyle} from './style';
import {startsWith} from './string';
import {tryParseJson} from './json';
import {urls} from './config';

/** @type {!Object<string,number>} Number of 3p frames on the for that type. */
let count = {};

/** @type {string} */
let overrideBootstrapBaseUrl;

/** @const {string} */
const TAG = '3p-frame';

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {string=} opt_type
 * @param {Object=} opt_context
 * @return {!JsonObject} Contains
 *     - type, width, height, src attributes of <amp-ad> tag. These have
 *       precedence over the data- attributes.
 *     - data-* attributes of the <amp-ad> tag with the "data-" removed.
 *     - A _context object for internal use.
 */
function getFrameAttributes(parentWindow, element, opt_type, opt_context) {
  const type = opt_type || element.getAttribute('type');
  userAssert(type, 'Attribute type required for <amp-ad>: %s', element);
  const sentinel = generateSentinel(parentWindow);
  let attributes = dict();
  // Do these first, as the other attributes have precedence.
  addDataAndJsonAttributes_(element, attributes);
  attributes = getContextMetadata(parentWindow, element, sentinel, attributes);
  attributes['type'] = type;
  Object.assign(attributes['_context'], opt_context);
  return attributes;
}

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!Window} parentWindow
 * @param {!AmpElement} parentElement
 * @param {string=} opt_type
 * @param {Object=} opt_context
 * @param {!{
 *   disallowCustom,
 *   allowFullscreen,
 * }=} opt_options Options for the created iframe.
 * @return {!HTMLIFrameElement} The iframe.
 */
export function getIframe(
  parentWindow,
  parentElement,
  opt_type,
  opt_context,
  {disallowCustom, allowFullscreen} = {}
) {
  // Check that the parentElement is already in DOM. This code uses a new and
  // fast `isConnected` API and thus only used when it's available.
  devAssert(
    parentElement['isConnected'] === undefined ||
      parentElement['isConnected'] === true,
    'Parent element must be in DOM'
  );
  const attributes = getFrameAttributes(
    parentWindow,
    parentElement,
    opt_type,
    opt_context
  );
  const iframe = /** @type {!HTMLIFrameElement} */ (parentWindow.document.createElement(
    'iframe'
  ));

  if (!count[attributes['type']]) {
    count[attributes['type']] = 0;
  }
  count[attributes['type']] += 1;

  const baseUrl = getBootstrapBaseUrl(parentWindow, undefined, disallowCustom);
  const host = parseUrlDeprecated(baseUrl).hostname;
  // This name attribute may be overwritten if this frame is chosen to
  // be the master frame. That is ok, as we will read the name off
  // for our uses before that would occur.
  // @see https://github.com/ampproject/amphtml/blob/master/3p/integration.js
  const name = JSON.stringify(
    dict({
      'host': host,
      'type': attributes['type'],
      // https://github.com/ampproject/amphtml/pull/2955
      'count': count[attributes['type']],
      'attributes': attributes,
    })
  );

  iframe.src = baseUrl;
  iframe.ampLocation = parseUrlDeprecated(baseUrl);
  iframe.name = name;
  // Add the check before assigning to prevent IE throw Invalid argument error
  if (attributes['width']) {
    iframe.width = attributes['width'];
  }
  if (attributes['height']) {
    iframe.height = attributes['height'];
  }
  if (attributes['title']) {
    iframe.title = attributes['title'];
  }
  if (allowFullscreen) {
    iframe.setAttribute('allowfullscreen', 'true');
  }
  iframe.setAttribute('scrolling', 'no');
  setStyle(iframe, 'border', 'none');
  /** @this {!Element} */
  iframe.onload = function() {
    // Chrome does not reflect the iframe readystate.
    this.readyState = 'complete';
  };
  if (isExperimentOn(parentWindow, 'no-sync-xhr-in-ads')) {
    // Block synchronous XHR in ad. These are very rare, but super bad for UX
    // as they block the UI thread for the arbitrary amount of time until the
    // request completes.
    iframe.setAttribute('allow', "sync-xhr 'none';");
  }
  const excludeFromSandbox = ['facebook'];
  if (
    isExperimentOn(parentWindow, 'sandbox-ads') &&
    !excludeFromSandbox.includes(opt_type)
  ) {
    applySandbox(iframe);
  }
  iframe.setAttribute(
    'data-amp-3p-sentinel',
    attributes['_context']['sentinel']
  );
  return iframe;
}

/**
 * Copies data- attributes from the element into the attributes object.
 * Removes the data- from the name and capitalizes after -. If there
 * is an attribute called json, parses the JSON and adds it to the
 * attributes.
 * @param {!Element} element
 * @param {!JsonObject} attributes The destination.
 * visibleForTesting
 */
export function addDataAndJsonAttributes_(element, attributes) {
  const {dataset} = element;
  for (const name in dataset) {
    // data-vars- is reserved for amp-analytics
    // see https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/analytics-vars.md#variables-as-data-attribute
    if (!startsWith(name, 'vars')) {
      attributes[name] = dataset[name];
    }
  }
  const json = element.getAttribute('json');
  if (json) {
    const obj = tryParseJson(json);
    if (obj === undefined) {
      throw user().createError(
        'Error parsing JSON in json attribute in element %s',
        element
      );
    }
    for (const key in obj) {
      attributes[key] = obj[key];
    }
  }
}

/**
 * Preloads URLs related to the bootstrap iframe.
 * @param {!Window} win
 * @param {!./preconnect.Preconnect} preconnect
 * @param {boolean=} opt_disallowCustom whether 3p url should not use meta tag.
 */
export function preloadBootstrap(win, preconnect, opt_disallowCustom) {
  const url = getBootstrapBaseUrl(win, undefined, opt_disallowCustom);
  preconnect.preload(url, 'document');

  // While the URL may point to a custom domain, this URL will always be
  // fetched by it.
  const scriptUrl = getMode().localDev
    ? getAdsLocalhost(win) + '/dist.3p/current/integration.js'
    : `${urls.thirdParty}/${internalRuntimeVersion()}/f.js`;
  preconnect.preload(scriptUrl, 'script');
}

/**
 * Returns the base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {boolean=} opt_strictForUnitTest
 * @param {boolean=} opt_disallowCustom whether 3p url should not use meta tag.
 * @return {string}
 * @visibleForTesting
 */
export function getBootstrapBaseUrl(
  parentWindow,
  opt_strictForUnitTest,
  opt_disallowCustom
) {
  const customBootstrapBaseUrl = opt_disallowCustom
    ? null
    : getCustomBootstrapBaseUrl(parentWindow, opt_strictForUnitTest);
  return customBootstrapBaseUrl || getDefaultBootstrapBaseUrl(parentWindow);
}

/**
 * @param {string} url
 */
export function setDefaultBootstrapBaseUrlForTesting(url) {
  overrideBootstrapBaseUrl = url;
}

/**
 * @param {*} win
 */
export function resetBootstrapBaseUrlForTesting(win) {
  win.defaultBootstrapSubDomain = undefined;
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
    return getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename);
  }
  // Ensure same sub-domain is used despite potentially different file.
  parentWindow.defaultBootstrapSubDomain =
    parentWindow.defaultBootstrapSubDomain || getSubDomain(parentWindow);
  return (
    'https://' +
    parentWindow.defaultBootstrapSubDomain +
    `.${urls.thirdPartyFrameHost}/${internalRuntimeVersion()}/` +
    `${srcFileBasename}.html`
  );
}

/**
 * Function to return the development boostrap base URL
 * @param {!Window} parentWindow
 * @param {string} srcFileBasename
 * @return {string}
 */
export function getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename) {
  return (
    overrideBootstrapBaseUrl ||
    getAdsLocalhost(parentWindow) +
      '/dist.3p/' +
      (getMode().minified
        ? `${internalRuntimeVersion()}/${srcFileBasename}`
        : `current/${srcFileBasename}.max`) +
      '.html'
  );
}

/**
 * @param {!Window} win
 * @return {string}
 */
function getAdsLocalhost(win) {
  let adsUrl = urls.thirdParty; // local dev with a non-localhost server
  if (adsUrl == 'https://3p.ampproject.net') {
    adsUrl = 'http://ads.localhost'; // local dev with a localhost server
  }
  return adsUrl + ':' + (win.location.port || win.parent.location.port);
}

/**
 * Sub domain on which the 3p iframe will be hosted.
 * Because we only calculate the URL once per page, this function is only
 * called once and hence all frames on a page use the same URL.
 * @param {!Window} win
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
  const meta = parentWindow.document.querySelector(
    'meta[name="amp-3p-iframe-src"]'
  );
  if (!meta) {
    return null;
  }
  const url = assertHttpsUrl(meta.getAttribute('content'), meta);
  userAssert(
    url.indexOf('?') == -1,
    '3p iframe url must not include query string %s in element %s.',
    url,
    meta
  );
  // This is not a security primitive, we just don't want this to happen in
  // practice. People could still redirect to the same origin, but they cannot
  // redirect to the proxy origin which is the important one.
  const parsed = parseUrlDeprecated(url);
  userAssert(
    (parsed.hostname == 'localhost' && !opt_strictForUnitTest) ||
      parsed.origin != parseUrlDeprecated(parentWindow.location.href).origin,
    '3p iframe url must not be on the same origin as the current document ' +
      '%s (%s) in element %s. See https://github.com/ampproject/amphtml' +
      '/blob/master/spec/amp-iframe-origin-policy.md for details.',
    url,
    parsed.origin,
    meta
  );
  return `${url}?${internalRuntimeVersion()}`;
}

/**
 * Applies a sandbox to the iframe, if the required flags can be allowed.
 * @param {!Element} iframe
 * @visibleForTesting
 */
export function applySandbox(iframe) {
  if (!iframe.sandbox || !iframe.sandbox.supports) {
    return; // Can't feature detect support
  }
  // If these flags are not supported by the UA we don't apply any
  // sandbox.
  const requiredFlags = [
    // This only allows navigation when user interacts and thus prevents
    // ads from auto navigating the user.
    'allow-top-navigation-by-user-activation',
    // Crucial because otherwise even target=_blank opened links are
    // still sandboxed which they may not expect.
    'allow-popups-to-escape-sandbox',
  ];
  // These flags are not feature detected. Put stuff here where either
  // they have always been supported or support is not crucial.
  const otherFlags = [
    'allow-forms',
    // We should consider turning this off! But since the top navigation
    // issue is the big one, we'll leave this allowed for now.
    'allow-modals',
    // Give access to raw mouse movements.
    'allow-pointer-lock',
    // This remains subject to popup blocking, it just makes it supported
    // at all.
    'allow-popups',
    // This applies inside the iframe and is crucial to not break the web.
    'allow-same-origin',
    'allow-scripts',
  ];
  // Not allowed
  // - allow-top-navigation
  // - allow-orientation-lock
  // - allow-pointer-lock
  // - allow-presentation
  for (let i = 0; i < requiredFlags.length; i++) {
    const flag = requiredFlags[i];
    if (!iframe.sandbox.supports(flag)) {
      dev().info(TAG, "Iframe doesn't support %s", flag);
      return;
    }
  }
  iframe.sandbox = requiredFlags.join(' ') + ' ' + otherFlags.join(' ');
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
