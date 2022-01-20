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

    /** @private {?NodeList<!Element>} */
    this.shoppingTags_ = null;

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
    this.attachmentEl_ = (
      <amp-story-page-attachment
        layout="nodisplay"
        theme={this.element.getAttribute('theme')}
      ></amp-story-page-attachment>
    );
    this.element.appendChild(this.attachmentEl_);
    this.attachmentEl_.appendChild(this.plpContainer_);
    this.shoppingTags_ = this.element
      .closest('amp-story-page')
      .querySelectorAll('amp-story-shopping-tag');

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.localizationServiceForOrNull(this.element),
    ]).then(([storeService, localizationService]) => {
      this.storeService_ = storeService;
      this.localizationService_ = localizationService;
    });
  }

  /** @override */
  layoutCallback() {
    this.storeService_.subscribe(
      StateProperty.PAGE_ATTACHMENT_STATE,
      (isOpen) => {
        if (isOpen) {
          this.populatePlp_();
        }
      }
    );
  }

  /**
   * Fully opens the drawer from its current position.
   * @param {boolean=} shouldAnimate
   * @return {!Promise}
   */
  // open(shouldAnimate = true) {
  // console.log('opening');
  // this.populatePlp_();

  // return this.attachmentEl_
  //   .getImpl()
  //   .then((impl) => impl.open(shouldAnimate));
  // }

  /** @private */
  populatePlp_() {
    console.log('populate PLP');
    if (this.plpContainer_.querySelector('.amp-story-shopping-plp')) {
      return;
    }
    const shoppingData = this.storeService_.get(StateProperty.SHOPPING_DATA);
    const shoppingDataForPage = Array.from(this.shoppingTags_).map(
      (shoppingTag) => shoppingData[shoppingTag.getAttribute('data-tag-id')]
    );
    this.plpContainer_.appendChild(
      this.renderPlpTemplate_(shoppingDataForPage)
    );
  }

  /**
   * @param {!Array<!ShoppingConfigDataDef} shoppingDataForPage
   * @return {Element}
   * @private
   */
  renderPlpTemplate_(shoppingDataForPage) {
    return (
      <div class="amp-story-shopping-plp">
        <div class="amp-story-shopping-plp-header">
          {this.localizationService_.getLocalizedString(
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PLP_HEADER,
            this.element
          )}
        </div>
        <div class="amp-story-shopping-plp-cards">
          {shoppingDataForPage.map((data) => (
            <div class="amp-story-shopping-plp-card">
              <img
                class="amp-story-shopping-plp-card-image"
                src={data['product-images'][0]}
              ></img>
              <div class="amp-story-shopping-plp-card-brand">
                {data['product-brand']}
              </div>
              <div class="amp-story-shopping-plp-card-title">
                {data['product-title']}
              </div>
              <div class="amp-story-shopping-plp-card-price">
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
