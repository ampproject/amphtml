import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Object<!Object<string, !Array<function>>>} */
const productImagesValidationConfig = {
  'url': [validateRequired, validateURLs],
  'alt': [validateRequired, validateString],
};

/** @const {!Object<!Object<string, !Array<function>>>} */
const aggregateRatingValidationConfig = {
  'ratingValue': [validateRequired, validateNumber],
  'reviewCount': [validateRequired, validateNumber],
  'reviewUrl': [validateRequired, validateURLs],
};

/** @const {!Object<!Object<string, !Array<function>>>} */
export const productValidationConfig = {
  /* Required Attrs */
  'productUrl': [validateRequired, validateURLs],
  'productId': [validateRequired, validateString],
  'productTitle': [validateRequired, validateString],
  'productBrand': [validateRequired, validateString],
  'productPrice': [validateRequired, validateNumber],
  'productImages': [
    validateRequired,
    createValidateConfigArray(productImagesValidationConfig),
  ],
  'productPriceCurrency': [validateRequired, validateString, validateCurrency],
  /* Optional Attrs */
  'aggregateRating': [
    createValidateConfigObject(aggregateRatingValidationConfig),
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
 * Used for keeping track of intermediary invalid config results within Objects or Arrays of Objects.
 * @private {boolean}
 */
let isValidConfigSection_ = true;

/**
 * Validates an Object using the validateConfig function.
 * @param {?Object=} validation
 * @return {boolean}
 */
function createValidateConfigObject(validation) {
  return (field, value) => {
    isValidConfigSection_ &&= validateConfig(value, validation, field);
  };
}

/**
 * Validates an Array of Objects using the validateConfig function.
 * @param {?Object=} validation
 * @return {boolean}
 */
function createValidateConfigArray(validation) {
  return (field, value) => {
    for (const item of value) {
      isValidConfigSection_ &&= validateConfig(item, validation, field);
    }
  };
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
 * Validates currency in shopping config attributes
 * @param {string} field
 * @param {?string=} curr
 */
export function validateCurrency(field, curr) {
  // This will throw an error on invalid currency codes.
  Intl.NumberFormat('en-EN', {currency: curr}).format(0);
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
    assertHttpsUrl(url, `amp-story-shopping-config ${field}`);
  });
}

/**
 * Validates the shopping config of a single product.
 * @param {!ShoppingConfigDataDef} shoppingConfig
 * @param {!Object<string, !Array<function>>} validationObject
 * @param {?string} optParentFieldName
 * @return {boolean}
 */
export function validateConfig(
  shoppingConfig,
  validationObject = productValidationConfig,
  optParentFieldName = undefined
) {
  let isValidConfig = true;

  Object.keys(validationObject).forEach((configKey) => {
    const validationFunctions = validationObject[configKey];
    validationFunctions.forEach((fn) => {
      try {
        /* This check will skip optional attribute validation checks when they are not present in the config */
        if (
          shoppingConfig[configKey] !== undefined ||
          validationFunctions.includes(validateRequired)
        ) {
          fn(configKey, shoppingConfig[configKey]);
        }
      } catch (err) {
        isValidConfig = false;
        const warning = optParentFieldName?.concat(' ', err) ?? err;
        user().warn('AMP-STORY-SHOPPING-CONFIG', warning);
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
      isValidConfigSection_ = true;
      let isValidConfig = validateConfig(item2);
      isValidConfig &&= isValidConfigSection_;
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
      let indexOffset = 0;
      for (const index of shoppingTagIndicesToRemove) {
        //need to keep track of accumulated indices to make sure that the splice index is correct!
        config['items'].splice(index + indexOffset, 1);
        indexOffset--;
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
