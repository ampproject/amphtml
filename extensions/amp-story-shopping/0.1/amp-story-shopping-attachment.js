// update all example pages
// tests

import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {Services} from '#service';

import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

import {localize} from '../../amp-story/1.0/amp-story-localization-service';

import {formatI18nNumber} from './amp-story-shopping';

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

    const plpTemplate = this.renderPlpTemplate(shoppingDataForPage);

    this.templateWrapper_.replaceChildren(plpTemplate);

    return this.attachmentEl_
      .getImpl()
      .then((impl) => impl.open(shouldAnimate));
  }

  renderPlpTemplate(shoppingDataForPage) {
    return (
      <div class="amp-story-shopping-plp">
        <div class="amp-story-shopping-plp-header">
          {localize(
            this.element,
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_PLP_LABEL
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
