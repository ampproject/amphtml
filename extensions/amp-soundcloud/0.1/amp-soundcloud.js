/**
 * @fileoverview Embeds a Soundcloud clip
 *
 * Example:
 * <code>
 * <amp-soundcloud
 *   height=166
 *   data-trackid="243169232"
 *   data-color="ff5500"
 *   layout="fixed-height">
 * </amp-soundcloud>
 */

import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {setIsMediaComponent} from '../../../src/video-interface';

class AmpSoundcloud extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://api.soundcloud.com/',
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);
  }

  /**@override*/
  layoutCallback() {
    const height = this.element.getAttribute('height');
    const color = this.element.getAttribute('data-color');
    const visual = this.element.getAttribute('data-visual');
    const url =
      'https://api.soundcloud.com/' +
      (this.element.hasAttribute('data-trackid') ? 'tracks' : 'playlists') +
      '/';
    const mediaid = userAssert(
      this.element.getAttribute('data-trackid') ||
        this.element.getAttribute('data-playlistid'),
      'data-trackid or data-playlistid is required for <amp-soundcloud> %s',
      this.element
    );
    const secret = this.element.getAttribute('data-secret-token');

    const iframe = this.element.ownerDocument.createElement('iframe');

    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');

    let src =
      'https://w.soundcloud.com/player/?' +
      'url=' +
      encodeURIComponent(url + mediaid);
    if (secret) {
      // It's very important the entire thing is encoded, since it's part of
      // the `url` query param added above.
      src += encodeURIComponent('?secret_token=' + secret);
    }
    if (visual === 'true') {
      src += '&visual=true';
    } else if (color) {
      src += '&color=' + encodeURIComponent(color);
    }

    iframe.src = src;

    applyFillContent(iframe);
    iframe.height = height;
    this.element.appendChild(iframe);

    this.iframe_ = iframe;

    this.pauseHelper_.updatePlaying(true);

    return this.loadPromise(iframe);
  }

  /**@override*/
  unlayoutCallback() {
    const iframe = this.iframe_;
    if (iframe) {
      this.element.removeChild(iframe);
      this.iframe_ = null;
    }
    this.pauseHelper_.updatePlaying(false);
    return true;
  }

  /** @override */
  unlayoutCallback() {
    const iframe = this.iframe_;
    if (iframe) {
      this.element.removeChild(iframe);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify({'method': 'pause'}),
        'https://w.soundcloud.com'
      );
    }
  }
}

AMP.extension('amp-soundcloud', '0.1', (AMP) => {
  AMP.registerElement('amp-soundcloud', AmpSoundcloud);
});
