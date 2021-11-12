import {Layout} from '#core/dom/layout';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {Action} from '../../amp-story/1.0/amp-story-store-service';

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
   * @param {!JsonObject} storyConfig
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
      .then((services) => {
        this.storeService_ = services[0];
        this.requestService_ = services[1];

        devAssert(
          this.storeService_,
          'Could not retrieve AmpStoryStoreService'
        );
        devAssert(
          this.requestService_,
          'Could not retrieve AmpStoryRequestService'
        );

        return this.requestService_.loadConfig(this.element);
      })
      .then((storyConfig) => this.addShoppingDataFromConfig_(storyConfig));
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }
}
