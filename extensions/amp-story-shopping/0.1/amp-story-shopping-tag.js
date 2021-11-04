import {Layout, applyFillContent} from '#core/dom/layout';

import {Services} from '#service';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-shopping-tag';

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = TAG;

    /** @private {?Element} */
    this.container_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.container_.id = this.element.id;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        this.storeService_ = storeService;
        this.storeService_.subscribe(
          StateProperty.SHOPPING_STATE,
          (shoppingState) => {
            this.onShoppingStateUpdate_(shoppingState);
          }
        );
      }),
    ]);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }

  /**
   * Reacts to shopping state updates.
   * @param {boolean} shoppingState
   * @private
   */
  onShoppingStateUpdate_(shoppingState) {
    this.updateShoppingTag_(shoppingState);
  }

  /**
   * @param {Object} shoppingState
   * @private
   */
  updateShoppingTag_(shoppingState) {
    if (shoppingState[this.container_.id] != null) {
      this.myText_ = shoppingState[this.container_.id]['product-title'];
      this.container_.textContent = this.myText_;
    }
  }
}
