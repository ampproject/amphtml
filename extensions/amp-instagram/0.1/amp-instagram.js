/**
 * @fileoverview Embeds an instagram photo. The data-shortcode attribute can be
 * easily copied from a normal instagram URL. Example: <code> <amp-instagram
 * data-shortcode="fBwFP" data-captioned data-default-framing alt="Fastest page
 * in the west." width="320" height="392" layout="responsive"> </amp-instagram>
 * </code>
 *
 * For responsive embedding the width and height can be left unchanged from the
 * example above and should produce the correct aspect ratio. amp-instagram will
 * attempt to resize on load based on the height reported by the embedded frame.
 * If captions are specified (data-captioned) then a resize will be requested
 * every time due to the fact that it's not possible to know the height of the
 * caption in advance.
 *
 * If captions are included it is stringly reccomended that an overflow element
 * is also included.  See description of overflow in amp-iframe.
 *
 * If data-default-framing is present will apply the default instagram frame
 * style without changing the layout/size.
 */

import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {setStyle} from '#core/dom/style';
import {isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-instagram-0.1.css';

export class AmpInstagram extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {string} */
    this.shortcode_ = '';

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {string}  */
    this.captioned_ = '';

    /**
     * @private {?Promise}
     * @visibleForTesting
     */
    this.iframePromise_ = null;
  }
  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // See
    // https://instagram.com/developer/embedding/?hl=en
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://www.instagram.com',
      opt_onLayout
    );
    // Host instagram used for image serving. While the host name is
    // funky this appears to be stable in the post-domain sharding era.
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://instagram.fsnc1-1.fna.fbcdn.net',
      opt_onLayout
    );
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    this.shortcode_ = userAssert(
      this.element.getAttribute('data-shortcode') ||
        this.element.getAttribute('shortcode'),
      'The data-shortcode attribute is required for <amp-instagram> %s',
      this.element
    );
    this.captioned_ = this.element.hasAttribute('data-captioned')
      ? 'captioned/'
      : '';
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleInstagramMessages_.bind(this)
    );

    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    //Add title to the iframe for better accessibility.
    iframe.setAttribute(
      'title',
      'Instagram: ' + this.element.getAttribute('alt')
    );
    iframe.src =
      'https://www.instagram.com/p/' +
      encodeURIComponent(this.shortcode_) +
      '/embed/' +
      this.captioned_ +
      '?cr=1&v=12';
    applyFillContent(iframe);
    this.element.appendChild(iframe);
    setStyle(iframe, 'opacity', 0);
    return (this.iframePromise_ = this.loadPromise(iframe).then(() => {
      this.getVsync().mutate(() => {
        setStyle(iframe, 'opacity', 1);
      });
    }));
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleInstagramMessages_(event) {
    if (
      event.origin != 'https://www.instagram.com' ||
      event.source != this.iframe_.contentWindow
    ) {
      return;
    }
    const eventData = getData(event);
    if (
      !eventData ||
      !(
        isObject(eventData) || /** @type {string} */ (eventData).startsWith('{')
      )
    ) {
      return; // Doesn't look like JSON.
    }
    const data = isObject(eventData) ? eventData : tryParseJson(eventData);
    if (data === undefined) {
      return; // We only process valid JSON.
    }
    if (data['type'] == 'MEASURE' && data['details']) {
      const height = data['details']['height'];
      this.getVsync().measure(() => {
        if (this.iframe_ && this.iframe_./*OK*/ offsetHeight !== height) {
          this.forceChangeHeight(height);
        }
      });
    }
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
      this.iframePromise_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true; // Call layoutCallback again.
  }
}

AMP.extension('amp-instagram', '0.1', (AMP) => {
  AMP.registerElement('amp-instagram', AmpInstagram, CSS);
});
