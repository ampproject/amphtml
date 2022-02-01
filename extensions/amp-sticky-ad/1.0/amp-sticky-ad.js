import {addExperimentIdToElement} from '#ads/google/a4a/traffic-experiments';

import {CommonSignals_Enum} from '#core/constants/common-signals';
import {removeElement} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {realChildElements} from '#core/dom/query';
import {
  computedStyle,
  removeAlphaFromColor,
  setStyle,
  toggle,
} from '#core/dom/style';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev, user, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-sticky-ad-1.0.css';

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
    userAssert(
      this.win.document.querySelectorAll(
        'amp-sticky-ad.i-amphtml-built, amp-ad[sticky].i-amphtml-built'
      ).length <= 1,
      'At most one sticky ad can be loaded per page'
    );
    this.viewport_ = this.getViewport();
    this.element.classList.add('i-amphtml-sticky-ad-layout');

    const children = realChildElements(this.element);
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
        return ad.build();
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
      owners.scheduleLayout(this.element, dev().assertElement(this.ad_));
    }
    return Promise.resolve();
  }

  /** @override */
  upgradeCallback() {
    if (!isExperimentOn(this.win, 'amp-sticky-ad-to-amp-ad-v4')) {
      return null;
    }

    const children = realChildElements(this.element);
    userAssert(
      children.length == 1 && children[0].tagName == 'AMP-AD',
      'amp-sticky-ad must have a single amp-ad child'
    );

    const ad = children[0];
    const enableConversion = Math.random() < 0.5;

    const adType = (ad.getAttribute('type') || '').toLowerCase();
    if (adType == 'doubleclick' || adType == 'adsense') {
      addExperimentIdToElement(enableConversion ? '31063204' : '31063203', ad);
    }

    if (!enableConversion) {
      // Wait for the amp-ad extension to be loaded for a fairer comparison
      return Services.extensionsFor(this.win)
        .loadElementClass('amp-ad', '0.1')
        .then(() => null);
    }

    ad.setAttribute('sticky', 'bottom');

    // Rebuild the ad element since the attributes have changed
    const newAd = ad.cloneNode();
    this.element.parentElement.replaceChild(newAd, this.element);
    return Services.extensionsFor(this.win)
      .loadElementClass('amp-ad', '0.1')
      .then((AmpAd) => new AmpAd(newAd));
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
  collapsedCallback(element) {
    // We will only collapse the stick-ad when the ad collapses. The analytics
    // element will collapse after it's done initializing, which is normal.
    if (element !== this.ad_) {
      return;
    }
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
      ad.build().then(() => this.layoutAd_());
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
    owners.scheduleLayout(this.element, ad);
    // Wait for the earliest: `render-start` or `load-end` signals.
    // `render-start` is expected to arrive first, but it's not emitted by
    // all types of ads.
    const signals = ad.signals();
    return signals.whenSignal(CommonSignals_Enum.RENDER_START).then(() => {
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
