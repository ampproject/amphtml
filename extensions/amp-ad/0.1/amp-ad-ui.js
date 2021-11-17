import {Services} from '#service';
import {ancestorElementsByTag} from '#core/dom/query';

import {getAdContainer} from '../../../src/ad-helper';
import {setStyles} from '#core/dom/style';
import {AdFormatType} from './ad-format';
import {StickyAd} from './sticky-ad';
import {WebInterstitialyAd} from './web-interstitial-ad';
import {RegularAd} from './regular-ad';

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

    if (this.element_.hasAttribute('sticky')) {
      this.adFormatType_ = AdFormatType.STICKY;
      this.adFormatHandler = new StickyAd(baseInstance);
    } else if (this.element_.hasAttribute('interstitial')) {
      this.adFormatType_ = AdFormatType.WEB_INTERSTITIAL;
      this.adFormatHandler = new WebInterstitialyAd(baseInstance);
    } else {
      this.adFormatType_ = AdFormatType.REGULAR;
      this.adFormatHandler = new RegularAd(baseInstance);
    }

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
   * @return {AdFormatType}
   */
  getAdFormat() {
    return this.adFormatType_;
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
    if (!this.adFormatHandler.shouldAllowResizing(newWidth, newHeight)) {
      resizeInfo.success = false;
      return Promise.resolve(resizeInfo);
    }
    return this.baseInstance_
      .attemptChangeSize(newHeight, newWidth, event)
      .then(
        () => {
          this.setSize_(this.element_.querySelector('iframe'), height, width);
          this.adFormatHandler.onResize();
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
    this.adFormatHandler.cleanUp();
  }
}

// Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.
AMP.AmpAdUIHandler = AmpAdUIHandler;
