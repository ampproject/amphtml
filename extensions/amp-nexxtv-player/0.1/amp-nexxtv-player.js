/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {once} from '../../../src/utils/function';

const TAG = 'amp-nexxtv-player';

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpNexxtvPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {function():string} */
    this.getVideoIframeSrc_ = once(() => this.resolveVideoIframeSrc_());

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(this.getVideoIframeSrc_(), opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /**
   * @return {string}
   * @private
   */
  resolveVideoIframeSrc_() {
    const {element: el} = this;

    const mediaId = userAssert(
      el.getAttribute('data-mediaid'),
      'The data-mediaid attribute is required for <amp-nexxtv-player> %s',
      el
    );

    const client = userAssert(
      el.getAttribute('data-client'),
      'The data-client attribute is required for <amp-nexxtv-player> %s',
      el
    );

    const delay = el.getAttribute('data-seek-to') || '0';
    const mode = el.getAttribute('data-mode') || 'static';
    const streamtype = el.getAttribute('data-streamtype') || 'video';
    const origin =
      el.getAttribute('data-origin') || 'https://embed.nexx.cloud/';
    const disableAds = el.getAttribute('data-disable-ads');
    const streamingFilter = el.getAttribute('data-streaming-filter');

    let src = origin;

    src += `${encodeURIComponent(client)}/`;
    src += `${encodeURIComponent(streamtype)}/`;
    src += encodeURIComponent(mediaId);
    src += `?dataMode=${encodeURIComponent(mode)}&platform=amp`;

    if (delay > 0) {
      src += `&delay=${encodeURIComponent(delay)}`;
    }

    if (disableAds === '1') {
      src += '&disableAds=1';
    }

    if (streamingFilter !== null && streamingFilter.length > 0) {
      src += `&streamingFilter=${encodeURIComponent(streamingFilter)}`;
    }

    return assertAbsoluteHttpOrHttpsUrl(src);
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(this.win, 'message', event => {
      this.handleNexxMessage_(event);
    });

    this.element.appendChild(this.iframe_);
    const loaded = this.loadPromise(this.iframe_).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
    this.playerReadyResolver_(loaded);
    return loaded;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_) {
      this.pause();
    }
  }

  /** @override */
  unlayoutOnPause() {
    // TODO(aghassemi, #8264): Temp until #8264 is fixed.
    return true;
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
    return true;
  }

  /**
   * @param  {string} command
   * @private
   */
  sendCommand_(command) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(
          dict({
            'cmd': command,
          }),
          '*'
        );
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleNexxMessage_(event) {
    const eventData = getData(event);
    if (!eventData || event.source !== this.iframe_.contentWindow) {
      return;
    }

    const data = objOrParseJson(eventData);
    if (!data) {
      return;
    }

    redispatch(this.element, data['event'], {
      'play': VideoEvents.PLAYING,
      'pause': VideoEvents.PAUSE,
      'mute': VideoEvents.MUTED,
      'unmute': VideoEvents.UNMUTED,
    });
  }

  // VideoInterface Implementation

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
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  showControls() {
    // Not implemented
  }

  /** @override */
  hideControls() {
    // Not implemented
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
  AMP.registerElement(TAG, AmpNexxtvPlayer);
});
