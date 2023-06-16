import {getOptionalSandboxFlags, getRequiredSandboxFlags} from '#core/3p-frame';
import {setStyle} from '#core/dom/style';
import * as mode from '#core/mode';
import {tryParseJson} from '#core/types/object/json';

import {dev, devAssert, user, userAssert} from '#utils/log';

import * as urls from './config/urls';
import {getContextMetadata} from './iframe-attributes';
import {assertHttpsUrl, parseUrlDeprecated} from './url';

/** @type {!{[key: string]: number}} Number of 3p frames on the for that type. */
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
  let attributes = {};
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
 * @param {{
 *   allowFullscreen: (boolean|undefined),
 *   initialIntersection: (IntersectionObserverEntry|undefined),
 * }=} options Options for the created iframe.
 * @return {!HTMLIFrameElement} The iframe.
 */
export function getIframe(
  parentWindow,
  parentElement,
  opt_type,
  opt_context,
  options = {}
) {
  const {allowFullscreen = false, initialIntersection} = options;
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
  if (initialIntersection) {
    attributes['_context']['initialIntersection'] = initialIntersection;
  }

  const iframe = /** @type {!HTMLIFrameElement} */ (
    parentWindow.document.createElement('iframe')
  );

  if (!count[attributes['type']]) {
    count[attributes['type']] = 0;
  }
  count[attributes['type']] += 1;

  const ampdoc = parentElement.getAmpDoc();
  const baseUrl = getBootstrapBaseUrl(parentWindow, ampdoc);
  const host = parseUrlDeprecated(baseUrl).hostname;
  // This name attribute may be overwritten if this frame is chosen to
  // be the master frame. That is ok, as we will read the name off
  // for our uses before that would occur.
  // @see https://github.com/ampproject/amphtml/blob/main/3p/integration.js
  const name = JSON.stringify({
    'host': host,
    'bootstrap': getBootstrapUrl(attributes['type']),
    'type': attributes['type'],
    // https://github.com/ampproject/amphtml/pull/2955
    'count': count[attributes['type']],
    'attributes': attributes,
  });

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
  iframe.onload = function () {
    // Chrome does not reflect the iframe readystate.
    this.readyState = 'complete';
  };
  // Block synchronous XHR in ad. These are very rare, but super bad for UX
  // as they block the UI thread for the arbitrary amount of time until the
  // request completes.
  iframe.setAttribute('allow', "sync-xhr 'none';");
  const excludeFromSandbox = ['facebook'];
  if (!excludeFromSandbox.includes(opt_type)) {
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
    // see https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/analytics-vars.md#variables-as-data-attribute
    if (!name.startsWith('vars')) {
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
 * Get the bootstrap script URL for iframe.
 * @param {string} type
 * @return {string}
 */
export function getBootstrapUrl(type) {
  const extension = mode.isEsm() ? '.mjs' : '.js';
  if (mode.isProd()) {
    return `${urls.thirdParty}/${mode.version()}/vendor/${type}${extension}`;
  }
  const filename = mode.isMinified()
    ? `./vendor/${type}`
    : `./vendor/${type}.max`;
  return filename + extension;
}

/**
 * Preloads URLs related to the bootstrap iframe.
 * @param {!Window} win
 * @param {string} type
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!./preconnect.PreconnectService} preconnect
 */
export function preloadBootstrap(win, type, ampdoc, preconnect) {
  const url = getBootstrapBaseUrl(win, ampdoc);
  preconnect.preload(ampdoc, url, 'document');

  // While the URL may point to a custom domain, this URL will always be
  // fetched by it.
  preconnect.preload(ampdoc, getBootstrapUrl(type), 'script');
}

/**
 * Returns the base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {boolean=} opt_strictForUnitTest
 * @return {string}
 * @visibleForTesting
 */
export function getBootstrapBaseUrl(
  parentWindow,
  ampdoc,
  opt_strictForUnitTest
) {
  return (
    getCustomBootstrapBaseUrl(parentWindow, ampdoc, opt_strictForUnitTest) ||
    getDefaultBootstrapBaseUrl(parentWindow)
  );
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
  win.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN = undefined;
}

/**
 * Returns the default base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {string=} opt_srcFileBasename
 * @return {string}
 */
export function getDefaultBootstrapBaseUrl(parentWindow, opt_srcFileBasename) {
  const srcFileBasename = opt_srcFileBasename || 'frame';
  if (!mode.isProd()) {
    return getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename);
  }
  // Ensure same sub-domain is used despite potentially different file.
  parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN =
    parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN ||
    getSubDomain(parentWindow);
  return (
    'https://' +
    parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN +
    `.${urls.thirdPartyFrameHost}/${mode.version()}/` +
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
      (mode.isMinified()
        ? `${mode.version()}/${srcFileBasename}`
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
  return (
    adsUrl +
    ':' +
    (new URL(win.document.baseURI)?.port ||
      win.location.port ||
      win.parent.location.port)
  );
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
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {boolean=} opt_strictForUnitTest
 * @return {?string}
 */
function getCustomBootstrapBaseUrl(
  parentWindow,
  ampdoc,
  opt_strictForUnitTest
) {
  const meta = ampdoc.getMetaByName('amp-3p-iframe-src');
  if (!meta) {
    return null;
  }
  const url = assertHttpsUrl(meta, 'meta[name="amp-3p-iframe-src"]');
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
      '/blob/main/docs/spec/amp-iframe-origin-policy.md for details.',
    url,
    parsed.origin,
    meta
  );
  return `${url}?${mode.version()}`;
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
  const requiredFlags = getRequiredSandboxFlags();
  for (let i = 0; i < requiredFlags.length; i++) {
    const flag = requiredFlags[i];
    if (!iframe.sandbox.supports(flag)) {
      dev().info(TAG, "Iframe doesn't support %s", flag);
      return;
    }
  }
  iframe.sandbox =
    requiredFlags.join(' ') + ' ' + getOptionalSandboxFlags().join(' ');
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
