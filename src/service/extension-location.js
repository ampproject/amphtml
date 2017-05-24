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

import {urls} from '../config';
import {getMode} from '../mode';

/**
 * Calculate the base url for any scripts.
 * @param {!Location} location The window's location
 * @param {boolean=} isLocalDev
 * @return {string}
 */
function calculateScriptBaseUrl(location, isLocalDev) {
  if (isLocalDev) {
    return `${location.protocol}//${location.host}/dist`;
  }
  return urls.cdn;
}

/**
 * Calculate script url for an extension.
 * @param {!Location} location The window's location
 * @param {string} extensionId
 * @param {boolean=} isLocalDev
 * @return {string}
 */
export function calculateExtensionScriptUrl(location, extensionId, isLocalDev) {
  const base = calculateScriptBaseUrl(location, isLocalDev);
  return `${base}/rtv/${getMode().rtvVersion}/v0/${extensionId}-0.1.js`;
}

/**
 * Calculate script url for an entry point.
 * If `opt_rtv` is true, returns the URL matching the current RTV.
 * @param {!Location} location The window's location
 * @param {string} entryPoint
 * @param {boolean=} isLocalDev
 * @param {boolean=} opt_rtv
 * @param {boolean=} opt_minified
 * @return {string}
 */
export function calculateEntryPointScriptUrl(
    location, entryPoint, isLocalDev, opt_rtv, opt_minified) {
  const base = calculateScriptBaseUrl(location, isLocalDev);
  const rtv = opt_rtv ? `/rtv/${getMode().rtvVersion}` : '';
  const max = opt_minified ? '' : '.max';
  return `${base}${rtv}/${entryPoint}${max}.js`;
}
