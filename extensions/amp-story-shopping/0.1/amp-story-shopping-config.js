import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Object<!Object<string, !Array<function>>>} */
export const VALIDATION_OBJECTS = {
  'aggregateRating': {
    'ratingValue': [validateRequired, validateNumber],
    'reviewCount': [validateRequired, validateNumber],
    'reviewUrl': [validateRequired, validateURLs],
  },
  'productValidationConfig': {
    /* Required Attrs */
    'productUrl': [validateRequired, validateString],
    'productId': [validateRequired, validateString],
    'productTitle': [validateRequired, validateString],
    'productBrand': [validateRequired, validateString],
    'productPrice': [validateRequired, validateNumber],
    'productImages': [validateRequired, validateURLs],
    'productPriceCurrency': [validateRequired, validateString],
    'aggregateRating': [validateRequired, validateObject],
    /* Optional Attrs */
    'productColor': [validateString],
    'productSize': [validateString],
    'productIcon': [validateURLs],
    'productTagText': [validateString],
    'reviewsData': [validateURLs],
    'ctaText': [validateNumber],
    'shippingText': [validateNumber],
  },
};

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
 * Validates an Object using its field name as a key for one of the validation objects above.
 * @param {string} field
 * @param {?Object=} value
 */
function validateObject(field, value = undefined) {
  validateConfig(value, VALIDATION_OBJECTS[field]);
}

/**
 * Validates if a required field exists for shopping config attributes
 * @param {string} field
 * @param {?string=} value
 */
function validateRequired(field, value = undefined) {
  if (value === undefined) {
    throw Error(`Field ${field} is required.`);
  }
}

/**
 * Validates if string type for shopping config attributes
 * @param {string} field
 * @param {?string=} str
 */
function validateString(field, str = undefined) {
  if (typeof str !== 'string') {
    throw Error(`${field} ${str} is not a string.`);
  }
}

/**
 * Validates number in shopping config attributes
 * @param {string} field
 * @param {?number=} number
 */
function validateNumber(field, number = undefined) {
  if (typeof number !== 'number') {
    throw Error(`Value ${number} for field ${field} is not a number`);
  }
}

/**
 * Validates url of shopping config attributes
 * @param {string} field
 * @param {?Array<string>=} url
 */
function validateURLs(field, url = undefined) {
  if (url === undefined) {
    return;
  }

  const urls = Array.isArray(url) ? url : [url];

  urls.forEach((url) => {
    assertHttpsUrl(url.url ?? url, `amp-story-shopping-config ${field}`);
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
  validationObject = VALIDATION_OBJECTS['productValidationConfig']
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
        if (essentialFields.includes(configKey)) {
          isValidConfig = false;
        }
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
    const areConfigsValid = config['items'].reduce((item1, item2) => {
      return item1 && validateConfig(item2);
    }, true);

    if (!areConfigsValid) {
      user().warn(
        'AMP-STORY-SHOPPING-CONFIG',
        `Essential fields are missing. Please add them in the shopping config. See the error messages above for more details.`
      );
      return null;
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
    const pageIdToConfig = {[pageElement.id]: config};
    storeService?.dispatch(Action.ADD_SHOPPING_DATA, pageIdToConfig);
    return config;
  });
}
