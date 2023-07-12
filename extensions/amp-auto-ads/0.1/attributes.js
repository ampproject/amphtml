import {isArray, isObject} from '#core/types';

import {user} from '#utils/log';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * @const {!{[key: string]: boolean}}
 */
const NON_DATA_ATTRIBUTE_ALLOWLIST = {
  'type': true,
  'rtc-config': true,
  'layout': true,
  'height': true,
  'width': true,
  'sticky': true,
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
    return {};
  }
  if (!isObject(configObj[attributes]) || isArray(configObj[attributes])) {
    user().warn(TAG, attributes + ' property not an object');
    return {};
  }
  return parseAttributes(configObj[attributes]);
}

/**
 * @param {!JsonObject} attributeObject
 * @return {!JsonObject<string, string>}
 */
function parseAttributes(attributeObject) {
  const attributes = {};
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
