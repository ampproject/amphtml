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
function calculateScriptBaseUrl(location, opt_isLocalDev) {
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
 * Calculates if we need a single pass folder or not.
 *
 * @return {string}
 */
function getSinglePassExperimentPath() {
  return getMode().singlePassType ? `${getMode().singlePassType}/` : '';
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
  const base = calculateScriptBaseUrl(location, opt_isLocalDev);
  const rtv = getMode().rtvVersion;
  if (opt_extensionVersion == null) {
    opt_extensionVersion = '0.1';
  }
  const extensionVersion = opt_extensionVersion
    ? '-' + opt_extensionVersion
    : '';
  const spPath = getSinglePassExperimentPath();
  return `${base}/rtv/${rtv}/${spPath}v0/${extensionId}${extensionVersion}.js`;
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
  const base = calculateScriptBaseUrl(location, isLocalDev);
  if (opt_rtv) {
    const spPath = getSinglePassExperimentPath();
    return `${base}/rtv/${getMode().rtvVersion}/${spPath}${entryPoint}.js`;
  }
  return `${base}/${entryPoint}.js`;
}

/**
 * Parse the extension version from a given script URL.
 * @param {string} scriptUrl
 * @return {!ExtensionInfoDef}
 */
export function parseExtensionUrl(scriptUrl) {
  const regex = /^(.*)\/(.*)-([0-9.]+)\.js$/i;
  const matches = scriptUrl.match(regex);

  return {
    extensionId: matches ? matches[2] : undefined,
    extensionVersion: matches ? matches[3] : undefined,
  };
}
