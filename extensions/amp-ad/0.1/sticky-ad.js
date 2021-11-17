import {AdFormatInterface} from './ad-format-interface';
import {Services} from '#service';
import {user, userAssert} from '#utils/log';
import {setStyle} from '#core/dom/style';
import {createElementWithAttributes, removeElement} from '#core/dom';
import {dict} from '#core/types/object';
import {listen} from '#utils/event-helper';

const TAG = 'amp-ad/sticky-ad';

const STICKY_AD_PROP = 'sticky';

const STICKY_AD_MAX_SIZE_LIMIT = 0.2;
const STICKY_AD_MAX_HEIGHT_LIMIT = 0.5;

const TOP_STICKY_AD_CLOSE_THRESHOLD = 50;
const TOP_STICKY_AD_TRIGGER_THRESHOLD = 200;

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

export class StickyAd {
  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private @const {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;

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
     * For top sticky ads, we waited until scrolling down before activating
     * the closing ads listener.
     * @private {boolean}
     */
    this.topStickyAdCloserAcitve_ = false;

    /**
     * Unlisteners for cleaning up.
     */
    this.unlisteners_ = [];
  }

  /** @override */
  validate() {
    userAssert(
      this.baseInstance_.win.document.querySelectorAll(
        'amp-sticky-ad.i-amphtml-built, amp-ad[sticky].i-amphtml-built'
      ).length <= 1,
      'At most one sticky ad can be loaded per page'
    );
  }

  /** @override */
  shouldForceLayout() {
    return true;
  }

  /** @override */
  getScrollPromise() {
    return new Promise((resolve) => {
      const unlisten = Services.viewportForDoc(
        this.element_.getAmpDoc()
      ).onScroll(() => {
        resolve();
        unlisten();
      });
    });
  }

  /** @override */
  onAdPromiseResolved() {
    setStyle(this.element_, 'visibility', 'visible');

    if (this.stickyAdPosition_ == StickyAdPositions.TOP) {
      const doc = this.element_.getAmpDoc();

      // Let the top sticky ad be below the viewer top.
      const paddingTop = Services.viewportForDoc(doc).getPaddingTop();
      setStyle(this.element_, 'top', `${paddingTop}px`);

      this.topStickyAdScrollListener_ = Services.viewportForDoc(doc).onScroll(
        () => {
          const scrollPos = doc.win./*OK*/ scrollY;
          if (scrollPos > TOP_STICKY_AD_TRIGGER_THRESHOLD) {
            this.topStickyAdCloserAcitve_ = true;
          }

          // When the scroll position is close to the top, we close the
          // top sticky ad in order not to have the ads overlap the
          // content.
          if (
            this.topStickyAdCloserAcitve_ &&
            scrollPos < TOP_STICKY_AD_CLOSE_THRESHOLD
          ) {
            this.closeStickyAd_();
          }
        }
      );
      this.unlisteners_.push(this.topStickyAdScrollListener_);
    }

    this.onResize();
    if (!this.closeButtonRendered_) {
      this.addCloseButton_();
      this.closeButtonRendered_ = true;
    }
  }

  /** @override */
  shouldAllowResizing(newWidth, newHeight) {
    const viewport = this.baseInstance_.getViewport();
    return (
      newHeight * newWidth <=
        STICKY_AD_MAX_SIZE_LIMIT * viewport.getHeight() * viewport.getWidth() &&
      newHeight <= STICKY_AD_MAX_HEIGHT_LIMIT * viewport.getHeight()
    );
  }

  /** @override */
  onResize() {
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
      viewport.removeFromFixedLayer(this.element_);
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
      dict({
        'aria-label':
          this.element_.getAttribute('data-close-button-aria-label') ||
          'Close this ad',
      })
    );

    this.unlisteners_.push(
      listen(closeButton, 'click', this.closeStickyAd_.bind(this))
    );

    closeButton.classList.add('amp-ad-close-button');
    this.element_.appendChild(closeButton);
  }

  /** @override */
  cleanUp() {
    this.unlisteners_.forEach((unlistener) => unlistener());
    this.unlisteners_.length = 0;
  }
}
