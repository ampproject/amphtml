import {Deferred} from '#core/data-structures/promise';
import {dispatchCustomEvent, removeElement} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {Layout_Enum, isLayoutSizeDefined} from '#core/dom/layout';

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
import {addParamsToUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

/** @const */
const TAG = 'amp-minute-media-player';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpMinuteMediaPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    // Declare instance variables with type annotations.
    /** @private {Element} */
    this.iframe_ = null;

    /** @private {string} */
    this.contentType_ = '';

    /** @private {?string} */
    this.playerId_ = null;

    /** @private {?string} */
    this.contentId_ = '';

    /** @private {?string} */
    this.scannedElementType_ = '';

    /** @private {?string} */
    this.scannedElement_ = '';

    /** @private {?string} */
    this.tags_ = '';

    /** @private {?string} */
    this.minimumDateFactor_ = '';

    /** @private {?string} */
    this.scopedKeywords_ = '';

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?boolean}  */
    this.muted_ = false;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.iframeSource_()
    );
    // Host that serves player configuration and content redirects
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://www.oo-syringe.com',
      onLayout
    );
  }

  /** @override */
  buildCallback() {
    this.initFields_();

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout) || layout == Layout_Enum.FLEX_ITEM;
  }

  /**
   * Init params
   * @private
   */
  initFields_() {
    const {element} = this;
    this.contentType_ = userAssert(
      element.getAttribute('data-content-type'),
      'The data-content-type must be specified for <amp-minute-media-player> %s',
      element
    );

    if (this.contentType_ != 'semantic') {
      this.contentId_ = userAssert(
        element.getAttribute('data-content-id'),
        'The data-content-id must be specified for %s ' +
          'data-content-type in <amp-minute-media-player> %s',
        this.contentType_,
        element
      );
    } else {
      this.initSemanticFields_();
    }
  }

  /**
   * Init Semantic params
   * @private
   */
  initSemanticFields_() {
    const {element} = this;
    this.scannedElement_ = element.getAttribute('data-scanned-element') || '';
    this.tags_ = element.getAttribute('data-tags') || '';
    this.minimumDateFactor_ =
      element.getAttribute('data-minimum-date-factor') || '';
    this.scannedElementType_ =
      element.getAttribute('data-scanned-element-type') || '';
    this.scopedKeywords_ = element.getAttribute('data-scoped-keywords') || '';
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleMinuteMediaPlayerMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://www.oo-syringe.com')) {
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

    redispatch(this.element, data['event'], {
      'ready': VideoEvents_Enum.LOAD,
      'playing': VideoEvents_Enum.PLAYING,
      'pause': VideoEvents_Enum.PAUSE,
      'ended': [VideoEvents_Enum.ENDED, VideoEvents_Enum.PAUSE],
      'ads-ad-started': VideoEvents_Enum.AD_START,
      'ads-ad-ended': VideoEvents_Enum.AD_END,
    });

    if (data['event'] === 'mute') {
      const muted = data['value'];
      if (this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      dispatchCustomEvent(this.element, mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * Build Iframe source
   * @return {string}
   * @private
   */
  iframeSource_() {
    const baseUrl =
      'https://www.oo-syringe.com/prod/AMP/minute-media-player.html';

    const moreQueryParams = {
      'content_type': this.contentType_ || undefined,
      'content_id': this.contentId_ || undefined,
      'scanned_element_type': this.scannedElementType_ || undefined,
      'scanned_element': this.scannedElement_ || undefined,
      'tags': this.tags_ || undefined,
      'minimum_date_factor': this.minimumDateFactor_ || undefined,
      'scoped_keywords': this.scopedKeywords_ || undefined,
      'player_id': this.playerId_ || undefined,
    };

    return addParamsToUrl(baseUrl, moreQueryParams);
  }

  /** @override */
  layoutCallback() {
    const {element} = this;
    const iframe = createFrameFor(this, this.iframeSource_());
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(this.win, 'message', (event) =>
      this.handleMinuteMediaPlayerMessage_(event)
    );

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);

    const loaded = this.loadPromise(this.iframe_).then(() => {
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
    return true; // Call layoutCallback again.
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} message
   * @private
   */
  sendCommand_(message) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          message,
          'https://www.oo-syringe.com'
        );
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * Whether the component supports video playback in the current platform.
   * If false, component will be not treated as a video component.
   * @return {boolean}
   */
  /** @override */
  supportsPlatform() {
    return true;
  }

  /**
   * Whether users can interact with the video such as pausing it.
   * Example of non-interactive videos include design background videos where
   * all controls are hidden from the user.
   *
   * @return {boolean}
   */
  /** @override */
  isInteractive() {
    return true;
  }

  /**
   * Current playback time in seconds at time of trigger
   * @return {number}
   */
  /** @override */
  getCurrentTime() {
    // Not supported.
    return 0;
  }

  /**
   * Total duration of the video in seconds
   * @return {number}
   */
  /** @override */
  getDuration() {
    // Not supported.
    return 0;
  }

  /**
   * Get a 2d array of start and stop times that the user has watched.
   * @return {!Array<Array<number>>}
   */
  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /**
   * Plays the video.
   *
   * @param {boolean} unusedIsAutoplay Whether the call to the `play` method is
   * triggered by the autoplay functionality. Video players can use this hint
   * to make decisions such as not playing pre-roll video ads.
   */
  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }

  /**
   * Pauses the video.
   */
  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /**
   * Mutes the video.
   */
  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /**
   * Unmutes the video.
   */
  /** @override */
  unmute() {
    this.sendCommand_('unmute');
  }

  /**
   * Makes the video UI controls visible.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  /** @override */
  showControls() {} // Not supported.

  /**
   * Hides the video UI controls.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  /** @override */
  hideControls() {} // Not supported.

  /**
   * Returns video's meta data (artwork, title, artist, album, etc.) for use
   * with the Media Session API
   * artwork (Array): URL to the poster image (preferably a 512x512 PNG)
   * title (string): Name of the video
   * artist (string): Name of the video's author/artist
   * album (string): Name of the video's album if it exists
   * @return {!./mediasession-helper.MetadataDef|undefined} metadata
   */
  /** @override */
  getMetadata() {} // Not supported.

  /**
   * If this returns true then it will be assumed that the player implements
   * a feature to enter fullscreen on device rotation internally, so that the
   * video manager does not override it. If not, the video manager will
   * implement this feature automatically for videos with the attribute
   * `rotate-to-fullscreen`.
   *
   * @return {boolean}
   */
  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /**
   * If this returns true then it will be assumed that the player implements
   * the MediaSession API internally so that the video manager does not override
   * it. If not, the video manager will use the metadata variable as well as
   * inferred meta-data to update the video's Media Session notification.
   *
   * @return {boolean}
   */
  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /**
   * Enables fullscreen on the internal video element
   * NOTE: While implementing, keep in mind that Safari/iOS do not allow taking
   * any element other than <video> to fullscreen, if the player has an internal
   * implementation of fullscreen (flash for example) then check
   * if Services.platformFor(this.win).isSafari is true and use the internal
   * implementation instead. If not, it is recommended to take the iframe
   * to fullscreen using fullscreenEnter from src/core/dom/fullscreen.js
   */
  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /**
   * Quits fullscreen mode
   */
  /** @override */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    fullscreenExit(dev().assertElement(this.iframe_));
  }

  /**
   * Returns whether the video is currently in fullscreen mode or not
   * @return {boolean}
   */
  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /**
   * Seeks the video to a specified time.
   * @param {number} unusedTimeSeconds
   */
  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpMinuteMediaPlayer);
});
