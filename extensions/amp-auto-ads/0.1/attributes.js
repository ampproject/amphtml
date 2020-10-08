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

import {dict} from '../../../src/utils/object';
import {isArray, isObject} from '../../../src/types';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * @const {!Object<string, boolean>}
 */
const NON_DATA_ATTRIBUTE_ALLOWLIST = {
  'type': true,
  'rtc-config': true,
};

/**
 * Indicates attributes from config object for different ad formats.
 * @enum {string}
 */
export const Attributes = {
  // Attributes from config object which should be added on any ads.
  BASE_ATTRIBUTES: 'attributes',
  // Attributes from config object which should be added on anchor ads.
  STICKY_AD_ATTRIBUTES: 'stickyAdAttributes',
};

/**
 * @param {!JsonObject} configObj
 * @param {!Attributes} attributes
 * @return {!JsonObject<string, string>}
 */
export function getAttributesFromConfigObj(configObj, attributes) {
  if (!configObj[attributes]) {
    return dict();
  }
  if (!isObject(configObj[attributes]) || isArray(configObj[attributes])) {
    user().warn(TAG, attributes + ' property not an object');
    return dict();
  }
  return parseAttributes(configObj[attributes]);
}

/**
 * @param {!JsonObject} attributeObject
 * @return {!JsonObject<string, string>}
 */
function parseAttributes(attributeObject) {
  const attributes = dict();
  for (const key in attributeObject) {
    if (!NON_DATA_ATTRIBUTE_ALLOWLIST[key] && !key.startsWith('data-')) {
      user().warn(TAG, 'Attribute not whitlisted: ' + key);
      continue;
    }
    const valueType = typeof attributeObject[key];
    if (
      valueType != 'number' &&
      valueType != 'string' &&
      valueType != 'boolean'
    ) {
      user().warn(TAG, 'Attribute type not supported: ' + valueType);
      continue;
    }
    attributes[key] = String(attributeObject[key]);
  }
  return attributes;
}
