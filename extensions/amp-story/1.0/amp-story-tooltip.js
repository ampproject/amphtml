/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Action,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-tooltip-1.0.css';
import {EventType, dispatch} from './events';
import {Services} from '../../../src/services';
import {addAttributesToElement, closest} from '../../../src/dom';
import {createShadowRootWithStyle, getSourceOriginForElement} from './utils';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {isProtocolValid, parseUrlDeprecated} from '../../../src/url';
import {setImportantStyles} from '../../../src/style';

/**
 * List of selectors that can trigger a tooltip.
 * @const {!Array<string>}
 */
export const TOOLTIP_TRIGGERABLE_SELECTORS = ['a[href]'];

/**
 * Minimum vertical space needed to position tooltip.
 * @const {number}
 */
const MIN_VERTICAL_SPACE = 56;

/**
 * Padding between tooltip and edges of screen.
 * @const {number}
 */
const EDGE_PADDING = 8;

/**
 * Blank icon when no data-tooltip-icon src is specified.
 * @const {string}
 */
const DEFAULT_ICON_SRC =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

/**
 * @struct @typedef {{
 *   tooltip: !Element,
 *   buttonLeft: !Element,
 *   buttonRight: !Element,
 *   arrow: !Element,
 * }}
 */
let tooltipElementsDef;

const TAG = 'amp-story-tooltip';

/**
 * Tooltip element triggered by clickable elements in the amp-story-grid-layer.
 */
export class AmpStoryTooltip {
  /**
   * @param {!Window} win
   * @param {!Element} storyEl
   */
  constructor(win, storyEl) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.storyEl_ = storyEl;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private {?Element} */
    this.shadowRoot_ = null;

    /** @private {?Element} */
    this.tooltipOverlayEl_ = null;

    /** @private {?Element} */
    this.tooltip_ = null;

    /** @private {?Element} */
    this.tooltipArrow_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(getAmpdoc(this.win_.document));

    /**
     * Clicked element producing the tooltip. Used to avoid building the same
     * element twice.
     * @private {?Element} */
    this.clickedEl_ = null;

