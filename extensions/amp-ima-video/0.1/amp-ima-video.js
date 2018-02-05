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

import {ImaPlayerData} from '../../../ads/google/ima-player-data';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {assertHttpsUrl} from '../../../src/url';
import {
  childElementsByTag,
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  isJsonScriptTag,
  removeElement,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  getData,
  listen,
} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isEnumValue} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {
  isObject,
  toArray,
  toWin,
} from '../../../src/types';

/** @const */
const TAG = 'amp-ima-video';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpImaVideo extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?string} */
    this.preconnectSource_ = null;

    /** @private {?string} */
    this.preconnectTrack_ = null;

    /**
     * Maps events to their unlisteners.
     * @private {!Object<string, function()>}
     */
    this.unlisteners_ = {};

    /** @private {!ImaPlayerData} */
    this.playerData_ = new ImaPlayerData();
  }

  /** @override */
  buildCallback() {
    this.viewport_ = this.getViewport();
    if (this.element.getAttribute('data-delay-ad-request') === 'true') {
      this.unlisteners_['onFirstScroll'] =
          this.viewport_.onScroll(() => {
            this.sendCommand_('onFirstScroll');
          });
      // Request ads after 3 seconds, if something else doesn't trigger an ad
      // request before that.
      Services.timerFor(this.win).delay(
          () => { this.sendCommand_('onAdRequestDelayTimeout'); }, 3000);

    }

    assertHttpsUrl(this.element.getAttribute('data-tag'),
        'The data-tag attribute is required for <amp-video-ima> and must be ' +
            'https');

    // Handle <source> and <track> children
    const sourceElements = childElementsByTag(this.element, 'SOURCE');
    const trackElements = childElementsByTag(this.element, 'TRACK');
    const childElements =
        toArray(sourceElements).concat(toArray(trackElements));
    if (childElements.length > 0) {
      const children = [];
      childElements.forEach(child => {
        // Save the first source and first track to preconnect.
        if (child.tagName == 'SOURCE' && !this.preconnectSource_) {
          this.preconnectSource_ = child.src;
        } else if (child.tagName == 'TRACK' && !this.preconnectTrack_) {
          this.preconnectTrack_ = child.src;
        }
        children.push(child./*OK*/outerHTML);
      });
      this.element.setAttribute(
          'data-child-elements', JSON.stringify(children));
    }

    // Handle IMASetting JSON
    const scriptElement = childElementsByTag(this.element, 'SCRIPT')[0];
    if (scriptElement && isJsonScriptTag(scriptElement)) {
      this.element.setAttribute(
          'data-ima-settings', scriptElement./*OK*/innerHTML);
    }
  }

  /** @override */
  preconnectCallback() {
    this.preconnect.preload(
        'https://imasdk.googleapis.com/js/sdkloader/ima3.js', 'script');
    const source = this.element.getAttribute('data-src');
    if (source) {
      this.preconnect.url(source);
    }
    if (this.preconnectSource_) {
      this.preconnect.url(this.preconnectSource_);
    }
    if (this.preconnectTrack_) {
      this.preconnect.url(this.preconnectTrack_);
    }
    this.preconnect.url(this.element.getAttribute('data-tag'));
    preloadBootstrap(this.win, this.preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(toWin(this.element.ownerDocument.defaultView),
        this.element, 'ima-video');
    iframe.setAttribute('allowfullscreen', 'true');
    this.applyFillContent(iframe);

    this.iframe_ = iframe;

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handlePlayerMessages_.bind(this)
    );

    this.element.appendChild(iframe);

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.win.document).register(this);

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
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
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    if (this.iframe_) {
      this.sendCommand_('resize', {
        'width': this.iframe_./*OK*/offsetWidth,
        'height': this.iframe_./*OK*/offsetHeight,
      });
    }
  }

  /**
   * Sends a command to the player through postMessage. NOTE: All commands sent
   * before imaVideo fires VideoEvents.LOAD will be queued until that event
   * fires.
   * @param {string} command
   * @param {Object=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    if (this.iframe_ && this.iframe_.contentWindow)
    {
      this.playerReadyPromise_.then(() => {
        this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify(dict({
          'event': 'command',
          'func': command,
          'args': opt_args || '',
        })), '*');
      });
    }
    // If we have an unlistener for this command, call it.
    if (this.unlisteners_[command]) {
      this.unlisteners_[command]();
    }
  }

  /** @private */
  handlePlayerMessages_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }
    const eventData = getData(event);

    if (isObject(eventData)) {
      const videoEvent = eventData['event'];
      if (isEnumValue(VideoEvents, videoEvent)) {
        if (videoEvent == VideoEvents.LOAD) {
          this.playerReadyResolver_(this.iframe_);
        }
        this.element.dispatchCustomEvent(videoEvent);
      } else if (videoEvent == ImaPlayerData.IMA_PLAYER_DATA) {
        this.playerData_ = /** @type {!ImaPlayerData} */(eventData['data']);
      }
    }
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

  /**
   * @override
   */
  fullscreenEnter() {
    // TODO(@aghassemi, #10597) Make internal <video> element go fullscreen instead
    // using postMessages
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
    // TODO(@aghassemi, #10597) Report fullscreen status of internal <video>
    // element rather than iframe
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
    return this.playerData_.currentTime;
  }

  /** @override */
  getDuration() {
    return this.playerData_.duration;
  }

  /** @override */
  getPlayedRanges() {
    return this.playerData_.playedRanges;
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpImaVideo);
});
