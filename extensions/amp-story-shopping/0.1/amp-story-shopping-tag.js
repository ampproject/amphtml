import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {CSS as shoppingTagCSS} from '../../../build/amp-story-shopping-tag-0.1.css';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {
  ShoppingConfigDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {Array<Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
const fontsToLoad = [
  {
    family: 'Poppins',
    weight: '400',
    style: 'normal',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '700',
    style: 'normal',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

const ShoppingTagTemplate = ({tagData}) => (
  <div class="amp-story-shopping-tag-inner">
    <span class="amp-story-shopping-tag-dot"></span>
    <span class="amp-story-shopping-tag-pill">
      <span class="amp-story-shopping-tag-pill-image"></span>
      <span class="amp-story-shopping-tag-pill-text">
        {tagData['product-price']}
      </span>
    </span>
  </div>
);

/**
 * @typedef {{
 *  items: !Map<string, !ShoppingConfigDataDef>,
 * }}
 */
let ShoppingDataDef;

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
      (shoppingData) => this.updateShoppingTag_(shoppingData),
      true /** callToInitialize */
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  updateShoppingTag_(shoppingData) {
    const tagData = shoppingData[this.element.getAttribute('data-tag-id')];
    if (!tagData) {
      return;
    }
    this.mutateElement(() => {
      createShadowRootWithStyle(
        this.element,
        <ShoppingTagTemplate tagData={tagData} />,
        shoppingTagCSS
      );
    });
  }

  /** @private */
  loadFonts_() {
    if (this.win.document.fonts && FontFace) {
      fontsToLoad.forEach(({family, src, weight, style}) =>
        new FontFace(family, src, {weight, style})
          .load()
          .then((font) => this.win.document.fonts.add(font))
      );
    }
  }
}
