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

import {getMode} from '../mode';
import {urls} from '../config';

const CUSTOM_TEMPLATES = ['amp-mustache'];
const LATEST_VERSION = 'latest';

/**
 * Calculate the base url for any scripts.
 * @param {!Location} location The window's location
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */
export function calculateScriptBaseUrl(location, opt_isLocalDev) {
  if (opt_isLocalDev) {
    let prefix = `${location.protocol}//${location.host}`;
    if (
      location.protocol == 'about:' ||
      location.protocol == 'blob:' ||
      location.protocol == 'data:'
    ) {
      prefix = '';
    }
    return `${prefix}/dist`;
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
  opt_isLocalDev
) {
  const fileExtension = getMode().esm ? '.mjs' : '.js';
  const base = calculateScriptBaseUrl(location, opt_isLocalDev);
  const rtv = getMode().rtvVersion;
  const extensionVersion = version ? '-' + version : '';
  return `${base}/rtv/${rtv}/v0/${extensionId}${extensionVersion}${fileExtension}`;
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
  opt_rtv
) {
  const fileExtension = getMode().esm ? '.mjs' : '.js';
  const base = calculateScriptBaseUrl(location, isLocalDev);
  if (isLocalDev) {
    return `${base}/${entryPoint}${fileExtension}`;
  }
  if (opt_rtv) {
    return `${base}/rtv/${getMode().rtvVersion}/${entryPoint}${fileExtension}`;
  }
  return `${base}/${entryPoint}${fileExtension}`;
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
  const matches = scriptUrl.match(
    /^(.*)\/(.*)-([0-9.]+|latest)(\.max)?\.(?:js|mjs)$/i
  );
  const extensionId = matches ? matches[2] : undefined;
  const extensionVersion = matches ? matches[3] : undefined;
  if (!extensionId || !extensionVersion) {
    return null;
  }
  return {extensionId, extensionVersion};
}

/**
 * Create the missing amp extension HTML script element.
 * @param {!Window} win
 * @param {string} extensionId
 * @param {string} version
 * @return {!Element} Script object
 */
export function createExtensionScript(win, extensionId, version) {
  const scriptElement = win.document.createElement('script');
  scriptElement.async = true;
  if (isIntermediateExtension(extensionId)) {
    version = '';
  } else {
    scriptElement.setAttribute(
      CUSTOM_TEMPLATES.indexOf(extensionId) >= 0
        ? 'custom-template'
        : 'custom-element',
      extensionId
    );
  }
  scriptElement.setAttribute('data-script', extensionId);
  scriptElement.setAttribute('i-amphtml-inserted', '');
  if (getMode().esm) {
    scriptElement.setAttribute('type', 'module');
  }

  // Propagate nonce to all generated script tags.
  const currentScript = win.document.head.querySelector('script[nonce]');
  if (currentScript) {
    scriptElement.setAttribute('nonce', currentScript.getAttribute('nonce'));
  }

  // Allow error information to be collected
  // https://github.com/ampproject/amphtml/issues/7353
  scriptElement.setAttribute('crossorigin', 'anonymous');
  let loc = win.location;
  if (getMode(win).test && win.testLocation) {
    loc = win.testLocation;
  }
  const scriptSrc = calculateExtensionScriptUrl(
    loc,
    extensionId,
    version,
    getMode(win).localDev
  );
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
  latest,
  includeInserted = true
) {
  // Always ignore <script> elements that have a mismatched RTV.
  const modifier =
    ':not([i-amphtml-loaded-new-version])' +
    (includeInserted ? '' : ':not([i-amphtml-inserted])');
  // We have to match against "src" because a few extensions, such as
  // "amp-viewer-integration", do not have "custom-element" attribute.
  const matches = win.document.head./*OK*/ querySelectorAll(
    `script[src*="/${extensionId}-"]${modifier}`
  );
  const filtered = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const urlParts = parseExtensionUrl(match.src);
    if (!urlParts) {
      continue;
    }
    const {
      extensionId: scriptExtensionId,
      extensionVersion: scriptExtensionVersion,
    } = urlParts;
    if (
      scriptExtensionId == extensionId &&
      (isIntermediateExtension(extensionId) ||
        scriptExtensionVersion == version ||
        (scriptExtensionVersion == LATEST_VERSION && latest))
    ) {
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
  const list = head.querySelectorAll(
    'script[custom-element],script[custom-template]'
  );
  const scripts = [];
  for (let i = 0; i < list.length; i++) {
    const script = list[i];
    const extensionId =
      script.getAttribute('custom-element') ||
      script.getAttribute('custom-template');
    const urlParts = parseExtensionUrl(script.src);
    if (extensionId && urlParts) {
      scripts.push({extensionId, extensionVersion: urlParts.extensionVersion});
    }
  }
  return scripts;
}

/**
 * @param {string} extensionId
 * @return {boolean}
 */
function isIntermediateExtension(extensionId) {
  return extensionId.startsWith('_');
}
