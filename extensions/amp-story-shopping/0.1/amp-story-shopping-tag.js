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
export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private @const {?../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?../../../src/service/localization.LocalizationService} */
    this.localizationService_ = null;

    /** @param {boolean} element */
    this.hasAppendedInnerShoppingTagEl_ = false;

    /** @param {!ShoppingConfigDataDef} tagData */
    this.tagData_ = null;
  }

  /** @override */
  buildCallback() {
    this.loadFonts_();
    this.element.setAttribute('role', 'button');

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
      StateProperty.SHOPPING_DATA,
      (shoppingData) => this.createAndAppendInnerShoppingTagEl_(shoppingData),
      true /** callToInitialize */
    );

    this.storeService_.subscribe(StateProperty.RTL_STATE, (rtlState) => {
      this.onRtlStateUpdate_(rtlState);
    });
  }

  /**
   * Reacts to RTL state updates and triggers the UI for RTL.
   * @param {boolean} rtlState
   * @private
   */
  onRtlStateUpdate_(rtlState) {
    this.mutateElement(() => {
      rtlState
        ? this.shoppingTagEl_.setAttribute('dir', 'rtl')
        : this.shoppingTagEl_.removeAttribute('dir');
    });
  }

  /**
   * @private
   */
  onClick_() {
    this.storeService_.dispatch(Action.ADD_SHOPPING_DATA, {
      'activeProductData': this.tagData_,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @return {!Element}
   */
  renderShoppingTagTemplate_() {
    return (
      <div
        class="amp-story-shopping-tag-inner"
        role="button"
        onClick={() => this.onClick_()}
      >
        <span class="amp-story-shopping-tag-dot"></span>
        <span class="amp-story-shopping-tag-pill">
          <span
            class="amp-story-shopping-tag-pill-image"
            style={
              this.tagData_['product-icon'] && {
                backgroundImage:
                  'url(' + this.tagData_['product-icon'] + ') !important',
                backgroundSize: 'cover !important',
              }
            }
          ></span>
          <span class="amp-story-shopping-tag-pill-text">
            {(this.tagData_['product-tag-text'] && (
              <span class="amp-story-shopping-product-tag-text">
                {this.tagData_['product-tag-text']}
              </span>
            )) ||
              new Intl.NumberFormat(
                this.localizationService_.getLanguageCodesForElement(
                  this.element_
                )[0],
                {
                  style: 'currency',
                  currency: this.tagData_['product-price-currency'],
                }
              ).format(this.tagData_['product-price'])}
          </span>
        </span>
      </div>
    );
  }

  /**
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  createAndAppendInnerShoppingTagEl_(shoppingData) {
    this.tagData_ = shoppingData[this.element.getAttribute('data-tag-id')];
    if (this.hasAppendedInnerShoppingTagEl_ || !this.tagData_) {
      return;
    }

    this.shoppingTagEl_ = this.renderShoppingTagTemplate_();
    this.onRtlStateUpdate_(this.storeService_.get(StateProperty.RTL_STATE));
    this.mutateElement(() => {
      createShadowRootWithStyle(
        this.element,
        this.shoppingTagEl_,
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
