import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

import {CSS as shoppingTagCSS} from '../../../build/amp-story-shopping-tag-0.1.css';
import {
  ShoppingDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';

/** @const {!Array<!Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
const FONTS_TO_LOAD = [
  {
    family: 'Poppins',
    weight: '400',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '700',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

const renderShoppingTagTemplate = (tagData) => (
  <div class="amp-story-shopping-tag-inner">
    <span class="amp-story-shopping-tag-dot"></span>
    <span class="amp-story-shopping-tag-pill">
      <span
        class="amp-story-shopping-tag-pill-image"
        style={
          tagData['product-icon'] && {
            backgroundImage: 'url(' + tagData['product-icon'] + ') !important',
            backgroundSize: 'cover !important',
          }
        }
      ></span>
      <span class="amp-story-shopping-tag-pill-text">
        {tagData['product-tag-text'] || '$' + tagData['product-price']}
      </span>
    </span>
  </div>
);

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    this.loadFonts_();
    this.element.setAttribute('role', 'button');
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => (this.storeService_ = storeService)
    );
  }

  /** @override */
  layoutCallback() {
    this.storeService_.subscribe(
      StateProperty.SHOPPING_DATA,
      (shoppingData) => this.createAndAppendInnerShoppingTagEl_(shoppingData),
      true /** callToInitialize */
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * This function counts the number of lines in the shopping tag
   * and sets the styling properties dynamically based on the number of lines.
   * @private
   */
  countLinesAndResize_() {
    if (this.element.shadowRoot) {
      const pillEl = this.element.shadowRoot.querySelector(
        '.amp-story-shopping-tag-pill'
      );

      const textEl = this.element.shadowRoot.querySelector(
        '.amp-story-shopping-tag-pill-text'
      );

      const tagTextStyle = computedStyle(window, textEl).getPropertyValue(
        'font-size'
      );

      const fontSize = parseFloat(tagTextStyle);
      const lineHeight = Math.floor(fontSize * 1.5);
      const height = textEl./*OK*/ clientHeight;
      const numLines = Math.ceil(height / lineHeight);

      if (numLines == 1) {
        if (pillEl.classList.contains('amp-story-shopping-tag-pill-overflow')) {
          pillEl.classList.remove('amp-story-shopping-tag-pill-overflow');
        }
      } else {
        if (
          !pillEl.classList.contains('amp-story-shopping-tag-pill-overflow')
        ) {
          pillEl.classList.add('amp-story-shopping-tag-pill-overflow');
        }
      }
    }
  }

  /**
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  createAndAppendInnerShoppingTagEl_(shoppingData) {
    const tagData = shoppingData[this.element.getAttribute('data-tag-id')];

    if (!tagData) {
      return;
    }
    this.measureMutateElement(
      () => {
        createShadowRootWithStyle(
          this.element,
          renderShoppingTagTemplate(tagData),
          shoppingTagCSS
        );
      },
      () => {
        this.countLinesAndResize_();
      }
    );
  }

  /** @private */
  loadFonts_() {
    if (this.win.document.fonts && FontFace) {
      FONTS_TO_LOAD.forEach(({family, src, style = 'normal', weight}) =>
        new FontFace(family, src, {weight, style})
          .load()
          .then((font) => this.win.document.fonts.add(font))
      );
    }
  }
}
