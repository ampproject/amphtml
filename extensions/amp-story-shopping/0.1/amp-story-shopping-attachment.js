// update all example pages
// tests

import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {formatI18nNumber, loadFonts} from './amp-story-shopping';

import {localize} from '../../amp-story/1.0/amp-story-localization-service';
import {
  ShoppingConfigDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {!Array<!Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
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

    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @private {?Element} */
    this.templateWrapper_ = null;

    this.shoppingTags_ = this.element
      .closest('amp-story-page')
      .querySelectorAll('amp-story-shopping-tag');
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
    this.templateWrapper_ = this.attachmentEl_.appendChild(<div></div>);

    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win),
      Services.localizationServiceForOrNull(this.element),
    ]).then(([storeService, localizationService]) => {
      this.storeService_ = storeService;
      this.localizationService_ = localizationService;
    });
  }

  /**
   * Fully opens the drawer from its current position.
   * @param {boolean=} shouldAnimate
   * @return {!Promise}
   */
  open(shouldAnimate = true) {
    const shoppingData = this.storeService_.get(StateProperty.SHOPPING_DATA);

    const shoppingDataForPage = Array.from(this.shoppingTags_).map(
      (shoppingTag) => shoppingData[shoppingTag.getAttribute('data-tag-id')]
    );

    const plpTemplate = this.renderPlpTemplate_(shoppingDataForPage);

    this.templateWrapper_.replaceChildren(plpTemplate);

    return this.attachmentEl_
      .getImpl()
      .then((impl) => impl.open(shouldAnimate));
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
          {localize(
            this.element,
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PLP_HEADER
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
