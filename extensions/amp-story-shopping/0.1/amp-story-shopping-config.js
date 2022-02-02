import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {getElementConfig} from 'extensions/amp-story/1.0/request-utils';

import {assertHttpsUrl} from '../../../src/url';
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

/**
 * Validates string length of shopping config attributes
 * @param {?string} field
 * @param {?string} value
 * @return {!Array<string>}
 * @private
 */
function validateRequired(field, value) {
  if (value === undefined) {
    return [`Field ${field} is required.`];
  }
}

/**
 * Validates string length of shopping config attributes
 * @param {?string} field
 * @param {?string} str
 * @param {?number} maxLen
 * @return {!Array<string>}
 * @private
 */
function validateStringLength(field, str, maxLen = 100) {
  if (str !== undefined && str.length > maxLen) {
    return [`Length of ${field} exceeds max length: ${str.length} > ${maxLen}`];
  }
}

/**
 * Validates number in shopping config attributes
 * @param {?string} field
 * @param {?number} number
 * @private
 * @return {!Array<string>}
 */
function validateNumber(field, number) {
  if (number !== undefined && isNaN(number)) {
    return [`Value for field ${field} is not a number`];
  }
}

/**
 * Validates url of shopping config attributes
 * @param {?string} field
 * @param {!Array<string>} url
 * @private
 * @return {!Array<string>}
 */
function validateURL(field, url) {
  if (url === undefined) {
    /* Not a Required Attribute, return.*/
    return;
  }

  const urls = Array.isArray(url) ? url : [url];

  return urls.map((url) => {
    try {
      assertHttpsUrl(url, `amp-story-shopping-config ${field}`);
    } catch (e) {
      return e.message;
    }
  });
}
export class AmpStoryShoppingConfig extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private @const {!Object<Array<Function>>} */
    this.productValidationConfig_ = {
      /* Required Attrs */
      'productId': [validateRequired, validateStringLength],
      'productTitle': [validateRequired, validateStringLength],
      'productPrice': [validateRequired, validateNumber],
      'productImages': [validateRequired, validateURL],
      'productPriceCurrency': [validateRequired, validateStringLength],
      /* Optional Attrs */
      'productColor': [validateStringLength],
      'productSize': [validateStringLength],
      'productIcon': [validateURL],
      'productTagText': [validateStringLength],
      'reviewsData': [validateURL],
      'ctaText': [validateNumber],
      'shippingText': [validateNumber],
    };
  }
  /**
   * Validates shopping config.
   * @param {!ShoppingConfigDataDef} shoppingConfig
   * @private
   */
  validateConfig_(shoppingConfig) {
    const errors = Object.keys(this.productValidationConfig_)
      .reduce((errors, k) => {
        const value = shoppingConfig[k];
        this.productValidationConfig_[k].forEach((fn) => {
          errors.push(...(fn(k, value) || []));
        });
        return errors;
      }, [])
      .filter(Boolean);
    for (const error of errors) {
      this.user().warn('ERROR', `amp-story-shopping-config: ${error}`);
    }
  }

  /**
   * Keys product data to productIds and adds them to the store service.
   * @param {!ShoppingConfigDef} shoppingConfig
   * @private
   */
  addShoppingDataFromConfig_(shoppingConfig) {
    const productIDtoProduct = {};
    for (const item of shoppingConfig['items']) {
      this.validateConfig_(item);
      productIDtoProduct[item['productId']] = item;
    }
    this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, productIDtoProduct);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      getElementConfig(this.element),
    ]).then(([storeService, storyConfig]) => {
      this.storeService_ = storeService;
      this.addShoppingDataFromConfig_(storyConfig);
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.NODISPLAY;
  }
}
