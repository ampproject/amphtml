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
 * @param {boolean=} isTest
 * @return {string}
 */
function calculateScriptBaseUrl(location, isLocalDev, isTest) {
  if (isLocalDev) {
    if (isTest || isMax(location) || isMin(location)) {
      return `${location.protocol}//${location.host}/dist`;
    }
  }
  return urls.cdn;
}

/**
 * Calculate script url for an extension.
 * @param {!Location} location The window's location
 * @param {string} extensionId
 * @param {boolean=} isLocalDev
 * @param {boolean=} isTest
 * @param {boolean=} isUsingCompiledJs
 * @return {string}
 */
export function calculateExtensionScriptUrl(location, extensionId, isLocalDev,
    isTest, isUsingCompiledJs) {
  const base = calculateScriptBaseUrl(location, isLocalDev, isTest);
  if (isLocalDev) {
    if ((isTest && !isUsingCompiledJs) || isMax(location)) {
      return `${base}/v0/${extensionId}-0.1.max.js`;
    }
    return `${base}/v0/${extensionId}-0.1.js`;
  }
  return `${base}/rtv/${getMode().rtvVersion}/v0/${extensionId}-0.1.js`;
}

/**
 * Calculate script url for an entry point.
 * @param {!Location} location The window's location
 * @param {string} entryPoint
 * @param {boolean=} isLocalDev
 * @param {boolean=} isTest
 * @return {string}
 */
export function calculateEntryPointScriptUrl(location, entryPoint, isLocalDev,
    isTest) {
  const base = calculateScriptBaseUrl(location, isLocalDev, isTest);
  const serveMax = isLocalDev && isMax(location);
  return `${base}/${entryPoint}${serveMax ? '.max' : ''}.js`;
}

/**
 * Is this path to a max (unminified) version?
 * @param {!Location} location
 * @return {boolean}
 */
function isMax(location) {
  const path = location.pathname;
  return path.indexOf('.max') >= 0 || path.indexOf('/max/') >= 0;
}

/**
 * Is this path to a minified version?
 * @param {!Location} location
 * @return {boolean}
 */
function isMin(location) {
  const path = location.pathname;
  return path.indexOf('.min') >= 0 || path.substr(0, 5) == '/min/';
}
