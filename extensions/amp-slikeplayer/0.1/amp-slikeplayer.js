import {Deferred} from '#core/data-structures/promise';
import {dispatchCustomEvent} from '#core/dom';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {once} from '#core/types/function';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-slikeplayer';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */

/**
 @enum {string}
 * @private
 */

const CleoEvent = {
  'ready': VideoEvents_Enum.LOAD,
  'play': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'complete': VideoEvents_Enum.ENDED,
  'visible': VideoEvents_Enum.VISIBILITY,
  'seeked': VideoEvents_Enum.SEEKED,
  'seeking': VideoEvents_Enum.SEEKING,
  'adStart': VideoEvents_Enum.AD_START,
  'adEnd': VideoEvents_Enum.AD_END,
  'adPlay': VideoEvents_Enum.AD_PLAY,
  'adPause': VideoEvents_Enum.AD_PAUSE,
  'adSkip': VideoEvents_Enum.AD_SKIP,
  'adComplete': VideoEvents_Enum.AD_END,
  'adError': VideoEvents_Enum.AD_ERROR,
  'adLoaded': VideoEvents_Enum.AD_LOADED,
  'adImpression': VideoEvents_Enum.AD_IMPRESSION,
  'adClick': VideoEvents_Enum.AD_CLICK,
};

