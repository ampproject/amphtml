import {Layout_Enum} from '#core/dom/layout';

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

const attributeValidators = {
  'requiredAttributes': new Set([
    'productTagId',
    'brandLabel',
    'productTitle',
    'productPrice',
    'productImages',
    'productDetails',
    'productPriceCurrency',
    'reviewsPage',
  ]),
  'optionalAttributes': new Set([
    'productColor',
    'productSize',
    'productIcon',
    'productTagText',
  ]),
};

export class AmpStoryShoppingConfig extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private @const {!Object<Array<Function>>} */
    this.productValidationConfig_ = {
      /* Required Attrs */
      'productTagId': [this.validateStringLength_],
      'brandLabel': [this.validateStringLength_],
      'productTitle': [this.validateStringLength_],
      'productPrice': [this.validateStringLength_],
      'productImages': [this.validateURL_],
      'productDetails': [this.validateStringLength_],
      'reviewsPage': [this.validateURL_],
      'productPriceCurrency': [this.validateStringLength_],
      /* Optional Attrs */
      'productColor': [this.validateStringLength_],
      'productSize': [this.validateStringLength_],
      'productIcon': [this.validateURL_],
      'productTagText': [this.validateStringLength_],
    };
  }

  /**
   * Validates shopping config Attributes
   * @param {!ShoppingConfigDataDef} prouductAttrs
   * @param {?string} attribValidatorType
   * @private
   */
  validateAttributes_(
    prouductAttrs,
    attribValidatorType = 'requiredAttributes'
  ) {
    for (const attrib of attributeValidators[attribValidatorType]) {
      if (!prouductAttrs[attrib]) {
        console.log('missing attribute ' + attrib);
      }
    }
  }

  /**
   * Validates string length of shopping config attributes
   * @param {string} str
   * @param {?number} maxLen
   * @private
   */
  validateStringLength_(str, maxLen = 100) {
    if (str.length > maxLen) {
      console.log(
        str + ' length exceeds max length: ' + str.length + ' > ' + maxLen
      );
    }
  }

  /**
   * Validates url of shopping config attributes
   * @param {string} url
   * @private
   */
  validateURL_(url) {
    //TODO
  }

  /**
   * Validates shopping config.
   * @param {!ShoppingConfigDataDef} shoppingConfig
   * @private
   */
  validateConfig_(shoppingConfig) {
    for (const attr in shoppingConfig) {
      if (attr in this.productValidationConfig_) {
        /* Valid Attribute, run the function array check here */
        for (const validationFunction of this.productValidationConfig_[attr]) {
          validationFunction(shoppingConfig[attr]);
        }
      } else {
        console.log('invalid product attribute: ' + attr);
      }
      this.validateAttributes_(shoppingConfig);
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
