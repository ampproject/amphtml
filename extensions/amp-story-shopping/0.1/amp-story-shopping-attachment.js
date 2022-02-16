import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {formatI18nNumber, loadFonts} from './amp-story-shopping';
import {
  getShoppingConfig,
  storeShoppingConfig,
} from './amp-story-shopping-config';
import {getShoppingTagData} from './amp-story-shopping-tag';

import {
  Action,
  ShoppingConfigDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

const DRAGGABLE_DRAWER_TRANSITION_MS = 400;

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

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {!Map<string, Element>} */
    this.builtTemplates_ = {};
  }

  /** @override */
  buildCallback() {
    this.pageEl_ = this.element.closest('amp-story-page');
    this.shoppingTags_ = Array.from(
      this.pageEl_.querySelectorAll('amp-story-shopping-tag')
    );

    const pageElement = this.element.parentElement;
    getShoppingConfig(pageElement).then((config) =>
      storeShoppingConfig(pageElement, config)
    );

    this.attachmentEl_ = (
      <amp-story-page-attachment
        layout="nodisplay"
        theme={this.element.getAttribute('theme')}
      ></amp-story-page-attachment>
    );
    if (this.shoppingTags_.length === 0) {
      return;
    }

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
      this.attachmentEl_.appendChild(this.templateContainer_);
    });
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
      (isOpen) => this.checkClearActiveProductData_(isOpen),
      true /** callToInitialize */
    );
    this.storeService_.subscribe(
      StateProperty.SHOPPING_DATA,
      (shoppingData) => {
        if (this.isOnActivePage_()) {
          this.checkOpenAttachment_(shoppingData);
          this.updateTemplate_(shoppingData);
        }
      },
      true /** callToInitialize */
    );
  }

  /**
   * Active product data is cleared after the attachment closes so that content does not jump.
   * @param {boolean} isOpen
   * @private
   */
  checkClearActiveProductData_(isOpen) {
    if (!isOpen) {
      Services.timerFor(this.win).delay(
        () =>
          this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
            'activeProductData': null,
          }),
        DRAGGABLE_DRAWER_TRANSITION_MS
      );
    }
  }

  /**
   * If active data is set, open the attachment.
   * @param {!Array<!ShoppingConfigDataDef>} shoppingData
   * @private
   */
  checkOpenAttachment_(shoppingData) {
    if (shoppingData.activeProductData) {
      this.attachmentEl_.getImpl().then((impl) => impl.open());
    }
  }

  /**
   * Updates template based on shopping data.
   * @param {!Array<!ShoppingConfigDataDef>} shoppingData
   * @private
   */
  updateTemplate_(shoppingData) {
    const shoppingDataForPage = this.shoppingTags_.map((shoppingTag) =>
      getShoppingTagData(shoppingData, shoppingTag)
    );

    let productForPdp = shoppingData.activeProductData;
    // If no active product and only one product on page, use the one product for the PDP.
    if (!shoppingData.activeProductData && shoppingDataForPage.length === 1) {
      productForPdp = shoppingDataForPage[0];
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
      shoppingDataForPage
    );
    template.setAttribute('active', '');
    this.resetScroll_(template);

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
   * @param {!ShoppingConfigDataDef} activeProductData
   * @return {Element}
   * @private
   */
  renderPdpTemplate_(activeProductData) {
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
        <div class="i-amphtml-amp-story-shopping-plp-header">
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PLP_HEADER,
            this.element
          )}
        </div>
        <div class="i-amphtml-amp-story-shopping-plp-cards">
          {shoppingDataForPage.map((data) => (
            <div
              class="i-amphtml-amp-story-shopping-plp-card"
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
            </div>
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
