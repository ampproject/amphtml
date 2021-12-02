import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {
  ShoppingConfigDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

/**
 * @typedef {{
 *  items: !Map<string, !ShoppingConfigDataDef>,
 * }}
 */
let ShoppingDataDef;

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?Element} */
    this.buttonEl_ = null;
  }

  /** @override */
  buildCallback() {
    this.buttonEl_ = (
      <button type="button" role="button" style="background: #fff;"></button>
    );
    this.element.appendChild(this.buttonEl_);
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        devAssert(storeService, 'Could not retrieve AmpStoryStoreService');
        this.storeService_ = storeService;
      }
    );
  }

  /** @override */
  layoutCallback() {
    this.initializeListeners_();
    this.storeService_.subscribe(
      StateProperty.SHOPPING_DATA,
      (shoppingData) => this.updateShoppingTag_(shoppingData),
      true /** callToInitialize */
    );
  }

  /**
   * @private
   */
  initializeListeners_() {
    console.log('initializelistener', this.buttonEl_);
    this.buttonEl_.addEventListener(
      'click',
      (event) => this.onShoppingTagClick_(event),
      true /** useCapture */
    );
  }

  /**
   * @param e
   * @private
   */
  onShoppingTagClick_(e) {
    console.log('e', e);
    console.log('shopping tag clicked1');
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  updateShoppingTag_(shoppingData) {
    const tagData = shoppingData[this.element.getAttribute('data-tag-id')];
    if (!tagData) {
      return;
    }
    this.mutateElement(() => {
      this.buttonEl_.textContent = tagData['product-title'];
    });
  }
}
