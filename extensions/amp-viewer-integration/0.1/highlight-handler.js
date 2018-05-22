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
 * Returns highlight param in the URL hash.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {string}
 */
export const getHighlightParam = function(ampdoc) {
  return parseQueryString(ampdoc.win.location.hash)['highlight'];
};

/**
 * HighlightHandler reads highlight parameter from URL and
 * highlights specified text in AMP documents.
 */
export class HighlightHandler {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} json The highlighting info in JSON.
   */
  constructor(ampdoc, json) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?Array<Element>} */
    this.highlightedNodes_ = null;

    this.initHighlight_(json);
  }

  /**
   * @param {string} json
    * @private
    */
  initHighlight_(json) {
    const ampdoc = this.ampdoc_;
    const win = ampdoc.win;

    const highlight = parseJson(json);
    const sens = findSentences(win.document.body, highlight['s']);
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
