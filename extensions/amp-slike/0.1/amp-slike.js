/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {SandboxOptions, originMatches} from '../../../src/iframe-video';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setIsMediaComponent} from '../../../src/video-interface';
import {userAssert} from '../../../src/log';

/** @private @const */
const SANDBOX = [
  SandboxOptions.ALLOW_SCRIPTS,
  SandboxOptions.ALLOW_SAME_ORIGIN,
  SandboxOptions.ALLOW_POPUPS,
  SandboxOptions.ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION,
];

/**
@enum {string}
* @private
*/
const SlikeEvent = {
  API_READY: 'apiready',
  PLAY: 'play',
  PAUSE: 'pause',
  MUTE: 'mute',
  UNMUTE: 'unmute',
  AD_START: 'ad_start',
  AD_END: 'ad_end',
  VIDEO_START: 'started',
  VIDEO_END: 'video_end',
};

export class AmpSlike extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.apikey_ = '';

    /** @private {string} */
    this.videoid_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.config_ = null;

    /** @private {string} */
    this.poster_ = '';

    /** @private {string} */
    this.splayer_ = '';

    /** @private {string} */
    this.baseUrl_ = 'https://slike.in/';

    /**@private {string}*/
    this.cb_ = '';

    /**@private {string}*/
    this.autoplay_ = 'true';
  }

  /** @override */
  buildCallback() {
    this.apikey_ = userAssert(
      this.element.getAttribute('data-apikey'),
      'The data-apikey attribute is required for <amp-slike> %s',
      this.element
    );

    this.videoid_ = userAssert(
      this.element.getAttribute('data-videoid'),
      'The data-videoid attribute is required for <amp-slike> %s',
      this.element
    );

    this.config_ = this.element.getAttribute('data-config');
    this.poster_ = this.element.getAttribute('data-poster');
    this.splayer_ = this.element.getAttribute('data-splayer');
    this.cb_ = this.element.getAttribute('data-cb');
    this.autoplay_ = this.element.getAttribute('data-autoplay') || 'true';

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
    setIsMediaComponent(this.element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    let src = '';
    if (this.splayer_) {
      src = `${this.baseUrl_}${this.splayer_}.html`;
    } else {
      src = `${this.baseUrl_}sl.html`;
    }

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('sandbox', SANDBOX.join(' '));
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    listen(this.win, 'message', this.onMessageReceived_.bind(this));

    return this.loadPromise(iframe);
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.poster_) {
      return;
    }
    const placeholder = this.win.document.createElement('amp-img');
    this.propagateAttributes(['aria-label'], placeholder);
    const src = this.poster_;
    placeholder.setAttribute('src', src);
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

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /**
   * @param {!Event} event
   * @private
   */
  onMessageReceived_(event) {
    if (!originMatches(event, this.iframe_, 'https://slike.in')) {
      return;
    }
    const eventData = getData(event);

    if (!eventData || !event.type || event.type != 'message') {
      return; // Event empty
    }

    switch (eventData['event']) {
      case SlikeEvent.API_READY:
        const tmp = {};
        tmp.type = 'config';
        if (this.config_) {
          tmp['data'] = this.config_;
        } else {
          tmp['data'] = JSON.stringify(
            dict({
              'videoid': this.videoid_,
              'apikey': this.apikey_,
              'autoplay': this.autoplay_ === 'true' ? true : false,
            })
          );
        }
        this.postMessage_(tmp);
        break;

      case SlikeEvent.AD_START:
      case SlikeEvent.AD_END:
      case SlikeEvent.VIDEO_START:
      case SlikeEvent.VIDEO_START:
      case SlikeEvent.MUTE:
      case SlikeEvent.UNMUTE:
      case SlikeEvent.PLAY:
      case SlikeEvent.PAUSE:
        if (this.cb_ && typeof window[this.cb_] === 'function') {
          window[this.cb_](eventData['event']);
        }
        break;
    }
  }

  /**
   * @override
   */
  postMessage_(message) {
    const endpoint = 'https://slike.in';
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(message, endpoint);
    }
  }

  /**
   * @override
   */
  play() {
    this.postMessage_({type: 'play'});
  }

  /**
   * @override
   */
  pause() {
    this.postMessage_({type: 'pause'});
  }

  /**
   * @override
   */
  mute() {
    this.postMessage_({type: 'mute'});
  }

  /**
   * @override
   */
  unmute() {
    this.postMessage_({type: 'unmute'});
  }
}

AMP.extension('amp-slike', '0.1', (AMP) => {
  AMP.registerElement('amp-slike', AmpSlike);
});
