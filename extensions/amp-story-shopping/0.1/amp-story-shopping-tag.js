import {Layout} from '#core/dom/layout';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {?./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        this.storeService_ = storeService;
      }
    );
  }

  /** @override */
  layoutCallback() {
    this.storeService_.subscribe(
      StateProperty.SHOPPING_STATE,
      (shoppingState) => this.updateShoppingTag_(shoppingState),
      true /** callToInitialize */
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /**
   * @param {!Object} shoppingState
   * @private
   */
  updateShoppingTag_(shoppingState) {
    const tagData = shoppingState[this.element.getAttribute('data-tag-id')];
    if (tagData) {
      this.measureElement(() => {
        this.element.textContent = tagData['product-title'];
      });
    }
  }
}
