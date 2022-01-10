import {Deferred} from '#core/data-structures/promise';
import {dispatchCustomEvent, removeElement} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {isLayoutSizeDefined} from '#core/dom/layout';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-wistia-player';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpWistiaPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // video player and video metadata
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://fast.wistia.net',
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    const mediaId = userAssert(
      element.getAttribute('data-media-hashed-id'),
      'The data-media-hashed-id attribute is required ' +
        'for <amp-wistia-player> %s',
      element
    );

    const iframe = createFrameFor(
      this,
      `https://fast.wistia.net/embed/iframe/${encodeURIComponent(mediaId)}`
    );

    iframe.setAttribute(
      'title',
      element.getAttribute('title') || 'Wistia Video Player'
    );
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allowtransparency', '');

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleWistiaMessage_.bind(this)
    );

    const loaded = this.loadPromise(this.iframe_).then(() => {
      // Tell Wistia Player we want to receive messages
      this.listenToFrame_();
      dispatchCustomEvent(element, VideoEvents_Enum.LOAD);
    });

    this.playerReadyResolver_(loaded);
    return loaded;
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
    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_) {
      this.pause();
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleWistiaMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://fast.wistia.net')) {
      return;
    }

    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);
    if (data == null) {
      return; // We only process valid JSON.
    }

    const {element} = this;

    if (data['method'] != '_trigger') {
      return;
    }

    const playerEvent = data['args'] ? data['args'][0] : undefined;

    if (playerEvent === 'statechange') {
      const state = data['args'] ? data['args'][1] : undefined;
      redispatch(element, state, {
        'playing': VideoEvents_Enum.PLAYING,
        'paused': VideoEvents_Enum.PAUSE,
        'ended': [VideoEvents_Enum.PAUSE, VideoEvents_Enum.ENDED],
      });
      return;
    }

    if (playerEvent == 'mutechange') {
      const isMuted = data['args'] ? data['args'][1] : undefined;
      dispatchCustomEvent(element, mutedOrUnmutedEvent(isMuted));
      return;
    }
  }

  /**
   * Sends 'listening' message to the Wistia iframe to listen for events.
   * @private
   */
  listenToFrame_() {
    this.sendCommand_('amp-listening');
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @private
   */
  sendCommand_(command) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(command, '*');
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('amp-play');
  }

  /** @override */
  pause() {
    this.sendCommand_('amp-pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('amp-mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('amp-unmute');
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
  showControls() {
    // Not supported
  }

  /** @override */
  hideControls() {
    // Not supported
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
    // This player's iframe internally implements a feature that accomplishes
    // essentially the same as AMP's `rotate-to-fullscreen`.
    return true;
  }

  /** @override */
  getCurrentTime() {
    // Not supported.
    return 0;
  }

  /** @override */
  getDuration() {
    // Not supported.
    return 1;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpWistiaPlayer);
});
