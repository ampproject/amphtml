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

import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpBridPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.partnerID_ = '';

    /** @private {string} */
    this.feedID_ = '';

    /** @private {string} */
    this.playerID_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?number} */
    this.volume_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://services.brid.tv', opt_onLayout);
    this.preconnect.url('https://cdn.brid.tv', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    let feedType = '';

    if (this.element.hasAttribute('data-video')) {
      feedType = 'video';
    } else if (this.element.hasAttribute('data-playlist')) {
      feedType = 'playlist';
    } else if (this.element.hasAttribute('data-outstream')) {
      feedType = 'outstream';
    }

    //Create iframe
    const src = 'https://services.brid.tv/services/iframe/' +
        encodeURIComponent(feedType) +
        '/' + encodeURIComponent(this.feedID_) +
        '/' + encodeURIComponent(this.partnerID_) +
        '/' + encodeURIComponent(this.playerID_) + '/0/1';

    this.videoIframeSrc_ = assertAbsoluteHttpOrHttpsUrl(src);

    return this.videoIframeSrc_;
  }

  /** @override */
  buildCallback() {

    this.partnerID_ = user().assert(
        this.element.getAttribute('data-partner'),
        'The data-partner attribute is required for <amp-brid-player> %s',
        this.element);

    this.playerID_ = user().assert(this.element.getAttribute('data-player'),
        'The data-player attribute is required for <amp-brid-player> %s',
        this.element);

    this.feedID_ = user().assert(
        (this.element.getAttribute('data-video') ||
        this.element.getAttribute('data-playlist') ||
        this.element.getAttribute('data-outstream')),
        'Either the data-video or the data-playlist or the data-outstream ' +
        'attributes must be specified for <amp-brid-player> %s',
        this.element);

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    //Create iframe
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.getVideoIframeSrc_();
    this.applyFillContent(iframe);
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this. handleBridMessages_.bind(this)
    );

    this.element.appendChild(iframe);

    return this.loadPromise(iframe)
        .then(() => this.playerReadyPromise_);
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

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });
    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('amp-img');
    const partnerID = this.partnerID_;
    const feedID = this.feedID_;

    if (this.element.hasAttribute('data-video') ||
    		this.element.hasAttribute('data-playlist')) {

      const placeholderFallback = this.win.document.createElement('amp-img');
      placeholderFallback.setAttribute('src',
    		  'https://cdn.brid.tv/live/default/defaultSnapshot.png');
      placeholderFallback.setAttribute('referrerpolicy', 'origin');
      placeholderFallback.setAttribute('layout', 'fill');
      placeholderFallback.setAttribute('fallback', '');
      placeholder.appendChild(placeholderFallback);

      placeholder.setAttribute('src',
    		  'https://cdn.brid.tv/live/partners/' +
    		  encodeURIComponent(partnerID) + '/snapshot/' +
    		  encodeURIComponent(feedID) + '.jpg');
      placeholder.setAttribute('layout', 'fill');
      placeholder.setAttribute('placeholder', '');
      placeholder.setAttribute('referrerpolicy', 'origin');
      this.applyFillContent(placeholder);

      return placeholder;

    } else {
      return false;
    }

  }

  /**
     * Sends a command to the player through postMessage.
     * @param {string} command
     * @param {*=} opt_arg
     * @private
     * */
  sendCommand_(command, opt_arg) {

    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const args = opt_arg === undefined ? '' : '|' + opt_arg;
        const message = 'Brid|' + command + args;
        this.iframe_.contentWindow./*OK*/postMessage(message, '*');
      }
    });
  }

  /** @private */
  handleBridMessages_(event) {
    const eventData = /** @type {?string|undefined} */ (getData(event));
    if (event.origin !== 'https://services.brid.tv' ||
        event.source != this.iframe_.contentWindow ||
        typeof eventData !== 'string' || eventData.indexOf('Brid') !== 0) {
      return;
    }

    const params = eventData.split('|');

    if (params[2] == 'trigger') {
      if (params[3] == 'ready') {
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
        this.playerReadyResolver_(this.iframe_);
      } else if (params[3] == 'play') {
        this.element.dispatchCustomEvent(VideoEvents.PLAYING);
      } else if (params[3] == 'pause') {
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
      }
    } else if (params[2] == 'volume') {
      this.volume_ = parseFloat(params[3]);
      if (this.volume_ == 0) {
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
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('muted', 1);
    this.sendCommand_('volume', 0);
  }

  /** @override */
  unmute() {
    this.sendCommand_('muted', 0);
    this.sendCommand_('volume', 1);
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
}


AMP.extension('amp-brid-player', '0.1', AMP => {
  AMP.registerElement('amp-brid-player', AmpBridPlayer);
});
