import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Object<string, !Array<function>>} */
export const PRODUCT_VALIDATION_CONFIG = {
  /* Required Attrs */
  'productUrl': [validateRequired, validateString],
  'productId': [validateRequired, validateString],
  'productTitle': [validateRequired, validateString],
  'productBrand': [validateRequired, validateString],
  'productPrice': [validateRequired, validateNumber],
  'productImages': [validateRequired, validateURLs],
  'productPriceCurrency': [validateRequired, validateString],
  /* Optional Attrs */
  'productColor': [validateString],
  'productSize': [validateString],
  'productIcon': [validateURLs],
  'productTagText': [validateString],
  'reviewsData': [validateURLs],
  'ctaText': [validateNumber],
  'shippingText': [validateNumber],
};

const essentialFieldsAccum = [];
const essentialFields = [
  'productPrice',
  'productTitle',
  'productImages',
  'productBrand',
  'productId',
];

/**
 * @typedef {{
 *  items: !Array<!ShoppingConfigDataDef>,
 * }}
 */
let ShoppingConfigResponseDef;

/**
 * Validates if a required field exists for shopping config attributes
 * @param {string} field
 * @param {?string=} value
 */
export function validateRequired(field, value = undefined) {
  if (value === undefined) {
    if (essentialFields.includes(field)) {
      essentialFieldsAccum.push(field);
    }
    throw Error(`Field ${field} is required.`);
  }
}

/**
 * Validates string length of shopping config attributes
 * @param {string} field
 * @param {?string=} str
 */
export function validateString(field, str = undefined) {
  if (typeof str !== 'string' && str !== undefined) {
    throw Error(`${field} ${str} is not a string.`);
  }
}

/**
 * Validates number in shopping config attributes
 * @param {string} field
 * @param {?number=} number
 */
export function validateNumber(field, number = undefined) {
  if (typeof number !== 'number' && number !== undefined) {
    throw Error(`Value ${number} for field ${field} is not a number`);
  }
}

/**
 * Validates url of shopping config attributes
 * @param {string} field
 * @param {?Array<string>=} url
 */
export function validateURLs(field, url = undefined) {
  if (url === undefined) {
    return;
  }

  const urls = Array.isArray(url) ? url : [url];

  urls.forEach((url) => {
    assertHttpsUrl(url.url ?? url, `amp-story-shopping-config ${field}`);
  });
}

/**
 * Validates shopping config.
 * @param {!ShoppingConfigDataDef} shoppingConfig
 */
export function validateConfig(shoppingConfig) {
  Object.keys(PRODUCT_VALIDATION_CONFIG).forEach((configKey) => {
    const validationFunctions = PRODUCT_VALIDATION_CONFIG[configKey];
    validationFunctions.forEach((fn) => {
      try {
        fn(configKey, shoppingConfig[configKey]);
      } catch (err) {
        user().warn('AMP-STORY-SHOPPING-CONFIG', `${err}`);
      }
    });
  });
}

/** @typedef {!Object<string, !ShoppingConfigDataDef> */
export let KeyedShoppingConfigDef;

/**
 * Gets Shopping config from an <amp-story-page> element.
 * The config is validated and keyed by 'product-tag-id'.
 * @param {!Element} pageElement <amp-story-page>
 * @return {!Promise<!KeyedShoppingConfigDef>}
 */
export function getShoppingConfig(pageElement) {
  const element = pageElement.querySelector('amp-story-shopping-config');
  return getElementConfig(element).then((config) => {
    config['items'].forEach((item) => validateConfig(item));

    if (essentialFieldsAccum.length > 0) {
      user().warn(
        'AMP-STORY-SHOPPING-CONFIG',
        `Essential fields ${JSON.stringify(
          essentialFieldsAccum
        )} are missing. Please add them in the shopping config. See the error messages above for more details.`
      );
      return;
    } else {
      return keyByProductTagId(config);
    }
  });
}
/**
 * @param {!ShoppingConfigResponseDef} config
 * @return {!KeyedShoppingConfigDef}
 */
function keyByProductTagId(config) {
  const keyed = {};
  for (const item of config.items) {
    keyed[item.productId] = item;
  }
  return keyed;
}

/**
 * @param {!Element} pageElement
 * @param {!KeyedShoppingConfigDef} config
 * @return {!Promise<!ShoppingConfigResponseDef>}
 */
export function storeShoppingConfig(pageElement, config) {
  const win = pageElement.ownerDocument.defaultView;
  return Services.storyStoreServiceForOrNull(win).then((storeService) => {
    storeService?.dispatch(Action.ADD_SHOPPING_DATA, config);
    return config;
  });
}
