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

import {CSS} from '../../../build/amp-sticky-ad-1.0.css';
import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {
  computedStyle,
  removeAlphaFromColor,
  setStyle,
  toggle,
} from '../../../src/style';
import {dev, user, userAssert} from '../../../src/log';
import {removeElement, whenUpgradedToCustomElement} from '../../../src/dom';

class AmpStickyAd extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = this.getVsync();

    /** @private {?Element} */
    this.ad_ = null;

    /** @private {?../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = null;

    /** @private {boolean} */
    this.visible_ = false;

    /** @private {?UnlistenDef} */
    this.scrollUnlisten_ = null;

    /** @private {boolean} */
    this.collapsed_ = false;

    /** @private {?Promise} */
    this.adReadyPromise_ = null;
  }

  /** @override */
  buildCallback() {
    this.viewport_ = this.getViewport();
    this.element.classList.add('i-amphtml-sticky-ad-layout');

    const children = this.getRealChildren();
    userAssert(
      children.length == 1 && children[0].tagName == 'AMP-AD',
      'amp-sticky-ad must have a single amp-ad child'
    );

    this.ad_ = children[0];
    Services.ownersForDoc(this.element).setOwner(this.ad_, this.element);

    this.adReadyPromise_ = whenUpgradedToCustomElement(
      dev().assertElement(this.ad_)
    )
      .then((ad) => {
        return ad.whenBuilt();
      })
      .then(() => {
        return this.mutateElement(() => {
          toggle(this.element, true);
        });
      });

    const paddingBar = this.win.document.createElement(
      'amp-sticky-ad-top-padding'
    );
    paddingBar.classList.add('amp-sticky-ad-top-padding');
    this.element.insertBefore(paddingBar, this.ad_);

    // On viewport scroll, check requirements for amp-stick-ad to display.
    this.win.setTimeout(() => {
      this.scrollUnlisten_ = this.viewport_.onScroll(() => this.onScroll_());
    });
  }

  /** @override */
  layoutCallback() {
    // Reschedule layout for ad if layout sticky-ad again.
    if (this.visible_) {
      toggle(this.element, true);
      const borderBottom = this.element./*OK*/ offsetHeight;
      this.viewport_.updatePaddingBottom(borderBottom);
      const owners = Services.ownersForDoc(this.element);
      owners.updateInViewport(
        this.element,
        dev().assertElement(this.ad_),
        true
      );
      owners.scheduleLayout(this.element, dev().assertElement(this.ad_));
    }
    return Promise.resolve();
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    this.viewport_.updatePaddingBottom(0);
    return true;
  }

  /** @override */
  detachedCallback() {
    this.removeOnScrollListener_();
  }

  /** @override */
  collapsedCallback() {
    this.collapsed_ = true;
    this.visible_ = false;
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
   * The listener function that listen on viewport scroll event.
   * And decide when to display the ad.
   * @private
   */
  onScroll_() {
    const scrollTop = this.viewport_.getScrollTop();
    if (scrollTop > 1) {
      // Check greater than 1 because AMP set scrollTop to 1 in iOS.
      this.display_();
    }
  }

  /**
   * Display and load sticky ad.
   * @private
   */
  display_() {
    this.removeOnScrollListener_();
    this.adReadyPromise_.then(() => {
      // Wait for ad build ready. For example user dismiss user notification.
      this.mutateElement(() => {
        if (this.collapsed_) {
          // It's possible that if an AMP ad collapse before its layoutCallback.
          return;
        }
        this.visible_ = true;
        this.addCloseButton_();
        this.viewport_
          .addToFixedLayer(this.element, /* forceTransfer */ true)
          .then(() => this.scheduleLayoutForAd_());
      });
    });
  }

  /**
   * Function that check if ad has been built.  If not, wait for the "built"
   * signal. Otherwise schedule layout for ad.
   * @private
   */
  scheduleLayoutForAd_() {
    whenUpgradedToCustomElement(dev().assertElement(this.ad_)).then((ad) => {
      ad.whenBuilt().then(this.layoutAd_.bind(this));
    });
  }

  /**
   * Layout ad, and display sticky-ad container after layout complete.
   * @return {!Promise}
   * @private
   */
  layoutAd_() {
    const ad = dev().assertElement(this.ad_);
    const owners = Services.ownersForDoc(this.element);
    owners.updateInViewport(this.element, ad, true);
    owners.scheduleLayout(this.element, ad);
    // Wait for the earliest: `render-start` or `load-end` signals.
    // `render-start` is expected to arrive first, but it's not emitted by
    // all types of ads.
    const signals = ad.signals();
    return signals.whenSignal(CommonSignals.RENDER_START).then(() => {
      let backgroundColor;
      return this.measureElement(() => {
        backgroundColor = computedStyle(this.win, this.element)[
          'backgroundColor'
        ];
      }).then(() => {
        return this.vsync_.mutatePromise(() => {
          // Set sticky-ad to visible and change container style
          this.element.setAttribute('visible', '');
          // Add border-bottom to the body to compensate space that was taken
          // by sticky ad, so no content would be blocked by sticky ad unit.
          const borderBottom = this.element./*OK*/ offsetHeight;
          this.viewport_.updatePaddingBottom(borderBottom);
          this.forceOpacity_(backgroundColor);
        });
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
    closeButton.setAttribute(
      'aria-label',
      this.element.getAttribute('data-close-button-aria-label') ||
        'Close this ad'
    );
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
      Services.ownersForDoc(this.element)./*OK*/ scheduleUnlayout(
        this.element,
        dev().assertElement(this.ad_)
      );
      this.viewport_.removeFromFixedLayer(this.element);
      removeElement(this.element);
      this.viewport_.updatePaddingBottom(0);
    });
  }

  /**
   * To check for background-color alpha and force it to be 1.
   * Whoever calls this needs to make sure it's in a vsync.
   * @param {string} backgroundColor
   * @private
   */
  forceOpacity_(backgroundColor) {
    const newBackgroundColor = removeAlphaFromColor(backgroundColor);
    if (backgroundColor == newBackgroundColor) {
      return;
    }
    user().warn(
      'AMP-STICKY-AD',
      'Do not allow container to be semitransparent'
    );
    setStyle(this.element, 'background-color', newBackgroundColor);
  }
}

AMP.extension('amp-sticky-ad', '1.0', (AMP) => {
  AMP.registerElement('amp-sticky-ad', AmpStickyAd, CSS);
});
