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

import {
  STICKY_AD_TRANSITION_EXP,
  divertStickyAdTransition,
} from '../../../ads/google/a4a/sticky-ad-transition-exp';
import {Services} from '../../../src/services';
import {
  ancestorElementsByTag,
  createElementWithAttributes,
  removeElement,
} from '../../../src/dom';
import {devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getExperimentBranch} from '../../../src/experiments';

import {getAdContainer} from '../../../src/ad-helper';
import {listen} from '../../../src/event-helper';
import {setStyle, setStyles} from '../../../src/style';

const STICKY_AD_MAX_SIZE_LIMIT = 0.2;
const STICKY_AD_MAX_HEIGHT_LIMIT = 0.5;

/**
 * Permissible sticky ad options.
 * @const @enum {string}
 */
const StickyAdPositions = {
  TOP: 'top',
  BOTTOM: 'bottom',
  BOTTOM_RIGHT: 'bottom-right',
};

const STICKY_AD_PROP = 'sticky';

export class AmpAdUIHandler {
  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private @const {!Document} */
    this.doc_ = baseInstance.win.document;

    this.containerElement_ = null;

    /**
     * If this is a sticky ad unit, the sticky position option.
     * @private {?StickyAdPositions}
     */
    this.stickyAdPosition_ = null;
    if (this.element_.hasAttribute(STICKY_AD_PROP)) {
      // TODO(powerivq@) Kargo is currently running an experiment using empty sticky attribute, so
      // we default the position to bottom right. Remove this default afterwards.
      this.stickyAdPosition_ =
        this.element_.getAttribute(STICKY_AD_PROP) ||
        StickyAdPositions.BOTTOM_RIGHT;
      this.element_.setAttribute(STICKY_AD_PROP, this.stickyAdPosition_);
    }

    /**
     * Whether the close button has been rendered for a sticky ad unit.
     */
    this.closeButtonRendered_ = false;

    /**
     * Unlisteners to be unsubscribed after destroying.
     * @private {!Array<!Function>}
     */
    this.unlisteners_ = [];

    if (this.element_.hasAttribute('data-ad-container-id')) {
      const id = this.element_.getAttribute('data-ad-container-id');
      const container = this.doc_.getElementById(id);
      if (
        container &&
        container.tagName == 'AMP-LAYOUT' &&
        container.contains(this.element_)
      ) {
        // Parent <amp-layout> component with reference id can serve as the
        // ad container
        this.containerElement_ = container;
      }
    }

