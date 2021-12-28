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
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-ooyala-player';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpOoyalaPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /**@private {string} */
    this.embedCode_ = '';

    /**@private {string} */
    this.pCode_ = '';

    /**@private {string} */
    this.playerId_ = '';

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

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
      'https://player.ooyala.com',
      opt_onLayout
    );
  }

  /** @override */
  buildCallback() {
    const {element: el} = this;

    this.embedCode_ = userAssert(
      el.getAttribute('data-embedcode'),
      'The data-embedcode attribute is required for %s',
      el
    );

    this.pCode_ = userAssert(
      el.getAttribute('data-pcode'),
      'The data-pcode attribute is required for %s',
      el
    );

    this.playerId_ = userAssert(
      el.getAttribute('data-playerid'),
      'The data-playerid attribute is required for %s',
      el
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(el);
    Services.videoManagerForDoc(el).register(this);
  }

  /** @override */
  layoutCallback() {
    const {element: el} = this;

    let src = 'https://player.ooyala.com/iframe.html?platform=html5-priority';
    const playerVersion = el.getAttribute('data-playerversion') || '';
    if (playerVersion.toLowerCase() == 'v4') {
      src =
        'https://player.ooyala.com/static/v4/production/latest/' +
        'skin-plugin/amp_iframe.html?pcode=' +
        encodeURIComponent(this.pCode_);
      const configUrl = el.getAttribute('data-config');
      if (configUrl) {
        src += '&options[skin.config]=' + encodeURIComponent(configUrl);
      }
    }

    src +=
      '&ec=' +
      encodeURIComponent(this.embedCode_) +
      '&pbid=' +
      encodeURIComponent(this.playerId_);

    const iframe = createFrameFor(this, src);

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(this.win, 'message', (event) => {
      this.handleOoyalaMessage_(event);
    });

    const loaded = this.loadPromise(this.iframe_).then(() => {
      dispatchCustomEvent(el, VideoEvents_Enum.LOAD);
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

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  pauseCallback() {
    // Only send pauseVideo command if the player is playing. Otherwise
    // The player breaks if the user haven't played the video yet specially
    // on mobile.
    if (this.iframe_) {
      this.pause();
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleOoyalaMessage_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }
    const data = objOrParseJson(getData(event));
    if (data == null) {
      return; // We only process valid JSON.
    }
    redispatch(this.element, data['data'], {
      'playing': VideoEvents_Enum.PLAYING,
      'paused': VideoEvents_Enum.PAUSE,
      'muted': VideoEvents_Enum.MUTED,
      'unmuted': VideoEvents_Enum.UNMUTED,
    });
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
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  showControls() {}

  /** @override */
  hideControls() {}

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
  AMP.registerElement(TAG, AmpOoyalaPlayer);
});
