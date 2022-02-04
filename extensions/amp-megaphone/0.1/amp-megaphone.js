/**
 * @fileoverview Embeds a Megaphone podcast
 *
 * Example:
 * <code>
 * <amp-megaphone
 *   height=166
 *   data-episode="DEM6617440160"
 *   data-light="true"
 *   layout="fixed-height">
 * </amp-megaphone>
 */

import {removeElement} from '#core/dom';
import {applyFillContent, isLayoutSizeFixed} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {addParamsToUrl} from '../../../src/url';
import {setIsMediaComponent} from '../../../src/video-interface';

class AmpMegaphone extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {boolean} */
    this.isPlaylist_ = false;

    /** @private {string} */
    this.baseUrl_ = '';

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    // Pre-connects to the iframe source itself
    preconnect.url(ampdoc, this.baseUrl_, opt_onLayout);
    // Pre-connects to the megaphone static documents server (serves CSS and JS)
    preconnect.url(ampdoc, 'https://assets.megaphone.fm', opt_onLayout);
    // Pre-connects to the image assets server (for UI elements and playlist cover art)
    preconnect.url(ampdoc, 'https://megaphone.imgix.net', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeFixed(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);
    this.updateBaseUrl_();
  }

  /** @override */
  mutatedAttributesCallback() {
    this.updateBaseUrl_();
    if (this.iframe_) {
      this.iframe_.src = this.getIframeSrc_();
    }
  }

  /**@override*/
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');

    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('scrolling', 'no');

    iframe.src = this.getIframeSrc_();

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleMegaphoneMessages_.bind(this)
    );

    applyFillContent(iframe);
    this.element.appendChild(iframe);

    this.iframe_ = iframe;

    this.pauseHelper_.updatePlaying(true);

    return this.loadPromise(iframe);
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    this.pauseHelper_.updatePlaying(false);
    return true; // Call layoutCallback again.
  }

  /**
   * @return {string}
   * @private
   */
  getIframeSrc_() {
    this.updateBaseUrl_();

    const mediaid = userAssert(
      this.element.getAttribute('data-playlist') ||
        this.element.getAttribute('data-episode'),
      'data-playlist or data-episode is required for <amp-megaphone> %s',
      this.element
    );

    const hasLightTheme = this.element.hasAttribute('data-light');
    const hasSharing = this.element.hasAttribute('data-sharing');
    const episodes = this.element.getAttribute('data-episodes');
    const start = this.element.getAttribute('data-start');
    const hasTile = this.element.hasAttribute('data-tile');

    const queryParams = {
      'p': this.isPlaylist_ ? mediaid : undefined,
      'light': hasLightTheme || undefined,
      'sharing': hasSharing || undefined,
      'episodes': (this.isPlaylist_ && episodes) || undefined,
      'start': (!this.isPlaylist_ && start) || undefined,
      'tile': (!this.isPlaylist_ && hasTile) || undefined,
    };

    return addParamsToUrl(
      this.baseUrl_ + '/' + (this.isPlaylist_ ? '' : mediaid + '/'),
      queryParams
    );
  }

  /**
   * @private
   */
  updateBaseUrl_() {
    this.isPlaylist_ = this.element.hasAttribute('data-playlist');
    this.baseUrl_ = `https://${
      this.isPlaylist_ ? 'playlist' : 'player'
    }.megaphone.fm`;
  }

  /**
   * @param {!Event} event
   * @private
   * */
  handleMegaphoneMessages_(event) {
    if (
      event.origin != this.baseUrl_ ||
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
      return;
    }
    const data = isObject(eventData) ? eventData : tryParseJson(eventData);
    if (data['context'] == 'iframe.resize') {
      const height = data['height'];
      this.attemptChangeHeight(height).catch(() => {});
    }
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify({'method': 'pause'}),
        this.baseUrl_
      );

      // The player doesn't appear to respect `{method: pause}` message.
      this.iframe_.src = this.iframe_.src;
    }
  }
}

AMP.extension('amp-megaphone', '0.1', (AMP) => {
  AMP.registerElement('amp-megaphone', AmpMegaphone);
});
