import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {CSS as shoppingTagCSS} from '../../../build/amp-story-shopping-tag-0.1.css';
import {
  Action,
  ShoppingConfigDataDef,
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

/**
 * @param {!ShoppingConfigDataDef} tagData
 * @param {function(!ShoppingConfigDataDef): undefined} onClick
 * @return {!Element}
 */
const renderShoppingTagTemplate = (tagData, onClick) => (
  <div
    class="amp-story-shopping-tag-inner"
    role="button"
    onClick={() => onClick(tagData)}
  >
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

    /** @param {boolean} element */
    this.hasAppendedInnerShoppingTagEl_ = false;
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

  /**
   * @param {!ShoppingConfigDataDef} tagData
   * @private
   */
  onClick_(tagData) {
    this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
      'activeProductData': tagData,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  createAndAppendInnerShoppingTagEl_(shoppingData) {
    const tagData = shoppingData[this.element.getAttribute('data-tag-id')];
    if (this.hasAppendedInnerShoppingTagEl_ || !tagData) {
      return;
    }
    this.mutateElement(() => {
      createShadowRootWithStyle(
        this.element,
        renderShoppingTagTemplate(tagData, (tagData) => this.onClick_(tagData)),
        shoppingTagCSS
      );
      this.hasAppendedInnerShoppingTagEl_ = true;
    });
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
