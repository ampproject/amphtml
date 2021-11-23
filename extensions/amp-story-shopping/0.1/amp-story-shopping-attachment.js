import {Layout_Enum, applyFillContent} from '#core/dom/layout';
import {closest} from '#core/dom/query';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {dev} from '#utils/log';

import {AmpStoryPageAttachment} from 'extensions/amp-story/1.0/amp-story-page-attachment';

import {localize} from '../../amp-story/1.0/amp-story-localization-service';
import {
  ShoppingDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

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
  }

  /**
   * @private
   * @return {?Element} the parent amp-story-page
   */
  getPage_() {
    return closest(
      dev().assertElement(this.element),
      (el) => el.tagName.toLowerCase() === 'amp-story-page'
    );
  }

  /**
   * Updates the CTA based on the shopping data.
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  updateCtaText_(shoppingData) {
    const pageIdElem = this.getPage_();

    const shoppingTags = Array.from(
      pageIdElem.getElementsByTagName('amp-story-shopping-tag')
    ).filter((tag) => shoppingData[tag.getAttribute('data-tag-id')]);

    const ctaButton = pageIdElem
      .querySelector('.i-amphtml-story-page-open-attachment-host')
      ?.shadowRoot.querySelector('.i-amphtml-story-page-open-attachment');

    const i18nString =
      shoppingTags.length === 1
        ? localize(
            this.element,
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_SHOP_LABEL
          ) +
          ' ' +
          this.storeService_.get(StateProperty.SHOPPING_DATA)[
            shoppingTags[0].getAttribute('data-tag-id')
          ]['product-title']
        : localize(
            this.element,
            LocalizedStringId_Enum.AMP_STORY_SHOPPING_VIEW_ALL_PRODUCTS
          );

    if (!ctaButton) {
      this.element.setAttribute('data-cta-text', i18nString);
    } else {
      this.mutateElement(() => {
        ctaButton.setAttribute('aria-label', i18nString);
        ctaButton.querySelector(
          '.i-amphtml-story-page-attachment-label'
        ).textContent = i18nString;
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

    return Promise.resolve(Services.storyStoreServiceForOrNull(this.win)).then(
      (storeService) => {
        this.storeService_ = storeService;
        this.storeService_.subscribe(
          StateProperty.SHOPPING_DATA,
          (shoppingData) => {
            this.updateCtaText_(shoppingData);
          }
        );
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.NODISPLAY;
  }
}