    this.storeService_.subscribe(StateProperty.TOOLTIP_ELEMENT, el => {
      this.onTooltipStateUpdate_(el);
    });
  }

  /**
   * Builds the tooltip overlay and appends it to the provided story.
   * @private
   */
  build_() {
    this.isBuilt_ = true;

    this.shadowRoot_ = this.win_.document.createElement('div');

    this.tooltipOverlayEl_ =
      dev().assert(this.buildTemplate_(this.win_.document));
    createShadowRootWithStyle(this.shadowRoot_, this.tooltipOverlayEl_, CSS);

    this.tooltipOverlayEl_
        .addEventListener('click', event => this.onOutsideTooltipClick_(event));

    this.storeService_.subscribe(StateProperty.UI_STATE, isDesktop => {
      this.onUIStateUpdate_(isDesktop);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, () => {
      // Hide active tooltip when page switch is triggered by keyboard or
      // desktop buttons.
      if (this.storeService_.get(StateProperty.TOOLTIP_ELEMENT)) {
        this.closeTooltip_();
      }
    });

    return this.shadowRoot_;
  }

  /**
   * Hides the tooltip layer.
   * @private
   */
  closeTooltip_() {
    this.storeService_.dispatch(Action.TOGGLE_TOOLTIP, null);
  }

  /**
   * Reacts to store updates related to tooltip active status.
   * @param {!Element} clickedEl
   * @private
   */
  onTooltipStateUpdate_(clickedEl) {
    if (!clickedEl) {
      this.resources_.mutateElement(dev().assertElement(this.tooltipOverlayEl_),
          () => {
            this.tooltipOverlayEl_
                .classList.toggle('i-amphtml-hidden', true);
          });
      return;
    }

    if (!this.isBuilt_) {
      this.storyEl_.appendChild(this.build_());
    }

    if (clickedEl != this.clickedEl_) {
      this.clickedEl_ = clickedEl;
      this.attachTooltipToEl_(clickedEl);
    }

    this.resources_.mutateElement(dev().assertElement(this.tooltipOverlayEl_),
        () => {
          this.tooltipOverlayEl_
              .classList.toggle('i-amphtml-hidden', false);
        });
  }

  /**
   * Reacts to desktop state updates and hides navigation buttons since we
   * already have in the desktop UI.
   * @param {!UIType} uiState
   * @private
   */
  onUIStateUpdate_(uiState) {
    this.resources_.mutateElement(dev().assertElement(this.tooltipOverlayEl_),
        () => {
          [UIType.DESKTOP_FULLBLEED, UIType.DESKTOP_PANELS].includes(uiState) ?
            this.tooltipOverlayEl_.setAttribute('desktop', '') :
            this.tooltipOverlayEl_.removeAttribute('desktop');
        });
  }

  /**
   * Builds tooltip and attaches it depending on the clicked element content and
   * position.
   * @param {!Element} clickedEl
   * @private
   */
  attachTooltipToEl_(clickedEl) {
    const elUrl = clickedEl.getAttribute('href');
    if (!isProtocolValid(elUrl)) {
      user().error(TAG, 'The tooltip url is invalid');
      return;
    }

    const iconUrl = clickedEl.getAttribute('data-tooltip-icon');
    if (!isProtocolValid(iconUrl)) {
      user().error(TAG, 'The tooltip icon url is invalid');
      return;
    }

    const {href} = parseUrlDeprecated(elUrl);

    const tooltipText = clickedEl.getAttribute('data-tooltip-text') ||
      getSourceOriginForElement(clickedEl, href);
    this.updateTooltipText_(tooltipText);

    const iconSrc = iconUrl ? parseUrlDeprecated(iconUrl).href :
      DEFAULT_ICON_SRC;
    this.updateTooltipIcon_(iconSrc);

    addAttributesToElement(dev().assertElement(this.tooltip_),
        dict({'href': href}));

    this.positionTooltip_(clickedEl);
  }

  /**
   * Updates tooltip text content.
   * @param {string} tooltipText
   * @private
   */
  updateTooltipText_(tooltipText) {
    const existingTooltipText =
      this.tooltip_.querySelector('.i-amphtml-tooltip-text');

    existingTooltipText.textContent = tooltipText;
  }

  /**
   * Updates tooltip icon. If no icon src is declared, it sets a default src and
   * hides it.
   * @param {string} iconSrc
   * @private
   */
  updateTooltipIcon_(iconSrc) {
    const existingTooltipIcon =
      this.tooltip_.querySelector('.i-amphtml-story-tooltip-icon');

    if (existingTooltipIcon.firstElementChild) {
      addAttributesToElement(existingTooltipIcon.firstElementChild,
          dict({'src': iconSrc}));
    }

    existingTooltipIcon.classList.toggle('i-amphtml-hidden',
        iconSrc == DEFAULT_ICON_SRC);
  }

  /**
   * Positions tooltip and its pointing arrow according to the position of the
   * clicked element.
   * @param {!Element} clickedEl
   * @private
   */
  positionTooltip_(clickedEl) {
    const state = {arrowOnTop: false};

    this.resources_.measureMutateElement(this.storyEl_,
        /** measure */
        () => {
          const storyPage =
              this.storyEl_.querySelector('amp-story-page[active]');
          const clickedElRect = clickedEl./*OK*/getBoundingClientRect();
          const pageRect = storyPage./*OK*/getBoundingClientRect();

          this.verticalPositioning_(clickedElRect, pageRect, state);
          this.horizontalPositioning_(clickedElRect, pageRect, state);
        },
        /** mutate */
        () => {
          // Arrow on top or bottom of tooltip.
          this.tooltip_.classList.toggle('i-amphtml-tooltip-arrow-on-top',
              state.arrowOnTop);

          setImportantStyles(dev().assertElement(this.tooltipArrow_),
              {left: `${state.arrowLeftOffset}px`});
          setImportantStyles(dev().assertElement(this.tooltip_),
              {top: `${state.tooltipTop}px`, left: `${state.tooltipLeft}px`});
        });
  }

  /**
   * In charge of deciding where to position the tooltip depending on the
   * clicked element's position and size, and available space in the page. Also
   * places the tooltip's arrow on top when the tooltip is below an element.
   * @param {!ClientRect} clickedElRect
   * @param {!ClientRect} pageRect
   * @param {!Object} state
   */
  verticalPositioning_(clickedElRect, pageRect, state) {
    const clickedElTopOffset = clickedElRect.top - pageRect.top;
    const clickedElBottomOffset = clickedElRect.bottom - pageRect.top;

    if (clickedElTopOffset > MIN_VERTICAL_SPACE) { // Tooltip fits above clicked element.
      state.tooltipTop = clickedElRect.top - MIN_VERTICAL_SPACE;
    } else if (pageRect.height - clickedElBottomOffset >
        MIN_VERTICAL_SPACE) { // Tooltip fits below clicked element. Place arrow on top of the tooltip.
      state.tooltipTop = clickedElRect.bottom + EDGE_PADDING * 2;
      state.arrowOnTop = true;
    } else { // Element takes whole vertical space. Place tooltip on the middle.
      state.tooltipTop = pageRect.height / 2;
    }
  }

  /**
   * In charge of positioning the tooltip and the tooltip's arrow horizontally.
   * @param {!ClientRect} clickedElRect
   * @param {!ClientRect} pageRect
   * @param {!Object} state
   */
  horizontalPositioning_(clickedElRect, pageRect, state) {
    const clickedElLeftOffset = clickedElRect.left - pageRect.left;
    const elCenterLeft = clickedElRect.width / 2 + clickedElLeftOffset;
    const tooltipWidth = this.tooltip_./*OK*/offsetWidth;
    state.tooltipLeft = elCenterLeft - (tooltipWidth / 2);
    const maxHorizontalLeft = pageRect.width - tooltipWidth - EDGE_PADDING;

    // Make sure tooltip is not out of the page.
    state.tooltipLeft = Math.min(state.tooltipLeft, maxHorizontalLeft);
    state.tooltipLeft = Math.max(EDGE_PADDING, state.tooltipLeft);

    state.arrowLeftOffset = Math.abs(elCenterLeft - state.tooltipLeft -
        this.tooltipArrow_./*OK*/offsetWidth / 2);
    // Make sure tooltip arrow is not out of the tooltip.
    state.arrowLeftOffset =
      Math.min(state.arrowLeftOffset, tooltipWidth - EDGE_PADDING * 3);

    state.tooltipLeft += pageRect.left;
  }

  /**
   * Handles click outside the tooltip.
   * @param {!Event} event
   * @private
   */
  onOutsideTooltipClick_(event) {
    if (!closest(dev().assertElement(event.target),
        el => el == this.tooltip_)) {
      event.stopPropagation();
      this.closeTooltip_();
    }
  }

  /**
   * Builds the template and adds corresponding listeners to nav buttons.
   * @param {!Document} doc
   * @return {!Element}
   * @private
   */
  buildTemplate_(doc) {
    const html = htmlFor(doc);
    const tooltipOverlay =
        html`
        <section class="i-amphtml-story-tooltip-layer i-amphtml-hidden">
          <div class="i-amphtml-story-tooltip-layer-nav-button-container
              i-amphtml-story-tooltip-nav-button-left">
            <button role="button" ref="buttonLeft"
                class="i-amphtml-story-tooltip-layer-nav-button
                i-amphtml-story-tooltip-nav-button-left">
            </button>
          </div>
          <div class="i-amphtml-story-tooltip-layer-nav-button-container
              i-amphtml-story-tooltip-nav-button-right">
            <button role="button" ref="buttonRight"
                class="i-amphtml-story-tooltip-layer-nav-button
                    i-amphtml-story-tooltip-nav-button-right">
            </button>
          </div>
          <a class="i-amphtml-story-tooltip" target="_blank" ref="tooltip">
            <div class="i-amphtml-story-tooltip-icon"><img ref="icon"></div>
            <p class="i-amphtml-tooltip-text" ref="text"></p>
            <div class="i-amphtml-tooltip-launch-icon"></div>
            <div class="i-amphtml-story-tooltip-arrow" ref="arrow"></div>
          </a>
        </section>`;
    const overlayEls = htmlRefs(tooltipOverlay);
    const {tooltip, buttonLeft, buttonRight, arrow} =
      /** @type {!tooltipElementsDef} */ (overlayEls);

    this.tooltip_ = tooltip;
    this.tooltipArrow_ = arrow;
    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);

    buttonLeft.addEventListener('click', e =>
      this.onNavigationalClick_(e, rtlState ?
        EventType.NEXT_PAGE : EventType.PREVIOUS_PAGE));


    buttonRight.addEventListener('click', e =>
      this.onNavigationalClick_(e, rtlState ?
        EventType.PREVIOUS_PAGE : EventType.NEXT_PAGE));

    return tooltipOverlay;
  }

  /**
   * Navigates to next/previous page.
   * @param {!Event} event
   * @param {string} direction
   * @private
   */
  onNavigationalClick_(event, direction) {
    event.preventDefault();
    dispatch(
        this.win_,
        dev().assertElement(this.shadowRoot_),
        direction,
        undefined,
        {bubbles: true});
  }
}
