/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {addParamToUrl} from '../url';
import {getMode} from '../mode';
import {urls} from '../config';

/**
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
 *   extensionId: (string|undefined),
 *   extensionVersion: (string|undefined),
 * }}
 * @private
 */
let ExtensionInfoDef;

/**
 * Calculate the base url for any scripts.
 * @param {!Location} location The window's location
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */
export function calculateScriptBaseUrl(location, opt_isLocalDev) {
  if (opt_isLocalDev) {
    let prefix = `${location.protocol}//${location.host}`;
    if (location.protocol == 'about:') {
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
 * @param {string=} opt_extensionVersion
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */
export function calculateExtensionScriptUrl(
  location,
  extensionId,
  opt_extensionVersion,
  opt_isLocalDev
) {
  let fileExtension;
  if (getMode().sxg && opt_isLocalDev) {
    fileExtension = '.sxg.js';
  } else if (getMode().sxg || getMode().esm) {
    fileExtension = '.mjs';
  } else {
    fileExtension = '.js';
  }
  const base = calculateScriptBaseUrl(location, opt_isLocalDev);
  const rtv = getMode().rtvVersion;
  if (opt_extensionVersion == null) {
    opt_extensionVersion = '0.1';
  }
  const extensionVersion = opt_extensionVersion
    ? '-' + opt_extensionVersion
    : '';
  return finalizeScriptUrl(
    `${base}/rtv/${rtv}/v0/${extensionId}${extensionVersion}${fileExtension}`,
    opt_isLocalDev
  );
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
  let fileExtension;
  if (getMode().sxg && isLocalDev) {
    fileExtension = '.sxg.js';
  } else if (getMode().sxg || getMode().esm) {
    fileExtension = '.mjs';
  } else {
    fileExtension = '.js';
  }
  const base = calculateScriptBaseUrl(location, isLocalDev);
  if (isLocalDev) {
    return `${base}/${entryPoint}${fileExtension}`;
  }
  if (opt_rtv) {
    return finalizeScriptUrl(
      `${base}/rtv/${getMode().rtvVersion}/${entryPoint}${fileExtension}`,
      isLocalDev
    );
  }
  return finalizeScriptUrl(`${base}/${entryPoint}${fileExtension}`, isLocalDev);
}

/**
 * Parse the extension version from a given script URL.
 * @param {string} scriptUrl
 * @return {!ExtensionInfoDef}
 */
export function parseExtensionUrl(scriptUrl) {
  // Note that the "(\.max)?" group only applies to local dev.
  const matches = scriptUrl.match(
    /^(.*)\/(.*)-([0-9.]+|latest)(\.max)?\.(?:js|mjs)(\?.*)?$/i
  );
  return {
    extensionId: matches ? matches[2] : undefined,
    extensionVersion: matches ? matches[3] : undefined,
  };
}

/**
 * Add additional values to the script url depending on mode, such as query parameters.
 * @param {string} scriptUrl
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */
function finalizeScriptUrl(scriptUrl, opt_isLocalDev) {
  // If opt_isLocalDev is true, then .sxg.js is already appended and thus we don't need to add a query param.
  return getMode().sxg && !opt_isLocalDev
    ? addParamToUrl(scriptUrl, 'f', 'sxg')
    : scriptUrl;
}
