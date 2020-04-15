/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {addParamsToUrl} from '../../../src/url';
import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, getDetail, listen} from '../../../src/event-helper';
import {getMode} from '../../../src/mode';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {once} from '../../../src/utils/function';

const JWPLAYER_EVENTS = {
  'ready': VideoEvents.LOAD,
  'play': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'complete': VideoEvents.ENDED,
  'visible': VideoEvents.VISIBILITY,
  'adImpression': VideoEvents.AD_START,
  'adComplete': VideoEvents.AD_END,
  'adPlay': VideoEvents.PLAYING,
  'adPause': VideoEvents.PAUSE,
};

const eventHandlers = {
  /**
   * @param {{fullscreen:boolean}} msg Message details being passed from the iframe.
   * @param {Object} ctx
   */
  fullscreen: (msg, ctx) => {
    const {fullscreen} = msg;
    if (fullscreen == ctx.isFullscreen()) {
      return;
    }

    fullscreen ? ctx.fullscreenEnter() : ctx.fullscreenExit();
  },
  /**
   * @param {{metadataType:string}} msg details being passed from the iframe.
   * @param {Object} ctx
   */
  meta: (msg, ctx) => {
    const {metadataType, duration} = msg;
    if (metadataType === 'media') {
      ctx.duration_ = duration;
    }
  },
  /**
   * @param {{mute:boolean}} msg Message details being passed from the iframe.
   * @param {Object} ctx
   */
  mute: (msg, ctx) => {
    const {mute} = msg;
    const {element} = ctx;
    ctx.muted_ = mute;
    element.dispatchCustomEvent(mutedOrUnmutedEvent(mute));
  },
  /**
   * @param {{ranges:Array<(Array<number>|null)>}} msg Message details being passed from the iframe.
   * @param {Object} ctx
   */
  playedRanges: (msg, ctx) => {
    const {ranges} = msg;
    ctx.playedRanges_ = ranges;
  },
  /**
   * @param {Object} playlistItem Playlist item coming from JW Player.
   * @param {Object} ctx
   */
  playlistItem: (playlistItem, ctx) => {
    ctx.playlistItem_ = {...playlistItem};
    ctx.sendCommand_('getPlayedRanges');
  },
  /**
   * @param {{currentTime:number}} time Message details being passed from the iframe.
   * @param {Object} ctx
   */
  time: (time, ctx) => {
    ctx.currentTime_ = time.currentTime;
    ctx.sendCommand_('getPlayedRanges');
  },
  /**
   * @param {{position:number}} adTime Message details being passed from the iframe.
   * @param {Object} ctx
   */
  adTime: (adTime, ctx) => {
    ctx.currentTime_ = adTime.position;
  },
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpJWPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.contentid_ = '';

    /** @private {string} */
    this.playerid_ = '';

    /** @private {string} */
    this.contentSearch_ = '';

    /** @private {string} */
    this.contentContextual_ = '';

    /** @private {string} */
    this.contentRecency_ = '';

    /** @private {string} */
    this.contentBackfill_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?function(Element)} */
    this.playerReadyResolver_ = null;

    /** @private {function(Object)} */
    this.onReadyOnce_ = once((readyEvent) => this.onReady_(readyEvent));

    this.muteOnAutoOnce_ = once(() => this.muteOnAuto_());

    /** @private {function()} */
    this.onMessage_ = this.onMessage_.bind(this);

    /** @private {Object} */
    this.playlistItem_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {number} */
    this.duration_ = 0;

    /** @private {number} */
    this.currentTime_ = 0;

    /** @private {Array<(Array<number>|null)>} */
    this.playedRanges_ = [];

    /** @private {?function()} */
    this.unlistenFrame_ = null;

    /** @private {?function()} */
    this.unlistenFullscreen_ = null;
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
  getCurrentTime() {
    return this.currentTime_;
  }

  /** @override */
  getDuration() {
    return this.duration_ || this.playlistItem_['duration'] || 0;
  }

  /**
   * @override
   */
  getPlayedRanges() {
    return this.playedRanges_ || [];
  }

  /** @private */
  muteOnAuto_() {
    if (!this.muted_) {
      this.mute();
    }
  }

  /** @override */
  play(isAutoplay) {
    let reason;

    if (isAutoplay) {
      reason = 'auto';
      this.muteOnAutoOnce_();
    }
    this.sendCommand_('play', {reason});
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('setMute', true);
  }

  /** @override */
  unmute() {
    this.sendCommand_('setMute', false);
  }

  /** @override */
  showControls() {
    this.sendCommand_('setControls', true);
  }

  /** @override */
  hideControls() {
    this.sendCommand_('setControls', false);
  }

  /** @override */
  getMetadata() {
    if (
      'mediaSession' in navigator &&
      window.MediaMetadata &&
      this.playlistItem_['meta']
    ) {
      try {
        return new window.MediaMetadata(this.playlistItem_['meta']);
      } catch (error) {
        // catch error that occurs when mediaSession fails to setup
      }
    }
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    if (this.isSafariOrIos_()) {
      this.sendCommand_('setFullscreen', true);
    } else {
      fullscreenEnter(dev().assertElement(this.iframe_));
    }
  }

  /** @override */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    if (this.isSafariOrIos_()) {
      this.sendCommand_('setFullscreen', false);
    } else {
      fullscreenExit(dev().assertElement(this.iframe_));
    }
  }

  /** @override */
  isFullscreen() {
    if (this.iframe_) {
      return isFullscreenElement(this.iframe_);
    }

    return false;
  }

  /**
   * @param {number} timeSeconds
   * @override
   */
  seekTo(timeSeconds) {
    this.sendCommand_('seek', timeSeconds);
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    const ampDoc = this.getAmpDoc();
    const preconnectUrl = (url) =>
      Services.preconnectFor(this.win).url(ampDoc, url, onLayout);
    // Host that serves player configuration and content redirects
    preconnectUrl('https://content.jwplatform.com');
    // CDN which hosts jwplayer assets
    preconnectUrl('https://ssl.p.jwpcdn.com');
    // Embed
    preconnectUrl(this.getSingleLineEmbed_());
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    const deferred = new Deferred();

    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    this.contentid_ = userAssert(
      element.getAttribute('data-playlist-id') ||
        element.getAttribute('data-media-id'),
      'Either the data-media-id or the data-playlist-id ' +
        'attributes must be specified for <amp-jwplayer> %s',
      element
    );
    this.playerid_ = userAssert(
      element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-jwplayer> %s',
      element
    );

    this.contentSearch_ = element.getAttribute('data-content-search') || '';
    this.contentBackfill_ = element.getAttribute('data-content-backfill') || '';
    this.contentContextual_ =
      element.getAttribute('data-content-contextual') || '';
    this.contentRecency_ = element.getAttribute('data-content-recency') || '';

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    const queryParams = dict({
      'search': this.getContextualVal_() || undefined,
      'contextual': this.contentContextual_ || undefined,
      'recency': this.contentRecency_ || undefined,
      'backfill': this.contentBackfill_ || undefined,
      'isAMP': true,
    });

    const url = this.getSingleLineEmbed_();
    const src = addParamsToUrl(url, queryParams);
    const frame = disableScrollingOnIframe(
      createFrameFor(this, src, this.element.id)
    );

    addUnsafeAllowAutoplay(frame);
    disableScrollingOnIframe(frame);
    // Subscribe to messages from player
    this.unlistenFrame_ = listen(this.win, 'message', this.onMessage_);
    // Forward fullscreen changes to player to update ui
    this.unlistenFullscreen_ = listen(frame, 'fullscreenchange', () => {
      const isFullscreen = this.isFullscreen();
      this.sendCommand_('setFullscreen', isFullscreen);
    });
    this.iframe_ = /** @type {HTMLIFrameElement} */ (frame);

    return this.loadPromise(this.iframe_);
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlistenFrame_) {
      this.unlistenFrame_();
    }
    if (this.unlistenFullscreen_) {
      this.unlistenFullscreen_();
    }
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }

    return true; // Call layoutCallback again.
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.element.hasAttribute('data-media-id')) {
      return;
    }
    const placeholder = this.win.document.createElement('amp-img');
    this.propagateAttributes(['aria-label'], placeholder);
    placeholder.setAttribute(
      'src',
      'https://content.jwplatform.com/thumbs/' +
        encodeURIComponent(this.contentid_) +
        '-720.jpg'
    );
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

  /**
   * @param {Object} data
   * @private
   */
  onReady_(data) {
    const {element} = this;

    this.playlistItem_ = {...data.playlistItem};
    this.muted_ = !!data.muted;
    this.playerReadyResolver_(this.iframe_);
    element.dispatchCustomEvent(VideoEvents.LOAD);
  }

  /**
   * @param {Event} messageEvent
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
    const value = getDetail(data);

    // Log any valid events
    dev().info('JWPLAYER', 'EVENT:', event || 'anon event', value || data);

    if (event === 'ready') {
      this.onReadyOnce_(value);
      return;
    }

    const {element} = this;

    if (redispatch(element, event, JWPLAYER_EVENTS)) {
      return;
    }

    if (value && event && eventHandlers[event]) {
      eventHandlers[event](value, this);
    }
  }

  /**
   * @param {string} method
   * @param {number|boolean|string|Object|undefined} [optParams]
   * @private
   */
  sendCommand_(method, optParams) {
    this.playerReadyPromise_.then(() => {
      if (!this.iframe_ || !this.iframe_.contentWindow) {
        return;
      }

      dev().info('JWPLAYER', 'COMMAND:', method, optParams);

      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify(
          dict({
            'method': method,
            'optParams': optParams,
          })
        ),
        '*'
      );
    });
  }

  /**
   * @private
   * @return {boolean}
   */
  isSafariOrIos_() {
    const platform = Services.platformFor(this.win);

    return platform.isSafari() || platform.isIos();
  }

  /**
   * @private
   * @return {string}
   */
  getSingleLineEmbed_() {
    const isDev = getMode(this.win).localDev;
    const cid = encodeURIComponent(this.contentid_);
    const pid = encodeURIComponent(this.playerid_);
    let baseUrl = `https://content.jwplatform.com/players/${cid}-${pid}.html`;

    if (isDev) {
      const testPage = new URLSearchParams(document.location.search).get(
        'test_page'
      );
      if (testPage) {
        baseUrl = `${testPage}?cid=${cid}&pid=${pid}`;
      }
    }
    return baseUrl;
  }

  /**
   * @private
   * @return {string|null}
   */
  getContextualVal_() {
    if (this.contentSearch_ === '__CONTEXTUAL__') {
      const context = this.getAmpDoc().getHeadNode();
      const ogTitleElement = context.querySelector('meta[property="og:title"]');
      const ogTitle = ogTitleElement
        ? ogTitleElement.getAttribute('content')
        : null;
      const title = (context.querySelector('title') || {}).textContent;
      return ogTitle || title || '';
    }
    return this.contentSearch_;
  }
}

AMP.extension('amp-jwplayer', '0.1', (AMP) => {
  AMP.registerElement('amp-jwplayer', AmpJWPlayer);
});
