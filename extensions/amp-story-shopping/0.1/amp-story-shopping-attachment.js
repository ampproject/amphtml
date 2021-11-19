import {Layout_Enum, applyFillContent} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {AmpStoryPageAttachment} from 'extensions/amp-story/1.0/amp-story-page-attachment';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-shopping-attachment';

export class AmpStoryShoppingAttachment extends AmpStoryPageAttachment {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = TAG;

    /** @private {?Element} */
    this.container_ = null;

    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;
  }

  /**
   * Updates the CTA based on the shopping data.
   * @param {string} pageIndex
   * @param {string} pageId
   * @private
   */
  updateCta_(pageIndex, pageId) {
    const shoppingTag = this.element.ownerDocument
      .getElementById(pageId)
      .getElementsByTagName('amp-story-shopping-tag');
    const numShoppingTags = shoppingTag.length;

    const pageOutlink = document.getElementsByClassName(
      'i-amphtml-story-page-open-attachment-host'
    )[pageIndex].shadowRoot.children[1];

    if (numShoppingTags === 1) {
      this.mutateElement(() => {
        const productName = this.storeService_.get(StateProperty.SHOPPING_DATA)[
          shoppingTag[0].getAttribute('data-tag-id')
        ]['product-title'];

        const shopLocalizedString =
          this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PRODUCT_NAME
          );

        pageOutlink.setAttribute(
          'aria-label',
          shopLocalizedString + ' ' + productName
        );
        pageOutlink.children[1].textContent =
          shopLocalizedString + ' ' + productName;
      });
    } else {
      const viewAllProductsLocalizedString =
        this.localizationService_.getLocalizedString(
          LocalizedStringId_Enum.AMP_STORY_SHOPPING_VIEW_ALL_PRODUCTS
        );
      this.mutateElement(() => {
        pageOutlink.setAttribute('aria-label', viewAllProductsLocalizedString);
        pageOutlink.children[1].textContent = viewAllProductsLocalizedString;
      });
    }
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = this.myText_;
    this.element.appendChild(this.container_);
    applyFillContent(this.container_, /* replacedContent */ true);

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.localizationServiceForOrNull(this.element),
    ]).then(([storeService, localizationService]) => {
      this.storeService_ = storeService;
      this.localizationService_ = localizationService;
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, (pageId) => {
        const pageIndex = this.storeService_.get(
          StateProperty.CURRENT_PAGE_INDEX
        );
        this.updateCta_(pageIndex, pageId);
      });
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.NODISPLAY;
  }
}
