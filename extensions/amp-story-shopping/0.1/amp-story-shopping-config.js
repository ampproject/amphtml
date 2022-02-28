import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Object<!Object<string, !Array<function>>>} */

const aggregateRatingValidation = {
  'ratingValue': [validateRequired, validateNumber],
  'reviewCount': [validateRequired, validateNumber],
  'reviewUrl': [validateRequired, validateURLs],
};

export const productValidationConfig = {
  /* Required Attrs */
  'productUrl': [validateRequired, validateString],
  'productId': [validateRequired, validateString],
  'productTitle': [validateRequired, validateString],
  'productBrand': [validateRequired, validateString],
  'productPrice': [validateRequired, validateNumber],
  'productImages': [validateRequired, validateURLs],
  'productPriceCurrency': [validateRequired, validateString],
  'aggregateRating': [
    validateRequired,
    createValidateConfig(aggregateRatingValidation),
  ],
  /* Optional Attrs */
  'productIcon': [validateURLs],
  'productTagText': [validateString],
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
 * Validates an Object using the validateConfig function.
 * @param {?Object=} validation
 * @return {boolean}
 */
function createValidateConfig(validation) {
  return (field, value) => validateConfig(value, validation);
}

/**
 * Validates if a required field exists for shopping config attributes
 * @param {string} field
 * @param {?string=} value
 */
export function validateRequired(field, value) {
  if (value === undefined) {
    throw Error(`Field ${field} is required.`);
  }
}

/**
 * Validates if string type for shopping config attributes
 * @param {string} field
 * @param {?string=} str
 */
export function validateString(field, str) {
  if (typeof str !== 'string') {
    throw Error(`${field} ${str} is not a string.`);
  }
}

/**
 * Validates number in shopping config attributes
 * @param {string} field
 * @param {?number=} number
 */
export function validateNumber(field, number) {
  if (
    (typeof number === 'string' && !/^[0-9.,]+$/.test(number)) ||
    (typeof number !== 'string' && typeof number !== 'number')
  ) {
    throw Error(`Value ${number} for field ${field} is not a number`);
  }
}

/**
 * Validates url of shopping config attributes
 * @param {string} field
 * @param {?Array<string>=} url
 */
export function validateURLs(field, url) {
  if (url === undefined) {
    return;
  }

  const urls = Array.isArray(url) ? url : [url];

  urls.forEach((url) => {
    assertHttpsUrl(url.url ?? url, `amp-story-shopping-config ${field}`);
    if (field === 'productImages') {
      validateString('productImages alt', url.alt);
    }
  });
}

/**
 * Validates the shopping config of a single product.
 * @param {!ShoppingConfigDataDef} shoppingConfig
 * @param {!Object<string, !Array<function>>} validationObject
 * @return {boolean}
 */
export function validateConfig(
  shoppingConfig,
  validationObject = productValidationConfig
) {
  let isValidConfig = true;

  Object.keys(validationObject).forEach((configKey) => {
    const validationFunctions = validationObject[configKey];
    validationFunctions.forEach((fn) => {
      try {
        /* This check skips optional attribute validation */
        if (
          shoppingConfig[configKey] !== undefined ||
          validationFunctions.includes(validateRequired)
        ) {
          fn(configKey, shoppingConfig[configKey]);
        }
      } catch (err) {
        isValidConfig = false;
        user().warn('AMP-STORY-SHOPPING-CONFIG', `${err}`);
      }
    });
  });

  return isValidConfig;
}

/** @typedef {!Object<string, !ShoppingConfigDataDef> */
export let KeyedShoppingConfigDef;

/**
 * Gets Shopping config from an element.
 * The config is validated and keyed by 'product-tag-id'.
 * @param {!Element} element <amp-story-shopping-attachment>
 * @return {!Promise<!KeyedShoppingConfigDef>}
 */
export function getShoppingConfig(element) {
  return getElementConfig(element).then((config) => {
    const shoppingTagIndicesToRemove = [];
    let currentShoppingTagIndex = 0;
    const areConfigsValid = config['items'].reduce((item1, item2) => {
      const isValidConfig = validateConfig(item2);
      if (!isValidConfig) {
        shoppingTagIndicesToRemove.push(currentShoppingTagIndex);
      }
      currentShoppingTagIndex++;
      return item1 && isValidConfig;
    }, true);

    if (!areConfigsValid) {
      user().warn(
        'AMP-STORY-SHOPPING-CONFIG',
        `Required fields are missing. Please add them in the shopping config. See the error messages above for more details.`
      );
      for (const index of shoppingTagIndicesToRemove) {
        config['items'].splice(index, 1);
      }
    }

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
 * @return {!ShoppingConfigResponseDef}
 */
export function storeShoppingConfig(pageElement, config) {
  const win = pageElement.ownerDocument.defaultView;
  const storeService = Services.storyStoreService(win);
  const pageIdToConfig = {[pageElement.id]: config};
  storeService?.dispatch(Action.ADD_SHOPPING_DATA, pageIdToConfig);
  return config;
}
