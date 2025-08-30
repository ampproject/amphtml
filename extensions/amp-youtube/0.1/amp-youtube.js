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
  HIDE_ANNOTATION: 3,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpYoutube extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.videoid_ = null;

    /** @private {?string} */
    this.liveChannelid_ = null;

    /** @private {?string} */
    this.channelid_ = null;

    /** @private {?boolean} */
    this.muted_ = false;

    /** @private {?boolean} */
    this.isLoop_ = false;

    /** @private {?boolean} */
    this.isPlaylist_ = false;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Object} */
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
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    preconnect.url(ampdoc, this.getVideoIframeSrc_());
    preconnect.url(ampdoc, 'https://i.ytimg.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  renderOutsideViewport() {
    return 0.75;
  }

  /** @override */
  buildCallback() {
    this.videoid_ = this.getVideoId_();
    this.liveChannelid_ = this.getLiveChannelId_();
    this.channelid_ = this.getChannelId_();
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

    let descriptor;
    if (this.videoid_) {
      descriptor = `${encodeURIComponent(this.videoid_)}?`;
    } else {
      const channel = this.liveChannelid_ || this.channelid_ || '';
      descriptor = `live_stream?channel=${encodeURIComponent(channel)}&`;
    }
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
      delete params['autoplay'];
      this.user().error(
        'AMP-YOUTUBE',
        'Use autoplay attribute instead of data-param-autoplay'
      );
    }

    if (!('playsinline' in params)) {
      params['playsinline'] = '1';
    }

    const hasAutoplay = element.hasAttribute('autoplay');
    if (hasAutoplay) {
      if (!('iv_load_policy' in params)) {
        params['iv_load_policy'] = `${PlayerFlags.HIDE_ANNOTATION}`;
      }
      params['playsinline'] = '1';
    }

    if ('loop' in params) {
      this.user().warn(
        'AMP-YOUTUBE',
        'Use loop attribute instead of the deprecated data-param-loop'
      );
    }

    this.isLoop_ =
      element.hasAttribute('loop') ||
      ('loop' in params && params['loop'] == '1');
    this.isPlaylist_ = 'playlist' in params;
    if (this.isLoop_) {
      if (this.isPlaylist_) {
        params['loop'] = '1';
      } else if ('loop' in params) {
        delete params['loop'];
      }
    }

    src = addParamsToUrl(src, params);
    return (this.videoIframeSrc_ = src);
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    iframe.title = this.element.title || 'YouTube video';

    // Temporary until M74 launch (legacy)
    addUnsafeAllowAutoplay(iframe);

    this.iframe_ = iframe;

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
        (unusedEvent) => this.play(false /* unusedIsAutoplay */)
      );
    }

    const loaded = this.loadPromise(this.iframe_)
      .then(() => Services.timerFor(this.win).promise(300))
      .then(() => {
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
    const videoChanged = mutations['data-videoid'] != null;
    const liveChannelChanged = mutations['data-live-channelid'] != null;
    const channelChanged = mutations['data-channelid'] != null;
    if (!videoChanged && !liveChannelChanged && !channelChanged) {
      return;
    }

    this.videoid_ = this.getVideoId_();
    this.liveChannelid_ = this.getLiveChannelId_();
    this.channelid_ = this.getChannelId_();

    if (!this.iframe_) {
      return;
    }

    if (this.videoid_ && !liveChannelChanged && !channelChanged) {
      this.sendCommand_('loadVideoById', [this.videoid_]);
    } else {
      this.videoIframeSrc_ = null;
      this.iframe_.src = this.getVideoIframeSrc_();
    }
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
  getChannelId_() {
    return this.element.getAttribute('data-channelid');
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
    const sources = [this.videoid_, this.liveChannelid_, this.channelid_];
    const present = sources.filter(Boolean).length;
    const datasourceExists = present === 1;
    userAssert(
      datasourceExists,
      'Exactly one of data-videoid, data-live-channelid, or data-channelid should be present for <amp-youtube> %s',
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
          event: 'command',
          func: command,
          args: opt_args || '',
        });
        this.iframe_.contentWindow.postMessage(message, '*');
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
      return; // Only process valid JSON.
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
    this.iframe_.contentWindow.postMessage(
      JSON.stringify({
        event: 'listening',
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
      'object-fit': 'cover',
      'visibility': 'hidden',
    });
    propagateAttributes(['aria-label'], this.element, imgPlaceholder);
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

    this.loadPromise(imgPlaceholder)
      .then(() => {
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
            visibility: '',
          });
        });
      });

    return imgPlaceholder;
  }

  // VideoInterface Implementation.

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
  showControls() {}

  /** @override */
  hideControls() {}

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
    return NaN;
  }

  /** @override */
  getPlayedRanges() {
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
