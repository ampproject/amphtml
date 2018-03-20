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
import {clamp} from '../../../src/utils/math';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isFiniteNumber, isObject} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {parseJson} from '../../../src/json';
import {removeElement} from '../../../src/dom';
import {startsWith} from '../../../src/string';
import {user} from '../../../src/log';

const TAG = 'amp-bodymovin-animation';

export class AmpBodymovinAnimation extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.loop_ = null;

    /** @private {?boolean} */
    this.autoplay_ = null;

    /** @private {?string} */
    this.src_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
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
    this.preconnect.url('https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin_light.min.js', opt_onLayout);
  }

  /** @override */
  buildCallback() {
    this.loop_ = this.element.getAttribute('loop') || 'true';
    this.autoplay_ = !this.element.hasAttribute('noautoplay');
    user().assert(this.element.hasAttribute('src'),
        'The src attribute must be specified for <amp-bodymovin-animation>');
    assertHttpsUrl(this.element.getAttribute('src'), this.element);
    this.src_ = this.element.getAttribute('src');
    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    // Register relevant actions
    this.registerAction('play', () => { this.play_(); }, ActionTrust.LOW);
    this.registerAction('pause', () => { this.pause_(); }, ActionTrust.LOW);
    this.registerAction('stop', () => { this.stop_(); }, ActionTrust.LOW);
    this.registerAction('seekTo', invocation => {
      const args = invocation.args;
      if (args) {
        this.seekTo_(args);
      }
    }, ActionTrust.LOW);
  }

  /** @override */
  layoutCallback() {
    const animData = batchFetchJsonFor(this.ampdoc_, this.element);
    return animData.then(data => {
      const opt_context = {
        loop: this.loop_,
        autoplay: this.autoplay_,
        animationData: data,
      };
      const iframe = getIframe(
          this.win, this.element, 'bodymovinanimation', opt_context);
      return Services.vsyncFor(this.win).mutatePromise(() => {
        this.applyFillContent(iframe);
        this.unlistenMessage_ = listen(
            this.win,
            'message',
            this.handleBodymovinMessages_.bind(this)
        );
        this.element.appendChild(iframe);
        this.iframe_ = iframe;
      }).then(() => {
        return this.loadPromise(this.iframe_);
      });
    });
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

  /** @private */
  handleBodymovinMessages_(event) {
    if (this.iframe_ && event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!getData(event) || !(isObject(getData(event))
        || startsWith(/** @type {string} */ (getData(event)), '{'))) {
      return; // Doesn't look like JSON.
    }

    /** @const {?JsonObject} */
    const eventData = /** @type {?JsonObject} */ (isObject(getData(event))
      ? getData(event)
      : parseJson(getData(event)));
    if (eventData === undefined) {
      return; // We only process valid JSON.
    }
    if (eventData['action'] == 'ready') {
      this.playerReadyResolver_();
    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} action
   * @param {string=} opt_valueType
   * @param {number=} opt_value
   * @private
   * */
  sendCommand_(action, opt_valueType, opt_value) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify(dict({
          'action': action,
          'valueType': opt_valueType || '',
          'value': opt_value || '',
        }));
        this.iframe_.contentWindow. /*OK*/postMessage(message, '*');
      }
    });
  }

  /** @private */
  play_() {
    this.sendCommand_('play');
  }

  /** @private */
  pause_() {
    this.sendCommand_('pause');
  }

  /** @private */
  stop_() {
    this.sendCommand_('stop');
  }

  /** @private */
  seekTo_(args) {
    const time = parseFloat(args && args['time']);
    // time based seek
    if (isFiniteNumber(time)) {
      this.sendCommand_('seekTo', 'time', time);
    }
    // percent based seek
    const percent = parseFloat(args && args['percent']);
    if (isFiniteNumber(percent)) {
      this.sendCommand_('seekTo', 'percent', clamp(percent, 0, 1));
    }
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpBodymovinAnimation);
});
