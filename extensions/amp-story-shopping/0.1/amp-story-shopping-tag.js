import {Layout, applyFillContent} from '#core/dom/layout';

import {Services} from '#service';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-shopping-tag';

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.element.textContent = this.myText_;
    applyFillContent(this.element, /* replacedContent */ true);
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        this.storeService_ = storeService;
        this.storeService_.subscribe(
          StateProperty.SHOPPING_STATE,
          (shoppingState) => this.updateShoppingTag_(shoppingState)
        );
      }),
    ]);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /**
   * @param {Object} shoppingState
   * @private
   */
  updateShoppingTag_(shoppingState) {
    const tagData = shoppingState[this.element.getAttribute('tag-data-id')];
    if (tagData != null) {
      this.element.textContent = tagData['product-title'];
    }
  }
}
