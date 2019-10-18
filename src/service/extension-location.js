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
import {isCacheModifiedExtension} from '../cache-modified-extensions';
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
 * @param {boolean=} opt_useDefaultCdn
 * @return {string}
 */
export function calculateScriptBaseUrl(
  location,
  opt_isLocalDev,
  opt_useDefaultCdn
) {
  if (opt_isLocalDev) {
    let prefix = `${location.protocol}//${location.host}`;
    if (location.protocol == 'about:') {
      prefix = '';
    }
    return `${prefix}/dist`;
  }
  if (opt_useDefaultCdn) {
    return urls.defaultCdn;
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
  const useDefaultCdn =
    isCacheModifiedExtension(extensionId) &&
    !urls.cdnSupportsCacheModifiedExtensions;
  const base = calculateScriptBaseUrl(location, opt_isLocalDev, useDefaultCdn);
  if (opt_extensionVersion == null) {
    opt_extensionVersion = '0.1';
  }
  const extensionVersion = opt_extensionVersion
    ? '-' + opt_extensionVersion
    : '';
  let extensionPath = `v0/${extensionId}${extensionVersion}.js`;
  if (urls.cdn === urls.defaultCdn || useDefaultCdn) {
    extensionPath = `rtv/${getMode().rtvVersion}/${extensionPath}`;
  }
  return `${base}/${extensionPath}`;
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
  const base = calculateScriptBaseUrl(location, isLocalDev, false);
  let entryPointPath = `${entryPoint}.js`;
  if (urls.cdn === urls.defaultCdn && opt_rtv) {
    entryPointPath = `rtv/${getMode().rtvVersion}/${entryPointPath}`;
  }
  return `${base}/${entryPointPath}`;
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
