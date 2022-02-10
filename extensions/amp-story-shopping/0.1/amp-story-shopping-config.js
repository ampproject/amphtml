import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/**
 * Max Length of strings allowed in shopping config.
 */
export const MAX_STR_LEN = 100;

/** @const {!Object<string, !Array<function>>} */
export const PRODUCT_VALIDATION_CONFIG = {
  /* Required Attrs */
  'productId': [validateRequired, validateStringLength],
  'productTitle': [validateRequired, validateStringLength],
  'productPrice': [validateRequired, validateNumber],
  'productImages': [validateRequired, validateURLs],
  'productPriceCurrency': [validateRequired, validateStringLength],
  /* Optional Attrs */
  'productColor': [validateStringLength],
  'productSize': [validateStringLength],
  'productIcon': [validateURLs],
  'productTagText': [validateStringLength],
  'reviewsData': [validateURLs],
  'ctaText': [validateNumber],
  'shippingText': [validateNumber],
};

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
export function validateRequired(field, value = null) {
  if (value == null) {
    throw Error(`Field ${field} is required.`);
  }
}

/**
 * Validates string length of shopping config attributes
 * @param {string} field
 * @param {?string=} str
 */
export function validateStringLength(field, str = null) {
  if (str?.length > MAX_STR_LEN) {
    throw Error(
      `Length of ${field} exceeds max length: ${str.length} > ${MAX_STR_LEN}`
    );
  }
}

/**
 * Validates number in shopping config attributes
 * @param {string} field
 * @param {?number=} number
 */
export function validateNumber(field, number = null) {
  if (number != null && isNaN(number)) {
    throw Error(`Value ${number} for field ${field} is not a number`);
  }
}

/**
 * Validates url of shopping config attributes
 * @param {string} field
 * @param {?Array<string>=} url
 */
export function validateURLs(field, url = null) {
  if (url == null) {
    return;
  }

  const urls = Array.isArray(url) ? url : [url];

  urls.forEach((url) => {
    assertHttpsUrl(url, `amp-story-shopping-config ${field}`);
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
    return keyByProductTagId(config);
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
