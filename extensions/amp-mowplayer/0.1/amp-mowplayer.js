import {Deferred} from '#core/data-structures/promise';
import {dispatchCustomEvent, removeElement} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';

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

const TAG = 'amp-mowplayer';

/**
 * @enum {number}
 * @private
 */
const PlayerStates = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpMowplayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.mediaid_ = '';

    /** @private {?boolean}  */
    this.muted_ = false;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /**
     * Prefix to embed URLs. Overridden on tests.
     * @private @const {string}
     */
    this.baseUrl_ = 'https://mowplayer.com/watch/';

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    preconnect.url(this.getAmpDoc(), this.getVideoIframeSrc_());
    // Host that mowplayer uses to serve JS needed by player.
    preconnect.url(this.getAmpDoc(), 'https://mowplayer.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.mediaid_ = userAssert(
      this.element.getAttribute('data-mediaid'),
      '/The data-mediaid attribute is required for <amp-mowplayer> %s',
      this.element
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /**
   * @return {string}
   * @private
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    return (this.videoIframeSrc_ =
      this.baseUrl_ + encodeURIComponent(this.mediaid_));
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    this.iframe_ = iframe;
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleMowMessage_.bind(this)
    );
    const loaded = this.loadPromise(this.iframe_).then(() => {
      // Tell mowplayer that we want to receive messages
      this.listenToFrame_();
      dispatchCustomEvent(this.element, VideoEvents_Enum.LOAD);
    });
    this.playerReadyResolver_(loaded);

    this.pauseHelper_.updatePlaying(true);

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

    this.pauseHelper_.updatePlaying(false);

    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.pause();
    }
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['data-mediaid'] == null) {
      return;
    }
    if (!this.iframe_) {
      return;
    }
    this.sendCommand_('loadVideoById', [this.mediaid_]);
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {Array=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify({
          'event': 'command',
          'func': command,
          'args': opt_args || '',
        });
        this.iframe_.contentWindow./*OK*/ postMessage(
          message,
          'https://mowplayer.com'
        );
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleMowMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://mowplayer.com')) {
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

    const eventType = data['event'];
    const info = data['info'] || {};

    const {element} = this;

    if (eventType === 'set_aspect_ratio') {
      this.attemptChangeHeight(info['new_height']).catch(() => {});
    }

    const playerState = info['playerState'];
    if (eventType == 'infoDelivery' && playerState != null) {
      redispatch(element, playerState.toString(), {
        [PlayerStates.PLAYING]: VideoEvents_Enum.PLAYING,
        [PlayerStates.PAUSED]: VideoEvents_Enum.PAUSE,
        // mowplayer does not fire pause and ended together.
        [PlayerStates.ENDED]: [VideoEvents_Enum.ENDED, VideoEvents_Enum.PAUSE],
      });
      return;
    }

    const muted = info['muted'];
    if (eventType == 'infoDelivery' && info && muted != null) {
      if (this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      dispatchCustomEvent(element, mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * Sends 'listening' message to the Mowplayer iframe to listen for events.
   * @private
   */
  listenToFrame_() {
    if (!this.iframe_) {
      return;
    }

    this.sendCommand_('listening', [
      'amp',
      window.location.href,
      window.location.origin,
      true,
    ]);
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
  play(unusedIsAutoplay) {
    this.sendCommand_('playVideo');
  }

  /** @override */
  pause() {
    this.sendCommand_('pauseVideo');
    // The player doesn't appear to respect "pauseVideo" message.
    const iframe = this.iframe_;
    if (iframe) {
      iframe.src = iframe.src;
    }
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unMute');
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /** @override */
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
    return true;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
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
  AMP.registerElement(TAG, AmpMowplayer);
});
