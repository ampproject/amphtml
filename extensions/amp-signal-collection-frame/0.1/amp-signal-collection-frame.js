/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {CONFIG} from './_amp-signal-collection-frame-config';
import {
  createElementWithAttributes,
  removeChildren,
} from '../../../src/dom';
import {Layout} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {isValidAttr} from '../../../src/sanitizer';
import {user} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-signal-collection-frame';

/**
 * @const {number} interval at which messages about touch events is sent
 * @visibleForTesting
 */
export const MESSAGE_INTERVAL_MS = 100;

export class AmpSignalCollectionFrame extends AMP.BaseElement {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /** @private {number} interval timer for broadcasting events to frame */
    this.intervalId_ = -1;

    /**
    * Derived from config plus optional hash.
    * @private {?string}
    */
    this.src_ = null;

    /** @private {!Array<!UnlistenDef>}} */
    this.unlisteners_ = [];
  }

  /** @override */
  buildCallback() {
    const type = this.element.getAttribute('type');
    user().assert(type, `${TAG} requires attribute type`);
    const src = CONFIG[type];
    user().assert(src, `${TAG}: invalid type ${type}`);

    const hashAttributeName = 'data-hash';
    const hash = this.element.getAttribute(hashAttributeName);
    user().assert(isValidAttr(this.element.tagName, hashAttributeName, hash),
        `${TAG}:${type} invalid ${hashAttributeName}`);

    this.src_ = src + (hash ? `#${hash}` : '');
    // Consider the element invisible.
    this.element.setAttribute('aria-hidden', 'true');
  }

  /** @override */
  getPriority() {
    // Set priority of 1 to ensure it executes after AMP creative content.
    return 1;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED;
  }

  /** @override */
  layoutCallback() {
    user().assert(this.src_);
    user().assert(!this.element.querySelector(`iframe[src="${this.src_}"]`));
    const iframe = createElementWithAttributes(
       /** @type {!Document} */(this.element.ownerDocument),
       'iframe',{
         'height': 0,
         'width': 0,
         'src': this.src_,
         'style': 'position:fixed !important;top:0 !important;' +
            'visibility:hidden',
       });
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    // Listen for touch events and periodically send to child iframe.
    let events = {};
    const addBroadcastEventListener = name => {
      // Place listener on outer document and use capture to ensure data is
      // always collected.
      this.unlisteners_.push(
        listen(this.element.ownerDocument.documentElement, name, e => {
          events[name] = events[name] || [];
          if (name == 'touchmove') {
            const touches = [];
            for (let i = 0; i < e.touches.length; i++) {
              touches.push({x: e.touches[i].pageX, y: e.touches[i].pageY});
            }
            events[name].push({touches, timestamp: Date.now()});
          } else {
            events[name].push({x: e.pageX, y: e.pageY, timestamp: Date.now()});
          }
        }, true));
    };
    ['touchstart', 'touchend', 'click', 'touchmove'].forEach(
        name => addBroadcastEventListener(name));
    this.intervalId_ = this.win.setInterval(() => {
      if (Object.keys(events).length) {
        this.sendPostMessage(iframe.contentWindow,
            JSON.stringify({'collection-events': events}));
        events = {};
      }
    }, MESSAGE_INTERVAL_MS);
    return Promise.resolve();
  }

  /** @override */
  unlayoutCallback() {
    if (this.intervalId_ >= 0) {
      this.win.clearInterval(this.intervalId_);
      this.intervalId_ = -1;
    }
    removeChildren(this.element);
    this.unlisteners_.forEach(unlistener => unlistener);
    this.unlisteners_ = [];
    return true;
  }

  sendPostMessage(win, message) {
    win./*REVIEW*/postMessage(message, '*');
  }
}

AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerElement(TAG, AmpSignalCollectionFrame);
});
