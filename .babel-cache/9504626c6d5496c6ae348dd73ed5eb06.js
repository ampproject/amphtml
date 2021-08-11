/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import { urls } from "../config";
import { getMode } from "../mode";

var CUSTOM_TEMPLATES = ['amp-mustache'];
var LATEST_VERSION = 'latest';

/**
 * Calculate the base url for any scripts.
 * @param {!Location} location The window's location
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */
export function calculateScriptBaseUrl(location, opt_isLocalDev) {
  if (opt_isLocalDev) {
    var prefix = "".concat(location.protocol, "//").concat(location.host);
    if (
    location.protocol == 'about:' ||
    location.protocol == 'blob:' ||
    location.protocol == 'data:')
    {
      prefix = '';
    }
    return "".concat(prefix, "/dist");
  }
  return urls.cdn;
}

/**
 * Calculate script url for an extension.
 * @param {!Location} location The window's location
 * @param {string} extensionId
 * @param {string} version
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */
export function calculateExtensionScriptUrl(
location,
extensionId,
version,
opt_isLocalDev)
{
  var fileExtension = getMode().esm ? '.mjs' : '.js';
  var base = calculateScriptBaseUrl(location, opt_isLocalDev);
  var rtv = getMode().rtvVersion;
  var extensionVersion = version ? '-' + version : '';
  return "".concat(base, "/rtv/").concat(rtv, "/v0/").concat(extensionId).concat(extensionVersion).concat(fileExtension);
}

/**
 * Calculate script url for an entry point.
 * If `opt_rtv` is true, returns the URL matching the current RTV.
 * @param {!Location} location The window's location
 * @param {string} entryPoint
 * @param {boolean=} isLocalDev
 * @param {boolean=} opt_rtv
 * @return {string}
 */
export function calculateEntryPointScriptUrl(
location,
entryPoint,
isLocalDev,
opt_rtv)
{
  var fileExtension = getMode().esm ? '.mjs' : '.js';
  var base = calculateScriptBaseUrl(location, isLocalDev);
  if (isLocalDev) {
    return "".concat(base, "/").concat(entryPoint).concat(fileExtension);
  }
  if (opt_rtv) {
    return "".concat(base, "/rtv/").concat(getMode().rtvVersion, "/").concat(entryPoint).concat(fileExtension);
  }
  return "".concat(base, "/").concat(entryPoint).concat(fileExtension);
}

/**
 * Parse the extension version from a given script URL.
 * @param {string} scriptUrl
 * @return {?{extensionId: string, extensionVersion: string}}
 */
export function parseExtensionUrl(scriptUrl) {
  if (!scriptUrl) {
    return null;
  }
  // Note that the "(\.max)?" group only applies to local dev.
  var matches = scriptUrl.match(
  /^(.*)\/(.*)-([0-9.]+|latest)(\.max)?\.(?:js|mjs)$/i);

  var extensionId = matches ? matches[2] : undefined;
  var extensionVersion = matches ? matches[3] : undefined;
  if (!extensionId || !extensionVersion) {
    return null;
  }
  return { extensionId: extensionId, extensionVersion: extensionVersion };
}

/**
 * Create the missing amp extension HTML script element.
 * @param {!Window} win
 * @param {string} extensionId
 * @param {string} version
 * @return {!Element} Script object
 */
export function createExtensionScript(win, extensionId, version) {
  var scriptElement = win.document.createElement('script');
  scriptElement.async = true;
  if (isIntermediateExtension(extensionId)) {
    version = '';
  } else {
    scriptElement.setAttribute(
    CUSTOM_TEMPLATES.indexOf(extensionId) >= 0 ?
    'custom-template' :
    'custom-element',
    extensionId);

  }
  scriptElement.setAttribute('data-script', extensionId);
  scriptElement.setAttribute('i-amphtml-inserted', '');
  if (getMode().esm) {
    scriptElement.setAttribute('type', 'module');
  }

  // Propagate nonce to all generated script tags.
  var currentScript = win.document.head.querySelector('script[nonce]');
  if (currentScript) {
    scriptElement.setAttribute('nonce', currentScript.getAttribute('nonce'));
  }

  // Allow error information to be collected
  // https://github.com/ampproject/amphtml/issues/7353
  scriptElement.setAttribute('crossorigin', 'anonymous');
  var loc = win.location;
  if (false && win.testLocation) {
    loc = win.testLocation;
  }
  var scriptSrc = calculateExtensionScriptUrl(
  loc,
  extensionId,
  version, false);


  scriptElement.src = scriptSrc;
  return scriptElement;
}

/**
 * Returns the extension <script> element and attribute for the given
 * extension ID, if it exists. Otherwise, returns null.
 * @param {!Window} win
 * @param {string} extensionId
 * @param {string} version
 * @param {boolean} latest
 * @param {boolean=} includeInserted If true, includes script elements that
 *   are inserted by the runtime dynamically. Default is true.
 * @return {!Array<!Element>}
 */
export function getExtensionScripts(
win,
extensionId,
version,
latest)

{var includeInserted = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  // Always ignore <script> elements that have a mismatched RTV.
  var modifier =
  ':not([i-amphtml-loaded-new-version])' + (
  includeInserted ? '' : ':not([i-amphtml-inserted])');
  // We have to match against "src" because a few extensions, such as
  // "amp-viewer-integration", do not have "custom-element" attribute.
  var matches = win.document.head. /*OK*/querySelectorAll("script[src*=\"/".concat(
  extensionId, "-\"]").concat(modifier));

  var filtered = [];
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var urlParts = parseExtensionUrl(match.src);
    if (!urlParts) {
      continue;
    }
    var
    scriptExtensionId =

    urlParts.extensionId,scriptExtensionVersion = urlParts.extensionVersion;
    if (
    scriptExtensionId == extensionId && (
    isIntermediateExtension(extensionId) ||
    scriptExtensionVersion == version || (
    scriptExtensionVersion == LATEST_VERSION && latest)))
    {
      filtered.push(match);
    }
  }
  return filtered;
}

/**
 * Get list of all the extension JS files.
 * @param {HTMLHeadElement|Element|ShadowRoot|Document} head
 * @return {!Array<{extensionId: string, extensionVersion: string}>}
 */
export function extensionScriptsInNode(head) {
  // ampdoc.getHeadNode() can return null.
  if (!head) {
    return [];
  }
  // Note: Some extensions don't have [custom-element] or [custom-template]
  // e.g. amp-viewer-integration.
  var list = head.querySelectorAll(
  'script[custom-element],script[custom-template]');

  var scripts = [];
  for (var i = 0; i < list.length; i++) {
    var script = list[i];
    var extensionId =
    script.getAttribute('custom-element') ||
    script.getAttribute('custom-template');
    var urlParts = parseExtensionUrl(script.src);
    if (extensionId && urlParts) {
      scripts.push({ extensionId: extensionId, extensionVersion: urlParts.extensionVersion });
    }
  }
  return scripts;
}

/**
 * Verifies that an extension script is present in head for
 * installation.
 * @param {!Window} win
 * @param {string} id
 * @param {string} version
 * @return {boolean}
 */
export function extensionScriptInNode(win, id, version) {
  return extensionScriptsInNode(win.document.head).some(
  function (_ref) {var extensionId = _ref.extensionId,extensionVersion = _ref.extensionVersion;return (
      id == extensionId && version == extensionVersion);});

}

/**
 * @param {string} extensionId
 * @return {boolean}
 */
function isIntermediateExtension(extensionId) {
  return extensionId.startsWith('_');
}
// /Users/mszylkowski/src/amphtml/src/service/extension-script.js