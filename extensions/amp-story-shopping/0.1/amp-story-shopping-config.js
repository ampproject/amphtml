import {Layout_Enum, applyFillContent} from '#core/dom/layout';

import {Services} from '#service';

import {devAssert} from '#utils/log';

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

export class AmpStoryShoppingConfig extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {?./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = null;

    /** @private @const {?./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /**
   * Keys product data to product-ids and adds them to the store service.
   * @param {!ShoppingConfigDef} storyConfig
   * @private
   */
  addShoppingDataFromConfig_(storyConfig) {
    const productIDtoProduct = {};

    for (const item of storyConfig['items']) {
      productIDtoProduct[item['product-tag-id']] = item;
    }

    this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, productIDtoProduct);

    //TODO(#36412): Add call to validate config here.
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.storyRequestServiceForOrNull(this.win),
    ])
      .then(([storeService, requestService]) => {
        this.storeService_ = storeService;
        this.requestService_ = requestService;
        return this.requestService_.loadConfig(this.element);
      })
      .then((storyConfig) => this.addShoppingDataFromConfig_(storyConfig));
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.NODISPLAY;
  }
}
