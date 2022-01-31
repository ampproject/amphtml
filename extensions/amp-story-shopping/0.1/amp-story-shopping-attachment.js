import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {formatI18nNumber, loadFonts} from './amp-story-shopping';

import {
  ShoppingConfigDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Array<!Object>} fontFaces */
const FONTS_TO_LOAD = [
  {
    family: 'Poppins',
    weight: '500',
    src: "url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '600',
    src: "url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

export class AmpStoryShoppingAttachment extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.attachmentEl_ = null;

    /** @private {!Element} */
    this.pageEl_ = this.element.closest('amp-story-page');

    /** @private {!Array<!Element>} */
    this.shoppingTags_ = Array.from(
      this.pageEl_.querySelectorAll('amp-story-shopping-tag')
    );

    /** @private @const {!Element} */
    this.plpContainer_ = <div></div>;

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;
  }

  /** @override */
  buildCallback() {
    loadFonts(this.win, FONTS_TO_LOAD);

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.localizationServiceForOrNull(this.element),
    ]).then(([storeService, localizationService]) => {
      this.storeService_ = storeService;
      this.localizationService_ = localizationService;

      this.attachmentEl_ = (
        <amp-story-page-attachment
          layout="nodisplay"
          theme={this.element.getAttribute('theme')}
          cta-text={this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_CTA_LABEL
          )}
        ></amp-story-page-attachment>
      );
      this.element.appendChild(this.attachmentEl_);
      this.attachmentEl_.appendChild(this.plpContainer_);
    });
  }

  /** @override */
  layoutCallback() {
    this.storeService_.subscribe(
      StateProperty.PAGE_ATTACHMENT_STATE,
      (isOpen) => this.onPageAttachmentStateUpdate_(isOpen)
    );
  }

  /**
   * On attachment state update, check if on active page and populate plp.
   * @param {boolean} isOpen
   * @private
   */
  onPageAttachmentStateUpdate_(isOpen) {
    const isOnActivePage =
      this.pageEl_.id === this.storeService_.get(StateProperty.CURRENT_PAGE_ID);

    if (isOpen && isOnActivePage) {
      this.populatePlp_();
    }
  }

  /**
   * Renders a list of the products on the page, knows as a "Product Listing Page" or PLP.
   * @private
   */
  populatePlp_() {
    if (this.plpContainer_.querySelector('.i-amphtml-amp-story-shopping-plp')) {
      return;
    }
    const shoppingData = this.storeService_.get(StateProperty.SHOPPING_DATA);
    const shoppingDataForPage = this.shoppingTags_.map(
      (shoppingTag) => shoppingData[shoppingTag.getAttribute('data-product-id')]
    );

    const plp = this.renderPlpTemplate_(shoppingDataForPage);
    this.mutateElement(() => {
      this.plpContainer_.appendChild(plp);
    });
  }

  /**
   * @param {!Array<!ShoppingConfigDataDef} shoppingDataForPage
   * @return {Element}
   * @private
   */
  renderPlpTemplate_(shoppingDataForPage) {
    return (
      <div class="i-amphtml-amp-story-shopping-plp">
        <div class="i-amphtml-amp-story-shopping-plp-header">
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PLP_HEADER,
            this.element
          )}
        </div>
        <div class="i-amphtml-amp-story-shopping-plp-cards">
          {shoppingDataForPage.map((data) => (
            <div class="i-amphtml-amp-story-shopping-plp-card">
              <div
                class="i-amphtml-amp-story-shopping-plp-card-image"
                style={`background-image: url("${data['product-images'][0]}")`}
              ></div>
              <div class="i-amphtml-amp-story-shopping-plp-card-brand">
                {data['product-brand']}
              </div>
              <div class="i-amphtml-amp-story-shopping-plp-card-title">
                {data['product-title']}
              </div>
              <div class="i-amphtml-amp-story-shopping-plp-card-price">
                {formatI18nNumber(
                  this.localizationService_,
                  this.element,
                  data['product-price-currency'],
                  data['product-price']
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}
