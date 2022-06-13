import {toggleAttribute} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';
import {
  childElementByTag,
  closestAncestorElementBySelector,
} from '#core/dom/query';

import {Services} from '#service';

import {HistoryState, setHistoryState} from 'extensions/amp-story/1.0/history';

import {formatI18nNumber, loadFonts} from './amp-story-shopping';

import {CSS as shoppingSharedCSS} from '../../../build/amp-story-shopping-shared-0.1.css';
import {CSS as shoppingTagCSS} from '../../../build/amp-story-shopping-tag-0.1.css';
import {
  Action,
  ShoppingConfigDataDef,
  ShoppingDataDef,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';
import {StoryAnalyticsEvent} from '../../amp-story/1.0/story-analytics';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {AnalyticsVariable} from '../../amp-story/1.0/variable-service';

/** @const {!Array<!Object>} fontFaces */
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

    /** @private @const {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win);

    /** @private @const {!../../../src/service/localization.LocalizationService} */
    this.localizationService_ = Services.localizationForDoc(this.element);

    /** @private {boolean} element */
    this.hasAppendedInnerShoppingTagEl_ = false;

    /** @private {!ShoppingConfigDataDef} tagData */
    this.tagData_ = null;

    /** @private {?AmpElement} element */
    this.shoppingAttachment_ = null;

    /** @private {!AmpElement} element */
    this.shoppingTagEl_ = null;
    /** @private {?Element} */
    this.pageEl_ = null;

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.analyticsService_ = Services.storyAnalyticsService(this.win);

    /** @private @const {!./story-analytics.StoryAnalyticsService} */
    this.variableService_ = Services.storyVariableService(this.win);
  }

  /** @override */
  buildCallback() {
    this.pageEl_ = closestAncestorElementBySelector(
      this.element,
      'amp-story-page'
    );

    /* This is used to prevent the shopping tag component from building if there is no shopping attachment. */
    this.shoppingAttachment_ = childElementByTag(
      this.pageEl_,
      'amp-story-shopping-attachment'
    );

    if (!this.shoppingAttachment_) {
      return;
    }

    this.element.setAttribute('role', 'button');
  }

  /** @override */
  layoutCallback() {
    if (!this.shoppingAttachment_) {
      return;
    }
    loadFonts(this.win, FONTS_TO_LOAD);
    this.storeService_.subscribe(
      StateProperty.SHOPPING_DATA,
      (shoppingData) =>
        this.maybeCreateAndAppendInnerShoppingTagEl_(shoppingData),
      true /** callToInitialize */
    );
  }

  /**
   * Toggling the active attribute to make the animations play on the active page.
   * @param {string} currentPageId
   * @private
   */
  toggleShoppingTagActive_(currentPageId) {
    const isActive = currentPageId === this.pageEl_.id;
    this.mutateElement(() =>
      toggleAttribute(this.shoppingTagEl_, 'active', isActive)
    );
  }

  /**
   * Helper function to check if the shopping tag should flip if it's too far to the right.
   * We only check the right hand side, as resizing only expands the border to the right.
   * @param {!Object} pageSize
   * @private
   */
  flipTagIfOffscreen_(pageSize) {
    const storyPageWidth = pageSize.width;

    let shouldFlip;

    this.measureMutateElement(
      () => {
        /*
         * We are using offsetLeft and offsetWidth instead of getLayoutBox() because
         * the correct measurements are not taken into account when using a CSS transform (such as translate),
         * which we are using in the i-amphtml-amp-story-shopping-tag-inner-flipped class.
         */
        const {offsetLeft, offsetWidth} = this.element;
        shouldFlip = offsetLeft + offsetWidth > storyPageWidth;
      },
      () => {
        this.shoppingTagEl_.classList.toggle(
          'i-amphtml-amp-story-shopping-tag-inner-flipped',
          shouldFlip
        );

        this.shoppingTagEl_.classList.toggle(
          'i-amphtml-amp-story-shopping-tag-visible',
          true
        );
      }
    );
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

    setHistoryState(this.win, HistoryState.SHOPPING_DATA, this.tagData_);

    this.variableService_.onVariableUpdate(
      AnalyticsVariable.STORY_SHOPPING_PRODUCT_ID,
      this.tagData_.productId
    );

    this.analyticsService_.triggerEvent(StoryAnalyticsEvent.SHOPPING_TAG_CLICK);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout_Enum.CONTAINER;
  }

  /**
   * @return {!Element}
   * @private
   */
  renderShoppingTagTemplate_() {
    return (
      <button
        class="i-amphtml-amp-story-shopping-button-reset i-amphtml-amp-story-shopping-tag-inner"
        role="button"
        onClick={() => this.onClick_()}
      >
        <span class="i-amphtml-amp-story-shopping-tag-dot"></span>
        <span class="i-amphtml-amp-story-shopping-tag-pill">
          <span
            class="i-amphtml-amp-story-shopping-tag-pill-image"
            style={
              this.tagData_['productIcon'] && {
                backgroundImage:
                  'url(' + this.tagData_['productIcon'] + ') !important',
                backgroundSize: 'cover !important',
              }
            }
          ></span>
          <span class="i-amphtml-amp-story-shopping-tag-pill-text">
            {(this.tagData_['productTagText'] && (
              <span class="i-amphtml-amp-story-shopping-product-tag-text">
                {this.tagData_['productTagText']}
              </span>
            )) ||
              formatI18nNumber(
                this.localizationService_,
                this.element,
                this.tagData_['productPriceCurrency'],
                this.tagData_['productPrice']
              )}
          </span>
        </span>
      </button>
    );
  }

  /**
   * Initialize listeners (data, orientation, visibility) for the shopping tag on creation.
   * @private
   */
  initializeTagStateListeners_() {
    this.storeService_.subscribe(
      StateProperty.RTL_STATE,
      (rtlState) => this.onRtlStateUpdate_(rtlState),
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.PAGE_SIZE,
      (pageSizeState) => this.flipTagIfOffscreen_(pageSizeState),
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (id) => this.toggleShoppingTagActive_(id),
      true /** callToInitialize */
    );
  }

  /**
   * @param {!ShoppingDataDef} shoppingData
   * @private
   */
  maybeCreateAndAppendInnerShoppingTagEl_(shoppingData) {
    const pageElement = closestAncestorElementBySelector(
      this.element,
      'amp-story-page'
    );
    this.tagData_ =
      shoppingData[pageElement.id]?.[
        this.element.getAttribute('data-product-id')
      ];
    if (this.hasAppendedInnerShoppingTagEl_ || !this.tagData_) {
      return;
    }
    this.shoppingTagEl_ = this.renderShoppingTagTemplate_();
    createShadowRootWithStyle(
      this.element,
      this.shoppingTagEl_,
      shoppingSharedCSS + shoppingTagCSS
    );
    this.hasAppendedInnerShoppingTagEl_ = true;
    this.initializeTagStateListeners_();
  }
}
