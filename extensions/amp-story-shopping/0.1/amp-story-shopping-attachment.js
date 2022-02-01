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
  ShoppingConfigDataDef,
  StateProperty,
  Action,
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

    /** @private {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;
  }

  /** @override */
  buildCallback() {
    this.pageEl_ = this.element.closest('amp-story-page');
    this.shoppingTags_ = Array.from(
      this.pageEl_.querySelectorAll('amp-story-shopping-tag')
    );
    loadFonts(this.win, FONTS_TO_LOAD);

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
      this.attachmentEl_.appendChild(this.templateContainer_);
    });
  }

  /** @override */
  layoutCallback() {
    if (this.shoppingTags_.length === 0) {
      return;
    }
    this.storeService_.subscribe(
      StateProperty.PAGE_ATTACHMENT_STATE,
      (isOpen) => {
        const shoppingData = this.storeService_.get(
          StateProperty.SHOPPING_DATA
        );
        this.checkClearActiveProductData_(isOpen, shoppingData);
        this.updateTemplate_(isOpen, shoppingData);
      }
    );
    this.storeService_.subscribe(
      StateProperty.SHOPPING_DATA,
      (shoppingData) => {
        const isOpen = this.storeService_.get(
          StateProperty.PAGE_ATTACHMENT_STATE
        );
        this.updateTemplate_(isOpen, shoppingData);
      }
    );
  }

  /**
   * @param {boolean} isOpen
   * @param {!Array<!ShoppingConfigDataDef>} shoppingData
   * @private
   */
  checkClearActiveProductData_(isOpen, shoppingData) {
    const {activeProductData} = shoppingData;
    if (activeProductData && !isOpen && this.isOnActivePage_()) {
      this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
        'activeProductData': null,
      });
    }
  }

  /**
   * @param {boolean} isOpen
   * @param {!Array<!ShoppingConfigDataDef>} shoppingData
   * @private
   */
  updateTemplate_(isOpen, shoppingData) {
    if (!isOpen && !this.isOnActivePage_()) {
      return;
    }
    const {activeProductData} = shoppingData;
    const shoppingDataForPage = this.shoppingTags_.map(
      (shoppingTag) => shoppingData[shoppingTag.getAttribute('data-product-id')]
    );

    if (activeProductData) {
      const pdp = this.renderPdpTemplate_(
        activeProductData,
        shoppingDataForPage
      );
      this.mutateElement(() => this.templateContainer_.replaceChildren(pdp));
    } else {
      const plp = this.renderPlpTemplate_(shoppingDataForPage);
      this.mutateElement(() => this.templateContainer_.replaceChildren(plp));
    }
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

  /**
   * @param {!Array<!ShoppingConfigDataDef>} shoppingData
   * @private
   */
  onClick_(shoppingData) {
    this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
      'activeProductData': shoppingData,
    });
  }

  /**
   * @param {!ShoppingConfigDataDef} activeProductData
   * @param {!Array<!ShoppingConfigDataDef>} shoppingDataForPage
   * @return {Element}
   * @private
   */
  renderPdpTemplate_(activeProductData, shoppingDataForPage) {
    return (
      <div>
        <div class="i-amphtml-amp-story-shopping-pdp-header">
          <div>
            <span class="i-amphtml-amp-story-shopping-pdp-header-brand">
              {activeProductData.productBrand}
            </span>
            <span class="i-amphtml-amp-story-shopping-pdp-header-title">
              {activeProductData.productTitle}
            </span>
          </div>
          <span class="i-amphtml-amp-story-shopping-pdp-header-price">
            {formatI18nNumber(
              this.localizationService_,
              this.element,
              activeProductData.productPriceCurrency,
              activeProductData.productPrice
            )}
          </span>
        </div>
        <div>
          {this.renderPlpTemplate_(
            shoppingDataForPage.filter((item) => item !== activeProductData)
          )}
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
              onClick={() => this.onClick_(data)}
            >
              <div
                class="i-amphtml-amp-story-shopping-plp-card-image"
                style={{backgroundImage: `url("${data['productImages'][0]}")`}}
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

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}
