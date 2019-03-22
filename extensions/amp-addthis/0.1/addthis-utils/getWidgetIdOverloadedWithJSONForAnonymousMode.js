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
 * @param {AmpAddThis} self
 * @return {string} JSON | empty string means there is no override object
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
    if (data !== null) {
      if (isString(data) || isNumber(data) || isBoolean(data)) {
        override[item] = data;
      }
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
