import {AdFormatInterface} from './ad-format-interface';
import {userAssert} from '#utils/log';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {createElementWithAttributes} from '#core/dom';
import {Services} from '#service';
import {dict} from '#core/types/object';
import {listen} from '#utils/event-helper';
import {setStyle} from '#core/dom/style';

const WEB_INTERSTITIAL_FREQ_CAPPED_STORAGE_KEY = 'interstitial-ad-freq-cap';
const WEB_INTERSTITIAL_FREQ_CAP_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days

export class WebInterstitialyAd {
  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  constructor(baseInstance) {
    /** @private {!Element} */
    this.element_ = baseInstance.element;

    /** @private @const {!Window} */
    this.win_ = baseInstance.win;

    /**
     * Whether the ads info has been received.
     */
    this.rendered_ = false;

    /**
     * Whether the web interstitial ads has been resized.
     */
    this.resized_ = false;

    /**
     * The next URL to navigat to.
     */
    this.nextUrl_ = undefined;

    /**
     * Unlisteners for cleaning up.
     */
    this.unlisteners_ = [];
  }

  /** @override */
  validate() {
    userAssert(
      this.win_.document.querySelectorAll(
        'amp-ad[interstitial].i-amphtml-built'
      ).length <= 1,
      'At most one interstitial ad can be loaded per page'
    );
  }

  /** @override */
  shouldForceLayout() {
    return true;
  }

  /** @override */
  onAdPromiseResolved() {
    const {canonicalUrl} = Services.documentInfoForDoc(
      this.element_.getAmpDoc()
    );
    let canonicalHost = undefined;
    try {
      canonicalHost = new URL(canonicalUrl).hostname;
    } catch (e) {}
    closestAncestorElementBySelector(this.element_, 'BODY')
      .querySelectorAll('a:not([amp-interstitial-opt-out])')
      .forEach((a) => {
        // We allow either same domain links or links to the canonical host.
        if (
          a.hostname == this.win_.location.hostname ||
          a.hostname == canonicalHost
        ) {
          a.addEventListener(
            'click',
            this.interstitialLinkClickCallback_.bind(this)
          );
        }
      });
  }

  /** @override */
  shouldAllowResizing(unusedNewWidth, unusedNewHeight) {
    return true;
  }

  /** @override */
  onResize() {
    this.resized_ = true;
  }

  /** @override */
  onRenderStart(info) {
    // Currently, only creatives with close button are eligible.
    if (info.data['interstitialCloseBtn']) {
      this.rendered_ = true;

      // Handle full screen ad
      if (info.data['height'] == -1 && info.data['width'] == -1) {
        this.element_.classList.add('i-amphtml-interstitial-ad-fullscreen');
      }

      // Add the UI elements for the interstitial ad.
      const header = createElementWithAttributes(
        /** @type {!Document} */ (this.element_.ownerDocument),
        'div'
      );
      header.classList.add('amp-ad-interstitial-wrapper');
      this.unlisteners_.push(
        listen(header, 'click', (e) => e.stopPropagation())
      );

      const title = createElementWithAttributes(
        /** @type {!Document} */ (this.element_.ownerDocument),
        'div',
        dict()
      );
      title.classList.add('interstitial-title');

      header.appendChild(title);
      this.element_.appendChild(header);
    }
  }

  /**
   * Callback for link clicked
   * @param {*} e
   */
  interstitialLinkClickCallback_(e) {
    if (!this.rendered_ || !this.resized_) {
      return;
    }

    setStyle(this.element_, 'visibility', 'visible');
    const overlay = createElementWithAttributes(
      /** @type {!Document} */ (this.element_.ownerDocument),
      'amp-ad-interstitial-overlay',
      dict()
    );
    this.unlisteners_.push(
      listen(overlay, 'click', this.onAdNavigate.bind(this))
    );
    this.element_.ownerDocument.body.insertBefore(overlay, null);
    this.nextUrl_ = e.target.href;

    const doc = this.element_.getAmpDoc();
    Services.preconnectFor(this.win_).preload(doc, this.nextUrl_);

    Services.storageForDoc(doc).then((storage) =>
      storage.set(WEB_INTERSTITIAL_FREQ_CAPPED_STORAGE_KEY, true, false)
    );
    e.preventDefault();
  }

  /**
   * Returns a promise indicating whether the interstitial ads should be frequency capped.
   * @return {Promise<?boolean>}
   */
  getIsFrequencyCappedPromise() {
    return Services.storageForDoc(this.element_.getAmpDoc()).then((storage) =>
      storage.get(
        WEB_INTERSTITIAL_FREQ_CAPPED_STORAGE_KEY,
        WEB_INTERSTITIAL_FREQ_CAP_PERIOD
      )
    );
  }

  /**
   * Called when the interstitial ads is requested to be closed.
   */
  onAdNavigate() {
    this.win_.location.href = this.nextUrl_;
  }

  /** @override */
  getScrollPromise() {
    return null;
  }

  /** @override */
  cleanUp() {
    this.unlisteners_.forEach((unlistener) => unlistener());
    this.unlisteners_.length = 0;
  }
}
