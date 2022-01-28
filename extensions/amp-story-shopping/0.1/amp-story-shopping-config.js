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
  if (value == null) {
    return [`${field} is required.`];
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
  if (str != null && str.length > maxLen) {
    return [
      'Length of ' +
        field +
        ' exceeds max length: ' +
        str.length +
        ' > ' +
        maxLen,
    ];
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
  if (number != null && isNaN(number)) {
    return ['Value for field ' + field + ' is not a number'];
  }
}

/**
 * Validates url of shopping config attributes
 * @param {?string} field
 * @param {?string} url
 * @private
 * @return {!Array<string>}
 */
function validateURL(field, url) {
  if (url == null) {
    /* Not a Required Attribute, return.*/
    return;
  }

  const urls = Array.isArray(url) ? url : [url];

  return urls.map((url) => {
    try {
      assertHttpsUrl(url, 'amp-story-shopping-config ' + field);
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
      'productTagId': [validateRequired, validateStringLength], // Required. String. Keys to amp-story-shopping-tag nodes.
      'brandLabel': [validateRequired, validateStringLength], // Required. String.
      'productTitle': [validateRequired, validateStringLength], // Required. String.
      'productPrice': [validateRequired, validateNumber], // Required. Number.
      'productImages': [validateRequired, validateURL], // Required. String or array of strings.
      'productDetails': [validateRequired, validateStringLength], // Required. String.
      'reviewsPage': [validateRequired, validateURL], // Required if reviews-data. Links to a page where reviews can be read.
      'productPriceCurrency': [validateRequired, validateStringLength], // Required. String. ISO 4217 currency code used to display the correct currency symbol.
      /* Optional Attrs */
      'productColor': [validateStringLength], // Optional. String.
      'productSize': [validateStringLength], // Optional. String.
      'productIcon': [validateURL], // Optional. Links to an image. Defaults to a shopping bag icon.
      'productTagText': [validateStringLength], // Optional. String.
      'reviewsData': [validateURL], // Optional. Links to review data.
      'ctaText': [validateNumber], // Optional. Number. Defaults to “Buy now”. Keys to a CTA text option for i18n.
      'shippingText': [validateNumber], // Optional. Number. Keys to a shipping text option for i18n. Shipping text will not be rendered if the string is omitted.
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
        const fns = this.productValidationConfig_[k];

        errors.push(
          ...fns.reduce((errors, fn) => {
            const localErrors = fn(k, value) || [];
            errors.push(...localErrors);
            return errors;
          }, [])
        );
        return errors;
      }, [])
      .filter(Boolean);

    for (const error of errors) {
      this.user().warn('ERROR', error);
    }
  }

  /**
   * Keys product data to product-ids and adds them to the store service.
   * @param {!ShoppingConfigDef} shoppingConfig
   * @private
   */
  addShoppingDataFromConfig_(shoppingConfig) {
    const productIDtoProduct = {};
    for (const item of shoppingConfig['items']) {
      this.validateConfig_(item);
      productIDtoProduct[item['productTagId']] = item;
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
