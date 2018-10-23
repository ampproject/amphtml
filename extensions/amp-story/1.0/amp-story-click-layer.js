import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-click-layer-1.0.css';
import {Services} from '../../../src/services';
import {addAttributesToElement, childElements, closest, childElement} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {getAmpdoc} from '../../../src/service';
import {getSourceOriginForBookendComponent} from './bookend/components/bookend-component-interface';
import {htmlFor, htmlRefs} from '../../../src/static-template';
import {setImportantStyles} from '../../../src/style';
import { EventType, dispatch } from './events';

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

//TODO:
//1. Layout tooltip and navigation buttons.
//1.1 Nav buttons: update class if on last/first page.
//1.2 nav buttons: test on rtl / don't show on desktop (?)
// **1.3 tooltip: calculate where to position it depending on the link position.
// **2. Add click listener to tooltip and nav buttons.
// **3. Make sure to close and unpause when clicking outside of tooltip.
// **4. And navigate if clicking on navigation arrows.
// **5. Or proceed with action if clicked on tooltip.
// RTL (icon on right, open in new in left of tooltip)

/**
 * Minimum vertical space needed to position tooltip.
 */
const MIN_VERTICAL_SPACE = 56;

export class AmpStoryClickLayer {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /**
     * Root element containing a shadow DOM root.
     * @private {?Element}
     */
    this.root_ = null;

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
  }

  /**
   * Builds the tooltip overlay and appends it to the provided story.
   */
  build() {
    if (this.isBuilt_) {
      return;
    }

    this.isBuilt_ = true;

    this.root_ = this.win_.document.createElement('div');

    this.tooltipOverlayEl_ = this.buildTemplate_(this.win_.document);

    createShadowRootWithStyle(this.root_, this.tooltipOverlayEl_, CSS);

    this.tooltipOverlayEl_
        .addEventListener('click', event => this.onClick_(event));

    this.storeService_.subscribe(StateProperty.TOOLTIP_STATE, isActive => {
      this.onTooltipStateUpdate_(isActive);
    });

    this.storeService_.subscribe(StateProperty.TOOLTIP_ELEMENT, elem => {
      if (this.storeService_.get(StateProperty.TOOLTIP_STATE) &&
        elem != this.builtElem_) {

        this.builtElem_ = elem;
        this.attachTooltipToEl_(elem);
      }
    });

    return this.root_;
  }

  /**
   *
   * @param {boolean} tooltipIsActive
   */
  onTooltipStateUpdate_(tooltipIsActive) {
    this.resources_.mutateElement(this.tooltipOverlayEl_, () => {
      this.tooltipOverlayEl_
          .classList.toggle('i-amphtml-hidden', !tooltipIsActive);
    });
  }

  /**
   *
   * @param {!Element} elem
   */
  attachTooltipToEl_(elem) {
    const href = elem.getAttribute('i-amphtml-data-amp-story-tooltip-href');
    const iconSrc = elem.getAttribute('icon');
    const domainName = getSourceOriginForBookendComponent(elem, href);

    // let tooltipText;

    // this.resources_.measureMutateElement(this.tootlip_, () => {
    //   tooltipText =
    //       childElements(this.tooltip_,
    //           el => el.classList.contains('i-amphtml-tooltip-next'));
    //   const html = htmlFor(this.win_.document);
    //   tooltipText = tooltipText ? tooltipText :
    //     html`<p class="i-amphtml-tooltip-text" ref="text"></p>`;
    // }, () => {
    //   this.positionTooltip_(elem);
    //   addAttributesToElement(this.tooltip_, {'href': href});
    //   tooltipText.textContent = domainName;
    //   if (!this.builtElem_) {
    //     this.tooltip_.insertBefore(tooltipText, this.tooltip_.firstChild);
    //   }

    //   if (iconSrc) {
    //     this.appendIconToTooltip_(iconSrc);
    //   }
    // });

    this.resources_.mutateElement(this.tooltip_, () => {
      addAttributesToElement(this.tooltip_, {'href': href});

      const existingTooltipText =
        childElement(this.tooltip_,
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

      if (iconSrc) {
        this.appendIconToTooltip_(iconSrc);
      }

      this.positionTooltip_(elem);
    });
  }




  /**
   *
   * @param {*} elem
   */
  positionTooltip_(elem) {
    const rect = elem.getBoundingClientRect();
    let top, left;

    // Top property
    // Tooltip fits between element and top of screen.
    if (rect.top > MIN_VERTICAL_SPACE) {
      top = rect.top - MIN_VERTICAL_SPACE;
    } else if (this.win_.innerHeight - rect.bottom > MIN_VERTICAL_SPACE) {
      // Position under element.
      top = rect.bottom + 8;
    } else {
      // Element takes whole vertical space. Place on the middle.
      top = this.win_.innerHeight / 2;
    }

    // Left property
    const elCenter = (rect.width / 2) + rect.left;
    left = elCenter - (this.tooltip_.offsetWidth / 2);
    const maxLeft = (this.win_.innerWidth - this.tooltip_.offsetWidth - 8);
    left = Math.min(left, maxLeft);
    left = Math.max(8, left);

    setImportantStyles(this.tooltip_, {top: `${top}px`, left: `${left}px`});
  }

  /**
   *
   * @param {*} iconSrc
   */
  appendIconToTooltip_(iconSrc) {
    const existingTooltipIcon =
        childElement(this.tooltip_,
            el => el.classList.contains('i-amphtml-story-tooltip-icon'));

    if (existingTooltipIcon) {
      addAttributesToElement(existingTooltipIcon.firstElementChild, {'src': iconSrc});
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
   *
   * @param {*} event
   */
  onClick_(event) {
    const target = dev().assertElement(event.target);

    if (this.elementOutsideUsableArea_(target)) {
      event.stopPropagation();
      this.closeTooltip_();
    }
  }

  /**
   * Builds the template.
   * @param {!Document} doc
   */
  buildTemplate_(doc) {
    const html = htmlFor(doc);
    const tooltipOverlay =
        html`
        <section class="i-amphtml-story-click-layer i-amphtml-hidden"
            ref="overlay">
          <div class="i-amphtml-story-click-layer-button-container" left-button
              ref="buttonLeft">
            <button class="i-amphtml-story-tooltip-nav-button" left-button
                role="button">
            </button>
          </div>
          <div class="i-amphtml-story-click-layer-button-container"
              right-button ref="buttonRight">
            <button class="i-amphtml-story-tooltip-nav-button" right-button
                role="button">
            </button>
          </div>
          <a class="i-amphtml-story-tooltip" target="_top" ref="tooltip">
            <div class="i-amphtml-tooltip-launch-icon"></div>
          </a>
        </section>
        `;
    const {tooltip, buttonLeft, buttonRight} = htmlRefs(tooltipOverlay);
    this.tooltip_ = tooltip;
    buttonLeft.addEventListener('click', e => {
      e.preventDefault();
      dispatch(this.win_, this.root_, EventType.PREVIOUS_PAGE, undefined,
          {bubbles: true});
    });

    buttonRight.addEventListener('click', e => {
      e.preventDefault();
      dispatch(this.win_, this.root_, EventType.NEXT_PAGE, undefined,
          {bubbles: true});
    });

    return tooltipOverlay;
  }

  /**
   *
   */
  closeTooltip_() {
    this.storeService_.dispatch(Action.TOGGLE_TOOLTIP, false);
  }

  /**
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  elementOutsideUsableArea_(el) {
    const clickableEls = htmlRefs(this.tooltipOverlayEl_);
    const {buttonLeft, buttonRight, tooltip} = clickableEls;
    return !closest(el,
        el => el == buttonLeft || el == buttonRight || el == tooltip);
  }
}
