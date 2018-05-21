/* eslint-disable no-unused-vars */
/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';

import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {fullscreenEnter, fullscreenExit, isFullscreenElement, removeElement} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {setStyles} from '../../../src/style';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpViqeoPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string} */
    this.videoId_ = null;

    /** @private {?string} */
    this.profileId_ = null;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?number} */
    this.volume_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Object} */
    this.viqeoPlayer_ = null;

    /** @private {boolean} */
    this.kindIsProd_ = true;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://static.viqeo.tv', opt_onLayout);
    this.preconnect.url('https://stage.embed.viqeo.tv', opt_onLayout);
  }

  /**
   * @param {!Layout} layout
   * @return {boolean}
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  createPlaceholderCallback() {
    return null;
  }

  /** @override */
  buildCallback() {
    this.videoId_ = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-viqeo-player> %s',
        this.element);

    this.profileId_ = user().assert(
        this.element.getAttribute('data-profileid'),
        'The data-profileid attribute is required for <amp-viqeo-player> %s',
        this.element);

    this.kindIsProd_ = this.element.getAttribute('data-kind') !== 'stage';


    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);

  }

  /** @override */
  layoutCallback() {

    const iframeStyle = this.element.getAttribute('data-iframe-style')
        || 'position: absolute';
    const iframeHeight = this.element.getAttribute('data-iframe-height')
        || '100%';
    const iframeWidth = this.element.getAttribute('data-iframe-width')
        || '100%';

    let scriptPlayerInit = this.element.getAttribute('data-script-url');
    scriptPlayerInit =
        (scriptPlayerInit
            && scriptPlayerInit.length && decodeURI(scriptPlayerInit)
        )
        ||
        (this.kindIsProd_
          ? 'https://cdn.viqeo.tv/js/vq_player_init.js'
          : 'https://static.viqeo.tv/js/vq_player_init.js?branch=dev1'
        );

    const ampIframe = this.element.ownerDocument.createElement('iframe');
    ampIframe.src = 'about:blank';
    if (ampIframe.contentWindow) {
      frameLoaded.call(this);
    } else {
      ampIframe.onload = frameLoaded.bind(this);
    }

    this.element.appendChild(ampIframe);
    this.iframe_ = ampIframe;

    return this.loadPromise(ampIframe);

    /** @this {AmpViqeoPlayer} */
    function frameLoaded() {
      const doc = ampIframe.contentWindow.document;
      setStyles(doc.body, {
        'marginLeft': 0,
        'marginRight': 0,
        'marginTop': 0,
        'marginBottom': 0,
      });

      const scr = doc.createElement('script');
      scr.async = true;
      scr.src = scriptPlayerInit;
      doc.head.appendChild(scr);

      const mark = doc.createElement('div');

      setStyles(mark, {
        'position': 'relative',
        'width': '100%',
        'height': '0',
        'paddingBottom': '100%',
      });
      mark.setAttribute('data-vnd', this.videoId_);
      mark.setAttribute('data-profile', this.profileId_);
      mark.classList.add('viqeo-embed');

      const iframe = doc.createElement('iframe');

      iframe.setAttribute('width', iframeWidth);
      iframe.setAttribute('height', iframeHeight);
      iframe.setAttribute('style', iframeStyle);
      iframe.setAttribute('frameBorder', '0');
      iframe.setAttribute('allowFullScreen', '');
      iframe.src = this.getVideoIframeSrc_();

      mark.appendChild(iframe);

      const wrapper = doc.createElement('div');
      wrapper.appendChild(mark);

      doc.body.appendChild(wrapper);

      const ampIframeWindow = ampIframe.contentWindow;

      this.unlistenMessage_ = listen(
          ampIframeWindow,
          'message',
          this.handleViqeoMessages_.bind(this)
      );

      if (!ampIframeWindow['VIQEO']) {
        ampIframeWindow['onViqeoLoad'] = this.viqeoPlayerInitLoaded_.bind(this);
      } else {
        this.viqeoPlayerInitLoaded_(ampIframeWindow['VIQEO']);
      }

      this.applyFillContent(ampIframe);
    }

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

  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    let viqeoPlayerUrl = this.element.getAttribute('data-player-url');
    viqeoPlayerUrl =
        (viqeoPlayerUrl
            && viqeoPlayerUrl.length && decodeURI(viqeoPlayerUrl)
        )
        || (this.kindIsProd_ ? 'https://cdn.viqeo.tv/embed' : 'https://stage.embed.viqeo.tv');


    // Create iframe source path
    const src = viqeoPlayerUrl + '/?vid=' + this.videoId_;

    this.videoIframeSrc_ = assertAbsoluteHttpOrHttpsUrl(src);

    return this.videoIframeSrc_;
  }

  /**
   * @param {!Event|{data: !JsonObject}} event
   * @return {?JsonObject|string|undefined}
   * @private
   * */
  handleViqeoMessages_(event) {
    const eventData = /** @type {?string|undefined} */ (getData(event));
    if (event.source !== this.win ||
      typeof eventData !== 'string' ||
      eventData.indexOf('ViqeoPlayer') !== 0) {
      return;
    }

    const params = eventData.split('|');
    if (params[1] === 'trigger') {
      if (params[2] === 'ready') {
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
        this.playerReadyResolver_(this.iframe_);
      } else if (params[2] === 'play') {
        this.element.dispatchCustomEvent(VideoEvents.PLAYING);
      } else if (params[2] === 'pause') {
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
      }
    } else if (params[1] === 'volume') {
      this.volume_ = parseFloat(params[2]);
      if (this.volume_ === 0) {
        this.element.dispatchCustomEvent(VideoEvents.MUTED);
      } else {
        this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
      }
    }
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
  play() {
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
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
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
    return false;
  }

  /** @override */
  getCurrentTime() {
    if (!this.viqeoPlayer_) {
      return 0;
    }
    return this.viqeoPlayer_.getCurrentTime();
  }

  /** @override */
  getDuration() {
    if (!this.viqeoPlayer_) {
      return 1;
    }
    return this.viqeoPlayer_.getDuration();
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /**
   * Sends a command to the player
   * @param {string} command
   * @private
   * */
  sendCommand_(command) {
    const player = this.viqeoPlayer_;
    this.playerReadyPromise_.then(() => {
      switch (command) {
        case 'pause': player.pause(); break;
        case 'play': player.play(); break;
        case 'mute': player.setVolume(0); break;
        case 'unmute': player.setVolume(1); break;
      }
    });
  }

  /**
   * @param {Object} VIQEO
   * @param  {function(Object)} VIQEO.getPlayers - returns viqeo player
   * @param {function(function(Object), Object)} VIQEO.subscribeTracking - subscriber
   * @private
   */
  viqeoPlayerInitLoaded_(VIQEO) {
    const ampIframeWindow = this.iframe_.contentWindow;

    subscribe('added', 'ready', () => {
      const players = VIQEO['getPlayers']({container: 'stdPlayer'});
      this.viqeoPlayer_ = players && players[0];
    });
    subscribe('paused', 'pause');
    subscribe('played', 'play');
    subscribe('replayed', 'play');

    function subscribe(playerEventName, targetEventName, extraHandler = null) {
      VIQEO['subscribeTracking'](
          () => {
            ampIframeWindow['postMessage'](
                `ViqeoPlayer|trigger|${targetEventName}`, '*'
            );
            if (extraHandler) {
              extraHandler();
            }
          },
          {eventName: `Player:${playerEventName}`, container: 'stdPlayer'}
      );
    }
  }
}

AMP.extension('amp-viqeo-player', '0.1', AMP => {
  AMP.registerElement('amp-viqeo-player', AmpViqeoPlayer);
});
