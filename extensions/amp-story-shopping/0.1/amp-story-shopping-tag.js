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
   * @param {string} textContent
   * @return {boolean}
   * @private
   */
  isRTLLanguage_(textContent) {
    const ltrChars =
        'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
        '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
      rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
      rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

    return rtlDirCheck.test(textContent);
  }

  /**
   * This function counts the number of lines in the shopping tag
   * and sets the styling properties dynamically based on the number of lines.
   * @private
   */
  styleTagText_() {
    if (this.element.shadowRoot) {
      const pillEl = this.element.shadowRoot.querySelector(
        '.amp-story-shopping-tag-pill'
      );

      const textEl = this.element.shadowRoot.querySelector(
        '.amp-story-shopping-tag-pill-text'
      );

      const fontSize = computedStyle(window, textEl).getPropertyValue(
        'font-size'
      );
      const ratioOfLineHeightToFontSize = 1.5;
      const lineHeight = Math.floor(fontSize * ratioOfLineHeightToFontSize);
      const height = textEl./*OK*/ clientHeight;
      const numLines = Math.ceil(height / lineHeight);

      if (numLines <= 1) {
        pillEl.classList.remove('amp-story-shopping-tag-pill-overflow');
      } else {
        pillEl.classList.add('amp-story-shopping-tag-pill-overflow');
      }

      if (
        this.isRTLLanguage_(textEl.textContent) &&
        !textEl.classList.contains('amp-story-shopping-tag-pill-text-rtl')
      ) {
        textEl.classList.add('amp-story-shopping-tag-pill-text-rtl');
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
        this.styleTagText_();
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
