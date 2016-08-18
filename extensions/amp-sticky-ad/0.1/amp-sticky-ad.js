/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-sticky-ad-0.1.css';
import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';
import {removeElement} from '../../../src/dom';
import {timerFor} from '../../../src/timer';
import {toggle} from '../../../src/style';
import {waitForRenderStart} from '../../../3p/integration';
import {listenOnce} from '../../../src/event-helper';


class AmpStickyAd extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    toggle(this.element, true);
    this.element.classList.add('-amp-sticky-ad-layout');
    const children = this.getRealChildren();
    user().assert((children.length == 1 && children[0].tagName == 'AMP-AD'),
        'amp-sticky-ad must have a single amp-ad child');

    /** @const @private {!Element} */
    this.ad_ = children[0];

    this.setAsOwner(this.ad_);

    /** @private @const {!Viewport} */
    this.viewport_ = this.getViewport();

    /** @const @private {!Vsync} */
    this.vsync_ = this.getVsync();

    /** @const @private {boolean} */
    this.visible_ = false;

    /**
     * On viewport scroll, check requirements for amp-stick-ad to display.
     * @const @private {!UnlistenDef}
     */
    this.scrollUnlisten_ =
        this.viewport_.onScroll(() => this.displayAfterScroll_());
  }

  /** @override */
  layoutCallback() {
    // Reschedule layout for ad if layout sticky-ad again.
    if (this.visible_) {
      toggle(this.element, true);
      const borderBottom = this.element./*OK*/offsetHeight;
      this.viewport_.updatePaddingBottom(borderBottom);
      this.updateInViewport(this.ad_, true);
      this.scheduleLayoutForAd_();
    }
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    this.viewport_.updatePaddingBottom(0);
    this.element.classList.remove('amp-sticky-ad-loaded');
    return true;
  }

  /** @override */
  detachedCallback() {
    this.removeOnScrollListener_();
  }

  /** @override */
  collapsedCallback() {
    toggle(this.element, false);
    this.vsync_.mutate(() => {
      this.viewport_.updatePaddingBottom(0);
    });
  }

  /**
   * The function that remove listener to viewport onScroll event.
   * @private
   */
  removeOnScrollListener_() {
    if (this.scrollUnlisten_) {
      this.scrollUnlisten_();
      this.scrollUnlisten_ = null;
    }
  }

  /**
   * The listener function that listen on onScroll event and
   * show sticky ad when user scroll at least one viewport and
   * there is at least one more viewport available.
   * @private
   */
  displayAfterScroll_() {
    const scrollTop = this.viewport_.getScrollTop();
    const viewportHeight = this.viewport_.getSize().height;
    const scrollHeight = this.viewport_.getScrollHeight();
    if (scrollHeight < viewportHeight * 2) {
      this.removeOnScrollListener_();
      return;
    }

    // Check user has scrolled at least one viewport from init position.
    if (scrollTop > viewportHeight) {
      this.removeOnScrollListener_();
      this.deferMutate(() => {
        this.visible_ = true;
        this.element.classList.add('-amp-sticky-ad-visible');
        this.viewport_.addToFixedLayer(this.element);
        // Add border-bottom to the body to compensate space that was taken
        // by sticky ad, so no content would be blocked by sticky ad unit.
        const borderBottom = this.element./*OK*/offsetHeight;
        this.viewport_.updatePaddingBottom(borderBottom);
        this.addCloseButton_();
        this.scheduleLayoutForAd_();
      });
    }
  }

  /**
   * Function that check if ad has been built
   * If not, wait for the amp:built event
   * otherwise schedule layout for ad.
   * @private
   */
  scheduleLayoutForAd_() {
    if (this.ad_.isBuilt()) {
      this.layoutAd_();
    } else {
      listenOnce(this.ad_, 'amp:built', () => {
        this.layoutAd_();
      });
    }
  }

  /**
   * Layout ad, and change sticky-ad container style
   * @private
   */
  layoutAd_() {
    this.updateInViewport(this.ad_, true);
    this.scheduleLayout(this.ad_);
    this.delayAdLoad_();
  }

  /**
   * Change sticky-ad container style to ad-loaded-style after certain delay.
   * For ad type that support return render-start wait until ad layoutCallback
   * resolve and receive amp:load:end.
   * For ad type that don't support render-start, wait for 1 sec.
   * @private
   */
  delayAdLoad_() {
    listenOnce(this.ad_, 'amp:load:end', () => {
      const type = this.ad_.getAttribute('type');
      if (waitForRenderStart.indexOf(type) < 0) {
        timerFor(this.win).delay(() => {
          this.displayAfterAdLoad_();
        }, 1000);
      } else {
        this.displayAfterAdLoad_();
      }
    });
  }

  /**
   * Change sticky-ad container style by adding class name
   * @private
   */
  displayAfterAdLoad_() {
    this.vsync_.mutate(() => {
      this.element.classList.add('amp-sticky-ad-loaded');
    });
  }

  /**
   * The function that add a close button to sticky ad
   * @private
   */
  addCloseButton_() {
    const closeButton = this.win.document.createElement('button');
    closeButton.classList.add('amp-sticky-ad-close-button');
    closeButton.setAttribute('aria-label',
        this.element.getAttribute('data-close-button-aria-label') || 'Close');
    const boundOnCloseButtonClick = this.onCloseButtonClick_.bind(this);
    closeButton.addEventListener('click', boundOnCloseButtonClick);
    this.element.appendChild(closeButton);
  }

  /**
   * The listener function that listen to click event and dismiss sticky ad
   * @private
   */
  onCloseButtonClick_() {
    this.vsync_.mutate(() => {
      this.visible_ = false;
      this./*OK*/scheduleUnlayout(this.ad_);
      removeElement(this.element);
      this.viewport_.updatePaddingBottom(0);
    });
  }
}

AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
