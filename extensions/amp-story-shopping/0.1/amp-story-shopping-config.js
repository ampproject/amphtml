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
  'url': [validateRequired, validateURL],
  'alt': [validateRequired, validateString],
};

/** @const {!Object<string, !Array<function>>} */
const aggregateRatingValidationConfig = {
  'ratingValue': [validateRequired, validateNumber],
  'reviewCount': [validateRequired, validateNumber],
  'reviewUrl': [validateRequired, validateURL],
};

/** @const {!Object<string, !Array<function>>} */
const productValidationConfig = {
  /* Required Attrs */
  'productUrl': [validateRequired, validateURL],
  'productId': [validateRequired, validateString, validateHTMLId],
  'productTitle': [validateRequired, validateString],
  'productPrice': [validateRequired, validateNumber],
  'productImages': [
    validateRequired,
    getObjectArrayValidationFnForConfig(productImagesValidationConfig),
  ],
  'productPriceCurrency': [validateRequired, validateString, validateCurrency],
  /* Optional Attrs */
  'productVendor': [validateString],
  'aggregateRating': [
    getObjectValidationFnForConfig(aggregateRatingValidationConfig),
  ],
  'productIcon': [validateURL],
  'productTagText': [validateString],
};

/**
 * @typedef {{
 *  items: !Array<!ShoppingConfigDataDef>,
 * }}
 */
let ShoppingConfigResponseDef;

/**
 * Returns a function that validates an object according
 * to the given validation config.
 * @param {!Object<string, !Array<function>>} validationConfig
 * @return {function(string, *): undefined}
 */
function getObjectValidationFnForConfig(validationConfig) {
  return (field, shoppingConfigData) => {
    if (!validateConfig(shoppingConfigData, validationConfig, field)) {
      throw Error(
        `Value for field '${field}' is not valid, see the error messages above for details`
      );
    }
  };
}

/**
 * Returns a function that validates an object array according
 * to the given validation config.
 * @param {!Object<string, !Array<function>>} validationConfig
 * @return {function(string, *): undefined}
 */
function getObjectArrayValidationFnForConfig(validationConfig) {
  return (field, shoppingConfigDataArray) => {
    let isValid = true;
    for (const shoppingConfigData of shoppingConfigDataArray) {
      isValid &&= validateConfig(shoppingConfigData, validationConfig, field);
    }
    if (!isValid) {
      throw Error(
        `Value for field '${field}' is not valid, see the error messages above for details`
      );
    }
  };
}

/**
 * Throws an error if the given field is undefined or null.
 * @param {string} field
 * @param {*} value
 */
function validateRequired(field, value) {
  if (value === undefined || value === null) {
    throw Error(`Field ${field} is required.`);
  }
}

/**
 * Throws an error if the given field is not a string.
 * @param {string} field
 * @param {*} str
 */
function validateString(field, str) {
  if (typeof str !== 'string') {
    throw Error(`${field} ${str} is not a string`);
  }
}

/**
 * Throws an error if the given ID is not a valid HTML ID.
 * @param {string} field
 * @param {*} id
 */
function validateHTMLId(field, id) {
  const checkID = /^[A-Za-z]+[\w\-\:\.]*$/;
  if (!checkID.test(id)) {
    throw Error(`${field} ${id} is not a valid HTML Id`);
  }
}

/**
 * Throws an error if the given value is not a number.
 * @param {string} field
 * @param {*} number
 */
function validateNumber(field, number) {
  if (
    typeof number !== 'number' &&
    (typeof number !== 'string' || !/^[0-9.,]+$/.test(number))
  ) {
    throw Error(`Value ${number} for field ${field} is not a number`);
  }
}

/**
 * Throws an error if the given currency code is invalid.
 * @param {string} field
 * @param {*} currencyCode
 */
function validateCurrency(field, currencyCode) {
  const testPrice = 0;
  try {
    // This will throw an error on invalid currency codes.
    Intl.NumberFormat('en-EN', {currency: currencyCode}).format(testPrice);
  } catch (err) {
    throw Error(`${field} ${currencyCode} is not a valid currency code`);
  }
}

/**
 * Throws an error if a given URL is invalid.
 * @param {string} field
 * @param {*} url
 */
function validateURL(field, url) {
  try {
    assertHttpsUrl(url, `amp-story-shopping-config ${field}`);
  } catch (err) {
    throw Error(`${field} ${url} is not a valid URL. (${err})`);
  }
}

/**
 * Uses the specified validation configuration to run validation against
 * the user's shopping configuration.
 * @param {!ShoppingConfigDataDef} productConfig The user's config object.
 * @param {!Object<string, !Array<function>>} validationConfig The object to
 *     validate against the user's config.
 * @param {string=} parentFieldName Optional parent field name of the object
 *     for error messages.
 * @return {boolean} returns a boolean indicating whether the validation
 *     was successful.
 */
function validateConfig(
  productConfig,
  validationConfig,
  parentFieldName = undefined
) {
  let isValidConfig = true;

  Object.keys(validationConfig).forEach((configKey) => {
    const validationFunctions = validationConfig[configKey];
    const isFieldRequired = validationFunctions.includes(validateRequired);
    const isFieldPresent = productConfig[configKey] !== undefined;
    validationFunctions.forEach((fn) => {
      if (isFieldRequired || isFieldPresent) {
        try {
          fn(configKey, productConfig[configKey]);
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
let KeyedShoppingConfigDef;

/**
 * Validates and returns the shopping config corresponding to the given
 * amp-story-shopping-attachment element.
 * @param {!Element} shoppingAttachmentEl <amp-story-shopping-attachment>
 *     The amp story shopping attachment element
 * @return {!Promise<!KeyedShoppingConfigDef>} An object with product ID
 *     keys that each have a `ShoppingConfigDataDef` value
 */
export function getShoppingConfig(shoppingAttachmentEl) {
  return getElementConfig(shoppingAttachmentEl).then((config) => {
    const allItems = config['items'];
    const validItems = allItems.filter((item) =>
      validateConfig(item, productValidationConfig)
    );
    if (allItems.length != validItems.length) {
      user().warn(
        'AMP-STORY-SHOPPING-CONFIG',
        `Please fix: ${
          allItems.length - validItems.length
        } product(s) have invalid shopping configuration values. See the error messages above for more details.`
      );
    }
    return keyByProductId(validItems);
  });
}

/**
 * Takes an array of product configs and returns a map of product IDs to
 * product configs.
 * @param {!ShoppingConfigResponseDef} configItems
 * @return {!KeyedShoppingConfigDef}
 */
function keyByProductId(configItems) {
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
