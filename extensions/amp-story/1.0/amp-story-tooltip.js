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
import {
  addAttributesToElement,
  childElement,
  removeElement,
} from '../../../src/dom';
import {createShadowRootWithStyle, getSourceOriginForElement} from './utils';
import {getAmpdoc} from '../../../src/service';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {parseUrlDeprecated} from '../../../src/url';
import {setImportantStyles} from '../../../src/style';

/**
 * Minimum vertical space needed to position tooltip.
 */
const MIN_VERTICAL_SPACE = 56;

/**
 * Padding between tooltip and edges of screen.
 */
const EDGE_PADDING = 8;

/**
 * List of selectors that can trigger a tooltip.
 * @enum {string}
 */
export const TOOLTIP_TRIGGERABLE_SELECTORS = ['a[href]'];

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

    /**
     * amp-story element.
     * @private {?Element}
     */
    this.story_ = storyEl;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /**
     * Root element containing a shadow DOM root.
     * @private {?Element}
     */
    this.shadowRoot_ = null;

    /**
     * Tooltip overlay layer.
     * @private {?Element}
     */
    this.tooltipOverlayEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win_);

    /** @private @const {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(getAmpdoc(this.win_.document));

    /**
     * Clicked element producing the tooltip. Used to avoid building the same
     * element twice.
     * @private {?Element} */
    this.builtElem_ = null;

    this.storeService_.subscribe(StateProperty.TOOLTIP_ELEMENT, elem => {
      if (!elem) {
        return;
      }

      if (!this.isBuilt_) {
        this.story_.appendChild(this.build_());
      }

      if (elem != this.builtElem_) {
        this.builtElem_ = elem;
        this.attachTooltipToEl_(elem);
      }
      this.onTooltipStateUpdate_(true);
    });
  }

  /**
   * Builds the tooltip overlay and appends it to the provided story.
   */
  build_() {
    this.isBuilt_ = true;

    this.shadowRoot_ = this.win_.document.createElement('div');

    this.tooltipOverlayEl_ = this.buildTemplate_(this.win_.document);
    createShadowRootWithStyle(this.shadowRoot_, this.tooltipOverlayEl_, CSS);
    this.tooltipOverlayEl_
        .addEventListener('click', event => this.onOutsideClickableEls_(event));

    this.storeService_.subscribe(StateProperty.UI_STATE, isDesktop => {
      this.onUIStateUpdate_(isDesktop);
    }, true /** callToInitialize */);

    this.storeService_.subscribe(StateProperty.CURRENT_PAGE_ID, () => {
      // Hide active tooltip when page switch is triggered by keyboard or
      // desktop buttons.
      this.closeTooltip_();
    });

    return this.shadowRoot_;
  }

  /**
   * Hides the tooltip layer.
   */
  closeTooltip_() {
    this.storeService_.dispatch(Action.TOGGLE_TOOLTIP, null);
    // Hide active tooltip when page switch is triggered by keyboard or
    // desktop buttons.
    this.onTooltipStateUpdate_(false);
  }

  /**
   * Reacts to store updates related to tooltip active status.
   * @param {boolean} tooltipIsActive
   */
  onTooltipStateUpdate_(tooltipIsActive) {
    this.resources_.mutateElement(this.tooltipOverlayEl_, () => {
      this.tooltipOverlayEl_
          .classList.toggle('i-amphtml-hidden', !tooltipIsActive);
    });
  }

  /**
   * Reacts to desktop state updates and hides navigation buttons since we
   * already have in the desktop UI.
   * @param {!UIType} uiState
   */
  onUIStateUpdate_(uiState) {
    this.resources_.mutateElement(this.tooltipOverlayEl_, () => {
      uiState === UIType.DESKTOP ?
        this.tooltipOverlayEl_.setAttribute('desktop', '') :
        this.tooltipOverlayEl_.removeAttribute('desktop');
    });
  }

  /**
   * Builds tooltip and attaches it depending on the clicked element content and
   * position.
   * @param {!Element} clickedEl
   */
  attachTooltipToEl_(clickedEl) {
    const {href} = parseUrlDeprecated(clickedEl.getAttribute('href'));
    const domainName = getSourceOriginForElement(clickedEl, href);

    this.resources_.mutateElement(this.tooltip_, () => {
      const tooltipText = clickedEl.getAttribute('tooltipText') || domainName;
      this.appendTextToTooltip_(tooltipText);

      const iconAttr = clickedEl.getAttribute('tooltipIcon');
      const iconSrc = iconAttr ? parseUrlDeprecated(iconAttr).href : '';
      this.appendIconToTooltip_(iconSrc);

      this.positionTooltip_(clickedEl);
    });
  }

  /**
   * Checks for existing text content and modifies it or appends a new text node
   * if building tooltip for the first time.
   * @param {string} domainName
   */
  appendTextToTooltip_(domainName) {
    const existingTooltipText = childElement(this.tooltip_,
        el => el.classList.contains('i-amphtml-tooltip-text'));

    if (existingTooltipText) {
      existingTooltipText.textContent = domainName;
    } else {
      const html = htmlFor(this.win_.document);
      const tooltipText =
        html`<p class="i-amphtml-tooltip-text" ref="text"></p>`;
      tooltipText.textContent = domainName;
      this.tooltip_.insertBefore(tooltipText, this.tooltip_.firstChild);
    }
  }

  /**
   * Checks for existing icon source and modifies it or appends a new tooltip
   * icon node if building tooltip for the first time.
   * @param {string} iconSrc
   */
  appendIconToTooltip_(iconSrc) {
    const existingTooltipIcon =
        childElement(this.tooltip_,
            el => el.classList.contains('i-amphtml-story-tooltip-icon'));

    if (!iconSrc) {
      if (existingTooltipIcon) {
        removeElement(existingTooltipIcon);
      }
      return;
    }

    if (existingTooltipIcon) {
      addAttributesToElement(existingTooltipIcon.firstElementChild,
          {'src': iconSrc});
    } else {
      const html = htmlFor(this.win_.document);
      const iconEl =
        html`
        <div class="i-amphtml-story-tooltip-icon">
          <img ref="icon">
          </img>
        </div>`;
      const {icon} = htmlRefs(iconEl);
      addAttributesToElement(icon, {'src': iconSrc});
      this.tooltip_.insertBefore(iconEl, this.tooltip_.firstChild);
    }
  }

  /**
   * Positions tooltip and its pointing arrow according to the position of the
   * clicked element.
   * @param {!Element} clickedEl
   */
  positionTooltip_(clickedEl) {
    const clickedRect = clickedEl./*REVIEW*/getBoundingClientRect();

    // Reset tooltip arrow positioning.
    this.tooltipArrow_.classList.remove('i-amphtml-tooltip-arrow-on-top');

    // Vertical positioning.
    let top;
    // Tooltip fits above clicked element.
    if (clickedRect.top > MIN_VERTICAL_SPACE) {
      top = clickedRect.top - MIN_VERTICAL_SPACE;
    } else if (this.win_./*REVIEW*/innerHeight - clickedRect.bottom >
        MIN_VERTICAL_SPACE) { // Tooltip fits below clicked element.
      top = clickedRect.bottom + EDGE_PADDING;
      this.tooltipArrow_.classList.add('i-amphtml-tooltip-arrow-on-top');
    } else { // Element takes whole vertical space. Place tooltip on the middle.
      top = this.win_./*REVIEW*/innerHeight / 2;
    }

    // Horizontal positioning.
    let left;
    const elCenter = (clickedRect.width / 2) + clickedRect.left;
    left = elCenter - (this.tooltip_./*REVIEW*/offsetWidth / 2);
    const maxLeft = (this.win_./*REVIEW*/innerWidth -
      this.tooltip_./*REVIEW*/offsetWidth - EDGE_PADDING);

    // Make sure tooltip is not out of screen.
    left = Math.min(left, maxLeft);
    left = Math.max(EDGE_PADDING, left);

    // Position tooltip arrow horizontally depending on clicked element's center
    // in relation to the screen width.
    let arrowLeftOffset = elCenter / this.win_./*REVIEW*/innerWidth * 100;
    arrowLeftOffset = Math.min(arrowLeftOffset, 80);
    arrowLeftOffset = Math.max(arrowLeftOffset, 0);

    setImportantStyles(this.tooltipArrow_, {left: `calc(${arrowLeftOffset}%)`});
    setImportantStyles(this.tooltip_, {top: `${top}px`, left: `${left}px`});
  }

  /**
   * Handles click outside of clickable elements.
   * @param {!Event} event
   */
  onOutsideClickableEls_(event) {
    event.stopPropagation();
    this.closeTooltip_();
  }

  /**
   * Builds the template and adds corresponding listeners to nav buttons.
   * @param {!Document} doc
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
          <a class="i-amphtml-story-tooltip" target="_top" ref="tooltip">
            <div class="i-amphtml-tooltip-launch-icon"></div>
            <div class="i-amphtml-story-tooltip-arrow" ref="arrow"></div>
          </a>
        </section>
        `;
    const {tooltip, buttonLeft, buttonRight, arrow} = htmlRefs(tooltipOverlay);
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
   */
  onNavigationalClick_(event, direction) {
    event.preventDefault();
    dispatch(this.win_, this.shadowRoot_, direction, undefined,
        {bubbles: true});
  }
}
