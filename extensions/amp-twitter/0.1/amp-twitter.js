import {MessageType_Enum} from '#core/3p-frame-messaging';
import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';

const TYPE = 'twitter';

class AmpTwitter extends AMP.BaseElement {
  /** @override  */
  static createLoaderLogoCallback(element) {
    const html = htmlFor(element);
    return {
      color: '#1DA1F2',
      content: html`
        <svg viewBox="0 0 72 72">
          <path
            fill="currentColor"
            d="M32.29,44.13c7.55,0,11.67-6.25,11.67-11.67c0-0.18,0-0.35-0.01-0.53c0.8-0.58,1.5-1.3,2.05-2.12
    c-0.74,0.33-1.53,0.55-2.36,0.65c0.85-0.51,1.5-1.31,1.8-2.27c-0.79,0.47-1.67,0.81-2.61,1c-0.75-0.8-1.82-1.3-3-1.3
    c-2.27,0-4.1,1.84-4.1,4.1c0,0.32,0.04,0.64,0.11,0.94c-3.41-0.17-6.43-1.8-8.46-4.29c-0.35,0.61-0.56,1.31-0.56,2.06
    c0,1.42,0.72,2.68,1.83,3.42c-0.67-0.02-1.31-0.21-1.86-0.51c0,0.02,0,0.03,0,0.05c0,1.99,1.41,3.65,3.29,4.02
    c-0.34,0.09-0.71,0.14-1.08,0.14c-0.26,0-0.52-0.03-0.77-0.07c0.52,1.63,2.04,2.82,3.83,2.85c-1.4,1.1-3.17,1.76-5.1,1.76
    c-0.33,0-0.66-0.02-0.98-0.06C27.82,43.45,29.97,44.13,32.29,44.13"
          ></path>
        </svg>
      `,
    };
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Element} */
    this.userPlaceholder_ = null;
  }

  /**
   * @override
   */
  buildCallback() {
    this.userPlaceholder_ = this.getPlaceholder();
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    preloadBootstrap(this.win, TYPE, ampdoc, preconnect);
    // Hosts the script that renders tweets.
    preconnect.preload(
      ampdoc,
      'https://platform.twitter.com/widgets.js',
      'script'
    );
    // This domain serves the actual tweets as JSONP.
    preconnect.url(ampdoc, 'https://syndication.twitter.com', opt_onLayout);
    // All images
    preconnect.url(ampdoc, 'https://pbs.twimg.com', opt_onLayout);
    preconnect.url(ampdoc, 'https://cdn.syndication.twimg.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  firstLayoutCompleted() {
    // Do not hide the placeholder.
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, TYPE, null, {
      allowFullscreen: true,
    });
    iframe.title = this.element.title || 'Twitter';
    applyFillContent(iframe);
    this.updateForLoadingState_();
    listenFor(
      iframe,
      MessageType_Enum.EMBED_SIZE,
      (data) => {
        this.updateForSuccessState_(data['height']);
      },
      /* opt_is3P */ true
    );
    listenFor(
      iframe,
      MessageType_Enum.NO_CONTENT,
      () => {
        this.updateForFailureState_();
      },
      /* opt_is3P */ true
    );
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * Updates when starting to load a tweet.
   * @private
   */
  updateForLoadingState_() {
    let height;
    this.measureMutateElement(
      () => {
        height = this.element./*OK*/ getBoundingClientRect().height;
      },
      () => {
        // Set an explicit height so we can animate it.
        this.forceChangeHeight(height);
      }
    );
  }

  /**
   * Updates when the tweet has successfully rendered.
   * @param {number} height The height of the rendered tweet.
   * @private
   */
  updateForSuccessState_(height) {
    this.mutateElement(() => {
      this.toggleLoading(false);
      if (this.userPlaceholder_) {
        this.togglePlaceholder(false);
      }
      this.forceChangeHeight(height);
    });
  }

  /**
   * Updates when the tweet failed to load. This uses the fallback
   * provided if available. If not, it uses the user specified placeholder.
   * @private
   */
  updateForFailureState_() {
    const fallback = this.getFallback();
    const content = fallback || this.userPlaceholder_;

    this.mutateElement(() => {
      this.toggleLoading(false);
      if (fallback) {
        this.togglePlaceholder(false);
        this.toggleFallback(true);
      }

      if (content) {
        this.forceChangeHeight(content./*OK*/ offsetHeight);
      }
    });
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (this.iframe_ && mutations['data-tweetid'] != null) {
      this.unlayoutCallback();
      this.toggleLoading(true, /* force */ true);
      this.layoutCallback();
    }
  }
}

AMP.extension('amp-twitter', '0.1', (AMP) => {
  AMP.registerElement('amp-twitter', AmpTwitter);
});
