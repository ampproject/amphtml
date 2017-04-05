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

import {CommonSignals} from '../../../src/common-signals';
import {CSS} from '../../../build/amp-sticky-ad-0.1.css';
import {Layout} from '../../../src/layout';
import {dev,user} from '../../../src/log';
import {removeElement} from '../../../src/dom';
import {toggle} from '../../../src/style';

class AmpStickyAd extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {?Element} */
    this.ad_ = null;

    /** @private {?../../../src/service/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {boolean} */
    this.visible_ = false;

    /** @private {?UnlistenDef} */
    this.scrollUnlisten_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    this.viewport_ = this.getViewport();

    toggle(this.element, true);
    this.element.classList.add('i-amphtml-sticky-ad-layout');
    const children = this.getRealChildren();
    user().assert((children.length == 1 && children[0].tagName == 'AMP-AD'),
        'amp-sticky-ad must have a single amp-ad child');

    this.ad_ = children[0];
    this.setAsOwner(this.ad_);

    // On viewport scroll, check requirements for amp-stick-ad to display.
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
      this.updateInViewport(dev().assertElement(this.ad_), true);
      this.scheduleLayout(dev().assertElement(this.ad_));
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
   * Function that check if ad has been built.  If not, wait for the "built"
   * signal. Otherwise schedule layout for ad.
   * @private
   */
  scheduleLayoutForAd_() {
    if (this.ad_.isBuilt()) {
      this.layoutAd_();
    } else {
      this.ad_.whenBuilt().then(this.layoutAd_.bind(this));
    }
  }

  /**
   * Layout ad, and display sticky-ad container after layout complete.
   * @private
   */
  layoutAd_() {
    const ad = dev().assertElement(this.ad_);
    this.updateInViewport(ad, true);
    this.scheduleLayout(ad);
    // Wait for the earliest: `render-start` or `load-end` signals.
    // `render-start` is expected to arrive first, but it's not emitted by
    // all types of ads.
    const signals = ad.signals();
    return Promise.race([
      signals.whenSignal(CommonSignals.RENDER_START),
      signals.whenSignal(CommonSignals.LOAD_END),
    ]).then(() => {
      return this.vsync_.mutatePromise(() => {
        // Set sticky-ad to visible and change container style
        this.element.setAttribute('visible', '');
        this.element.classList.add('amp-sticky-ad-loaded');
      });
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
        this.element.getAttribute('data-close-button-aria-label')
            || 'Close this ad');
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
      this./*OK*/scheduleUnlayout(dev().assertElement(this.ad_));
      this.viewport_.removeFromFixedLayer(this.element);
      removeElement(this.element);
      this.viewport_.updatePaddingBottom(0);
    });
  }
}

AMP.extension('amp-sticky-ad', '0.1', AMP => {
  AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
});