export class AmpSlikeplayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.apikey_ = '';

    /** @private {string} */
    this.videoid_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?function()} */
    this.unlistenFrame_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?function(Element)} */
    this.playerReadyResolver_ = null;

    /** @private {function(Object)} */
    this.onReadyOnce_ = once((detail) => this.onReady_(detail));

    /** @private {string} */
    this.config_ = null;

    /** @private {string} */
    this.poster_ = '';

    /** @private {string} */
    this.baseUrl_ = 'https://tvid.in/player/amp.html';

    /** @private {number} */
    this.duration_ = 1;

    /** @private {number} */
    this.currentTime_ = 0;

    /** @private {function()} */
    this.onMessage_ = this.onMessage_.bind(this);

    /** @private {?function()} */
    this.unlistenViewport_ = null;

    /** @private {number} 0..1 */
    this.viewportVisibleThreshold_ = 0;
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    const deferred = new Deferred();

    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    this.apikey_ = userAssert(
      element.getAttribute('data-apikey'),
      'The data-apikey attribute is required for <amp-slikeplayer> %s',
      element
    );

    this.videoid_ = userAssert(
      element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-slikeplayer> %s',
      element
    );

    this.baseUrl_ = element.getAttribute('data-iframe-src') || this.baseUrl_;
    this.config_ = element.getAttribute('data-config') || '';
    this.poster_ = element.getAttribute('poster') || '';

    // Read optional viewport visibility threshold from data-config
    if (this.config_) {
      try {
        const params = new URLSearchParams(this.config_);
        if (params.has('viewport')) {
          let threshold = parseFloat(
            /** @type {string} */ (params.get('viewport'))
          );
          if (isFinite(threshold)) {
            if (threshold > 1) {
              threshold = threshold / 100; // percent -> ratio
            }
            this.viewportVisibleThreshold_ = Math.max(
              0,
              Math.min(1, threshold)
            );
          }
        }
      } catch {}
    }

    installVideoManagerForDoc(element);
    const videoManager = Services.videoManagerForDoc(element);
    videoManager.register(this);
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.poster_) {
      return;
    }
    const placeholder = this.win.document.createElement('amp-img');
    const ariaLabel = this.element.getAttribute('aria-label');
    if (ariaLabel) {
      placeholder.setAttribute('aria-label', ariaLabel);
    }
    const src = this.poster_;
    placeholder.setAttribute('src', src);
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    if (placeholder.hasAttribute('aria-label')) {
      placeholder.setAttribute(
        'alt',
        'Loading video - ' + placeholder.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('alt', 'Loading video');
    }
    return placeholder;
  }

  /** @override */
  layoutCallback() {
    let src = `${this.baseUrl_}#apikey=${this.apikey_}&videoid=${this.videoid_}&baseurl=${this.win.location.origin}`;

    if (this.config_) {
      src = `${this.baseUrl_}#apikey=${this.apikey_}&videoid=${this.videoid_}&${this.config_}&baseurl=${this.win.location.origin}`;
    }

    const frame = disableScrollingOnIframe(
      createFrameFor(this, src, this.element.id)
    );

    addUnsafeAllowAutoplay(frame);
    this.unlistenFrame_ = listen(this.win, 'message', this.onMessage_);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (frame);

    // Observe visibility to auto play/pause when entering/leaving viewport
    const threshold = this.viewportVisibleThreshold_;
    if (threshold > 0) {
      this.unlistenViewport_ = observeIntersections(
        this.element,
        (entry) => {
          const ratio =
            entry && typeof entry.intersectionRatio === 'number'
              ? entry.intersectionRatio
              : entry && entry.isIntersecting
                ? 1
                : 0;
          this.viewportCallback(ratio >= threshold);
        },
        {threshold}
      );
    }

    return this.loadPromise(this.iframe_);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  viewportCallback(inViewport) {
    this.handleViewportPlayPause(inViewport);
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @private */
  onReady_() {
    const {element} = this;
    this.playerReadyResolver_(this.iframe_);
    dispatchCustomEvent(element, VideoEvents_Enum.LOAD);
  }

  /**
   * @param {string} messageEvent
   * @private
   */
  onMessage_(messageEvent) {
    if (
      !this.iframe_ ||
      !messageEvent ||
      messageEvent.source != this.iframe_.contentWindow
    ) {
      return;
    }

    const messageData = getData(messageEvent);
    if (!isJsonOrObj(messageData)) {
      return;
    }

    const data = objOrParseJson(messageData);
    const event = data['event'];
    const detail = data['detail'];
    if (event === 'ready') {
      detail && this.onReadyOnce_(detail);
      return;
    }
    const {element} = this;
    if (redispatch(element, event, CleoEvent)) {
      return;
    }
    if (detail && event) {
      switch (event) {
        case 'fullscreen':
          break;
        case 'meta':
          break;
        case 'mute':
          break;
        case 'playedRanges':
          break;
        case 'time':
          const {currentTime} = detail;
          this.currentTime_ = currentTime;
          break;
        case 'adTime':
          const {position} = detail;
          this.currentTime_ = position;
          break;
        case 'seeked':
        case 'seeking':
          // Seek events are handled by the redispatch above
          break;
        case 'adStart':
        case 'adEnd':
        case 'adPlay':
        case 'adPause':
        case 'adSkip':
        case 'adComplete':
        case 'adError':
        case 'adLoaded':
        case 'adImpression':
        case 'adClick':
          // Ad events are handled by the redispatch above
          break;
        default:
          break;
      }
    }
  }
  /**
   * @override
   */
  play() {
    this.postMessage_('play', '');
  }

  /**
   * @override
   */
  pause() {
    this.postMessage_('pause', '');
  }

  /**
   * Handle auto play/pause based on viewport visibility.
   *
   * @param {boolean} inViewport
   */
  handleViewportPlayPause(inViewport) {
    this.postMessage_('handleViewport', inViewport);
  }

  /**
   * @override
   */
  mute() {
    this.postMessage_('mute', '');
  }

  /**
   * @override
   */
  unmute() {
    this.postMessage_('unmute', '');
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  getMetadata() {
    //Not Implemented
  }

  /** @override */
  getCurrentTime() {
    // Not supported.
    return this.currentTime_ || 0;
  }

  /** @override */
  getDuration() {
    return this.duration_ || 1;
  }

  /** @override */
  getPlayedRanges() {
    return [];
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.postMessage_('seekTo', unusedTimeSeconds);
  }
  /**
   * @param {string} method
   * @param {string} [optParams]
   * @private
   */
  postMessage_(method, optParams) {
    this.playerReadyPromise_.then(() => {
      if (!this.iframe_ || !this.iframe_.contentWindow) {
        return;
      }
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify({
          'method': method,
          'optParams': optParams,
        }),
        '*'
      );
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlistenFrame_) {
      this.unlistenFrame_();
      this.unlistenFrame_ = null;
    }
    if (this.iframe_) {
      this.iframe_.src = 'about:blank';
      this.iframe_ = null;
    }
    if (this.unlistenViewport_) {
      this.unlistenViewport_();
      this.unlistenViewport_ = null;
    }
    return true;
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpSlikeplayer);
});
