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

 import {Services} from '../../../src/services';
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {removeElement} from '../../../src/dom';
import {listen, getData, getDetail} from '../../../src/event-helper'
import {userAssert, dev} from '../../../src/log';
import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {VideoEvents} from '../../../src/video-interface';
import {once} from '../../../src/utils/function';

const JWPLAYER_EVENTS = {
  'play': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'complete': VideoEvents.ENDED,
  'visible': VideoEvents.VISIBILITY,
  'adImpression': VideoEvents.AD_START,
  'adComplete': VideoEvents.AD_END,
}

const eventHandlers = {
  fullscreen: (fullscreenInfo, ctx) => {
      ctx.fullscreen_ = fullscreenInfo.fullscreen;
  },
  meta: (metadata, ctx) => {
    if (metadata.metadataType === 'media') {
      ctx.duration_ = metadata.duration;
    }
  },
  mute: (muted, ctx) => {
      ctx.onToggleMute_(muted.mute);
  },
  playedRanges: (playedRanges, ctx) => {
    ctx.playedRanges_ = playedRanges.ranges;
  },
  playlistItem: (playlistItem, ctx) => {
    ctx.playlistItem = dict(playlistItem)
    ctx.sendCommand_('getPlayedRanges');
  },
  time: (timeInfo, ctx) => {
    ctx.currentTime = timeInfo.currentTime;
    ctx.sendCommand_('getPlayedRanges');
  }
}

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

    /** @private {function()} */
    this.onReadyOnce_ = once((readyEvent) => this.onReady_(readyEvent));

    /** @private {function()} */
    this.onMessage_ = this.onMessage_.bind(this);

    /** @private {JsonObject} */
    this.playlistItem = {};

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {boolean} */
    this.fullscreen_ = false;

    /** @private {./time.timeDef} */
    this.duration_ = 0;

    /** @private {./time.timeDef} */
    this.currentTime_ = 0;

    /** @private {Array<Array>} */
    this.playedRanges_ = [];
  }

  /**
   * @param {object} data
   * @private
  */
  onReady_(data) {
    const {element} = this;

    this.apiInstance = data.apiInstance; 
    this.playlistItem = dict(data.playlistItem);
    this.muted_ = !!data.muted;
    Services.videoManagerForDoc(element).register(this);
    element.dispatchCustomEvent(VideoEvents.LOAD);
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
    return this.duration_ || this.playlistItem.duration || 0;
  }

  /** @override */
  getPlayedRanges() {
    return this.playedRanges_;
  }

  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
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

  /**
   * @param {Event} messageEvent
   * @private
   */
  onMessage_(messageEvent) {
    if (messageEvent.source != this.iframe_.contentWindow) {
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
    dev().info(event || 'anon event', value || data);

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
   * @param {T} optParams
   * @template {number|boolean|string|undefined} T
   * @private
   */
  sendCommand_(method, optParams) {
    if (!this.iframe_ || !this.iframe_.contentWindow) {
      return;
    }
    
    dev().info('command', method);

    this.iframe_.contentWindow./*OK*/ postMessage(
      JSON.stringify(
        dict({
          'method': method,
          'optParams': optParams,
          'player': this.id,
          'apiInstance': this.apiInstance || null
        })
      ),
      '*'
    );
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
    return {
      artwork: this.playlistItem.image,
      title: this.playlistItem.title,
    };
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return true;
  }

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_ || this.fullscreen_) {
      return;
    }
    this.sendCommand_('setFullscreen', true);
  }

  /** @override */
  fullscreenExit() {
    if (!this.iframe_ || !this.fullscreen_) {
      return;
    }
    this.sendCommand_('setFullscreen', false);
  }

  /** @override */
  isFullscreen() {
    return this.fullscreen_;
  }

  /**
   * @param {./time.timeDef} timeSeconds
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
    // Host that serves player configuration and content redirects
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://content.jwplatform.com',
      onLayout
    );
    // CDN which hosts jwplayer assets
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://ssl.p.jwpcdn.com',
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);

    const {element} = this;

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

    installVideoManagerForDoc(this.getAmpDoc());
  }

  /** @override */
  layoutCallback() {
    const cid = encodeURIComponent(this.contentid_);
    const pid = encodeURIComponent(this.playerid_);
    const queryParams = dict({
      'search': this.getContextualVal_() || undefined,
      'contextual': this.contentContextual_ || undefined,
      'recency': this.contentRecency_ || undefined,
      'backfill': this.contentBackfill_ || undefined,
    });
    const IS_DEV = true;
    const baseUrl = IS_DEV ? 
      `http://localhost:4000/test/public/platform/amp/iframe.html?cid=${this.contentid_}&pid=${this.playerid_}` :
      `https://content.jwplatform.com/players/${cid}-${pid}.html`;

    const src = addParamsToUrl(baseUrl, queryParams);
    const frame = createFrameFor(this, src, this.element.id);
    this.unlistenFrame_ = listen(this.win, 'message', this.onMessage_);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (frame);
  
    return this.loadPromise(this.iframe_);
  }

  /** @override */
  unlayoutCallback() {
    if (this.unlistenFrame_) {
      this.unlistenFrame_();
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
   * @return {?string=}
   * @private
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

  /**
   * @param {boolean}
   * @private
   */
  onToggleMute_(muted) {
    const {element} = this;
    this.muted_ = muted;
    element.dispatchCustomEvent(mutedOrUnmutedEvent(muted));
  }
}

AMP.extension('amp-jwplayer', '0.1', (AMP) => {
  AMP.registerElement('amp-jwplayer', AmpJWPlayer);
});