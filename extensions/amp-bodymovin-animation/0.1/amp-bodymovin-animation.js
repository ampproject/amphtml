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

import {ActionTrust} from '../../../src/action-trust';
import {Services} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';
import {batchFetchJsonFor} from '../../../src/batched-json';
import {dict} from '../../../src/utils/object';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

const TAG = 'amp-bodymovin-animation';

/** @enum {number} */
export const PLAYING_STATE = {
  LOADED_NOT_PLAYING: 0,
  PLAYING: 1,
  PAUSED: 2,
  STOPPED: 3, 
};

export class AmpBodymovinAnimation extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.loop_ = 'true';

    /** @private {string} */
    this.autoplay_ = true;

    /** @private {string} */
    this.src_ = null;

    /** @private {enum} */
    this.playingState_;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    preloadBootstrap(this.win, this.preconnect);
    this.preconnect.url('https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovinjs', opt_onLayout);
  }

  /** @override */
  buildCallback() {
    this.loop_ = this.element.getAttribute('loop') ?
      this.element.getAttribute('loop') : this.loop_;
    this.autoplay_ = !this.element.hasAttribute('no-autoplay');
    this.playingState_ = this.autoplay_ ? PLAYING_STATE.PLAYING : PLAYING_STATE.LOADED_NOT_PLAYING;

    user().assert(this.element.hasAttribute('src'),
        'The src attribute must be specified for <amp-bodymovin-animation>');
    assertHttpsUrl(this.element.getAttribute('src'), this.element);
    this.src_ = this.element.getAttribute('src');

    // Register relevant actions
    this.registerAction('play', () => { this.play_(); }, ActionTrust.LOW);
    this.registerAction('pause', () => { this.pause_(); }, ActionTrust.LOW);
    this.registerAction('stop', () => { this.stop_(); }, ActionTrust.LOW);
  }

  /** @override */
  layoutCallback() {
    this.element.setAttribute('data-loop', this.loop_);
    const animData = batchFetchJsonFor(this.ampdoc_, this.element);
    return animData.then(data => {
      // We will get here when the data has been fetched from the server
      this.element.setAttribute('data-animation-data', JSON.stringify(data));

      return Services.vsyncFor(this.win).mutatePromise(() => {
        const iframe = getIframe(this.win, this.element, 'bodymovinanimation');
        this.applyFillContent(iframe);
        this.element.appendChild(iframe);
        this.iframe_ = iframe;
      }).then(() => {
        return this.loadPromise(this.iframe_).then(() => {
          const message = JSON.stringify(dict({
            'messageType': 'load dict',
            'loop': this.loop_,
            'animationData': data,
            'autoplay': this.autoplay_,
          }));
          this.iframe_.contentWindow./*OK*/postMessage(message, '*');
        });
      });
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  play_() {
    if (this.playingState_ == PLAYING_STATE.PLAYING) {
      return;
    }

    const message = JSON.stringify(dict({
      'messageType': 'action',
      'action': 'play',
    }));
    this.iframe_.contentWindow./*OK*/postMessage(message, '*');
    this.playingState_ = PLAYING_STATE.PLAYING;
  }

  pause_() {
    if (this.playingState_ == PLAYING_STATE.PAUSED) {
      return;
    }

    const message = JSON.stringify(dict({
      'messageType': 'action',
      'action': 'pause',
    }));
    this.iframe_.contentWindow./*OK*/postMessage(message, '*');
    this.playingState_ = PLAYING_STATE.PAUSED;
  }

  stop_() {
    if (this.playingState_ == PLAYING_STATE.STOPPED) {
      return;
    }

    const message = JSON.stringify(dict({
      'messageType': 'action',
      'action': 'stop',
    }));
    this.iframe_.contentWindow./*OK*/postMessage(message, '*');
    this.playingState_ = PLAYING_STATE.STOPPED;
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpBodymovinAnimation);
});
