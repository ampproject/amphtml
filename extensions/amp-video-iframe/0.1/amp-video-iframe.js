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
import {LayoutPriority} from '../../../src/layout';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {
  createFrameFor,
  isJsonOrObj,
  objOrParseJson,
  originMatches,
} from '../../../src/iframe-video';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {htmlFor} from '../../../src/static-template';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isAdLike, looksLikeTrackingIframe} from '../../../src/iframe-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';


/** @private @const */
const TAG = 'amp-video-iframe';

/** @private @const */
const SANDBOX = 'allow-scripts allow-same-origin';

/** @private @const */
const ALLOWED_EVENTS = [
  'registered',
  'load',
  'playing',
  'pause',
  'ended',
  'muted',
  'unmuted',
  'reloaded',
  'ad_start',
  'ad_end',
];


/** @implements {../../../src/video-interface.VideoInterface} */
class AmpVideoIframe extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.isAdLike_ = false;

    /** @private {boolean} */
    this.isTrackingIframe_ = false;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {!UnlistenDef|null} */
    this.unlistenFrame_ = null;

    /** @private {?function()} */
    this.readyPromise_ = null;

    /** @private {?function()} */
    this.readyResolver_ = null;

    /** @private {?function()} */
    this.readyRejecter_ = null;

    /** @private {boolean} */
    this.embedReady_ = false;

    /** @private {boolean} */
    this.canPlay_ = false;

    /**
     * @param {!Event} e
     * @private
     */
    this.boundOnMessage_ = e => this.onMessage_(e);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  onLayoutMeasure() {
    const {element} = this;
    this.isAdLike_ = isAdLike(element);
    this.isTrackingIframe_ = looksLikeTrackingIframe(element.getLayoutBox());
  }

  /** @override */
  getLayoutPriority() {
    if (this.isAdLike_) {
      return LayoutPriority.ADS; // See AmpAd3PImpl.
    }
    if (this.isTrackingIframe_) {
      return LayoutPriority.METADATA;
    }
    return super.getLayoutPriority();
  }

  /** @override */
  buildCallback() {
    installVideoManagerForDoc(this.getAmpDoc());
  }

  /** @override */
  layoutCallback() {
    this.iframe_ = createFrameFor(this, this.getSrc_(), SANDBOX);
    this.unlistenFrame_ = listen(this.win, 'message', this.boundOnMessage_);
    return this.createReadyPromise_().then(() => this.onReady_());
  }

  /** @private */
  onReady_() {
    const {element} = this;
    Services.videoManagerForDoc(element).register(this);
    element.dispatchCustomEvent(VideoEvents.LOAD);
  }

  /** @override */
  createPlaceholderCallback() {
    const {element} = this;
    const poster =
        htmlFor(element)`<amp-img layout=fill placeholder></amp-img>`;

    poster.setAttribute('src',
        this.user().assertString(element.getAttribute('poster')));

    return poster;
  }

  /** @override */
  unlayoutCallback() {
    this.removeIframe_();
    return true; // layout again.
  }

  /** @private */
  removeIframe_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenFrame_) {
      this.unlistenFrame_();
      this.unlistenFrame_ = null;
      this.embedReady_ = false;
      this.canPlay_ = false;
    }
  }

  /** @private */
  getSrc_() {
    // TODO: assert https
    return this.element.getAttribute('src');
  }

  /**
   * @return {!Promise}
   * @private
   */
  createReadyPromise_() {
    const {promise, resolve, reject} = new Deferred();
    this.readyPromise_ = promise;
    this.readyResolver_ = resolve;
    this.readyRejecter_ = reject;
    return promise;
  }

  /**
   * @param {!Event} event
   */
  onMessage_(event) {
    if (!this.iframe_) {
      return;
    }

    if (!originMatches(event, this.iframe_, /.*/)) {
      return;
    }

    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);
    const eventReceived = data['event'];

    this.embedReady_ = this.embedReady_ || eventReceived == 'embed-ready';
    this.canPlay_ = this.canPlay_ || eventReceived == 'canplay';

    if (eventReceived == 'canplay' || eventReceived == 'embed-ready') {
      if (this.embedReady_ && this.canPlay_) {
        dev().assert(this.readyResolver_).call();
      }
      return;
    }

    if (eventReceived == 'error' && (!this.embedReady_ || !this.canPlay_)) {
      dev().assert(this.readyRejecter_).call();
      return;
    }

    if (ALLOWED_EVENTS.indexOf(eventReceived) > -1) {
      this.element.dispatchCustomEvent(eventReceived);
      return;
    }
  }

  /**
   * @param {string} method
   * @private
   */
  method_(method) {
    if (!this.readyPromise_) {
      return;
    }
    this.readyPromise_.then(() => {
      if (!this.iframe_ || !this.iframe_.contentWindow) {
        return;
      }
      const message = JSON.stringify(dict({
        'event': 'method',
        'method': method,
      }));
      this.iframe_.contentWindow./*OK*/postMessage(message, '*');
    });
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /** @override */
  pause() {
    this.method_('pause');
  }

  /** @override */
  play() {
    this.method_('play');
  }

  /** @override */
  mute() {
    this.method_('mute');
  }

  /** @override */
  unmute() {
    this.method_('unmute');
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return this.element.hasAttribute('implements-media-session');
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return this.element.hasAttribute('implements-rotate-to-fullscreen');
  }

  /** @override */
  fullscreenEnter() {
    this.method_('fullscreenenter');
  }

  /** @override */
  fullscreenExit() {
    this.method_('fullscreenexit');
  }

  /** @override */
  isFullscreen() {
    return false;
  }

  /** @override */
  showControls() {
    this.method_('showcontrols');
  }

  /** @override */
  hideControls() {
    this.method_('hidecontrols');
  }

  /** @override */
  getMetadata() {
    // TODO(alanorozco)
  }

  /** @override */
  getDuration() {
    // TODO(alanorozco)
    return 0;
  }

  /** @override */
  getCurrentTime() {
    // TODO(alanorozco)
    return 0;
  }

  /** @override */
  getPlayedRanges() {
    // TODO(alanorozco)
    return [];
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpVideoIframe);
});
