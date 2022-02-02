import {Services} from '#service';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

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

/** @typedef {!Object<string, !ShoppingConfigDataDef> */
export let KeyedShoppingConfigDef;

/**
 * Gets Shopping config from an <amp-story-shopping-attachment> element.
 * The config is validated and keyed by 'product-id'.
 * @param {!Element} pageElement <amp-story-page>
 * @return {!Promise<!KeyedShoppingConfigDef>}
 */
export function getShoppingConfig(pageElement) {
  const element = pageElement.querySelector('amp-story-shopping-attachment');
  return getElementConfig(element).then((config) => {
    //TODO(#36412): Add call to validate config here.
    return keyByProductId(config);
  });
}

/**
 * @param {!ShoppingConfigResponseDef} config
 * @return {!KeyedShoppingConfigDef}
 */
function keyByProductId(config) {
  const keyed = {};
  console.log(config);
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
