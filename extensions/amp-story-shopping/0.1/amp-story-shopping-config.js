import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Object<string, !Array<function>>} */
const productImagesValidationConfig = {
  'url': [validateRequired, validateURLs],
  'alt': [validateRequired, validateString],
};

/** @const {!Object<string, !Array<function>>} */
const aggregateRatingValidationConfig = {
  'ratingValue': [validateRequired, validateNumber],
  'reviewCount': [validateRequired, validateNumber],
  'reviewUrl': [validateRequired, validateURLs],
};

/** @const {!Object<string, !Array<function>>} */
export const productValidationConfig = {
  /* Required Attrs */
  'productUrl': [validateRequired, validateURLs],
  'productId': [validateRequired, validateString, validateHTMLId],
  'productTitle': [validateRequired, validateString],
  'productBrand': [validateRequired, validateString],
  'productPrice': [validateRequired, validateNumber],
  'productImages': [
    validateRequired,
    getObjectArrayValidationFnForConfig(productImagesValidationConfig),
  ],
  'productPriceCurrency': [validateRequired, validateString, validateCurrency],
  /* Optional Attrs */
  'aggregateRating': [
    getObjectValidationFnForConfig(aggregateRatingValidationConfig),
  ],
  'productIcon': [validateURLs],
  'productTagText': [validateString],
};

/**
 * @typedef {{
 *  items: !Array<!ShoppingConfigDataDef>,
 * }}
 */
let ShoppingConfigResponseDef;

/**
 * Returns a function that validates an object according to the given validation config.
 * @param {!Object<string, !Array<function>>} config
 * @return {boolean}
 */
function getObjectValidationFnForConfig(config) {
  return (field, value) => {
    if (!validateConfig(value, config, field)) {
      throw Error(
        `Value for field '${field}' is not vaild, see the error messages above for details`
      );
    }
  };
}

/**
 * Returns a function that validates an object array according to the given validation config.
 * @param {!Array<!Object<string, !Array<function>>>} config
 * @return {boolean}
 */
function getObjectArrayValidationFnForConfig(config) {
  return (field, value) => {
    let isValid = true;
    for (const item of value) {
      isValid &&= validateConfig(item, config, field);
    }
    if (!isValid) {
      throw Error(
        `Value for field '${field}' is not vaild, see the error messages above for details`
      );
    }
  };
}

/**
 * Throws an error if the given field is undefined.
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
    throw Error(`${field} ${str} is not a string`);
  }
}

/**
 * Throws an error if the given ID is not a valid HTML ID.
 * @param {string} field
 * @param {?string=} id
 */
export function validateHTMLId(field, id) {
  const checkID = /^[A-Za-z]+[\w\-\:\.]*$/;
  if (!checkID.test(id)) {
    throw Error(`${field} ${id} is not a valid HTML Id`);
  }
}

/**
 * Throws an error if the given value is not a number.
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
 * Throws an error if the given currency code is invalid.
 * @param {string} field
 * @param {?string=} currencyCode
 */
export function validateCurrency(field, currencyCode) {
  // This will throw an error on invalid currency codes.
  Intl.NumberFormat('en-EN', {currency: currencyCode}).format(0);
}

/**
 * Throws an error if a given URL is invalid.
 * @param {string} field
 * @param {?Array<string>=} url
 */
export function validateURLs(field, url) {
  if (url === undefined) {
    return;
  }
  const urls = Array.isArray(url) ? url : [url];
  urls.forEach((url) => {
    assertHttpsUrl(url, `amp-story-shopping-config ${field}`);
  });
}

/**
 * Validates the shopping config of a single product.
 * @param {!ShoppingConfigDataDef} shoppingConfig
 * @param {!Object<string, !Array<function>>} validationObject
 * @param {?string} parentFieldName // Optional parent field name of the object for error messages.
 * @return {boolean}
 */
export function validateConfig(
  shoppingConfig,
  validationObject,
  parentFieldName
) {
  let isValidConfig = true;

  Object.keys(validationObject).forEach((configKey) => {
    const validationFunctions = validationObject[configKey];

    const isFieldRequired = validationFunctions.includes(validateRequired);
    const isFieldPresent = shoppingConfig[configKey] !== undefined;

    validationFunctions.forEach((fn) => {
      if (isFieldRequired || isFieldPresent) {
        try {
          fn(configKey, shoppingConfig[configKey]);
        } catch (err) {
          isValidConfig = false;
          const warning = parentFieldName?.concat(` ${err}`) ?? `${err}`;
          user().warn('AMP-STORY-SHOPPING-CONFIG', warning);
        }
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
    const allItems = config['items'];
    const validItems = allItems.filter((item) =>
      validateConfig(item, productValidationConfig)
    );
    if (allItems.length != validItems.length) {
      user().warn(
        'AMP-STORY-SHOPPING-CONFIG',
        `Required fields are missing. Please add them in the shopping config. See the error messages above for more details.`
      );
    }
    return keyByProductTagId(validItems);
  });
}
/**
 * @param {!ShoppingConfigResponseDef} configItems
 * @return {!KeyedShoppingConfigDef}
 */
function keyByProductTagId(configItems) {
  const keyed = {};
  for (const item of configItems) {
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
