import {Layout} from '#core/dom/layout';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {getRequestService} from '../../amp-story/1.0/amp-story-request-service';
import {Action} from '../../amp-story/1.0/amp-story-store-service';

export class AmpStoryShoppingConfig extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {?./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private @const {!./amp-story-request-service.AmpStoryRequestService} */
    this.requestService_ = getRequestService(this.win, element);
  }

  /**
   * Keys product data to product-ids and adds them to the store service.
   * @param {!JsonObject} storyConfig
   * @private
   */
  addShoppingStateFromConfig_(storyConfig) {
    const productIDtoProduct = {};

    for (const item of storyConfig['items']) {
      productIDtoProduct[item['product-tag-id']] = item;
    }

    this.storeService_.dispatch(Action.ADD_SHOPPING_STATE, productIDtoProduct);

    //TODO(#36412): Add call to validate config here.
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');

        this.storeService_ = storeService;
        this.requestService_
          .loadShareConfigImpl_(this.element)
          .then((storyConfig) => this.addShoppingStateFromConfig_(storyConfig));
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }
}
