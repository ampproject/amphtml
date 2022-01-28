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
let ShoppingConfigDef;

/** @type {!WeakMap<!Element, !Promise<!ShoppingConfigDef>>} */
const cache = new WeakMap();

/**
 * Gets Shopping config from an <amp-story-page> element.
 * It caches the result so that this can be used many times.
 * During the initial fetch, the config is: validated, keyed by 'product-tag-id',
 * and stored in service.
 * @param {!Element} pageElement <amp-story-page>
 * @return {!Promise<!ShoppingConfigDef>}
 */
export function getShoppingConfig(pageElement) {
  if (!cache.has(pageElement)) {
    cache.set(pageElement, getShoppingConfigUncached(pageElement));
  }
  return cache.get(pageElement);
}

/**
 * @param {!Element} pageElement <amp-story-page>
 * @return {!Promise<!Object<string, ShoppingConfigDataDef>>}
 */
function getShoppingConfigUncached(pageElement) {
  const element = pageElement.querySelector('amp-story-shopping-config');
  return getElementConfig(element).then((config) => {
    //TODO(#36412): Add call to validate config here.
    const keyed = keyByProductTagId(config);
    return storeShoppingConfig(element, keyed);
  });
}

/**
 * @param {!ShoppingConfigDef} config
 * @return {!Object<string, ShoppingConfigDataDef>}
 */
function keyByProductTagId(config) {
  const keyed = {};
  for (const item of config['items']) {
    keyed[item['productId']] = item;
  }
  return keyed;
}

/**
 * @param {!Element} element
 * @param {!Object<string, ShoppingConfigDataDef>} config
 * @return {!Promise<!ShoppingConfigDef>}
 */
function storeShoppingConfig(element, config) {
  const storeService = Services.storyStoreServiceForOrNull(element);
  return storeService.then((storeService) => {
    storeService?.dispatch(Action.ADD_SHOPPING_DATA, config);
    return config;
  });
}
