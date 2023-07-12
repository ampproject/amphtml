import {createElementWithAttributes, removeElement} from '#core/dom';
import {ancestorElementsByTag} from '#core/dom/query';
import {setStyle, setStyles} from '#core/dom/style';

import {Services} from '#service';

import {listen} from '#utils/event-helper';
import {user, userAssert} from '#utils/log';

import {getAdContainer} from '../../../src/ad-helper';

const TAG = 'amp-ad-ui';

const STICKY_AD_MAX_SIZE_LIMIT = 0.2;
const STICKY_AD_MAX_HEIGHT_LIMIT = 0.5;

const TOP_STICKY_AD_OFFSET_THRESHOLD = 50;

/**
 * Permissible sticky ad options.
 * @const @enum {string}
 */
const StickyAdPositions = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
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
      if (!this.element_.getAttribute(STICKY_AD_PROP)) {
        user().error(
          TAG,
          'amp-ad sticky is deprecating empty attribute value, please use <amp-ad sticky="bottom" instead'
        );
      }

      this.stickyAdPosition_ =
        this.element_.getAttribute(STICKY_AD_PROP) ||
        StickyAdPositions.BOTTOM_RIGHT;
      this.element_.setAttribute(STICKY_AD_PROP, this.stickyAdPosition_);

      if (!Object.values(StickyAdPositions).includes(this.stickyAdPosition_)) {
        user().error(TAG, `Invalid sticky ad type: ${this.stickyAdPosition_}`);
        this.stickyAdPosition_ = null;
      }
    }

    /**
     * Whether the close button has been rendered for a sticky ad unit.
     */
    this.closeButtonRendered_ = false;

    /**
     * For top sticky ads, we close the ads when scrolled to the top.
     * @private {!Function}
     */
    this.topStickyAdScrollListener_ = undefined;

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
   * Verify that the limits for sticky ads are not exceeded
   */
  validateStickyAd() {
    userAssert(
      this.doc_.querySelectorAll(
        'amp-sticky-ad.i-amphtml-built, amp-ad[sticky].i-amphtml-built'
      ).length <= 1,
      'At most one sticky ad can be loaded per page'
    );
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
      const doc = this.element_.getAmpDoc();
      setStyle(this.element_, 'visibility', 'visible');

      if (this.stickyAdPosition_ == StickyAdPositions.TOP) {
        this.topStickyAdScrollListener_ = Services.viewportForDoc(doc).onScroll(
          () => {
            // When the scroll position is close to the top, we hide the
            // top sticky ad in order not to have the ads overlap the
            // content.
            const scrollPos = doc.win./*OK*/ scrollY;
            setStyle(
              this.element_,
              'visibility',
              scrollPos > TOP_STICKY_AD_OFFSET_THRESHOLD ? 'visible' : 'hidden'
            );
          }
        );
        this.unlisteners_.push(this.topStickyAdScrollListener_);
      }

      Services.viewportForDoc(doc).addToFixedLayer(
        this.element_,
        /* forceTransfer */ true
      );

      this.adjustPadding();
      if (!this.closeButtonRendered_) {
        this.addCloseButton_();
        this.closeButtonRendered_ = true;
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
   * Adjust the padding-bottom when resized to prevent overlaying on top of content
   */
  adjustPadding() {
    if (
      this.stickyAdPosition_ == StickyAdPositions.BOTTOM ||
      this.stickyAdPosition_ == StickyAdPositions.BOTTOM_RIGHT
    ) {
      const borderBottom = this.element_./*OK*/ offsetHeight;
      Services.viewportForDoc(this.element_.getAmpDoc()).updatePaddingBottom(
        borderBottom
      );
    }
  }

  /**
   * Close the sticky ad
   */
  closeStickyAd_() {
    Services.vsyncFor(this.baseInstance_.win).mutate(() => {
      const viewport = Services.viewportForDoc(this.element_.getAmpDoc());
      viewport.removeFromFixedLayer(this.element);
      removeElement(this.element_);
      viewport.updatePaddingBottom(0);
    });

    if (this.topStickyAdScrollListener_) {
      this.topStickyAdScrollListener_();
    }
  }

  /**
   * The function that add a close button to sticky ad
   */
  addCloseButton_() {
    const closeButton = createElementWithAttributes(
      /** @type {!Document} */ (this.element_.ownerDocument),
      'button',
      {
        'aria-label':
          this.element_.getAttribute('data-close-button-aria-label') ||
          'Close this ad',
      }
    );

    this.unlisteners_.push(
      listen(closeButton, 'click', this.closeStickyAd_.bind(this))
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

    /** @type {!{[key: boolean]: number|undefined, number|undefined}} */
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
          this.setSize_(this.element_.querySelector('iframe'), height, width);
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
