/* eslint-disable @typescript-eslint/no-unused-vars */

import {Deferred} from '#core/data-structures/promise';
import {removeElement} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {
  Layout_Enum,
  applyFillContent,
  isLayoutSizeDefined,
} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {getIframe} from '../../../src/3p-frame';
import {redispatch} from '../../../src/iframe-video';
import {
  VideoAttributes_Enum,
  VideoEvents_Enum,
} from '../../../src/video-interface';

const TAG = 'amp-viqeo-player';

const EVENTS = {
  'ready': VideoEvents_Enum.LOAD,
  'play': VideoEvents_Enum.PLAYING,
  'pause': VideoEvents_Enum.PAUSE,
  'mute': VideoEvents_Enum.MUTED,
  'unmute': VideoEvents_Enum.UNMUTED,
  'end': VideoEvents_Enum.ENDED,
  'startAdvert': VideoEvents_Enum.AD_START,
  'endAdvert': VideoEvents_Enum.AD_END,
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpViqeoPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {boolean} */
    this.hasAutoplay_ = false;

    /** @private {string} */
    this.videoId_ = '';

    /** @private {{[key: string]: (number|Array)}} */
    this.meta_ = {};
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://api.viqeo.tv',
      opt_onLayout
    );
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://cdn.viqeo.tv',
      opt_onLayout
    );
  }

  /**
   * @param {!Layout_Enum} layout
   * @return {boolean}
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.videoId_ = userAssert(
      this.element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-viqeo-player> %s',
      this.element
    );

    userAssert(
      this.element.getAttribute('data-profileid'),
      'The data-profileid attribute is required for <amp-viqeo-player> %s',
      this.element
    );

    this.hasAutoplay_ = this.element.hasAttribute(
      VideoAttributes_Enum.AUTOPLAY
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
    this.playerReadyResolver_(this.iframe_);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(
      this.win,
      this.element,
      'viqeoplayer',
      {
        'autoplay': this.hasAutoplay_,
      },
      {
        allowFullscreen: true,
      }
    );
    iframe.title = this.element.title || 'Viqeo video';

    // required to display the user gesture in the iframe
    iframe.setAttribute('allow', 'autoplay');

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleViqeoMessages_.bind(this)
    );

    return this.mutateElement(() => {
      this.element.appendChild(iframe);
      this.iframe_ = iframe;
      applyFillContent(iframe);
    }).then(() => {
      return this.playerReadyPromise_;
    });
  }

  /**
   * @param {!Event|{data: !JsonObject}} event
   * @return {?JsonObject|string|undefined}
   * @private
   * */
  handleViqeoMessages_(event) {
    const eventData = getData(event);
    if (
      !eventData ||
      event.source !== (this.iframe_ && this.iframe_.contentWindow) ||
      eventData['source'] !== 'ViqeoPlayer'
    ) {
      return;
    }
    const action = eventData['action'];
    if (redispatch(this.element, action, EVENTS)) {
      return;
    }
    if (action.startsWith('update')) {
      const key = action.replace(
        /^update([A-Z])(.*)$/,
        (_, c, rest) => c.toLowerCase() + rest
      );
      this.meta_[key] = eventData['value'];
    }
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

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.element.ownerDocument.createElement('img');
    propagateAttributes(['aria-label'], this.element, placeholder);
    applyFillContent(placeholder);
    placeholder.setAttribute('loading', 'lazy');
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
    placeholder.setAttribute(
      'src',
      `https://cdn.viqeo.tv/preview/${encodeURIComponent(this.videoId_)}.jpg`
    );

    return placeholder;
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
  play() {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unmute');
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /**
   * @override
   */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /**
   * @override
   */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    fullscreenExit(dev().assertElement(this.iframe_));
  }

  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    return /** @type {number} */ (this.meta_['currentTime'] || 0);
  }

  /** @override */
  getDuration() {
    return /** @type {number} */ (this.meta_['duration'] || 1);
  }

  /** @override */
  getPlayedRanges() {
    return /** @type {!Array<!Array<number>>} */ (
      this.meta_['playedRanges'] || []
    );
  }

  /**
   * Sends a command to the player
   * @param {string|JsonObject} command
   * @private
   */
  sendCommand_(command) {
    if (!this.iframe_) {
      return;
    }
    const {contentWindow} = this.iframe_;
    if (!contentWindow) {
      return;
    }

    if (typeof command === 'string') {
      command = /** @type {JsonObject} */ ({
        action: command,
      });
    }
    contentWindow./*OK*/ postMessage(command, '*');
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpViqeoPlayer);
});

export default AmpViqeoPlayer;
