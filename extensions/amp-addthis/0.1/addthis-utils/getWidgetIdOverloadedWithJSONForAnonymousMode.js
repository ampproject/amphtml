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
import {isBoolean} from './boolean';
import {isFunction} from './function';
import {isNumber} from './number';
import {isString} from './string';

const overrideKeys = ['backgroundColor', 'borderRadius', 'counterColor',
  'counts', 'countsFontSize', 'desktopPosition', 'elements', 'hideDevice',
  'hideEmailSharingConfirmation', 'hideLabel','iconColor', 'label',
  'mobilePosition', 'numPreferredServices', 'offset', 'originalServices',
  'postShareFollowMsg', 'postShareRecommendedMsg', 'postShareTitle',
  'responsive', 'shareCountThreshold', 'size', 'style', 'textColor',
  'thankyou', 'titleFontSize', '__hideOnHomepage',
];

/**
 * Get Widget ID Overloaded With JSON For Anonymous Mode
 * If no argument or self doesnt have element.getAttribute, returns empty string
 * For each existing attribute: `data-attr-NAME`, check and add value for key
 * If object is not empty, return only the JSON of the override object
 * If an error happens return empty string
 * @param {AMP.BaseElement} self
 * @return {JsonObject|string} empty string means there is no override object
 */
export const getWidgetOverload = self => {
  const hasGetAttributeFunction = self && self.element &&
    self.element.getAttribute && isFunction(self.element.getAttribute);
  if (!hasGetAttributeFunction) {
    return '';
  }
  const override = {};
  overrideKeys.forEach(item => {
    const data = self.element.getAttribute(`data-attr-${item}`);
    if (isString(data) || isNumber(data) || isBoolean(data)) {
      override[item] = data;
    }
  });
  let returnValue = '';
  if (override && Object.keys(override).length > 0) {
    try {
      returnValue = JSON.stringify(override);
    } catch (e) {}
  }
  return returnValue;
};
