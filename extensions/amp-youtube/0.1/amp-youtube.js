/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {getDataParamsFromAttributes} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';
import {removeElement} from '../../../src/dom';
import {listen} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {dev, user} from '../../../src/log';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {setStyles} from '../../../src/style';
import {addParamsToUrl} from '../../../src/url';
import {isObject} from '../../../src/types';
import {VideoEvents} from '../../../src/video-interface';
import {videoManagerForDoc} from '../../../src/services';
import {startsWith} from '../../../src/string';

/**
 * @enum {number}
 * @private
 */

 // Correct PlayerStates taken from: https://developers.google.com/youtube/iframe_api_reference#Playback_status
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

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpYoutube extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {number} */
    this.playerState_ = PlayerStates.UNSTARTED;

    /** @private {?string}  */
    this.videoid_ = null;

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
    this.preconnect.url(this.getVideoIframeSrc_());
    // Host that YT uses to serve JS needed by player.
    this.preconnect.url('https://s.ytimg.com', opt_onLayout);
    // Load high resolution placeholder images for videos in prerender mode.
    this.preconnect.url('https://i.ytimg.com', opt_onLayout);
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
   viewportCallback(visible) {
     this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
   }

  /** @override */
  buildCallback() {
    this.videoid_ = this.getVideoId_();

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    // TODO(aghassemi, #3216): amp-youtube has a special case where 404s are not
    // easily caught hence the following hacky-solution.
    // Please don't follow this behavior in other extensions, instead
    // see BaseElement.createPlaceholderCallback.
    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }

    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.element).register(this);
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }
    dev().assert(this.videoid_);
    let src = `https://www.youtube.com/embed/${encodeURIComponent(this.videoid_ || '')}?enablejsapi=1`;

    const params = getDataParamsFromAttributes(this.element);
    if ('autoplay' in params) {
      // Autoplay is managed by video manager, do not pass it to YouTube.
      delete params['autoplay'];
      user().error('AMP-YOUTUBE', 'Use autoplay attribute instead of ' +
          'data-param-autoplay');
    }

    // Unless inline play policy is set explicitly, enable inline play for iOS
    // in all cases similar to Android. Inline play is the desired default for
    // video in AMP.
    if (!('playsinline' in params)) {
      params['playsinline'] = '1';
    }

    const hasAutoplay = this.element.hasAttribute('autoplay');
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

    src = addParamsToUrl(src, params);
    return this.videoIframeSrc_ = src;
  }

  /** @override */
  layoutCallback() {
    // See https://developers.google.com/youtube/iframe_api_reference
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = this.getVideoIframeSrc_();

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleYoutubeMessages_.bind(this)
    );

    this.element.appendChild(this.iframe_);
    const loaded = this.loadPromise(this.iframe_).then(() => {
      // Tell YT that we want to receive messages
      this.listenToFrame_();
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
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
    this.playerState_ = PlayerStates.PAUSED;

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });
    return true;  // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    // Only send pauseVideo command if the player is playing. Otherwise
    // The player breaks if the user haven't played the video yet specially
    // on mobile.
    if (this.iframe_ && this.iframe_.contentWindow &&
        this.playerState_ == PlayerStates.PLAYING) {
      this.pause();
    }
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['data-videoid'] !== undefined) {
      this.videoid_ = this.getVideoId_();
      if (this.iframe_) { // `null` if element hasn't been laid out yet.
        this.sendCommand_('loadVideoById', [this.videoid_]);
      }
    }
  }

  /**
   * @return {string}
   * @private
   */
  getVideoId_() {
    return user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-youtube> %s',
        this.element);
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
        this.iframe_.contentWindow./*OK*/postMessage(message, '*');
      }
    });
  }

  /** @private */
  handleYoutubeMessages_(event) {
    if (event.origin != 'https://www.youtube.com' ||
        event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!event.data || !(isObject(event.data) || startsWith(event.data, '{'))) {
      return;  // Doesn't look like JSON.
    }
    const data = isObject(event.data) ? event.data : tryParseJson(event.data);
    if (data === undefined) {
      return; // We only process valid JSON.
    }
    if (data.event == 'infoDelivery' &&
        data.info && data.info.playerState !== undefined) {
      this.playerState_ = data.info.playerState;
      if (this.playerState_ == PlayerStates.PAUSED ||
          this.playerState_ == PlayerStates.ENDED) {
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
      } else if (this.playerState_ == PlayerStates.PLAYING) {
        this.element.dispatchCustomEvent(VideoEvents.PLAY);
      }
    } else if (data.event == 'infoDelivery' &&
        data.info && data.info.muted !== undefined) {
      if (this.muted_ != data.info.muted) {
        this.muted_ = data.info.muted;
        const evt = this.muted_ ? VideoEvents.MUTED : VideoEvents.UNMUTED;
        this.element.dispatchCustomEvent(evt);
      }
    }
  }

  /**
   * Sends 'listening' message to the YouTube iframe to listen for events.
   * @private
   */
  listenToFrame_() {
    this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
      'event': 'listening',
    }), '*');
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = this.element.ownerDocument.createElement('img');
    dev().assert(this.videoid_);
    const videoid = this.videoid_ || '';

    setStyles(imgPlaceholder, {
      // Cover matches YouTube Player styling.
      'object-fit': 'cover',
      // Hiding the placeholder initially to give the browser time to fix
      // the object-fit: cover.
      'visibility': 'hidden',
    });

    // TODO(mkhatib): Maybe add srcset to allow the browser to
    // load the needed size or even better match YTPlayer logic for loading
    // player thumbnails for different screen sizes for a cache win!
    imgPlaceholder.src = 'https://i.ytimg.com/vi/' +
        encodeURIComponent(videoid) + '/sddefault.jpg#404_is_fine';
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.setAttribute('referrerpolicy', 'origin');

    this.applyFillContent(imgPlaceholder);
    this.element.appendChild(imgPlaceholder);

    // Because sddefault.jpg isn't available for all videos, we try to load
    // it and fallback to hqdefault.jpg.
    this.loadPromise(imgPlaceholder).then(() => {
      // A pretty ugly hack since onerror won't fire on YouTube image 404.
      // This might be due to the fact that YouTube returns data to the request
      // even when the status is 404. YouTube returns a placeholder image that
      // is 120x90.
      if (imgPlaceholder.naturalWidth == 120 &&
          imgPlaceholder.naturalHeight == 90) {
        throw new Error('sddefault.jpg is not found');
      }
    }).catch(() => {
      imgPlaceholder.src = 'https://i.ytimg.com/vi/' +
          encodeURIComponent(videoid) + '/hqdefault.jpg';
      return this.loadPromise(imgPlaceholder);
    }).then(() => {
      setStyles(imgPlaceholder, {
        'visibility': '',
      });
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * @override
   */
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

  /**
   * @override
   */
  play(unusedIsAutoplay) {
    this.sendCommand_('playVideo');
  }

  /**
   * @override
   */
  pause() {
    this.sendCommand_('pauseVideo');
  }

  /**
   * @override
   */
  mute() {
    this.sendCommand_('mute');
  }

  /**
   * @override
   */
  unmute() {
    this.sendCommand_('unMute');
  }

  /**
   * @override
   */
  showControls() {
    // Not supported.
  }

  /**
   * @override
   */
  hideControls() {
    // Not supported.
  }
};

AMP.registerElement('amp-youtube', AmpYoutube);
