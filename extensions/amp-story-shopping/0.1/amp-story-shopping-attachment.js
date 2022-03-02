import {toggleAttribute} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {formatI18nNumber, loadFonts} from './amp-story-shopping';
import {
  getShoppingConfig,
  storeShoppingConfig,
} from './amp-story-shopping-config';

import {
  Action,
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

    /** @private {?Element} */
    this.pageEl_ = null;

    /** @private {?Array<!Element>} */
    this.shoppingTags_ = null;

    /** @private @const {!Element} */
    this.templateContainer_ = <div></div>;

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win);

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = Services.localizationForDoc(this.element);

    /** @private {!Map<string, Element>} */
    this.builtTemplates_ = {};
  }

  /** @override */
  buildCallback() {
    this.pageEl_ = this.element.closest('amp-story-page');
    this.shoppingTags_ = Array.from(
      this.pageEl_.querySelectorAll('amp-story-shopping-tag')
    );

    getShoppingConfig(this.element).then((config) =>
      storeShoppingConfig(this.pageEl_, config)
    );

    if (this.shoppingTags_.length === 0) {
      return;
    }

    this.attachmentEl_ = (
      <amp-story-page-attachment
        layout="nodisplay"
        theme={this.element.getAttribute('theme')}
        cta-text={this.localizationService_.getLocalizedString(
          LocalizedStringId_Enum.AMP_STORY_SHOPPING_CTA_LABEL
        )}
      >
        {this.templateContainer_}
      </amp-story-page-attachment>
    );
    this.element.appendChild(this.attachmentEl_);
  }

  /** @override */
  layoutCallback() {
    if (this.shoppingTags_.length === 0) {
      return;
    }
    loadFonts(this.win, FONTS_TO_LOAD);
    // Update template on attachment state update or shopping data update.
    this.storeService_.subscribe(
      StateProperty.PAGE_ATTACHMENT_STATE,
      (isOpen) => this.onAttachmentStateUpdate_(isOpen),
      true /** callToInitialize */
    );
    this.storeService_.subscribe(
      StateProperty.SHOPPING_DATA,
      (shoppingData) => this.onShoppingDataUpdate_(shoppingData),
      true /** callToInitialize */
    );
    // Listen to transiton end events on attachment to check to clear active data.
    this.attachmentEl_.addEventListener('transitionend', () =>
      this.clearActiveProductDataIfClosed_()
    );
  }

  /**
   * Triggers template update if opening without active product data.
   * This happens when the "Shop Now" CTA is clicked.
   * @param {boolean} isOpen
   * @private
   */
  onAttachmentStateUpdate_(isOpen) {
    if (!this.isOnActivePage_() || !isOpen) {
      return;
    }
    const shoppingData = this.storeService_.get(StateProperty.SHOPPING_DATA);
    if (!shoppingData.activeProductData) {
      this.updateTemplate_(shoppingData);
    }
  }

  /**
   * Handles template changes when there is activeProductData.
   * This happens when a product tag or PLP card is clicked.
   * @param {!Object<string, !ShoppingConfigDataDef>} shoppingData
   * @private
   */
  onShoppingDataUpdate_(shoppingData) {
    if (!shoppingData.activeProductData || !this.isOnActivePage_()) {
      return;
    }
    const isOpen = this.storeService_.get(StateProperty.PAGE_ATTACHMENT_STATE);
    if (isOpen) {
      // If open, update the template.
      // This happens when a product card is clicked in the PLP template.
      this.updateTemplate_(shoppingData);
    } else {
      // Otherwise, open the attachment and then update the template.
      // This happens when clicking a shopping tag.
      this.attachmentEl_.getImpl().then((impl) => {
        impl.open();
        this.updateTemplate_(shoppingData);
      });
    }
  }

  /**
   * Clear active product data after the attachment closes so that content does not jump.
   * @private
   */
  clearActiveProductDataIfClosed_() {
    const isOpen = this.storeService_.get(StateProperty.PAGE_ATTACHMENT_STATE);
    if (!isOpen) {
      this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
        'activeProductData': null,
      });
    }
  }

  /**
   * Updates template based on shopping data.
   * @param {!Object<string, !ShoppingConfigDataDef>} shoppingData
   * @private
   */
  updateTemplate_(shoppingData) {
    const productOnPageToConfig = shoppingData[this.pageEl_.id];
    const shoppingDataPerPage = Object.values(productOnPageToConfig);

    let productForPdp = shoppingData.activeProductData;
    // If no active product and only one product on page, use the one product for the PDP.
    if (!productForPdp && shoppingDataPerPage.length === 1) {
      productForPdp = shoppingDataPerPage[0];
    }

    // templateId string used to key already built templates.
    const templateId = productForPdp ? `pdp-${productForPdp.productId}` : 'plp';

    // Remove active attribute from already built templates.
    Object.values(this.builtTemplates_).forEach((template) =>
      template.removeAttribute('active')
    );

    const template = this.getTemplate_(
      templateId,
      productForPdp,
      shoppingDataPerPage
    );
    template.setAttribute('active', '');
    this.resetScroll_(template);

    // Ensure details text is closed, unless there is only one product on the page.
    const detailsContainer = template.querySelector(
      '.i-amphtml-amp-story-shopping-pdp-details'
    );
    if (detailsContainer) {
      const shouldOpen = shoppingDataPerPage.length === 1;
      this.toggleDetailsText_(detailsContainer, shouldOpen);
    }

    // If template has not been appended to the dom, append it and assign it to built templates.
    if (!template.isConnected) {
      this.builtTemplates_[templateId] = template;
      this.mutateElement(() => this.templateContainer_.appendChild(template));
    }
  }

  /**
   * Returns template if already built. If not built, returns a built template.
   * @param {string} templateId
   * @param {?ShoppingConfigDataDef} productForPdp
   * @param {!Array<!ShoppingConfigDataDef} shoppingDataForPage
   * @return {Element}
   * @private
   */
  getTemplate_(templateId, productForPdp, shoppingDataForPage) {
    const buildTemplate = () => (
      <div class="i-amphtml-amp-story-shopping">
        {/* If there is a product for the PDP, render PDP. */}
        {productForPdp && this.renderPdpTemplate_(productForPdp)}
        {/* If there is more than one product on the page, render PLP. */}
        {shoppingDataForPage.length > 1 &&
          this.renderPlpTemplate_(
            shoppingDataForPage.filter((item) => item !== productForPdp)
          )}
      </div>
    );

    return this.builtTemplates_[templateId] || buildTemplate();
  }

  /**
   * Centers carousel card image on click.
   * @param {!Element} carouselCard
   * @private
   */
  onPdpCarouselCardClick_(carouselCard) {
    carouselCard./*OK*/ scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  /**
   * On plp card click dispatch shopping data.
   * @param {!Array<!ShoppingConfigDataDef>} shoppingData
   * @private
   */
  onPlpCardClick_(shoppingData) {
    this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
      'activeProductData': shoppingData,
    });
  }

  /**
   * @param {!Element} template
   * @private
   */
  resetScroll_(template) {
    // If template contains carousel, reset carousel scroll.
    template
      .querySelector('.i-amphtml-amp-story-shopping-pdp-carousel')
      ?.scroll({
        left: 0,
      });
    // Smooth scroll drawer to top.
    this.element
      .querySelector('.i-amphtml-story-draggable-drawer-container')
      .scroll({
        top: 0,
        behavior: 'smooth',
      });
  }

  /**
   * Expands or collapses details text.
   * @param {!Element} detailsContainer
   * @param {boolean} shouldOpen
   * @private
   */
  toggleDetailsText_(detailsContainer, shouldOpen) {
    const detailsText = detailsContainer.querySelector(
      '.i-amphtml-amp-story-shopping-pdp-details-text'
    );
    this.mutateElement(() => {
      toggleAttribute(detailsContainer, 'active', shouldOpen);
      detailsText.setAttribute('aria-hidden', !shouldOpen);
    });
  }

  /**
   * @param {!ShoppingConfigDataDef} activeProductData
   * @return {Element}
   * @private
   */
  renderPdpTemplate_(activeProductData) {
    const onDetailsHeaderClick = (el) => {
      const detailsContainer = el.closest(
        '.i-amphtml-amp-story-shopping-pdp-details'
      );
      const shouldOpen = !detailsContainer.hasAttribute('active');
      this.toggleDetailsText_(detailsContainer, shouldOpen);
    };
    return (
      <div class="i-amphtml-amp-story-shopping-pdp">
        <div class="i-amphtml-amp-story-shopping-pdp-header">
          <span class="i-amphtml-amp-story-shopping-pdp-header-brand">
            {activeProductData.productBrand}
          </span>
          <div class="i-amphtml-amp-story-shopping-pdp-header-title-and-price">
            <span class="i-amphtml-amp-story-shopping-pdp-header-title">
              {activeProductData.productTitle}
            </span>
            <span class="i-amphtml-amp-story-shopping-pdp-header-price">
              {formatI18nNumber(
                this.localizationService_,
                this.element,
                activeProductData.productPriceCurrency,
                activeProductData.productPrice
              )}
            </span>
          </div>
          {activeProductData.aggregateRating && (
            <span class="i-amphtml-amp-story-shopping-pdp-reviews">
              {activeProductData.aggregateRating.ratingValue} (
              <a
                class="i-amphtml-amp-story-shopping-pdp-reviews-link"
                href={activeProductData.aggregateRating.reviewUrl}
                target="_top"
              >
                {activeProductData.aggregateRating.reviewCount + ' '}
                {this.localizationService_.getLocalizedString(
                  LocalizedStringId_Enum.AMP_STORY_SHOPPING_ATTACHMENT_REVIEWS_LABEL,
                  this.element
                )}
              </a>
              )
            </span>
          )}
          <a
            class="i-amphtml-amp-story-shopping-pdp-cta"
            href={activeProductData.productUrl}
            target="_top"
          >
            {this.localizationService_.getLocalizedString(
              LocalizedStringId_Enum.AMP_STORY_SHOPPING_ATTACHMENT_CTA_LABEL,
              this.element
            )}
          </a>
        </div>
        <div class="i-amphtml-amp-story-shopping-pdp-carousel">
          {activeProductData.productImages.map((image) => (
            <div
              class="i-amphtml-amp-story-shopping-pdp-carousel-card"
              role="img"
              aria-label={image.alt}
              style={`background-image: url("${image.url}")`}
              onClick={(e) => this.onPdpCarouselCardClick_(e.target)}
            ></div>
          ))}
        </div>
        {activeProductData.productDetails && (
          <div class="i-amphtml-amp-story-shopping-pdp-details">
            <button
              class="i-amphtml-amp-story-shopping-button-reset i-amphtml-amp-story-shopping-pdp-details-header"
              onClick={(e) => onDetailsHeaderClick(e.target)}
            >
              <span class="i-amphtml-amp-story-shopping-sub-section-header">
                {this.localizationService_.getLocalizedString(
                  LocalizedStringId_Enum.AMP_STORY_SHOPPING_ATTACHMENT_DETAILS,
                  this.element
                )}
              </span>
              <svg
                viewBox="0 0 10 6"
                class="i-amphtml-amp-story-shopping-pdp-details-header-arrow"
              >
                <path d="M.5,.5 L5,5.2 L9.5,.5" />
              </svg>
            </button>
            <span
              class="i-amphtml-amp-story-shopping-pdp-details-text"
              aria-hidden="true"
            >
              {activeProductData.productDetails
                // Replaces two newlines with 0 or more spaces between them with two newlines.
                .replace(/\n\s*\n/g, '\n\n')}
            </span>
          </div>
        )}
      </div>
    );
  }

  /**
   * @param {!Array<!ShoppingConfigDataDef>} shoppingDataForPage
   * @return {Element}
   * @private
   */
  renderPlpTemplate_(shoppingDataForPage) {
    return (
      <div class="i-amphtml-amp-story-shopping-plp">
        <div class="i-amphtml-amp-story-shopping-sub-section-header">
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PLP_HEADER,
            this.element
          )}
        </div>
        <div class="i-amphtml-amp-story-shopping-plp-cards">
          {shoppingDataForPage.map((data) => (
            <button
              class="i-amphtml-amp-story-shopping-button-reset i-amphtml-amp-story-shopping-plp-card"
              role="button"
              onClick={() => this.onPlpCardClick_(data)}
            >
              <div
                class="i-amphtml-amp-story-shopping-plp-card-image"
                style={{
                  backgroundImage: `url("${data['productImages'][0].url}")`,
                }}
              ></div>
              <div class="i-amphtml-amp-story-shopping-plp-card-brand">
                {data['productBrand']}
              </div>
              <div class="i-amphtml-amp-story-shopping-plp-card-title">
                {data['productTitle']}
              </div>
              <div class="i-amphtml-amp-story-shopping-plp-card-price">
                {formatI18nNumber(
                  this.localizationService_,
                  this.element,
                  data['productPriceCurrency'],
                  data['productPrice']
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /**
   * @return {boolean}
   * @private
   */
  isOnActivePage_() {
    return (
      this.pageEl_.id === this.storeService_.get(StateProperty.CURRENT_PAGE_ID)
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}
