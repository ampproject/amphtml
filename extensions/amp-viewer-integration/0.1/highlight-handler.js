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

import {Messaging} from './messaging/messaging';
import {Services} from '../../../src/services';
import {findSentences, markTextRangeList} from './findtext';
import {parseJson} from '../../../src/json';
import {parseQueryString} from '../../../src/url';

/**
 * The message name sent by viewers to dismiss highlights.
 * @type {string}
 */
const HIGHLIGHT_DISMISS = 'highlightDismiss';

/**
 * The length limit of highlight param to avoid parsing
 * a incredibley large string as JSON. The limit is 100kB.
 * @type {number}
 */
const HIGHLIGHT_PARAM_LENGTH_LIMIT = 100 << 10;

/**
 * The limit of # of sentences to highlight.
 * @type {number}
 */
const NUM_SENTENCES_LIMIT = 15;

/**
 * The length limit of one sentence to highlight.
 * @type {number}
 */
const NUM_ALL_CHARS_LIMIT = 1500;

/**
 * Returns highlight param in the URL hash.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {?JsonObject}
 */
export const getHighlightParam = function(ampdoc) {
  const param = parseQueryString(ampdoc.win.location.hash)['highlight'];
  if (!param || param.length > HIGHLIGHT_PARAM_LENGTH_LIMIT) {
    return null;
  }
  const highlight = parseJson(param);
  const sens = highlight['s'];
  if (sens) {
    if (sens.length > NUM_SENTENCES_LIMIT) {
      // Too many sentences, do nothing for safety.
      return null;
    }
    let sum = 0;
    for (let i = 0; i < sens.length; i++) {
      const sen = sens[i];
      if (!sen) {
        continue;
      }
      sum += sen.length;
      if (sum > NUM_ALL_CHARS_LIMIT) {
        // Too many chars, do nothing for safety.
        return null;
      }
    }
  }
  return highlight;
};

/**
 * HighlightHandler reads highlight parameter from URL and
 * highlights specified text in AMP documents.
 */
export class HighlightHandler {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} highlightInfo The highlighting info in JSON.
   */
  constructor(ampdoc, highlightInfo) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?Array<Element>} */
    this.highlightedNodes_ = null;

    this.initHighlight_(highlightInfo);
  }

  /**
   * @param {!JsonObject} highlightInfo
    * @private
    */
  initHighlight_(highlightInfo) {
    const ampdoc = this.ampdoc_;
    const win = ampdoc.win;

    const sens = findSentences(win.document.body, highlightInfo['s']);
    if (!sens) {
      return;
    }
    const spans = markTextRangeList(sens);
    if (spans.length <= 0) {
      return;
    }
    for (let i = 0; i < spans.length; i++) {
      const n = spans[i];
      n['style']['backgroundColor'] = '#ff0';
      n['style']['color'] = '#333';
    }
    this.highlightedNodes_ = spans;
    const viewer = Services.viewerForDoc(ampdoc);
    const visibility = viewer.getVisibilityState();
    if (visibility == 'visible') {
      Services.viewportForDoc(ampdoc).animateScrollIntoView(spans[0], 500);
    } else {
      let called = false;
      viewer.onVisibilityChanged(() => {
        // TODO(yunabe): Unregister the handler.
        if (called || viewer.getVisibilityState() != 'visible') {
          return;
        }
        Services.viewportForDoc(ampdoc).animateScrollIntoView(spans[0], 500);
        viewer.sendMessage('highlightShown', null);
        called = true;
      });
    }

    // TODO(yunabe): Unregister this handler when the highlight is dismissed.
    win.document.body.addEventListener(
        'click', this.dismissHighlight_.bind(this));
  }

  /**
   * @param {!Messaging} messaging
   */
  setupMessaging(messaging) {
    messaging.registerHandler(
        HIGHLIGHT_DISMISS, this.handleDismissHighlight_.bind(this));
  }

  /**
   * @private
   */
  dismissHighlight_() {
    if (!this.highlightedNodes_) {
      return;
    }
    for (let i = 0; i < this.highlightedNodes_.length; i++) {
      const n = this.highlightedNodes_[i];
      n['style']['backgroundColor'] = '';
      n['style']['color'] = '';
    }
  }

  /**
   * @private
   */
  handleDismissHighlight_() {
    this.dismissHighlight_();
  }
}
