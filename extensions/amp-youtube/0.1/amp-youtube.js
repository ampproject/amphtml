import {Deferred} from '#core/data-structures/promise';
import {
  dispatchCustomEvent,
  getDataParamsFromAttributes,
  removeElement,
} from '#core/dom';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {htmlFor} from '#core/dom/static-template';
import {setStyles} from '#core/dom/style';
import {PauseHelper} from '#core/dom/video/pause-helper';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {getData, listen} from '#utils/event-helper';
import {dev, userAssert} from '#utils/log';

import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {addParamsToUrl} from '../../../src/url';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-youtube';

// Correct PlayerStates taken from
// https://developers.google.com/youtube/iframe_api_reference#Playback_status
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

/**
 * @enum {number}
 * @private
 */
const PlayerFlags = {
  // Config to tell YouTube to hide annotations by default
  HIDE_ANNOTATION: 3,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpYoutube extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.videoid_ = null;

    /** @private {?string} */
    this.liveChannelid_ = null;

    /** @private {?boolean}  */
    this.muted_ = false;

    /** @private {?boolean}  */
    this.isLoop_ = false;

    /** @private {?boolean}  */
    this.isPlaylist_ = false;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Object} Info object about video returned by YouTube API*/
    this.info_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Function} */
    this.unlistenLooping_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    // NOTE: When preload `as=document` is natively supported in browsers
    // we can switch to preloading the full source. For now this doesn't
    // work, because we preload with a different type and in that case
    // responses are only picked up if they are cacheable.
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    preconnect.url(ampdoc, this.getVideoIframeSrc_());
    // Host that YT uses to serve JS needed by player.
    preconnect.url(ampdoc, 'https://s.ytimg.com', opt_onLayout);
    // Load high resolution placeholder images for videos in prerender mode.
    preconnect.url(ampdoc, 'https://i.ytimg.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  renderOutsideViewport() {
    // We are conservative about loading YT videos outside the viewport,
    // because the player is pretty heavy.
    // This will still start loading before they become visible, but it
    // won't typically load a large number of embeds.
    return 0.75;
  }

  /** @override */
  buildCallback() {
    this.videoid_ = this.getVideoId_();
    this.liveChannelid_ = this.getLiveChannelId_();
    this.assertDatasourceExists_();

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
  }

  /**
   * @return {string}
   * @private
   */
  getEmbedUrl_() {
    this.assertDatasourceExists_();
    const urlSuffix = this.getCredentials_() === 'omit' ? '-nocookie' : '';
    const baseUrl = `https://www.youtube${urlSuffix}.com/embed/`;
    const descriptor = this.videoid_
      ? `${encodeURIComponent(this.videoid_ || '')}?`
      : `live_stream?channel=${encodeURIComponent(this.liveChannelid_ || '')}&`;
    return `${baseUrl}${descriptor}enablejsapi=1&amp=1`;
  }

  /**
   * @return {string}
   * @private
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    let src = this.getEmbedUrl_();

    const {element} = this;
    const params = getDataParamsFromAttributes(element);
    if ('autoplay' in params) {
      // Autoplay is managed by video manager, do not pass it to YouTube.
      delete params['autoplay'];
      this.user().error(
        'AMP-YOUTUBE',
        'Use autoplay attribute instead of data-param-autoplay'
      );
    }

    // Unless inline play policy is set explicitly, enable inline play for iOS
    // in all cases similar to Android. Inline play is the desired default for
    // video in AMP.
    if (!('playsinline' in params)) {
      params['playsinline'] = '1';
    }

    const hasAutoplay = element.hasAttribute('autoplay');
    if (hasAutoplay) {
      // Unless annotations policy is set explicitly, change the default to
      // hide annotations when autoplay is set.
      // We do this because we like the first user interaction with an
      // autoplaying video to be just unmute tso annotations are not
      // interactive during autoplay anyway.
      if (!('iv_load_policy' in params)) {
        params['iv_load_policy'] = `${PlayerFlags.HIDE_ANNOTATION}`;
      }

      // Inline play must be set for autoplay regardless of original value.
      params['playsinline'] = '1';
    }

    if ('loop' in params) {
      // Loop is managed by the amp-youtube extension, prefer loop param instead
      this.user().warn(
        'AMP-YOUTUBE',
        'Use loop attribute instead of the deprecated data-param-loop'
      );
    }

    // In the case of a playlist, looping is delegated to the Youtube player
    // instead of AMP manually looping the video through the Youtube API
    this.isLoop_ =
      element.hasAttribute('loop') ||
      ('loop' in params && params['loop'] == '1');
    this.isPlaylist_ = 'playlist' in params;
    if (this.isLoop_) {
      if (this.isPlaylist_) {
        // Use native looping for playlists
        params['loop'] = '1';
      } else if ('loop' in params) {
        // Use js-based looping for single videos
        delete params['loop'];
      }
    }

    src = addParamsToUrl(src, params);
    return (this.videoIframeSrc_ = src);
  }

  /** @override */
  layoutCallback() {
    // See https://developers.google.com/youtube/iframe_api_reference
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    iframe.title = this.element.title || 'YouTube video';

    // This is temporary until M74 launches.
    // TODO(aghassemi, #21247)
    addUnsafeAllowAutoplay(iframe);

    this.iframe_ = iframe;

    // Listening for VideoEvents_Enum.LOAD in AutoFullscreenManager.register may
    // introduce race conditions which may break elements e.g. amp-ima-video
    Services.videoManagerForDoc(this.element).register(this);

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleYoutubeMessage_.bind(this)
    );

    if (this.isLoop_ && !this.isPlaylist_) {
      this.unlistenLooping_ = listen(
        this.element,
        VideoEvents_Enum.ENDED,
        (unusedEvent) => this.play(false /** unusedIsAutoplay */)
      );
    }

    const loaded = this.loadPromise(this.iframe_)
      // Make sure the YT player is ready for this. For some reason YT player
      // would send couple of messages but then stop. Waiting for a bit before
      // sending the 'listening' event seems to fix that and allow YT Player
      // to send messages continuously.
      //
      // This was removed in #6915 but due to #17979 it has been taken back
      // for a workaround.
      .then(() => Services.timerFor(this.win).promise(300))
      .then(() => {
        // Tell YT that we want to receive messages
        this.listenToFrame_();
        dispatchCustomEvent(this.element, VideoEvents_Enum.LOAD);
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

    if (this.unlistenLooping_) {
      this.unlistenLooping_();
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
    if (mutations['data-videoid'] == null) {
      return;
    }
    this.videoid_ = this.getVideoId_();
    if (!this.iframe_) {
      return;
    }
    this.sendCommand_('loadVideoById', [this.videoid_]);
  }

  /**
   * @return {?string}
   * @private
   */
  getLiveChannelId_() {
    return this.element.getAttribute('data-live-channelid');
  }

  /**
   * @return {?string}
   * @private
   */
  getVideoId_() {
    return this.element.getAttribute('data-videoid');
  }

  /**
   * @return {string}
   * @private
   */
  getCredentials_() {
    return this.element.getAttribute('credentials') || 'include';
  }

  /**
   * @private
   */
  assertDatasourceExists_() {
    const datasourceExists =
      !(this.videoid_ && this.liveChannelid_) &&
      (this.videoid_ || this.liveChannelid_);
    userAssert(
      datasourceExists,
      'Exactly one of data-videoid or ' +
        'data-live-channelid should be present for <amp-youtube> %s',
      this.element
    );
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
        this.iframe_.contentWindow./*OK*/ postMessage(message, '*');
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleYoutubeMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://www.youtube.com')) {
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

    const playerState = info['playerState'];
    if (eventType == 'infoDelivery' && playerState != null) {
      switch (playerState) {
        case PlayerStates.PLAYING:
          this.pauseHelper_.updatePlaying(true);
          break;
        case PlayerStates.PAUSED:
        case PlayerStates.ENDED:
          this.pauseHelper_.updatePlaying(false);
          break;
      }

      redispatch(element, playerState.toString(), {
        [PlayerStates.PLAYING]: VideoEvents_Enum.PLAYING,
        [PlayerStates.PAUSED]: VideoEvents_Enum.PAUSE,
        // YT does not fire pause and ended together.
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

    if (eventType == 'initialDelivery') {
      this.info_ = info;
      dispatchCustomEvent(element, VideoEvents_Enum.LOADEDMETADATA);
      return;
    }

    if (eventType == 'infoDelivery' && info['currentTime'] !== undefined) {
      this.info_.currentTime = info['currentTime'];
      return;
    }
  }

  /**
   * Sends 'listening' message to the YouTube iframe to listen for events.
   * @private
   */
  listenToFrame_() {
    if (!this.iframe_) {
      return;
    }
    this.iframe_.contentWindow./*OK*/ postMessage(
      JSON.stringify({
        'event': 'listening',
      }),
      '*'
    );
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.videoid_) {
      return null;
    }

    const {element: el} = this;
    const imgPlaceholder = htmlFor(el)`<img placeholder referrerpolicy=origin>`;
    const videoid = dev().assertString(this.videoid_);

    setStyles(imgPlaceholder, {
      // Cover matches YouTube Player styling.
      'object-fit': 'cover',
      // Hiding the placeholder initially to give the browser time to fix
      // the object-fit: cover.
      'visibility': 'hidden',
    });
    propagateAttributes(['aria-label'], this.element, imgPlaceholder);
    // TODO(mkhatib): Maybe add srcset to allow the browser to
    // load the needed size or even better match YTPlayer logic for loading
    // player thumbnails for different screen sizes for a cache win!
    imgPlaceholder.src = `https://i.ytimg.com/vi/${encodeURIComponent(
      videoid
    )}/sddefault.jpg#404_is_fine`;

    if (imgPlaceholder.hasAttribute('aria-label')) {
      imgPlaceholder.setAttribute(
        'alt',
        'Loading video - ' + imgPlaceholder.getAttribute('aria-label')
      );
    } else {
      imgPlaceholder.setAttribute('alt', 'Loading video');
    }
    applyFillContent(imgPlaceholder);

    // Because sddefault.jpg isn't available for all videos, we try to load
    // it and fallback to hqdefault.jpg.
    this.loadPromise(imgPlaceholder)
      .then(() => {
        // A pretty ugly hack since onerror won't fire on YouTube image 404.
        // This might be due to the fact that YouTube returns data to the request
        // even when the status is 404. YouTube returns a placeholder image that
        // is 120x90.
        if (
          imgPlaceholder.naturalWidth == 120 &&
          imgPlaceholder.naturalHeight == 90
        ) {
          throw new Error('sddefault.jpg is not found');
        }
      })
      .catch(() => {
        imgPlaceholder.src = `https://i.ytimg.com/vi/${encodeURIComponent(
          videoid
        )}/hqdefault.jpg`;
        return this.loadPromise(imgPlaceholder);
      })
      .then(() => {
        this.getVsync().mutate(() => {
          setStyles(imgPlaceholder, {
            'visibility': '',
          });
        });
      });

    return imgPlaceholder;
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    // YouTube videos are always interactive. There is no YouTube param that
    // makes the video non-interactive. Even data-param-control=0 will not
    // prevent user from pausing or resuming the video.
    return true;
  }

  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('playVideo');
  }

  /** @override */
  pause() {
    this.sendCommand_('pauseVideo');
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
    // Youtube already updates the Media Session so no need for the video
    // manager to update it too
    return true;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    if (this.info_) {
      return this.info_.currentTime;
    }
    return NaN;
  }

  /** @override */
  getDuration() {
    if (this.info_) {
      return this.info_.duration;
    }
    // Not supported.
    return NaN;
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
  AMP.registerElement(TAG, AmpYoutube);
});