    if (!baseInstance.getFallback()) {
      const fallback = this.addDefaultUiComponent_('fallback');
      if (fallback) {
        this.baseInstance_.element.appendChild(fallback);
      }
    }
  }

  /**
   * Apply UI for laid out ad with no-content
   * Order: try collapse -> apply provided fallback -> apply default fallback
   */
  applyNoContentUI() {
    if (getAdContainer(this.element_) === 'AMP-STICKY-AD') {
      // Special case: force collapse sticky-ad if no content.
      this.baseInstance_./*OK*/ collapse();
      return;
    }

    if (getAdContainer(this.element_) === 'AMP-FX-FLYING-CARPET') {
      /**
       * Special case: Force collapse the ad if it is the,
       * only and direct child of a flying carpet.
       * Also, this will not handle
       * the amp-layout case for now, as it could be
       * inefficient. And we have not seen an amp-layout
       * used with flying carpet and ads yet.
       */

      const flyingCarpetElements = ancestorElementsByTag(
        this.element_,
        'amp-fx-flying-carpet'
      );
      const flyingCarpetElement = flyingCarpetElements[0];

      flyingCarpetElement.getImpl().then((implementation) => {
        const children = implementation.getChildren();

        if (children.length === 1 && children[0] === this.element_) {
          this.baseInstance_./*OK*/ collapse();
        }
      });
      return;
    }

    let attemptCollapsePromise;
    if (this.containerElement_) {
      // Collapse the container element if there's one
      attemptCollapsePromise = Services.mutatorForDoc(
        this.element_.getAmpDoc()
      ).attemptCollapse(this.containerElement_);
      attemptCollapsePromise.then(() => {});
    } else {
      attemptCollapsePromise = this.baseInstance_.attemptCollapse();
    }

    // The order here is collapse > user provided fallback > default fallback
    attemptCollapsePromise.catch(() => {
      this.baseInstance_.mutateElement(() => {
        this.baseInstance_.togglePlaceholder(false);
        this.baseInstance_.toggleFallback(true);
      });
    });
  }

  /**
   * Apply UI for unlaid out ad: Hide fallback.
   * Note: No need to togglePlaceholder here, unlayout show it by default.
   */
  applyUnlayoutUI() {
    this.baseInstance_.mutateElement(() => {
      this.baseInstance_.toggleFallback(false);
    });
  }

  /**
   * @param {string} name
   * @return {?Element}
   * @private
   */
  addDefaultUiComponent_(name) {
    if (this.element_.tagName == 'AMP-EMBED') {
      // Do nothing for amp-embed element;
      return null;
    }
    const uiComponent = this.doc_.createElement('div');
    uiComponent.setAttribute(name, '');

    const content = this.doc_.createElement('div');
    content.classList.add('i-amphtml-ad-default-holder');

    // TODO(aghassemi, #4146) i18n
    content.setAttribute('data-ad-holder-text', 'Ad');
    uiComponent.appendChild(content);

    return uiComponent;
  }

  /**
   * @return {boolean}
   */
  isStickyAd() {
    return this.stickyAdPosition_ !== null;
  }

  /**
   * Initialize sticky ad related features
   */
  maybeInitStickyAd() {
    if (this.isStickyAd()) {
      setStyle(this.element_, 'visibility', 'visible');

      if (this.stickyAdPosition_ == StickyAdPositions.BOTTOM) {
        const paddingBar = this.doc_.createElement('amp-ad-sticky-padding');
        this.element_.insertBefore(
          paddingBar,
          devAssert(
            this.element_.firstChild,
            'amp-ad should have been expanded.'
          )
        );
      }
    }
  }

  /**
   * Scroll promise for sticky ad
   * @return {Promise}
   */
  getScrollPromiseForStickyAd() {
    if (this.isStickyAd()) {
      return new Promise((resolve) => {
        const unlisten = Services.viewportForDoc(
          this.element_.getAmpDoc()
        ).onScroll(() => {
          resolve();
          unlisten();
        });
      });
    }
    return Promise.resolve(null);
  }

  /**
   * When a sticky ad is shown, the close button should be rendered at the same time.
   */
  onResizeSuccess() {
    if (this.isStickyAd() && !this.closeButtonRendered_) {
      this.addCloseButton_();
      this.closeButtonRendered_ = true;
    }
  }

  /**
   * The function that add a close button to sticky ad
   */
  addCloseButton_() {
    const closeButton = createElementWithAttributes(
      /** @type {!Document} */ (this.element_.ownerDocument),
      'button',
      dict({
        'aria-label':
          this.element_.getAttribute('data-close-button-aria-label') ||
          'Close this ad',
      })
    );

    this.unlisteners_.push(
      listen(closeButton, 'click', () => {
        Services.vsyncFor(this.baseInstance_.win).mutate(() => {
          const viewport = Services.viewportForDoc(this.element_.getAmpDoc());
          viewport.removeFromFixedLayer(this.element);
          removeElement(this.element_);
          viewport.updatePaddingBottom(0);
        });
      })
    );

    closeButton.classList.add('amp-ad-close-button');
    this.element_.appendChild(closeButton);
  }

  /**
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {number} iframeHeight
   * @param {number} iframeWidth
   * @param {!MessageEvent} event
   * @return {!Promise<!Object>}
   */
  updateSize(height, width, iframeHeight, iframeWidth, event) {
    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = Math.max(
        this.element_./*OK*/ offsetHeight + height - iframeHeight,
        height
      );
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = Math.max(
        this.element_./*OK*/ offsetWidth + width - iframeWidth,
        width
      );
    }

    /** @type {!Object<boolean, number|undefined, number|undefined>} */
    const resizeInfo = {
      success: true,
      newWidth,
      newHeight,
    };

    if (!newHeight && !newWidth) {
      return Promise.reject(new Error('undefined width and height'));
    }

    if (getAdContainer(this.element_) == 'AMP-STICKY-AD') {
      // Special case: force collapse sticky-ad if no content.
      resizeInfo.success = false;
      return Promise.resolve(resizeInfo);
    }

    // Special case: for sticky ads, we enforce 20% size limit and 50% height limit
    if (this.isStickyAd()) {
      const viewport = this.baseInstance_.getViewport();
      if (
        height * width >
          STICKY_AD_MAX_SIZE_LIMIT *
            viewport.getHeight() *
            viewport.getWidth() ||
        newHeight > STICKY_AD_MAX_HEIGHT_LIMIT * viewport.getHeight()
      ) {
        resizeInfo.success = false;
        return Promise.resolve(resizeInfo);
      }
    }
    return this.baseInstance_
      .attemptChangeSize(newHeight, newWidth, event)
      .then(
        () => {
          divertStickyAdTransition(this.baseInstance_.win);
          if (
            getExperimentBranch(
              this.baseInstance_.win,
              STICKY_AD_TRANSITION_EXP.id
            ) === STICKY_AD_TRANSITION_EXP.experiment
          ) {
            this.setSize_(this.element_.querySelector('iframe'), height, width);
          }
          return resizeInfo;
        },
        () => {
          resizeInfo.success = false;
          return resizeInfo;
        }
      );
  }

  /**
   * Force set the dimensions for an element
   * @param {Any} element
   * @param {number} newHeight
   * @param {number} newWidth
   */
  setSize_(element, newHeight, newWidth) {
    setStyles(element, {
      'height': `${newHeight}px`,
      'width': `${newWidth}px`,
    });
  }

  /**
   * Clean up the listeners
   */
  cleanup() {
    this.unlisteners_.forEach((unlistener) => unlistener());
    this.unlisteners_.length = 0;
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdUIHandler = AmpAdUIHandler;
