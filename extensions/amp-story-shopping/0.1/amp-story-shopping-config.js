import {Services} from '#service';

import {user} from '#utils/log';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import validateProduct from '../../../examples/amp-story/shopping/product.schema.json' assert {type: 'json-schema'};
import {
  Action,
  ShoppingConfigDataDef,
} from '../../amp-story/1.0/amp-story-store-service';

/**
 * @typedef {{
 *  items: !Array<!ShoppingConfigDataDef>,
 * }}
 */
let ShoppingConfigResponseDef;

/**
 * Uses the specified validation configuration to run validation against
 * the user's shopping configuration.
 * @param {!ShoppingConfigDataDef} productConfig The user's config object.
 * @param {string=} parentFieldName Optional parent field name of the object
 *     for error messages.
 * @return {boolean} returns a boolean indicating whether the validation
 *     was successful.
 */
function validateConfig(productConfig, parentFieldName = undefined) {
  let isValidConfig = true;

  consol.log('productConfig', productConfig);

  try {
    validateProduct(productConfig);
  } catch (err) {
    isValidConfig = false;
    const warning = parentFieldName?.concat(` ${err}`) ?? `${err}`;
    user().warn('AMP-STORY-SHOPPING-CONFIG', warning);
  }

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
  console.log('sourcemap error');
  return getElementConfig(shoppingAttachmentEl).then((config) => {
    const allItems = config['items'];
    const validItems = allItems.filter((item) => validateConfig(item));
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
