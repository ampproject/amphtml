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
import * as mode from "./core/mode";
import { urls } from "./config";
import { getOptionalSandboxFlags, getRequiredSandboxFlags } from "./core/3p-frame";
import { setStyle } from "./core/dom/style";
import { dict } from "./core/types/object";
import { tryParseJson } from "./core/types/object/json";
import { getContextMetadata } from "./iframe-attributes";
import { internalRuntimeVersion } from "./internal-version";
import { dev, devAssert, user, userAssert } from "./log";
import { getMode } from "./mode";
import { assertHttpsUrl, parseUrlDeprecated } from "./url";

/** @type {!Object<string,number>} Number of 3p frames on the for that type. */
var count = {};

/** @type {string} */
var overrideBootstrapBaseUrl;

/** @const {string} */
var TAG = '3p-frame';

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
  var type = opt_type || element.getAttribute('type');
  userAssert(type, 'Attribute type required for <amp-ad>: %s', element);
  var sentinel = generateSentinel(parentWindow);
  var attributes = dict();
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
export function getIframe(parentWindow, parentElement, opt_type, opt_context, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$allowFullscr = _options.allowFullscreen,
      allowFullscreen = _options$allowFullscr === void 0 ? false : _options$allowFullscr,
      initialIntersection = _options.initialIntersection;
  // Check that the parentElement is already in DOM. This code uses a new and
  // fast `isConnected` API and thus only used when it's available.
  devAssert(parentElement['isConnected'] === undefined || parentElement['isConnected'] === true, 'Parent element must be in DOM');
  var attributes = getFrameAttributes(parentWindow, parentElement, opt_type, opt_context);

  if (initialIntersection) {
    attributes['_context']['initialIntersection'] = initialIntersection;
  }

  var iframe =
  /** @type {!HTMLIFrameElement} */
  parentWindow.document.createElement('iframe');

  if (!count[attributes['type']]) {
    count[attributes['type']] = 0;
  }

  count[attributes['type']] += 1;
  var ampdoc = parentElement.getAmpDoc();
  var baseUrl = getBootstrapBaseUrl(parentWindow, ampdoc);
  var host = parseUrlDeprecated(baseUrl).hostname;
  // This name attribute may be overwritten if this frame is chosen to
  // be the master frame. That is ok, as we will read the name off
  // for our uses before that would occur.
  // @see https://github.com/ampproject/amphtml/blob/main/3p/integration.js
  var name = JSON.stringify(dict({
    'host': host,
    'bootstrap': getBootstrapUrl(attributes['type']),
    'type': attributes['type'],
    // https://github.com/ampproject/amphtml/pull/2955
    'count': count[attributes['type']],
    'attributes': attributes
  }));
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
  var excludeFromSandbox = ['facebook'];

  if (!excludeFromSandbox.includes(opt_type)) {
    applySandbox(iframe);
  }

  iframe.setAttribute('data-amp-3p-sentinel', attributes['_context']['sentinel']);
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
  var dataset = element.dataset;

  for (var name in dataset) {
    // data-vars- is reserved for amp-analytics
    // see https://github.com/ampproject/amphtml/blob/main/extensions/amp-analytics/analytics-vars.md#variables-as-data-attribute
    if (!name.startsWith('vars')) {
      attributes[name] = dataset[name];
    }
  }

  var json = element.getAttribute('json');

  if (json) {
    var obj = tryParseJson(json);

    if (obj === undefined) {
      throw user().createError('Error parsing JSON in json attribute in element %s', element);
    }

    for (var key in obj) {
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
  var extension = false ? '.mjs' : '.js';

  if (getMode().localDev || getMode().test) {
    var filename = mode.isMinified() ? "./vendor/" + type : "./vendor/" + type + ".max";
    return filename + extension;
  }

  return urls.thirdParty + "/" + internalRuntimeVersion() + "/vendor/" + type + extension;
}

/**
 * Preloads URLs related to the bootstrap iframe.
 * @param {!Window} win
 * @param {string} type
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!./preconnect.PreconnectService} preconnect
 */
export function preloadBootstrap(win, type, ampdoc, preconnect) {
  var url = getBootstrapBaseUrl(win, ampdoc);
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
export function getBootstrapBaseUrl(parentWindow, ampdoc, opt_strictForUnitTest) {
  return getCustomBootstrapBaseUrl(parentWindow, ampdoc, opt_strictForUnitTest) || getDefaultBootstrapBaseUrl(parentWindow);
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
  var srcFileBasename = opt_srcFileBasename || 'frame';

  if (getMode().localDev || getMode().test) {
    return getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename);
  }

  // Ensure same sub-domain is used despite potentially different file.
  parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN = parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN || getSubDomain(parentWindow);
  return 'https://' + parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN + ("." + urls.thirdPartyFrameHost + "/" + internalRuntimeVersion() + "/") + (srcFileBasename + ".html");
}

/**
 * Function to return the development boostrap base URL
 * @param {!Window} parentWindow
 * @param {string} srcFileBasename
 * @return {string}
 */
export function getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename) {
  return overrideBootstrapBaseUrl || getAdsLocalhost(parentWindow) + '/dist.3p/' + (mode.isMinified() ? internalRuntimeVersion() + "/" + srcFileBasename : "current/" + srcFileBasename + ".max") + '.html';
}

/**
 * @param {!Window} win
 * @return {string}
 */
function getAdsLocalhost(win) {
  var adsUrl = urls.thirdParty;

  // local dev with a non-localhost server
  if (adsUrl == 'https://3p.ampproject.net') {
    adsUrl = 'http://ads.localhost';
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
  var rand;

  if (win.crypto && win.crypto.getRandomValues) {
    // By default use 2 32 bit integers.
    var uint32array = new Uint32Array(2);
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
function getCustomBootstrapBaseUrl(parentWindow, ampdoc, opt_strictForUnitTest) {
  var meta = ampdoc.getMetaByName('amp-3p-iframe-src');

  if (!meta) {
    return null;
  }

  var url = assertHttpsUrl(meta, 'meta[name="amp-3p-iframe-src"]');
  userAssert(url.indexOf('?') == -1, '3p iframe url must not include query string %s in element %s.', url, meta);
  // This is not a security primitive, we just don't want this to happen in
  // practice. People could still redirect to the same origin, but they cannot
  // redirect to the proxy origin which is the important one.
  var parsed = parseUrlDeprecated(url);
  userAssert(parsed.hostname == 'localhost' && !opt_strictForUnitTest || parsed.origin != parseUrlDeprecated(parentWindow.location.href).origin, '3p iframe url must not be on the same origin as the current document ' + '%s (%s) in element %s. See https://github.com/ampproject/amphtml' + '/blob/main/docs/spec/amp-iframe-origin-policy.md for details.', url, parsed.origin, meta);
  return url + "?" + internalRuntimeVersion();
}

/**
 * Applies a sandbox to the iframe, if the required flags can be allowed.
 * @param {!Element} iframe
 * @visibleForTesting
 */
export function applySandbox(iframe) {
  if (!iframe.sandbox || !iframe.sandbox.supports) {
    return;
  }

  // If these flags are not supported by the UA we don't apply any
  // sandbox.
  var requiredFlags = getRequiredSandboxFlags();

  for (var i = 0; i < requiredFlags.length; i++) {
    var flag = requiredFlags[i];

    if (!iframe.sandbox.supports(flag)) {
      dev().info(TAG, "Iframe doesn't support %s", flag);
      return;
    }
  }

  iframe.sandbox = requiredFlags.join(' ') + ' ' + getOptionalSandboxFlags().join(' ');
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
  var windowDepth = 0;

  for (var win = parentWindow; win && win != win.parent; win = win.parent) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjNwLWZyYW1lLmpzIl0sIm5hbWVzIjpbIm1vZGUiLCJ1cmxzIiwiZ2V0T3B0aW9uYWxTYW5kYm94RmxhZ3MiLCJnZXRSZXF1aXJlZFNhbmRib3hGbGFncyIsInNldFN0eWxlIiwiZGljdCIsInRyeVBhcnNlSnNvbiIsImdldENvbnRleHRNZXRhZGF0YSIsImludGVybmFsUnVudGltZVZlcnNpb24iLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwidXNlckFzc2VydCIsImdldE1vZGUiLCJhc3NlcnRIdHRwc1VybCIsInBhcnNlVXJsRGVwcmVjYXRlZCIsImNvdW50Iiwib3ZlcnJpZGVCb290c3RyYXBCYXNlVXJsIiwiVEFHIiwiZ2V0RnJhbWVBdHRyaWJ1dGVzIiwicGFyZW50V2luZG93IiwiZWxlbWVudCIsIm9wdF90eXBlIiwib3B0X2NvbnRleHQiLCJ0eXBlIiwiZ2V0QXR0cmlidXRlIiwic2VudGluZWwiLCJnZW5lcmF0ZVNlbnRpbmVsIiwiYXR0cmlidXRlcyIsImFkZERhdGFBbmRKc29uQXR0cmlidXRlc18iLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRJZnJhbWUiLCJwYXJlbnRFbGVtZW50Iiwib3B0aW9ucyIsImFsbG93RnVsbHNjcmVlbiIsImluaXRpYWxJbnRlcnNlY3Rpb24iLCJ1bmRlZmluZWQiLCJpZnJhbWUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJhbXBkb2MiLCJnZXRBbXBEb2MiLCJiYXNlVXJsIiwiZ2V0Qm9vdHN0cmFwQmFzZVVybCIsImhvc3QiLCJob3N0bmFtZSIsIm5hbWUiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0Qm9vdHN0cmFwVXJsIiwic3JjIiwiYW1wTG9jYXRpb24iLCJ3aWR0aCIsImhlaWdodCIsInRpdGxlIiwic2V0QXR0cmlidXRlIiwib25sb2FkIiwicmVhZHlTdGF0ZSIsImV4Y2x1ZGVGcm9tU2FuZGJveCIsImluY2x1ZGVzIiwiYXBwbHlTYW5kYm94IiwiZGF0YXNldCIsInN0YXJ0c1dpdGgiLCJqc29uIiwib2JqIiwiY3JlYXRlRXJyb3IiLCJrZXkiLCJleHRlbnNpb24iLCJsb2NhbERldiIsInRlc3QiLCJmaWxlbmFtZSIsImlzTWluaWZpZWQiLCJ0aGlyZFBhcnR5IiwicHJlbG9hZEJvb3RzdHJhcCIsIndpbiIsInByZWNvbm5lY3QiLCJ1cmwiLCJwcmVsb2FkIiwib3B0X3N0cmljdEZvclVuaXRUZXN0IiwiZ2V0Q3VzdG9tQm9vdHN0cmFwQmFzZVVybCIsImdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsIiwic2V0RGVmYXVsdEJvb3RzdHJhcEJhc2VVcmxGb3JUZXN0aW5nIiwicmVzZXRCb290c3RyYXBCYXNlVXJsRm9yVGVzdGluZyIsIl9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiIsIm9wdF9zcmNGaWxlQmFzZW5hbWUiLCJzcmNGaWxlQmFzZW5hbWUiLCJnZXREZXZlbG9wbWVudEJvb3RzdHJhcEJhc2VVcmwiLCJnZXRTdWJEb21haW4iLCJ0aGlyZFBhcnR5RnJhbWVIb3N0IiwiZ2V0QWRzTG9jYWxob3N0IiwiYWRzVXJsIiwibG9jYXRpb24iLCJwb3J0IiwicGFyZW50IiwiZ2V0UmFuZG9tIiwicmFuZCIsImNyeXB0byIsImdldFJhbmRvbVZhbHVlcyIsInVpbnQzMmFycmF5IiwiVWludDMyQXJyYXkiLCJTdHJpbmciLCJNYXRoIiwicmFuZG9tIiwic3Vic3RyIiwibWV0YSIsImdldE1ldGFCeU5hbWUiLCJpbmRleE9mIiwicGFyc2VkIiwib3JpZ2luIiwiaHJlZiIsInNhbmRib3giLCJzdXBwb3J0cyIsInJlcXVpcmVkRmxhZ3MiLCJpIiwibGVuZ3RoIiwiZmxhZyIsImluZm8iLCJqb2luIiwid2luZG93RGVwdGgiLCJyZXNldENvdW50Rm9yVGVzdGluZyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsT0FBTyxLQUFLQSxJQUFaO0FBRUEsU0FBUUMsSUFB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RyxXQUFXLEdBQUcsQ0FBbEI7O0FBQ0EsT0FBSyxJQUFJNUMsR0FBRyxHQUFHdkQsWUFBZixFQUE2QnVELEdBQUcsSUFBSUEsR0FBRyxJQUFJQSxHQUFHLENBQUNtQixNQUEvQyxFQUF1RG5CLEdBQUcsR0FBR0EsR0FBRyxDQUFDbUIsTUFBakUsRUFBeUU7QUFDdkV5QixJQUFBQSxXQUFXO0FBQ1o7O0FBQ0QsU0FBT2xCLE1BQU0sQ0FBQ2tCLFdBQUQsQ0FBTixHQUFzQixHQUF0QixHQUE0QnhCLFNBQVMsQ0FBQzNFLFlBQUQsQ0FBNUM7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU29HLG9CQUFULEdBQWdDO0FBQ3JDeEcsRUFBQUEsS0FBSyxHQUFHLEVBQVI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBtb2RlIGZyb20gJyNjb3JlL21vZGUnO1xuXG5pbXBvcnQge3VybHN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7XG4gIGdldE9wdGlvbmFsU2FuZGJveEZsYWdzLFxuICBnZXRSZXF1aXJlZFNhbmRib3hGbGFncyxcbn0gZnJvbSAnLi9jb3JlLzNwLWZyYW1lJztcbmltcG9ydCB7c2V0U3R5bGV9IGZyb20gJy4vY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7dHJ5UGFyc2VKc29ufSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtnZXRDb250ZXh0TWV0YWRhdGF9IGZyb20gJy4vaWZyYW1lLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHtpbnRlcm5hbFJ1bnRpbWVWZXJzaW9ufSBmcm9tICcuL2ludGVybmFsLXZlcnNpb24nO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydCwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuL21vZGUnO1xuaW1wb3J0IHthc3NlcnRIdHRwc1VybCwgcGFyc2VVcmxEZXByZWNhdGVkfSBmcm9tICcuL3VybCc7XG5cbi8qKiBAdHlwZSB7IU9iamVjdDxzdHJpbmcsbnVtYmVyPn0gTnVtYmVyIG9mIDNwIGZyYW1lcyBvbiB0aGUgZm9yIHRoYXQgdHlwZS4gKi9cbmxldCBjb3VudCA9IHt9O1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmxldCBvdmVycmlkZUJvb3RzdHJhcEJhc2VVcmw7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICczcC1mcmFtZSc7XG5cbi8qKlxuICogUHJvZHVjZXMgdGhlIGF0dHJpYnV0ZXMgZm9yIHRoZSBhZCB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF90eXBlXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9jb250ZXh0XG4gKiBAcmV0dXJuIHshSnNvbk9iamVjdH0gQ29udGFpbnNcbiAqICAgICAtIHR5cGUsIHdpZHRoLCBoZWlnaHQsIHNyYyBhdHRyaWJ1dGVzIG9mIDxhbXAtYWQ+IHRhZy4gVGhlc2UgaGF2ZVxuICogICAgICAgcHJlY2VkZW5jZSBvdmVyIHRoZSBkYXRhLSBhdHRyaWJ1dGVzLlxuICogICAgIC0gZGF0YS0qIGF0dHJpYnV0ZXMgb2YgdGhlIDxhbXAtYWQ+IHRhZyB3aXRoIHRoZSBcImRhdGEtXCIgcmVtb3ZlZC5cbiAqICAgICAtIEEgX2NvbnRleHQgb2JqZWN0IGZvciBpbnRlcm5hbCB1c2UuXG4gKi9cbmZ1bmN0aW9uIGdldEZyYW1lQXR0cmlidXRlcyhwYXJlbnRXaW5kb3csIGVsZW1lbnQsIG9wdF90eXBlLCBvcHRfY29udGV4dCkge1xuICBjb25zdCB0eXBlID0gb3B0X3R5cGUgfHwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgdXNlckFzc2VydCh0eXBlLCAnQXR0cmlidXRlIHR5cGUgcmVxdWlyZWQgZm9yIDxhbXAtYWQ+OiAlcycsIGVsZW1lbnQpO1xuICBjb25zdCBzZW50aW5lbCA9IGdlbmVyYXRlU2VudGluZWwocGFyZW50V2luZG93KTtcbiAgbGV0IGF0dHJpYnV0ZXMgPSBkaWN0KCk7XG4gIC8vIERvIHRoZXNlIGZpcnN0LCBhcyB0aGUgb3RoZXIgYXR0cmlidXRlcyBoYXZlIHByZWNlZGVuY2UuXG4gIGFkZERhdGFBbmRKc29uQXR0cmlidXRlc18oZWxlbWVudCwgYXR0cmlidXRlcyk7XG4gIGF0dHJpYnV0ZXMgPSBnZXRDb250ZXh0TWV0YWRhdGEocGFyZW50V2luZG93LCBlbGVtZW50LCBzZW50aW5lbCwgYXR0cmlidXRlcyk7XG4gIGF0dHJpYnV0ZXNbJ3R5cGUnXSA9IHR5cGU7XG4gIE9iamVjdC5hc3NpZ24oYXR0cmlidXRlc1snX2NvbnRleHQnXSwgb3B0X2NvbnRleHQpO1xuICByZXR1cm4gYXR0cmlidXRlcztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBpZnJhbWUgZm9yIHRoZSBlbWJlZC4gQXBwbGllcyBjb3JyZWN0IHNpemUgYW5kIHBhc3NlcyB0aGUgZW1iZWRcbiAqIGF0dHJpYnV0ZXMgdG8gdGhlIGZyYW1lIHZpYSBKU09OIGluc2lkZSB0aGUgZnJhZ21lbnQuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpbmRvd1xuICogQHBhcmFtIHshQW1wRWxlbWVudH0gcGFyZW50RWxlbWVudFxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfdHlwZVxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfY29udGV4dFxuICogQHBhcmFtIHt7XG4gKiAgIGFsbG93RnVsbHNjcmVlbjogKGJvb2xlYW58dW5kZWZpbmVkKSxcbiAqICAgaW5pdGlhbEludGVyc2VjdGlvbjogKEludGVyc2VjdGlvbk9ic2VydmVyRW50cnl8dW5kZWZpbmVkKSxcbiAqIH09fSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBjcmVhdGVkIGlmcmFtZS5cbiAqIEByZXR1cm4geyFIVE1MSUZyYW1lRWxlbWVudH0gVGhlIGlmcmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElmcmFtZShcbiAgcGFyZW50V2luZG93LFxuICBwYXJlbnRFbGVtZW50LFxuICBvcHRfdHlwZSxcbiAgb3B0X2NvbnRleHQsXG4gIG9wdGlvbnMgPSB7fVxuKSB7XG4gIGNvbnN0IHthbGxvd0Z1bGxzY3JlZW4gPSBmYWxzZSwgaW5pdGlhbEludGVyc2VjdGlvbn0gPSBvcHRpb25zO1xuICAvLyBDaGVjayB0aGF0IHRoZSBwYXJlbnRFbGVtZW50IGlzIGFscmVhZHkgaW4gRE9NLiBUaGlzIGNvZGUgdXNlcyBhIG5ldyBhbmRcbiAgLy8gZmFzdCBgaXNDb25uZWN0ZWRgIEFQSSBhbmQgdGh1cyBvbmx5IHVzZWQgd2hlbiBpdCdzIGF2YWlsYWJsZS5cbiAgZGV2QXNzZXJ0KFxuICAgIHBhcmVudEVsZW1lbnRbJ2lzQ29ubmVjdGVkJ10gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgcGFyZW50RWxlbWVudFsnaXNDb25uZWN0ZWQnXSA9PT0gdHJ1ZSxcbiAgICAnUGFyZW50IGVsZW1lbnQgbXVzdCBiZSBpbiBET00nXG4gICk7XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBnZXRGcmFtZUF0dHJpYnV0ZXMoXG4gICAgcGFyZW50V2luZG93LFxuICAgIHBhcmVudEVsZW1lbnQsXG4gICAgb3B0X3R5cGUsXG4gICAgb3B0X2NvbnRleHRcbiAgKTtcbiAgaWYgKGluaXRpYWxJbnRlcnNlY3Rpb24pIHtcbiAgICBhdHRyaWJ1dGVzWydfY29udGV4dCddWydpbml0aWFsSW50ZXJzZWN0aW9uJ10gPSBpbml0aWFsSW50ZXJzZWN0aW9uO1xuICB9XG5cbiAgY29uc3QgaWZyYW1lID0gLyoqIEB0eXBlIHshSFRNTElGcmFtZUVsZW1lbnR9ICovIChcbiAgICBwYXJlbnRXaW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJylcbiAgKTtcblxuICBpZiAoIWNvdW50W2F0dHJpYnV0ZXNbJ3R5cGUnXV0pIHtcbiAgICBjb3VudFthdHRyaWJ1dGVzWyd0eXBlJ11dID0gMDtcbiAgfVxuICBjb3VudFthdHRyaWJ1dGVzWyd0eXBlJ11dICs9IDE7XG5cbiAgY29uc3QgYW1wZG9jID0gcGFyZW50RWxlbWVudC5nZXRBbXBEb2MoKTtcbiAgY29uc3QgYmFzZVVybCA9IGdldEJvb3RzdHJhcEJhc2VVcmwocGFyZW50V2luZG93LCBhbXBkb2MpO1xuICBjb25zdCBob3N0ID0gcGFyc2VVcmxEZXByZWNhdGVkKGJhc2VVcmwpLmhvc3RuYW1lO1xuICAvLyBUaGlzIG5hbWUgYXR0cmlidXRlIG1heSBiZSBvdmVyd3JpdHRlbiBpZiB0aGlzIGZyYW1lIGlzIGNob3NlbiB0b1xuICAvLyBiZSB0aGUgbWFzdGVyIGZyYW1lLiBUaGF0IGlzIG9rLCBhcyB3ZSB3aWxsIHJlYWQgdGhlIG5hbWUgb2ZmXG4gIC8vIGZvciBvdXIgdXNlcyBiZWZvcmUgdGhhdCB3b3VsZCBvY2N1ci5cbiAgLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2Jsb2IvbWFpbi8zcC9pbnRlZ3JhdGlvbi5qc1xuICBjb25zdCBuYW1lID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgZGljdCh7XG4gICAgICAnaG9zdCc6IGhvc3QsXG4gICAgICAnYm9vdHN0cmFwJzogZ2V0Qm9vdHN0cmFwVXJsKGF0dHJpYnV0ZXNbJ3R5cGUnXSksXG4gICAgICAndHlwZSc6IGF0dHJpYnV0ZXNbJ3R5cGUnXSxcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwvcHVsbC8yOTU1XG4gICAgICAnY291bnQnOiBjb3VudFthdHRyaWJ1dGVzWyd0eXBlJ11dLFxuICAgICAgJ2F0dHJpYnV0ZXMnOiBhdHRyaWJ1dGVzLFxuICAgIH0pXG4gICk7XG5cbiAgaWZyYW1lLnNyYyA9IGJhc2VVcmw7XG4gIGlmcmFtZS5hbXBMb2NhdGlvbiA9IHBhcnNlVXJsRGVwcmVjYXRlZChiYXNlVXJsKTtcbiAgaWZyYW1lLm5hbWUgPSBuYW1lO1xuICAvLyBBZGQgdGhlIGNoZWNrIGJlZm9yZSBhc3NpZ25pbmcgdG8gcHJldmVudCBJRSB0aHJvdyBJbnZhbGlkIGFyZ3VtZW50IGVycm9yXG4gIGlmIChhdHRyaWJ1dGVzWyd3aWR0aCddKSB7XG4gICAgaWZyYW1lLndpZHRoID0gYXR0cmlidXRlc1snd2lkdGgnXTtcbiAgfVxuICBpZiAoYXR0cmlidXRlc1snaGVpZ2h0J10pIHtcbiAgICBpZnJhbWUuaGVpZ2h0ID0gYXR0cmlidXRlc1snaGVpZ2h0J107XG4gIH1cbiAgaWYgKGF0dHJpYnV0ZXNbJ3RpdGxlJ10pIHtcbiAgICBpZnJhbWUudGl0bGUgPSBhdHRyaWJ1dGVzWyd0aXRsZSddO1xuICB9XG4gIGlmIChhbGxvd0Z1bGxzY3JlZW4pIHtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdhbGxvd2Z1bGxzY3JlZW4nLCAndHJ1ZScpO1xuICB9XG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3Njcm9sbGluZycsICdubycpO1xuICBzZXRTdHlsZShpZnJhbWUsICdib3JkZXInLCAnbm9uZScpO1xuICAvKiogQHRoaXMgeyFFbGVtZW50fSAqL1xuICBpZnJhbWUub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIENocm9tZSBkb2VzIG5vdCByZWZsZWN0IHRoZSBpZnJhbWUgcmVhZHlzdGF0ZS5cbiAgICB0aGlzLnJlYWR5U3RhdGUgPSAnY29tcGxldGUnO1xuICB9O1xuICAvLyBCbG9jayBzeW5jaHJvbm91cyBYSFIgaW4gYWQuIFRoZXNlIGFyZSB2ZXJ5IHJhcmUsIGJ1dCBzdXBlciBiYWQgZm9yIFVYXG4gIC8vIGFzIHRoZXkgYmxvY2sgdGhlIFVJIHRocmVhZCBmb3IgdGhlIGFyYml0cmFyeSBhbW91bnQgb2YgdGltZSB1bnRpbCB0aGVcbiAgLy8gcmVxdWVzdCBjb21wbGV0ZXMuXG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2FsbG93JywgXCJzeW5jLXhociAnbm9uZSc7XCIpO1xuICBjb25zdCBleGNsdWRlRnJvbVNhbmRib3ggPSBbJ2ZhY2Vib29rJ107XG4gIGlmICghZXhjbHVkZUZyb21TYW5kYm94LmluY2x1ZGVzKG9wdF90eXBlKSkge1xuICAgIGFwcGx5U2FuZGJveChpZnJhbWUpO1xuICB9XG4gIGlmcmFtZS5zZXRBdHRyaWJ1dGUoXG4gICAgJ2RhdGEtYW1wLTNwLXNlbnRpbmVsJyxcbiAgICBhdHRyaWJ1dGVzWydfY29udGV4dCddWydzZW50aW5lbCddXG4gICk7XG4gIHJldHVybiBpZnJhbWU7XG59XG5cbi8qKlxuICogQ29waWVzIGRhdGEtIGF0dHJpYnV0ZXMgZnJvbSB0aGUgZWxlbWVudCBpbnRvIHRoZSBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqIFJlbW92ZXMgdGhlIGRhdGEtIGZyb20gdGhlIG5hbWUgYW5kIGNhcGl0YWxpemVzIGFmdGVyIC0uIElmIHRoZXJlXG4gKiBpcyBhbiBhdHRyaWJ1dGUgY2FsbGVkIGpzb24sIHBhcnNlcyB0aGUgSlNPTiBhbmQgYWRkcyBpdCB0byB0aGVcbiAqIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0geyFKc29uT2JqZWN0fSBhdHRyaWJ1dGVzIFRoZSBkZXN0aW5hdGlvbi5cbiAqIHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREYXRhQW5kSnNvbkF0dHJpYnV0ZXNfKGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgY29uc3Qge2RhdGFzZXR9ID0gZWxlbWVudDtcbiAgZm9yIChjb25zdCBuYW1lIGluIGRhdGFzZXQpIHtcbiAgICAvLyBkYXRhLXZhcnMtIGlzIHJlc2VydmVkIGZvciBhbXAtYW5hbHl0aWNzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwvYmxvYi9tYWluL2V4dGVuc2lvbnMvYW1wLWFuYWx5dGljcy9hbmFseXRpY3MtdmFycy5tZCN2YXJpYWJsZXMtYXMtZGF0YS1hdHRyaWJ1dGVcbiAgICBpZiAoIW5hbWUuc3RhcnRzV2l0aCgndmFycycpKSB7XG4gICAgICBhdHRyaWJ1dGVzW25hbWVdID0gZGF0YXNldFtuYW1lXTtcbiAgICB9XG4gIH1cbiAgY29uc3QganNvbiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdqc29uJyk7XG4gIGlmIChqc29uKSB7XG4gICAgY29uc3Qgb2JqID0gdHJ5UGFyc2VKc29uKGpzb24pO1xuICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgdXNlcigpLmNyZWF0ZUVycm9yKFxuICAgICAgICAnRXJyb3IgcGFyc2luZyBKU09OIGluIGpzb24gYXR0cmlidXRlIGluIGVsZW1lbnQgJXMnLFxuICAgICAgICBlbGVtZW50XG4gICAgICApO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgIGF0dHJpYnV0ZXNba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgYm9vdHN0cmFwIHNjcmlwdCBVUkwgZm9yIGlmcmFtZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb290c3RyYXBVcmwodHlwZSkge1xuICBjb25zdCBleHRlbnNpb24gPSBJU19FU00gPyAnLm1qcycgOiAnLmpzJztcbiAgaWYgKGdldE1vZGUoKS5sb2NhbERldiB8fCBnZXRNb2RlKCkudGVzdCkge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gbW9kZS5pc01pbmlmaWVkKClcbiAgICAgID8gYC4vdmVuZG9yLyR7dHlwZX1gXG4gICAgICA6IGAuL3ZlbmRvci8ke3R5cGV9Lm1heGA7XG4gICAgcmV0dXJuIGZpbGVuYW1lICsgZXh0ZW5zaW9uO1xuICB9XG4gIHJldHVybiBgJHtcbiAgICB1cmxzLnRoaXJkUGFydHlcbiAgfS8ke2ludGVybmFsUnVudGltZVZlcnNpb24oKX0vdmVuZG9yLyR7dHlwZX0ke2V4dGVuc2lvbn1gO1xufVxuXG4vKipcbiAqIFByZWxvYWRzIFVSTHMgcmVsYXRlZCB0byB0aGUgYm9vdHN0cmFwIGlmcmFtZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0geyEuL3ByZWNvbm5lY3QuUHJlY29ubmVjdFNlcnZpY2V9IHByZWNvbm5lY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWxvYWRCb290c3RyYXAod2luLCB0eXBlLCBhbXBkb2MsIHByZWNvbm5lY3QpIHtcbiAgY29uc3QgdXJsID0gZ2V0Qm9vdHN0cmFwQmFzZVVybCh3aW4sIGFtcGRvYyk7XG4gIHByZWNvbm5lY3QucHJlbG9hZChhbXBkb2MsIHVybCwgJ2RvY3VtZW50Jyk7XG5cbiAgLy8gV2hpbGUgdGhlIFVSTCBtYXkgcG9pbnQgdG8gYSBjdXN0b20gZG9tYWluLCB0aGlzIFVSTCB3aWxsIGFsd2F5cyBiZVxuICAvLyBmZXRjaGVkIGJ5IGl0LlxuICBwcmVjb25uZWN0LnByZWxvYWQoYW1wZG9jLCBnZXRCb290c3RyYXBVcmwodHlwZSksICdzY3JpcHQnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiYXNlIFVSTCBmb3IgM3AgYm9vdHN0cmFwIGlmcmFtZXMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpbmRvd1xuICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc3RyaWN0Rm9yVW5pdFRlc3RcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9vdHN0cmFwQmFzZVVybChcbiAgcGFyZW50V2luZG93LFxuICBhbXBkb2MsXG4gIG9wdF9zdHJpY3RGb3JVbml0VGVzdFxuKSB7XG4gIHJldHVybiAoXG4gICAgZ2V0Q3VzdG9tQm9vdHN0cmFwQmFzZVVybChwYXJlbnRXaW5kb3csIGFtcGRvYywgb3B0X3N0cmljdEZvclVuaXRUZXN0KSB8fFxuICAgIGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdylcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0Qm9vdHN0cmFwQmFzZVVybEZvclRlc3RpbmcodXJsKSB7XG4gIG92ZXJyaWRlQm9vdHN0cmFwQmFzZVVybCA9IHVybDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyp9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRCb290c3RyYXBCYXNlVXJsRm9yVGVzdGluZyh3aW4pIHtcbiAgd2luLl9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiA9IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZWZhdWx0IGJhc2UgVVJMIGZvciAzcCBib290c3RyYXAgaWZyYW1lcy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zcmNGaWxlQmFzZW5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdywgb3B0X3NyY0ZpbGVCYXNlbmFtZSkge1xuICBjb25zdCBzcmNGaWxlQmFzZW5hbWUgPSBvcHRfc3JjRmlsZUJhc2VuYW1lIHx8ICdmcmFtZSc7XG4gIGlmIChnZXRNb2RlKCkubG9jYWxEZXYgfHwgZ2V0TW9kZSgpLnRlc3QpIHtcbiAgICByZXR1cm4gZ2V0RGV2ZWxvcG1lbnRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdywgc3JjRmlsZUJhc2VuYW1lKTtcbiAgfVxuICAvLyBFbnN1cmUgc2FtZSBzdWItZG9tYWluIGlzIHVzZWQgZGVzcGl0ZSBwb3RlbnRpYWxseSBkaWZmZXJlbnQgZmlsZS5cbiAgcGFyZW50V2luZG93Ll9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiA9XG4gICAgcGFyZW50V2luZG93Ll9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiB8fFxuICAgIGdldFN1YkRvbWFpbihwYXJlbnRXaW5kb3cpO1xuICByZXR1cm4gKFxuICAgICdodHRwczovLycgK1xuICAgIHBhcmVudFdpbmRvdy5fX0FNUF9ERUZBVUxUX0JPT1RTVFJBUF9TVUJET01BSU4gK1xuICAgIGAuJHt1cmxzLnRoaXJkUGFydHlGcmFtZUhvc3R9LyR7aW50ZXJuYWxSdW50aW1lVmVyc2lvbigpfS9gICtcbiAgICBgJHtzcmNGaWxlQmFzZW5hbWV9Lmh0bWxgXG4gICk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gcmV0dXJuIHRoZSBkZXZlbG9wbWVudCBib29zdHJhcCBiYXNlIFVSTFxuICogQHBhcmFtIHshV2luZG93fSBwYXJlbnRXaW5kb3dcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNGaWxlQmFzZW5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERldmVsb3BtZW50Qm9vdHN0cmFwQmFzZVVybChwYXJlbnRXaW5kb3csIHNyY0ZpbGVCYXNlbmFtZSkge1xuICByZXR1cm4gKFxuICAgIG92ZXJyaWRlQm9vdHN0cmFwQmFzZVVybCB8fFxuICAgIGdldEFkc0xvY2FsaG9zdChwYXJlbnRXaW5kb3cpICtcbiAgICAgICcvZGlzdC4zcC8nICtcbiAgICAgIChtb2RlLmlzTWluaWZpZWQoKVxuICAgICAgICA/IGAke2ludGVybmFsUnVudGltZVZlcnNpb24oKX0vJHtzcmNGaWxlQmFzZW5hbWV9YFxuICAgICAgICA6IGBjdXJyZW50LyR7c3JjRmlsZUJhc2VuYW1lfS5tYXhgKSArXG4gICAgICAnLmh0bWwnXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0QWRzTG9jYWxob3N0KHdpbikge1xuICBsZXQgYWRzVXJsID0gdXJscy50aGlyZFBhcnR5OyAvLyBsb2NhbCBkZXYgd2l0aCBhIG5vbi1sb2NhbGhvc3Qgc2VydmVyXG4gIGlmIChhZHNVcmwgPT0gJ2h0dHBzOi8vM3AuYW1wcHJvamVjdC5uZXQnKSB7XG4gICAgYWRzVXJsID0gJ2h0dHA6Ly9hZHMubG9jYWxob3N0JzsgLy8gbG9jYWwgZGV2IHdpdGggYSBsb2NhbGhvc3Qgc2VydmVyXG4gIH1cbiAgcmV0dXJuIGFkc1VybCArICc6JyArICh3aW4ubG9jYXRpb24ucG9ydCB8fCB3aW4ucGFyZW50LmxvY2F0aW9uLnBvcnQpO1xufVxuXG4vKipcbiAqIFN1YiBkb21haW4gb24gd2hpY2ggdGhlIDNwIGlmcmFtZSB3aWxsIGJlIGhvc3RlZC5cbiAqIEJlY2F1c2Ugd2Ugb25seSBjYWxjdWxhdGUgdGhlIFVSTCBvbmNlIHBlciBwYWdlLCB0aGlzIGZ1bmN0aW9uIGlzIG9ubHlcbiAqIGNhbGxlZCBvbmNlIGFuZCBoZW5jZSBhbGwgZnJhbWVzIG9uIGEgcGFnZSB1c2UgdGhlIHNhbWUgVVJMLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ViRG9tYWluKHdpbikge1xuICByZXR1cm4gJ2QtJyArIGdldFJhbmRvbSh3aW4pO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBub24tbmVnYXRpdmUgaW50ZWdlci5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb20od2luKSB7XG4gIGxldCByYW5kO1xuICBpZiAod2luLmNyeXB0byAmJiB3aW4uY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIEJ5IGRlZmF1bHQgdXNlIDIgMzIgYml0IGludGVnZXJzLlxuICAgIGNvbnN0IHVpbnQzMmFycmF5ID0gbmV3IFVpbnQzMkFycmF5KDIpO1xuICAgIHdpbi5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHVpbnQzMmFycmF5KTtcbiAgICByYW5kID0gU3RyaW5nKHVpbnQzMmFycmF5WzBdKSArIHVpbnQzMmFycmF5WzFdO1xuICB9IGVsc2Uge1xuICAgIC8vIEZhbGwgYmFjayB0byBNYXRoLnJhbmRvbS5cbiAgICByYW5kID0gU3RyaW5nKHdpbi5NYXRoLnJhbmRvbSgpKS5zdWJzdHIoMikgKyAnMCc7XG4gIH1cbiAgcmV0dXJuIHJhbmQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VzdG9tIGJhc2UgVVJMIGZvciAzcCBib290c3RyYXAgaWZyYW1lcyBpZiBpdCBleGlzdHMuXG4gKiBPdGhlcndpc2UgbnVsbC5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcGFyYW0geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9zdHJpY3RGb3JVbml0VGVzdFxuICogQHJldHVybiB7P3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0Q3VzdG9tQm9vdHN0cmFwQmFzZVVybChcbiAgcGFyZW50V2luZG93LFxuICBhbXBkb2MsXG4gIG9wdF9zdHJpY3RGb3JVbml0VGVzdFxuKSB7XG4gIGNvbnN0IG1ldGEgPSBhbXBkb2MuZ2V0TWV0YUJ5TmFtZSgnYW1wLTNwLWlmcmFtZS1zcmMnKTtcbiAgaWYgKCFtZXRhKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgdXJsID0gYXNzZXJ0SHR0cHNVcmwobWV0YSwgJ21ldGFbbmFtZT1cImFtcC0zcC1pZnJhbWUtc3JjXCJdJyk7XG4gIHVzZXJBc3NlcnQoXG4gICAgdXJsLmluZGV4T2YoJz8nKSA9PSAtMSxcbiAgICAnM3AgaWZyYW1lIHVybCBtdXN0IG5vdCBpbmNsdWRlIHF1ZXJ5IHN0cmluZyAlcyBpbiBlbGVtZW50ICVzLicsXG4gICAgdXJsLFxuICAgIG1ldGFcbiAgKTtcbiAgLy8gVGhpcyBpcyBub3QgYSBzZWN1cml0eSBwcmltaXRpdmUsIHdlIGp1c3QgZG9uJ3Qgd2FudCB0aGlzIHRvIGhhcHBlbiBpblxuICAvLyBwcmFjdGljZS4gUGVvcGxlIGNvdWxkIHN0aWxsIHJlZGlyZWN0IHRvIHRoZSBzYW1lIG9yaWdpbiwgYnV0IHRoZXkgY2Fubm90XG4gIC8vIHJlZGlyZWN0IHRvIHRoZSBwcm94eSBvcmlnaW4gd2hpY2ggaXMgdGhlIGltcG9ydGFudCBvbmUuXG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlVXJsRGVwcmVjYXRlZCh1cmwpO1xuICB1c2VyQXNzZXJ0KFxuICAgIChwYXJzZWQuaG9zdG5hbWUgPT0gJ2xvY2FsaG9zdCcgJiYgIW9wdF9zdHJpY3RGb3JVbml0VGVzdCkgfHxcbiAgICAgIHBhcnNlZC5vcmlnaW4gIT0gcGFyc2VVcmxEZXByZWNhdGVkKHBhcmVudFdpbmRvdy5sb2NhdGlvbi5ocmVmKS5vcmlnaW4sXG4gICAgJzNwIGlmcmFtZSB1cmwgbXVzdCBub3QgYmUgb24gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGRvY3VtZW50ICcgK1xuICAgICAgJyVzICglcykgaW4gZWxlbWVudCAlcy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwnICtcbiAgICAgICcvYmxvYi9tYWluL2RvY3Mvc3BlYy9hbXAtaWZyYW1lLW9yaWdpbi1wb2xpY3kubWQgZm9yIGRldGFpbHMuJyxcbiAgICB1cmwsXG4gICAgcGFyc2VkLm9yaWdpbixcbiAgICBtZXRhXG4gICk7XG4gIHJldHVybiBgJHt1cmx9PyR7aW50ZXJuYWxSdW50aW1lVmVyc2lvbigpfWA7XG59XG5cbi8qKlxuICogQXBwbGllcyBhIHNhbmRib3ggdG8gdGhlIGlmcmFtZSwgaWYgdGhlIHJlcXVpcmVkIGZsYWdzIGNhbiBiZSBhbGxvd2VkLlxuICogQHBhcmFtIHshRWxlbWVudH0gaWZyYW1lXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U2FuZGJveChpZnJhbWUpIHtcbiAgaWYgKCFpZnJhbWUuc2FuZGJveCB8fCAhaWZyYW1lLnNhbmRib3guc3VwcG9ydHMpIHtcbiAgICByZXR1cm47IC8vIENhbid0IGZlYXR1cmUgZGV0ZWN0IHN1cHBvcnRcbiAgfVxuICAvLyBJZiB0aGVzZSBmbGFncyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgVUEgd2UgZG9uJ3QgYXBwbHkgYW55XG4gIC8vIHNhbmRib3guXG4gIGNvbnN0IHJlcXVpcmVkRmxhZ3MgPSBnZXRSZXF1aXJlZFNhbmRib3hGbGFncygpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkRmxhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmbGFnID0gcmVxdWlyZWRGbGFnc1tpXTtcbiAgICBpZiAoIWlmcmFtZS5zYW5kYm94LnN1cHBvcnRzKGZsYWcpKSB7XG4gICAgICBkZXYoKS5pbmZvKFRBRywgXCJJZnJhbWUgZG9lc24ndCBzdXBwb3J0ICVzXCIsIGZsYWcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBpZnJhbWUuc2FuZGJveCA9XG4gICAgcmVxdWlyZWRGbGFncy5qb2luKCcgJykgKyAnICcgKyBnZXRPcHRpb25hbFNhbmRib3hGbGFncygpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcmFuZG9taXplZCBzZW50aW5lbCB2YWx1ZSBmb3IgM3AgaWZyYW1lcy5cbiAqIFRoZSBmb3JtYXQgaXMgXCIlZC0lZFwiIHdpdGggdGhlIGZpcnN0IHZhbHVlIGJlaW5nIHRoZSBkZXB0aCBvZiBjdXJyZW50XG4gKiB3aW5kb3cgaW4gdGhlIHdpbmRvdyBoaWVyYXJjaHkgYW5kIHRoZSBzZWNvbmQgYSByYW5kb20gaW50ZWdlci5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2VudGluZWwocGFyZW50V2luZG93KSB7XG4gIGxldCB3aW5kb3dEZXB0aCA9IDA7XG4gIGZvciAobGV0IHdpbiA9IHBhcmVudFdpbmRvdzsgd2luICYmIHdpbiAhPSB3aW4ucGFyZW50OyB3aW4gPSB3aW4ucGFyZW50KSB7XG4gICAgd2luZG93RGVwdGgrKztcbiAgfVxuICByZXR1cm4gU3RyaW5nKHdpbmRvd0RlcHRoKSArICctJyArIGdldFJhbmRvbShwYXJlbnRXaW5kb3cpO1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgY291bnQgb2YgZWFjaCAzcCBmcmFtZSB0eXBlXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q291bnRGb3JUZXN0aW5nKCkge1xuICBjb3VudCA9IHt9O1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/3p-frame.js