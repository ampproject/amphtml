/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Expects an object with pubId, widgetId, & productCode keys with string values
 *
 * There are three (3) planned modes you can invoke the amp-addthis tag via:
 * 1. pubId and widgetId [original mode]
 * 2. pubId and produceCode [wp addthis mode]
 * 3. just product code, no pub ID [wp anonymous mode, future]
 */

/**
 * @param {{pubId: string, widgetId: string, productCode: string}} _
 * @return {number} -1 indicates an error has occurred
 */
export function getAddThisMode(_) {
  const {hasPubId, hasWidgetId, hasProductCode} = getAddThisModeObject(_);
  if (hasPubId) {
    if (hasWidgetId && !hasProductCode) {
      return 1;
    } else if (!hasWidgetId && hasProductCode) {
      return 2;
    }
  } else if (!hasWidgetId && hasProductCode) {
    return 3;
  }
  return -1;
}

/**
 * @param {{pubId: string, widgetId: string, productCode: string}} mode
 * @return {{
 *   hasPubId: boolean,
 *   hasWidgetId: boolean,
 *   hasProductCode: boolean
 * }}
 */
export function getAddThisModeObject(mode) {
  const {pubId, widgetId, productCode} = mode;
  const hasPubId = isPubId(pubId);
  // widget ids are 4-character strings with lower-case letters and numbers only
  const hasWidgetId = isWidgetId(widgetId);
  // product code is one of just a few values
  const hasProductCode =
    typeof productCode === 'string' &&
    (productCode === 'shin' || productCode === 'shfs');
  return {hasPubId, hasWidgetId, hasProductCode};
}

/**
 * @param {*} candidate
 * @return {boolean}
 */
export function isPubId(candidate) {
  return typeof candidate === 'string' && candidate.length > 0;
}

/**
 * @param {*} candidate
 * @return {boolean}
 */
export function isWidgetId(candidate) {
  return typeof candidate === 'string' && candidate.length === 4;
}

/**
 * @param {*} candidate
 * @return {boolean}
 */
export function isProductCode(candidate) {
  return candidate === 'shin' || candidate === 'shfs';
}
