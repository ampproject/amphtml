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

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {
  createFrameFor,
  mutedOrUnmutedEvent,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {dev, userAssert} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {htmlFor} from '../../../src/static-template';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

const TAG = 'amp-brid-player';

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

  /**
   * Gets the source of video
   *
   * @return {string}
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    let feedType = '';
    const itemsNum = this.element.hasAttribute('data-dynamic') ? '10' : '1';

    if (this.element.hasAttribute('data-video')) {
      feedType = 'video';
    } else if (this.element.hasAttribute('data-dynamic')) {
      feedType = this.element.getAttribute('data-dynamic');
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
        '/' + encodeURIComponent(this.playerID_) + '/0/' + itemsNum + '/?amp=1';

    this.videoIframeSrc_ = assertAbsoluteHttpOrHttpsUrl(src);

    return this.videoIframeSrc_;
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.partnerID_ = userAssert(
        element.getAttribute('data-partner'),
        'The data-partner attribute is required for <amp-brid-player> %s',
        element);

    this.playerID_ = userAssert(element.getAttribute('data-player'),
        'The data-player attribute is required for <amp-brid-player> %s',
        element);

    this.feedID_ = userAssert(
        (element.getAttribute('data-video') ||
            element.getAttribute('data-playlist') ||
            element.getAttribute('data-outstream')),
        'Either the data-video or the data-playlist or the data-outstream ' +
        'attributes must be specified for <amp-brid-player> %s',
        element);

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleBridMessage_.bind(this)
    );

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

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  createPlaceholderCallback() {
    const {element} = this;

    if (!element.hasAttribute('data-video') &&
        !element.hasAttribute('data-playlist')) {
      return;
    }

    const {partnerID_: partnerID, feedID_: feedID} = this;

    const placeholder = htmlFor(element)`
      <amp-img referrerpolicy=origin layout=fill placeholder>
        <amp-img referrerpolicy=origin layout=fill fallback
            src="https://cdn.brid.tv/live/default/defaultSnapshot.png">
        </amp-img>
      </amp-img>`;

    this.propagateAttributes(['aria-label'], placeholder);
    this.applyFillContent(placeholder);

    placeholder.setAttribute('src',
        `https://cdn.brid.tv/live/partners/${encodeURIComponent(partnerID)}` +
        `/snapshot/${encodeURIComponent(feedID)}.jpg`);

    const altText = placeholder.hasAttribute('aria-label') ?
      'Loading video - ' + placeholder.getAttribute('aria-label') :
      'Loading video';

    placeholder.setAttribute('alt', altText);

    return placeholder;
  }

  /**
   * @override
   */
  createLoaderBrandCallback() {
    return createVideoLoaderBrand(this.element);
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

  /**
   * @param {!Event} event
   * @private
   */
  handleBridMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://services.brid.tv')) {
      return;
    }

    const eventData = /** @type {?string|undefined} */ (getData(event));
    if (typeof eventData !== 'string' || eventData.indexOf('Brid') !== 0) {
      return;
    }

    const {element} = this;
    const params = eventData.split('|');

    if (params[2] == 'trigger') {
      if (params[3] == 'ready') {
        this.playerReadyResolver_(this.iframe_);
      }
      redispatch(element, params[3], {
        'ready': VideoEvents.LOAD,
        'play': VideoEvents.PLAYING,
        'pause': VideoEvents.PAUSE,
      });
      return;
    }

    if (params[2] == 'volume') {
      this.volume_ = parseFloat(params[3]);
      element.dispatchCustomEvent(mutedOrUnmutedEvent(this.volume_ <= 0));
      return;
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


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpBridPlayer);
});
