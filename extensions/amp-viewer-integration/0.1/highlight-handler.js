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

import {Services} from '../../../src/services';
import {findSentences, markTextRangeList} from './findtext';
import {listenOnce} from '../../../src/event-helper';
import {parseJson} from '../../../src/json';
import {parseQueryString} from '../../../src/url';
import {resetStyles} from '../../../src/style';

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
 * TextRange represents a text range.
 * @typedef {{sentences: !Array<string>}}
 */
let HighlightInfoDef;

/**
 * Returns highlight param in the URL hash.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {?HighlightInfoDef}
 */
export function getHighlightParam(ampdoc) {
  const param = parseQueryString(ampdoc.win.location.hash)['highlight'];
  if (!param || param.length > HIGHLIGHT_PARAM_LENGTH_LIMIT) {
    return null;
  }
  const highlight = parseJson(param);
  const sens = highlight['s'];
  if (!(sens instanceof Array) || sens.length > NUM_SENTENCES_LIMIT) {
    // Too many sentences, do nothing for safety.
    return null;
  }
  let sum = 0;
  for (let i = 0; i < sens.length; i++) {
    const sen = sens[i];
    if (typeof sen != 'string' || !sen) {
      // Invalid element in sens.
      return null;
    }
    sum += sen.length;
    if (sum > NUM_ALL_CHARS_LIMIT) {
      // Too many chars, do nothing for safety.
      return null;
    }
  }
  return {
    sentences: sens,
  };
}

/**
 * HighlightHandler reads highlight parameter from URL and
 * highlights specified text in AMP documents.
 */
export class HighlightHandler {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!HighlightInfoDef} highlightInfo The highlighting info in JSON.
   */
  constructor(ampdoc, highlightInfo) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?Array<!Element>} */
    this.highlightedNodes_ = null;

    this.initHighlight_(highlightInfo);
  }

  /**
   * @param {!HighlightInfoDef} highlightInfo
    * @private
    */
  initHighlight_(highlightInfo) {
    const ampdoc = this.ampdoc_;
    const {win} = ampdoc;
    const sens = findSentences(win, ampdoc.getBody(), highlightInfo.sentences);
    if (!sens) {
      return;
    }
    const spans = markTextRangeList(win, sens);
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

    listenOnce(ampdoc.getBody(), 'click', this.dismissHighlight_.bind(this));
  }

  /**
   * @param {!./messaging/messaging.Messaging} messaging
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
      resetStyles(this.highlightedNodes_[i], ['backgroundColor', 'color']);
    }
  }

  /**
   * @private
   */
  handleDismissHighlight_() {
    this.dismissHighlight_();
  }
}
