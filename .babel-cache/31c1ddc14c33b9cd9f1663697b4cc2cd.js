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

  return urls.thirdParty + "/" + mode.version() + "/vendor/" + type + extension;
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
  return 'https://' + parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN + ("." + urls.thirdPartyFrameHost + "/" + mode.version() + "/") + (srcFileBasename + ".html");
}

/**
 * Function to return the development boostrap base URL
 * @param {!Window} parentWindow
 * @param {string} srcFileBasename
 * @return {string}
 */
export function getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename) {
  return overrideBootstrapBaseUrl || getAdsLocalhost(parentWindow) + '/dist.3p/' + (mode.isMinified() ? mode.version() + "/" + srcFileBasename : "current/" + srcFileBasename + ".max") + '.html';
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
  return url + "?" + mode.version();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjNwLWZyYW1lLmpzIl0sIm5hbWVzIjpbIm1vZGUiLCJ1cmxzIiwiZ2V0T3B0aW9uYWxTYW5kYm94RmxhZ3MiLCJnZXRSZXF1aXJlZFNhbmRib3hGbGFncyIsInNldFN0eWxlIiwiZGljdCIsInRyeVBhcnNlSnNvbiIsImdldENvbnRleHRNZXRhZGF0YSIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZ2V0TW9kZSIsImFzc2VydEh0dHBzVXJsIiwicGFyc2VVcmxEZXByZWNhdGVkIiwiY291bnQiLCJvdmVycmlkZUJvb3RzdHJhcEJhc2VVcmwiLCJUQUciLCJnZXRGcmFtZUF0dHJpYnV0ZXMiLCJwYXJlbnRXaW5kb3ciLCJlbGVtZW50Iiwib3B0X3R5cGUiLCJvcHRfY29udGV4dCIsInR5cGUiLCJnZXRBdHRyaWJ1dGUiLCJzZW50aW5lbCIsImdlbmVyYXRlU2VudGluZWwiLCJhdHRyaWJ1dGVzIiwiYWRkRGF0YUFuZEpzb25BdHRyaWJ1dGVzXyIsIk9iamVjdCIsImFzc2lnbiIsImdldElmcmFtZSIsInBhcmVudEVsZW1lbnQiLCJvcHRpb25zIiwiYWxsb3dGdWxsc2NyZWVuIiwiaW5pdGlhbEludGVyc2VjdGlvbiIsInVuZGVmaW5lZCIsImlmcmFtZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImFtcGRvYyIsImdldEFtcERvYyIsImJhc2VVcmwiLCJnZXRCb290c3RyYXBCYXNlVXJsIiwiaG9zdCIsImhvc3RuYW1lIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRCb290c3RyYXBVcmwiLCJzcmMiLCJhbXBMb2NhdGlvbiIsIndpZHRoIiwiaGVpZ2h0IiwidGl0bGUiLCJzZXRBdHRyaWJ1dGUiLCJvbmxvYWQiLCJyZWFkeVN0YXRlIiwiZXhjbHVkZUZyb21TYW5kYm94IiwiaW5jbHVkZXMiLCJhcHBseVNhbmRib3giLCJkYXRhc2V0Iiwic3RhcnRzV2l0aCIsImpzb24iLCJvYmoiLCJjcmVhdGVFcnJvciIsImtleSIsImV4dGVuc2lvbiIsImxvY2FsRGV2IiwidGVzdCIsImZpbGVuYW1lIiwiaXNNaW5pZmllZCIsInRoaXJkUGFydHkiLCJ2ZXJzaW9uIiwicHJlbG9hZEJvb3RzdHJhcCIsIndpbiIsInByZWNvbm5lY3QiLCJ1cmwiLCJwcmVsb2FkIiwib3B0X3N0cmljdEZvclVuaXRUZXN0IiwiZ2V0Q3VzdG9tQm9vdHN0cmFwQmFzZVVybCIsImdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsIiwic2V0RGVmYXVsdEJvb3RzdHJhcEJhc2VVcmxGb3JUZXN0aW5nIiwicmVzZXRCb290c3RyYXBCYXNlVXJsRm9yVGVzdGluZyIsIl9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiIsIm9wdF9zcmNGaWxlQmFzZW5hbWUiLCJzcmNGaWxlQmFzZW5hbWUiLCJnZXREZXZlbG9wbWVudEJvb3RzdHJhcEJhc2VVcmwiLCJnZXRTdWJEb21haW4iLCJ0aGlyZFBhcnR5RnJhbWVIb3N0IiwiZ2V0QWRzTG9jYWxob3N0IiwiYWRzVXJsIiwibG9jYXRpb24iLCJwb3J0IiwicGFyZW50IiwiZ2V0UmFuZG9tIiwicmFuZCIsImNyeXB0byIsImdldFJhbmRvbVZhbHVlcyIsInVpbnQzMmFycmF5IiwiVWludDMyQXJyYXkiLCJTdHJpbmciLCJNYXRoIiwicmFuZG9tIiwic3Vic3RyIiwibWV0YSIsImdldE1ldGFCeU5hbWUiLCJpbmRleE9mIiwicGFyc2VkIiwib3JpZ2luIiwiaHJlZiIsInNhbmRib3giLCJzdXBwb3J0cyIsInJlcXVpcmVkRmxhZ3MiLCJpIiwibGVuZ3RoIiwiZmxhZyIsImluZm8iLCJqb2luIiwid2luZG93RGVwdGgiLCJyZXNldENvdW50Rm9yVGVzdGluZyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsT0FBTyxLQUFLQSxJQUFaO0FBRUEsU0FBUUMsSUFBUjtBQUNBLFNBQ0VDLHVC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TUFBSW9HLFdBQVcsR0FBRyxDQUFsQjs7QUFDQSxPQUFLLElBQUk1QyxHQUFHLEdBQUd4RCxZQUFmLEVBQTZCd0QsR0FBRyxJQUFJQSxHQUFHLElBQUlBLEdBQUcsQ0FBQ21CLE1BQS9DLEVBQXVEbkIsR0FBRyxHQUFHQSxHQUFHLENBQUNtQixNQUFqRSxFQUF5RTtBQUN2RXlCLElBQUFBLFdBQVc7QUFDWjs7QUFDRCxTQUFPbEIsTUFBTSxDQUFDa0IsV0FBRCxDQUFOLEdBQXNCLEdBQXRCLEdBQTRCeEIsU0FBUyxDQUFDNUUsWUFBRCxDQUE1QztBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTcUcsb0JBQVQsR0FBZ0M7QUFDckN6RyxFQUFBQSxLQUFLLEdBQUcsRUFBUjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCAqIGFzIG1vZGUgZnJvbSAnI2NvcmUvbW9kZSc7XG5cbmltcG9ydCB7dXJsc30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtcbiAgZ2V0T3B0aW9uYWxTYW5kYm94RmxhZ3MsXG4gIGdldFJlcXVpcmVkU2FuZGJveEZsYWdzLFxufSBmcm9tICcuL2NvcmUvM3AtZnJhbWUnO1xuaW1wb3J0IHtzZXRTdHlsZX0gZnJvbSAnLi9jb3JlL2RvbS9zdHlsZSc7XG5pbXBvcnQge2RpY3R9IGZyb20gJy4vY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHt0cnlQYXJzZUpzb259IGZyb20gJy4vY29yZS90eXBlcy9vYmplY3QvanNvbic7XG5pbXBvcnQge2dldENvbnRleHRNZXRhZGF0YX0gZnJvbSAnLi9pZnJhbWUtYXR0cmlidXRlcyc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyLCB1c2VyQXNzZXJ0fSBmcm9tICcuL2xvZyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4vbW9kZSc7XG5pbXBvcnQge2Fzc2VydEh0dHBzVXJsLCBwYXJzZVVybERlcHJlY2F0ZWR9IGZyb20gJy4vdXJsJztcblxuLyoqIEB0eXBlIHshT2JqZWN0PHN0cmluZyxudW1iZXI+fSBOdW1iZXIgb2YgM3AgZnJhbWVzIG9uIHRoZSBmb3IgdGhhdCB0eXBlLiAqL1xubGV0IGNvdW50ID0ge307XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xubGV0IG92ZXJyaWRlQm9vdHN0cmFwQmFzZVVybDtcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJzNwLWZyYW1lJztcblxuLyoqXG4gKiBQcm9kdWNlcyB0aGUgYXR0cmlidXRlcyBmb3IgdGhlIGFkIHRlbXBsYXRlLlxuICogQHBhcmFtIHshV2luZG93fSBwYXJlbnRXaW5kb3dcbiAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3R5cGVcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X2NvbnRleHRcbiAqIEByZXR1cm4geyFKc29uT2JqZWN0fSBDb250YWluc1xuICogICAgIC0gdHlwZSwgd2lkdGgsIGhlaWdodCwgc3JjIGF0dHJpYnV0ZXMgb2YgPGFtcC1hZD4gdGFnLiBUaGVzZSBoYXZlXG4gKiAgICAgICBwcmVjZWRlbmNlIG92ZXIgdGhlIGRhdGEtIGF0dHJpYnV0ZXMuXG4gKiAgICAgLSBkYXRhLSogYXR0cmlidXRlcyBvZiB0aGUgPGFtcC1hZD4gdGFnIHdpdGggdGhlIFwiZGF0YS1cIiByZW1vdmVkLlxuICogICAgIC0gQSBfY29udGV4dCBvYmplY3QgZm9yIGludGVybmFsIHVzZS5cbiAqL1xuZnVuY3Rpb24gZ2V0RnJhbWVBdHRyaWJ1dGVzKHBhcmVudFdpbmRvdywgZWxlbWVudCwgb3B0X3R5cGUsIG9wdF9jb250ZXh0KSB7XG4gIGNvbnN0IHR5cGUgPSBvcHRfdHlwZSB8fCBlbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICB1c2VyQXNzZXJ0KHR5cGUsICdBdHRyaWJ1dGUgdHlwZSByZXF1aXJlZCBmb3IgPGFtcC1hZD46ICVzJywgZWxlbWVudCk7XG4gIGNvbnN0IHNlbnRpbmVsID0gZ2VuZXJhdGVTZW50aW5lbChwYXJlbnRXaW5kb3cpO1xuICBsZXQgYXR0cmlidXRlcyA9IGRpY3QoKTtcbiAgLy8gRG8gdGhlc2UgZmlyc3QsIGFzIHRoZSBvdGhlciBhdHRyaWJ1dGVzIGhhdmUgcHJlY2VkZW5jZS5cbiAgYWRkRGF0YUFuZEpzb25BdHRyaWJ1dGVzXyhlbGVtZW50LCBhdHRyaWJ1dGVzKTtcbiAgYXR0cmlidXRlcyA9IGdldENvbnRleHRNZXRhZGF0YShwYXJlbnRXaW5kb3csIGVsZW1lbnQsIHNlbnRpbmVsLCBhdHRyaWJ1dGVzKTtcbiAgYXR0cmlidXRlc1sndHlwZSddID0gdHlwZTtcbiAgT2JqZWN0LmFzc2lnbihhdHRyaWJ1dGVzWydfY29udGV4dCddLCBvcHRfY29udGV4dCk7XG4gIHJldHVybiBhdHRyaWJ1dGVzO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGlmcmFtZSBmb3IgdGhlIGVtYmVkLiBBcHBsaWVzIGNvcnJlY3Qgc2l6ZSBhbmQgcGFzc2VzIHRoZSBlbWJlZFxuICogYXR0cmlidXRlcyB0byB0aGUgZnJhbWUgdmlhIEpTT04gaW5zaWRlIHRoZSBmcmFnbWVudC5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcGFyYW0geyFBbXBFbGVtZW50fSBwYXJlbnRFbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF90eXBlXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9jb250ZXh0XG4gKiBAcGFyYW0ge3tcbiAqICAgYWxsb3dGdWxsc2NyZWVuOiAoYm9vbGVhbnx1bmRlZmluZWQpLFxuICogICBpbml0aWFsSW50ZXJzZWN0aW9uOiAoSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeXx1bmRlZmluZWQpLFxuICogfT19IG9wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIGNyZWF0ZWQgaWZyYW1lLlxuICogQHJldHVybiB7IUhUTUxJRnJhbWVFbGVtZW50fSBUaGUgaWZyYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWZyYW1lKFxuICBwYXJlbnRXaW5kb3csXG4gIHBhcmVudEVsZW1lbnQsXG4gIG9wdF90eXBlLFxuICBvcHRfY29udGV4dCxcbiAgb3B0aW9ucyA9IHt9XG4pIHtcbiAgY29uc3Qge2FsbG93RnVsbHNjcmVlbiA9IGZhbHNlLCBpbml0aWFsSW50ZXJzZWN0aW9ufSA9IG9wdGlvbnM7XG4gIC8vIENoZWNrIHRoYXQgdGhlIHBhcmVudEVsZW1lbnQgaXMgYWxyZWFkeSBpbiBET00uIFRoaXMgY29kZSB1c2VzIGEgbmV3IGFuZFxuICAvLyBmYXN0IGBpc0Nvbm5lY3RlZGAgQVBJIGFuZCB0aHVzIG9ubHkgdXNlZCB3aGVuIGl0J3MgYXZhaWxhYmxlLlxuICBkZXZBc3NlcnQoXG4gICAgcGFyZW50RWxlbWVudFsnaXNDb25uZWN0ZWQnXSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICBwYXJlbnRFbGVtZW50Wydpc0Nvbm5lY3RlZCddID09PSB0cnVlLFxuICAgICdQYXJlbnQgZWxlbWVudCBtdXN0IGJlIGluIERPTSdcbiAgKTtcbiAgY29uc3QgYXR0cmlidXRlcyA9IGdldEZyYW1lQXR0cmlidXRlcyhcbiAgICBwYXJlbnRXaW5kb3csXG4gICAgcGFyZW50RWxlbWVudCxcbiAgICBvcHRfdHlwZSxcbiAgICBvcHRfY29udGV4dFxuICApO1xuICBpZiAoaW5pdGlhbEludGVyc2VjdGlvbikge1xuICAgIGF0dHJpYnV0ZXNbJ19jb250ZXh0J11bJ2luaXRpYWxJbnRlcnNlY3Rpb24nXSA9IGluaXRpYWxJbnRlcnNlY3Rpb247XG4gIH1cblxuICBjb25zdCBpZnJhbWUgPSAvKiogQHR5cGUgeyFIVE1MSUZyYW1lRWxlbWVudH0gKi8gKFxuICAgIHBhcmVudFdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKVxuICApO1xuXG4gIGlmICghY291bnRbYXR0cmlidXRlc1sndHlwZSddXSkge1xuICAgIGNvdW50W2F0dHJpYnV0ZXNbJ3R5cGUnXV0gPSAwO1xuICB9XG4gIGNvdW50W2F0dHJpYnV0ZXNbJ3R5cGUnXV0gKz0gMTtcblxuICBjb25zdCBhbXBkb2MgPSBwYXJlbnRFbGVtZW50LmdldEFtcERvYygpO1xuICBjb25zdCBiYXNlVXJsID0gZ2V0Qm9vdHN0cmFwQmFzZVVybChwYXJlbnRXaW5kb3csIGFtcGRvYyk7XG4gIGNvbnN0IGhvc3QgPSBwYXJzZVVybERlcHJlY2F0ZWQoYmFzZVVybCkuaG9zdG5hbWU7XG4gIC8vIFRoaXMgbmFtZSBhdHRyaWJ1dGUgbWF5IGJlIG92ZXJ3cml0dGVuIGlmIHRoaXMgZnJhbWUgaXMgY2hvc2VuIHRvXG4gIC8vIGJlIHRoZSBtYXN0ZXIgZnJhbWUuIFRoYXQgaXMgb2ssIGFzIHdlIHdpbGwgcmVhZCB0aGUgbmFtZSBvZmZcbiAgLy8gZm9yIG91ciB1c2VzIGJlZm9yZSB0aGF0IHdvdWxkIG9jY3VyLlxuICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbXBwcm9qZWN0L2FtcGh0bWwvYmxvYi9tYWluLzNwL2ludGVncmF0aW9uLmpzXG4gIGNvbnN0IG5hbWUgPSBKU09OLnN0cmluZ2lmeShcbiAgICBkaWN0KHtcbiAgICAgICdob3N0JzogaG9zdCxcbiAgICAgICdib290c3RyYXAnOiBnZXRCb290c3RyYXBVcmwoYXR0cmlidXRlc1sndHlwZSddKSxcbiAgICAgICd0eXBlJzogYXR0cmlidXRlc1sndHlwZSddLFxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9wdWxsLzI5NTVcbiAgICAgICdjb3VudCc6IGNvdW50W2F0dHJpYnV0ZXNbJ3R5cGUnXV0sXG4gICAgICAnYXR0cmlidXRlcyc6IGF0dHJpYnV0ZXMsXG4gICAgfSlcbiAgKTtcblxuICBpZnJhbWUuc3JjID0gYmFzZVVybDtcbiAgaWZyYW1lLmFtcExvY2F0aW9uID0gcGFyc2VVcmxEZXByZWNhdGVkKGJhc2VVcmwpO1xuICBpZnJhbWUubmFtZSA9IG5hbWU7XG4gIC8vIEFkZCB0aGUgY2hlY2sgYmVmb3JlIGFzc2lnbmluZyB0byBwcmV2ZW50IElFIHRocm93IEludmFsaWQgYXJndW1lbnQgZXJyb3JcbiAgaWYgKGF0dHJpYnV0ZXNbJ3dpZHRoJ10pIHtcbiAgICBpZnJhbWUud2lkdGggPSBhdHRyaWJ1dGVzWyd3aWR0aCddO1xuICB9XG4gIGlmIChhdHRyaWJ1dGVzWydoZWlnaHQnXSkge1xuICAgIGlmcmFtZS5oZWlnaHQgPSBhdHRyaWJ1dGVzWydoZWlnaHQnXTtcbiAgfVxuICBpZiAoYXR0cmlidXRlc1sndGl0bGUnXSkge1xuICAgIGlmcmFtZS50aXRsZSA9IGF0dHJpYnV0ZXNbJ3RpdGxlJ107XG4gIH1cbiAgaWYgKGFsbG93RnVsbHNjcmVlbikge1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ2FsbG93ZnVsbHNjcmVlbicsICd0cnVlJyk7XG4gIH1cbiAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnc2Nyb2xsaW5nJywgJ25vJyk7XG4gIHNldFN0eWxlKGlmcmFtZSwgJ2JvcmRlcicsICdub25lJyk7XG4gIC8qKiBAdGhpcyB7IUVsZW1lbnR9ICovXG4gIGlmcmFtZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gQ2hyb21lIGRvZXMgbm90IHJlZmxlY3QgdGhlIGlmcmFtZSByZWFkeXN0YXRlLlxuICAgIHRoaXMucmVhZHlTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gIH07XG4gIC8vIEJsb2NrIHN5bmNocm9ub3VzIFhIUiBpbiBhZC4gVGhlc2UgYXJlIHZlcnkgcmFyZSwgYnV0IHN1cGVyIGJhZCBmb3IgVVhcbiAgLy8gYXMgdGhleSBibG9jayB0aGUgVUkgdGhyZWFkIGZvciB0aGUgYXJiaXRyYXJ5IGFtb3VudCBvZiB0aW1lIHVudGlsIHRoZVxuICAvLyByZXF1ZXN0IGNvbXBsZXRlcy5cbiAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnYWxsb3cnLCBcInN5bmMteGhyICdub25lJztcIik7XG4gIGNvbnN0IGV4Y2x1ZGVGcm9tU2FuZGJveCA9IFsnZmFjZWJvb2snXTtcbiAgaWYgKCFleGNsdWRlRnJvbVNhbmRib3guaW5jbHVkZXMob3B0X3R5cGUpKSB7XG4gICAgYXBwbHlTYW5kYm94KGlmcmFtZSk7XG4gIH1cbiAgaWZyYW1lLnNldEF0dHJpYnV0ZShcbiAgICAnZGF0YS1hbXAtM3Atc2VudGluZWwnLFxuICAgIGF0dHJpYnV0ZXNbJ19jb250ZXh0J11bJ3NlbnRpbmVsJ11cbiAgKTtcbiAgcmV0dXJuIGlmcmFtZTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgZGF0YS0gYXR0cmlidXRlcyBmcm9tIHRoZSBlbGVtZW50IGludG8gdGhlIGF0dHJpYnV0ZXMgb2JqZWN0LlxuICogUmVtb3ZlcyB0aGUgZGF0YS0gZnJvbSB0aGUgbmFtZSBhbmQgY2FwaXRhbGl6ZXMgYWZ0ZXIgLS4gSWYgdGhlcmVcbiAqIGlzIGFuIGF0dHJpYnV0ZSBjYWxsZWQganNvbiwgcGFyc2VzIHRoZSBKU09OIGFuZCBhZGRzIGl0IHRvIHRoZVxuICogYXR0cmlidXRlcy5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGF0dHJpYnV0ZXMgVGhlIGRlc3RpbmF0aW9uLlxuICogdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERhdGFBbmRKc29uQXR0cmlidXRlc18oZWxlbWVudCwgYXR0cmlidXRlcykge1xuICBjb25zdCB7ZGF0YXNldH0gPSBlbGVtZW50O1xuICBmb3IgKGNvbnN0IG5hbWUgaW4gZGF0YXNldCkge1xuICAgIC8vIGRhdGEtdmFycy0gaXMgcmVzZXJ2ZWQgZm9yIGFtcC1hbmFseXRpY3NcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FtcHByb2plY3QvYW1waHRtbC9ibG9iL21haW4vZXh0ZW5zaW9ucy9hbXAtYW5hbHl0aWNzL2FuYWx5dGljcy12YXJzLm1kI3ZhcmlhYmxlcy1hcy1kYXRhLWF0dHJpYnV0ZVxuICAgIGlmICghbmFtZS5zdGFydHNXaXRoKCd2YXJzJykpIHtcbiAgICAgIGF0dHJpYnV0ZXNbbmFtZV0gPSBkYXRhc2V0W25hbWVdO1xuICAgIH1cbiAgfVxuICBjb25zdCBqc29uID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2pzb24nKTtcbiAgaWYgKGpzb24pIHtcbiAgICBjb25zdCBvYmogPSB0cnlQYXJzZUpzb24oanNvbik7XG4gICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyB1c2VyKCkuY3JlYXRlRXJyb3IoXG4gICAgICAgICdFcnJvciBwYXJzaW5nIEpTT04gaW4ganNvbiBhdHRyaWJ1dGUgaW4gZWxlbWVudCAlcycsXG4gICAgICAgIGVsZW1lbnRcbiAgICAgICk7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgYXR0cmlidXRlc1trZXldID0gb2JqW2tleV07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBib290c3RyYXAgc2NyaXB0IFVSTCBmb3IgaWZyYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJvb3RzdHJhcFVybCh0eXBlKSB7XG4gIGNvbnN0IGV4dGVuc2lvbiA9IElTX0VTTSA/ICcubWpzJyA6ICcuanMnO1xuICBpZiAoZ2V0TW9kZSgpLmxvY2FsRGV2IHx8IGdldE1vZGUoKS50ZXN0KSB7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBtb2RlLmlzTWluaWZpZWQoKVxuICAgICAgPyBgLi92ZW5kb3IvJHt0eXBlfWBcbiAgICAgIDogYC4vdmVuZG9yLyR7dHlwZX0ubWF4YDtcbiAgICByZXR1cm4gZmlsZW5hbWUgKyBleHRlbnNpb247XG4gIH1cbiAgcmV0dXJuIGAke3VybHMudGhpcmRQYXJ0eX0vJHttb2RlLnZlcnNpb24oKX0vdmVuZG9yLyR7dHlwZX0ke2V4dGVuc2lvbn1gO1xufVxuXG4vKipcbiAqIFByZWxvYWRzIFVSTHMgcmVsYXRlZCB0byB0aGUgYm9vdHN0cmFwIGlmcmFtZS5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0geyEuL3ByZWNvbm5lY3QuUHJlY29ubmVjdFNlcnZpY2V9IHByZWNvbm5lY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWxvYWRCb290c3RyYXAod2luLCB0eXBlLCBhbXBkb2MsIHByZWNvbm5lY3QpIHtcbiAgY29uc3QgdXJsID0gZ2V0Qm9vdHN0cmFwQmFzZVVybCh3aW4sIGFtcGRvYyk7XG4gIHByZWNvbm5lY3QucHJlbG9hZChhbXBkb2MsIHVybCwgJ2RvY3VtZW50Jyk7XG5cbiAgLy8gV2hpbGUgdGhlIFVSTCBtYXkgcG9pbnQgdG8gYSBjdXN0b20gZG9tYWluLCB0aGlzIFVSTCB3aWxsIGFsd2F5cyBiZVxuICAvLyBmZXRjaGVkIGJ5IGl0LlxuICBwcmVjb25uZWN0LnByZWxvYWQoYW1wZG9jLCBnZXRCb290c3RyYXBVcmwodHlwZSksICdzY3JpcHQnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiYXNlIFVSTCBmb3IgM3AgYm9vdHN0cmFwIGlmcmFtZXMuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpbmRvd1xuICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc3RyaWN0Rm9yVW5pdFRlc3RcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9vdHN0cmFwQmFzZVVybChcbiAgcGFyZW50V2luZG93LFxuICBhbXBkb2MsXG4gIG9wdF9zdHJpY3RGb3JVbml0VGVzdFxuKSB7XG4gIHJldHVybiAoXG4gICAgZ2V0Q3VzdG9tQm9vdHN0cmFwQmFzZVVybChwYXJlbnRXaW5kb3csIGFtcGRvYywgb3B0X3N0cmljdEZvclVuaXRUZXN0KSB8fFxuICAgIGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdylcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0Qm9vdHN0cmFwQmFzZVVybEZvclRlc3RpbmcodXJsKSB7XG4gIG92ZXJyaWRlQm9vdHN0cmFwQmFzZVVybCA9IHVybDtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyp9IHdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRCb290c3RyYXBCYXNlVXJsRm9yVGVzdGluZyh3aW4pIHtcbiAgd2luLl9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiA9IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZWZhdWx0IGJhc2UgVVJMIGZvciAzcCBib290c3RyYXAgaWZyYW1lcy5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zcmNGaWxlQmFzZW5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdywgb3B0X3NyY0ZpbGVCYXNlbmFtZSkge1xuICBjb25zdCBzcmNGaWxlQmFzZW5hbWUgPSBvcHRfc3JjRmlsZUJhc2VuYW1lIHx8ICdmcmFtZSc7XG4gIGlmIChnZXRNb2RlKCkubG9jYWxEZXYgfHwgZ2V0TW9kZSgpLnRlc3QpIHtcbiAgICByZXR1cm4gZ2V0RGV2ZWxvcG1lbnRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdywgc3JjRmlsZUJhc2VuYW1lKTtcbiAgfVxuICAvLyBFbnN1cmUgc2FtZSBzdWItZG9tYWluIGlzIHVzZWQgZGVzcGl0ZSBwb3RlbnRpYWxseSBkaWZmZXJlbnQgZmlsZS5cbiAgcGFyZW50V2luZG93Ll9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiA9XG4gICAgcGFyZW50V2luZG93Ll9fQU1QX0RFRkFVTFRfQk9PVFNUUkFQX1NVQkRPTUFJTiB8fFxuICAgIGdldFN1YkRvbWFpbihwYXJlbnRXaW5kb3cpO1xuICByZXR1cm4gKFxuICAgICdodHRwczovLycgK1xuICAgIHBhcmVudFdpbmRvdy5fX0FNUF9ERUZBVUxUX0JPT1RTVFJBUF9TVUJET01BSU4gK1xuICAgIGAuJHt1cmxzLnRoaXJkUGFydHlGcmFtZUhvc3R9LyR7bW9kZS52ZXJzaW9uKCl9L2AgK1xuICAgIGAke3NyY0ZpbGVCYXNlbmFtZX0uaHRtbGBcbiAgKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB0byByZXR1cm4gdGhlIGRldmVsb3BtZW50IGJvb3N0cmFwIGJhc2UgVVJMXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpbmRvd1xuICogQHBhcmFtIHtzdHJpbmd9IHNyY0ZpbGVCYXNlbmFtZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2ZWxvcG1lbnRCb290c3RyYXBCYXNlVXJsKHBhcmVudFdpbmRvdywgc3JjRmlsZUJhc2VuYW1lKSB7XG4gIHJldHVybiAoXG4gICAgb3ZlcnJpZGVCb290c3RyYXBCYXNlVXJsIHx8XG4gICAgZ2V0QWRzTG9jYWxob3N0KHBhcmVudFdpbmRvdykgK1xuICAgICAgJy9kaXN0LjNwLycgK1xuICAgICAgKG1vZGUuaXNNaW5pZmllZCgpXG4gICAgICAgID8gYCR7bW9kZS52ZXJzaW9uKCl9LyR7c3JjRmlsZUJhc2VuYW1lfWBcbiAgICAgICAgOiBgY3VycmVudC8ke3NyY0ZpbGVCYXNlbmFtZX0ubWF4YCkgK1xuICAgICAgJy5odG1sJ1xuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldEFkc0xvY2FsaG9zdCh3aW4pIHtcbiAgbGV0IGFkc1VybCA9IHVybHMudGhpcmRQYXJ0eTsgLy8gbG9jYWwgZGV2IHdpdGggYSBub24tbG9jYWxob3N0IHNlcnZlclxuICBpZiAoYWRzVXJsID09ICdodHRwczovLzNwLmFtcHByb2plY3QubmV0Jykge1xuICAgIGFkc1VybCA9ICdodHRwOi8vYWRzLmxvY2FsaG9zdCc7IC8vIGxvY2FsIGRldiB3aXRoIGEgbG9jYWxob3N0IHNlcnZlclxuICB9XG4gIHJldHVybiBhZHNVcmwgKyAnOicgKyAod2luLmxvY2F0aW9uLnBvcnQgfHwgd2luLnBhcmVudC5sb2NhdGlvbi5wb3J0KTtcbn1cblxuLyoqXG4gKiBTdWIgZG9tYWluIG9uIHdoaWNoIHRoZSAzcCBpZnJhbWUgd2lsbCBiZSBob3N0ZWQuXG4gKiBCZWNhdXNlIHdlIG9ubHkgY2FsY3VsYXRlIHRoZSBVUkwgb25jZSBwZXIgcGFnZSwgdGhpcyBmdW5jdGlvbiBpcyBvbmx5XG4gKiBjYWxsZWQgb25jZSBhbmQgaGVuY2UgYWxsIGZyYW1lcyBvbiBhIHBhZ2UgdXNlIHRoZSBzYW1lIFVSTC5cbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFN1YkRvbWFpbih3aW4pIHtcbiAgcmV0dXJuICdkLScgKyBnZXRSYW5kb20od2luKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gbm9uLW5lZ2F0aXZlIGludGVnZXIuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tKHdpbikge1xuICBsZXQgcmFuZDtcbiAgaWYgKHdpbi5jcnlwdG8gJiYgd2luLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBCeSBkZWZhdWx0IHVzZSAyIDMyIGJpdCBpbnRlZ2Vycy5cbiAgICBjb25zdCB1aW50MzJhcnJheSA9IG5ldyBVaW50MzJBcnJheSgyKTtcbiAgICB3aW4uY3J5cHRvLmdldFJhbmRvbVZhbHVlcyh1aW50MzJhcnJheSk7XG4gICAgcmFuZCA9IFN0cmluZyh1aW50MzJhcnJheVswXSkgKyB1aW50MzJhcnJheVsxXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsIGJhY2sgdG8gTWF0aC5yYW5kb20uXG4gICAgcmFuZCA9IFN0cmluZyh3aW4uTWF0aC5yYW5kb20oKSkuc3Vic3RyKDIpICsgJzAnO1xuICB9XG4gIHJldHVybiByYW5kO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1c3RvbSBiYXNlIFVSTCBmb3IgM3AgYm9vdHN0cmFwIGlmcmFtZXMgaWYgaXQgZXhpc3RzLlxuICogT3RoZXJ3aXNlIG51bGwuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpbmRvd1xuICogQHBhcmFtIHshLi9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc3RyaWN0Rm9yVW5pdFRlc3RcbiAqIEByZXR1cm4gez9zdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldEN1c3RvbUJvb3RzdHJhcEJhc2VVcmwoXG4gIHBhcmVudFdpbmRvdyxcbiAgYW1wZG9jLFxuICBvcHRfc3RyaWN0Rm9yVW5pdFRlc3Rcbikge1xuICBjb25zdCBtZXRhID0gYW1wZG9jLmdldE1ldGFCeU5hbWUoJ2FtcC0zcC1pZnJhbWUtc3JjJyk7XG4gIGlmICghbWV0YSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHVybCA9IGFzc2VydEh0dHBzVXJsKG1ldGEsICdtZXRhW25hbWU9XCJhbXAtM3AtaWZyYW1lLXNyY1wiXScpO1xuICB1c2VyQXNzZXJ0KFxuICAgIHVybC5pbmRleE9mKCc/JykgPT0gLTEsXG4gICAgJzNwIGlmcmFtZSB1cmwgbXVzdCBub3QgaW5jbHVkZSBxdWVyeSBzdHJpbmcgJXMgaW4gZWxlbWVudCAlcy4nLFxuICAgIHVybCxcbiAgICBtZXRhXG4gICk7XG4gIC8vIFRoaXMgaXMgbm90IGEgc2VjdXJpdHkgcHJpbWl0aXZlLCB3ZSBqdXN0IGRvbid0IHdhbnQgdGhpcyB0byBoYXBwZW4gaW5cbiAgLy8gcHJhY3RpY2UuIFBlb3BsZSBjb3VsZCBzdGlsbCByZWRpcmVjdCB0byB0aGUgc2FtZSBvcmlnaW4sIGJ1dCB0aGV5IGNhbm5vdFxuICAvLyByZWRpcmVjdCB0byB0aGUgcHJveHkgb3JpZ2luIHdoaWNoIGlzIHRoZSBpbXBvcnRhbnQgb25lLlxuICBjb25zdCBwYXJzZWQgPSBwYXJzZVVybERlcHJlY2F0ZWQodXJsKTtcbiAgdXNlckFzc2VydChcbiAgICAocGFyc2VkLmhvc3RuYW1lID09ICdsb2NhbGhvc3QnICYmICFvcHRfc3RyaWN0Rm9yVW5pdFRlc3QpIHx8XG4gICAgICBwYXJzZWQub3JpZ2luICE9IHBhcnNlVXJsRGVwcmVjYXRlZChwYXJlbnRXaW5kb3cubG9jYXRpb24uaHJlZikub3JpZ2luLFxuICAgICczcCBpZnJhbWUgdXJsIG11c3Qgbm90IGJlIG9uIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBkb2N1bWVudCAnICtcbiAgICAgICclcyAoJXMpIGluIGVsZW1lbnQgJXMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sJyArXG4gICAgICAnL2Jsb2IvbWFpbi9kb2NzL3NwZWMvYW1wLWlmcmFtZS1vcmlnaW4tcG9saWN5Lm1kIGZvciBkZXRhaWxzLicsXG4gICAgdXJsLFxuICAgIHBhcnNlZC5vcmlnaW4sXG4gICAgbWV0YVxuICApO1xuICByZXR1cm4gYCR7dXJsfT8ke21vZGUudmVyc2lvbigpfWA7XG59XG5cbi8qKlxuICogQXBwbGllcyBhIHNhbmRib3ggdG8gdGhlIGlmcmFtZSwgaWYgdGhlIHJlcXVpcmVkIGZsYWdzIGNhbiBiZSBhbGxvd2VkLlxuICogQHBhcmFtIHshRWxlbWVudH0gaWZyYW1lXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U2FuZGJveChpZnJhbWUpIHtcbiAgaWYgKCFpZnJhbWUuc2FuZGJveCB8fCAhaWZyYW1lLnNhbmRib3guc3VwcG9ydHMpIHtcbiAgICByZXR1cm47IC8vIENhbid0IGZlYXR1cmUgZGV0ZWN0IHN1cHBvcnRcbiAgfVxuICAvLyBJZiB0aGVzZSBmbGFncyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgVUEgd2UgZG9uJ3QgYXBwbHkgYW55XG4gIC8vIHNhbmRib3guXG4gIGNvbnN0IHJlcXVpcmVkRmxhZ3MgPSBnZXRSZXF1aXJlZFNhbmRib3hGbGFncygpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkRmxhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBmbGFnID0gcmVxdWlyZWRGbGFnc1tpXTtcbiAgICBpZiAoIWlmcmFtZS5zYW5kYm94LnN1cHBvcnRzKGZsYWcpKSB7XG4gICAgICBkZXYoKS5pbmZvKFRBRywgXCJJZnJhbWUgZG9lc24ndCBzdXBwb3J0ICVzXCIsIGZsYWcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBpZnJhbWUuc2FuZGJveCA9XG4gICAgcmVxdWlyZWRGbGFncy5qb2luKCcgJykgKyAnICcgKyBnZXRPcHRpb25hbFNhbmRib3hGbGFncygpLmpvaW4oJyAnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcmFuZG9taXplZCBzZW50aW5lbCB2YWx1ZSBmb3IgM3AgaWZyYW1lcy5cbiAqIFRoZSBmb3JtYXQgaXMgXCIlZC0lZFwiIHdpdGggdGhlIGZpcnN0IHZhbHVlIGJlaW5nIHRoZSBkZXB0aCBvZiBjdXJyZW50XG4gKiB3aW5kb3cgaW4gdGhlIHdpbmRvdyBoaWVyYXJjaHkgYW5kIHRoZSBzZWNvbmQgYSByYW5kb20gaW50ZWdlci5cbiAqIEBwYXJhbSB7IVdpbmRvd30gcGFyZW50V2luZG93XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2VudGluZWwocGFyZW50V2luZG93KSB7XG4gIGxldCB3aW5kb3dEZXB0aCA9IDA7XG4gIGZvciAobGV0IHdpbiA9IHBhcmVudFdpbmRvdzsgd2luICYmIHdpbiAhPSB3aW4ucGFyZW50OyB3aW4gPSB3aW4ucGFyZW50KSB7XG4gICAgd2luZG93RGVwdGgrKztcbiAgfVxuICByZXR1cm4gU3RyaW5nKHdpbmRvd0RlcHRoKSArICctJyArIGdldFJhbmRvbShwYXJlbnRXaW5kb3cpO1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgY291bnQgb2YgZWFjaCAzcCBmcmFtZSB0eXBlXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q291bnRGb3JUZXN0aW5nKCkge1xuICBjb3VudCA9IHt9O1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/3p-frame.js