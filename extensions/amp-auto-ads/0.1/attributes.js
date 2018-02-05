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
import {startsWith} from '../../../src/string';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * @const {!Object<string, boolean>}
 */
const NON_DATA_ATTRIBUTE_WHITELIST = {
  'type': true,
};

/**
 * @param {!JsonObject} configObj
 * @return {!JsonObject<string, string>}
 */
export function getAttributesFromConfigObj(configObj) {
  if (!configObj['attributes']) {
    return dict();
  }
  if (!isObject(configObj['attributes']) || isArray(configObj['attributes'])) {
    user().warn(TAG, 'attributes property not an object');
    return dict();
  }
  return parseAttributes(configObj['attributes']);
}

/**
 * @param {!JsonObject} attributeObject
 * @return {!JsonObject<string, string>}
 */
function parseAttributes(attributeObject) {
  const attributes = dict();
  for (const key in attributeObject) {
    if (!NON_DATA_ATTRIBUTE_WHITELIST[key] && !startsWith(key, 'data-')) {
      user().warn(TAG, 'Attribute not whitlisted: ' + key);
      continue;
    }
    const valueType = (typeof attributeObject[key]);
    if (valueType != 'number' && valueType != 'string' &&
        valueType != 'boolean') {
      user().warn(TAG, 'Attribute type not supported: ' + valueType);
      continue;
    }
    attributes[key] = String(attributeObject[key]);
  }
  return attributes;
};
