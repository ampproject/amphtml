import {
  DailymotionEvents,
  getDailymotionIframeSrc,
  makeDailymotionMessage,
} from '#bento/apis/dailymotion-api';

import {Deferred} from '#core/data-structures/promise';
import {dispatchCustomEvent, getDataParamsFromAttributes} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {isLayoutSizeDefined} from '#core/dom/layout';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, devAssert, userAssert} from '#utils/log';

import {
  createFrameFor,
  mutedOrUnmutedEvent,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-dailymotion';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpDailymotion extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {string} */
    this.playerState_ = DailymotionEvents.UNSTARTED;

    /** @private {?string}  */
    this.videoid_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {boolean}  */
    this.muted_ = false;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Promise} */
    this.startedBufferingPromise_ = null;

    /** @private {?Function} */
    this.startedBufferingResolver_ = null;

    /** @private {boolean} */
    this.isFullscreen_ = false;

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
      'https://www.dailymotion.com',
      opt_onLayout
    );
    // Host that Dailymotion uses to serve JS needed by player.
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://static1.dmcdn.net',
      opt_onLayout
    );
  }

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    // Dailymotion videos are always interactive. There is no Dailymotion param
    // that makes the video non-interactive. Even controls=false will not
    // prevent user from pausing or resuming the video.
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.videoid_ = userAssert(
      this.element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-dailymotion> %s',
      this.element
    );

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
    const readyDeferred = new Deferred();
    this.playerReadyPromise_ = readyDeferred.promise;
    this.playerReadyResolver_ = readyDeferred.resolve;

    const bufferingDeferred = new Deferred();
    this.startedBufferingPromise_ = bufferingDeferred.promise;
    this.startedBufferingResolver_ = bufferingDeferred.resolve;
  }

  /** @override */
  layoutCallback() {
    devAssert(this.videoid_);

    this.iframe_ = createFrameFor(this, this.getIframeSrc_());

    listen(this.win, 'message', this.handleEvents_.bind(this));

    return this.loadPromise(this.iframe_);
  }

  /** @override */
  unlayoutCallback() {
    const iframe = this.iframe_;
    if (iframe) {
      this.element.removeChild(iframe);
      this.iframe_ = null;
    }
    this.pauseHelper_.updatePlaying(false);
    return true;
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleEvents_(event) {
    if (!originMatches(event, this.iframe_, 'https://www.dailymotion.com')) {
      return;
    }
    const eventData = getData(event);
    if (!eventData || !event.type || event.type != 'message') {
      return; // Event empty
    }
    const data = parseQueryString(/** @type {string} */ (eventData));
    if (data === undefined) {
      return; // The message isn't valid
    }

    redispatch(this.element, data['event'], {
      [DailymotionEvents.API_READY]: VideoEvents_Enum.LOAD,
      [DailymotionEvents.END]: [VideoEvents_Enum.ENDED, VideoEvents_Enum.PAUSE],
      [DailymotionEvents.PAUSE]: VideoEvents_Enum.PAUSE,
      [DailymotionEvents.PLAY]: VideoEvents_Enum.PLAYING,
    });

    switch (data['event']) {
      case DailymotionEvents.API_READY:
        this.playerReadyResolver_(true);
        break;

      case DailymotionEvents.PLAY:
        this.playerState_ = data['event'];
        this.pauseHelper_.updatePlaying(true);
        break;

      case DailymotionEvents.PAUSE:
        this.playerState_ = data['event'];
        this.pauseHelper_.updatePlaying(false);
        break;

      case DailymotionEvents.END:
        this.playerState_ = DailymotionEvents.PAUSE;
        this.pauseHelper_.updatePlaying(false);
        break;

      case DailymotionEvents.VOLUMECHANGE:
        const isMuted = data['volume'] == 0 || data['muted'] == 'true';
        if (
          this.playerState_ == DailymotionEvents.UNSTARTED ||
          this.muted_ != isMuted
        ) {
          this.muted_ = isMuted;
          dispatchCustomEvent(this.element, mutedOrUnmutedEvent(isMuted));
        }
        break;

      case DailymotionEvents.STARTED_BUFFERING:
        this.startedBufferingResolver_(true);
        break;

      case DailymotionEvents.FULLSCREEN_CHANGE:
        this.isFullscreen_ = data['fullscreen'] == 'true';
        break;

      default: // nothing
    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {boolean} opt_arg
   * @private
   */
  sendCommand_(command, opt_arg) {
    const endpoint = 'https://www.dailymotion.com';
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          makeDailymotionMessage(command, opt_arg),
          endpoint
        );
      }
    });
  }

  /** @private */
  getIframeSrc_() {
    const {
      'endscreenEnable': endscreenEnable,
      'info': info,
      'mute': mute,
      'sharingEnable': sharingEnable,
      'start': start,
      'uiHighlight': uiHighlight,
      'uiLogo': uiLogo,
    } = this.element.dataset;

    return getDailymotionIframeSrc(
      this.win,
      this.videoid_,
      this.element.hasAttribute('autoplay'),
      endscreenEnable !== 'false',
      info !== 'false',
      mute === 'true',
      sharingEnable !== 'false',
      start,
      uiHighlight,
      uiLogo !== 'false',
      getDataParamsFromAttributes(this.element)
    );
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /**
   * @override
   */
  play(isAutoplay) {
    this.sendCommand_('play');
    // Hack to solve autoplay problem on Chrome Android
    // (first play always fails)
    if (isAutoplay && this.playerState_ != DailymotionEvents.PAUSE) {
      this.startedBufferingPromise_.then(() => {
        this.sendCommand_('play');
      });
    }
  }

  /**
   * @override
   */
  pause() {
    this.sendCommand_('pause');
  }

  /**
   * @override
   */
  mute() {
    this.sendCommand_('muted', [true]);
    // Hack to simulate firing mute events when video is not playing
    // since Dailymotion only fires volume changes when the video has started
    this.playerReadyPromise_.then(() => {
      dispatchCustomEvent(this.element, VideoEvents_Enum.MUTED);
      this.muted_ = true;
    });
  }

  /**
   * @override
   */
  unmute() {
    this.sendCommand_('muted', [false]);
    // Hack to simulate firing mute events when video is not playing
    // since Dailymotion only fires volume changes when the video has started
    this.playerReadyPromise_.then(() => {
      dispatchCustomEvent(this.element, VideoEvents_Enum.UNMUTED);
      this.muted_ = false;
    });
  }

  /**
   * @override
   */
  showControls() {
    this.sendCommand_('controls', [true]);
  }

  /**
   * @override
   */
  hideControls() {
    this.sendCommand_('controls', [false]);
  }

  /**
   * @override
   */
  fullscreenEnter() {
    const platform = Services.platformFor(this.win);
    if (platform.isSafari() || platform.isIos()) {
      this.sendCommand_('fullscreen', [true]);
    } else {
      if (!this.iframe_) {
        return;
      }
      fullscreenEnter(dev().assertElement(this.iframe_));
    }
  }

  /**
   * @override
   */
  fullscreenExit() {
    const platform = Services.platformFor(this.win);
    if (platform.isSafari() || platform.isIos()) {
      this.sendCommand_('fullscreen', [false]);
    } else {
      if (!this.iframe_) {
        return;
      }
      fullscreenExit(dev().assertElement(this.iframe_));
    }
  }

  /** @override */
  isFullscreen() {
    const platform = Services.platformFor(this.win);
    if (platform.isSafari() || platform.isIos()) {
      return this.isFullscreen_;
    } else {
      if (!this.iframe_) {
        return false;
      }
      return isFullscreenElement(dev().assertElement(this.iframe_));
    }
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
  AMP.registerElement(TAG, AmpDailymotion);
});
