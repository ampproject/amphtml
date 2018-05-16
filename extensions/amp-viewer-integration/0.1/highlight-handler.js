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
import {parseJson} from '../../../src/json';
import {Services} from '../../../src/services';
import {parseUrl, parseQueryString} from '../../../src/url';
import {findSentences, markTextRangeList} from './findtext';
import {Messaging} from './messaging/messaging';

/**
 * The message name sent by viewers to dismiss highlights.
 * @type {!string}
 */
const HIGHLIGHT_DISMISS = 'highlightDismiss';

/**
 * HighlightHandler reads highlight parameter from URL and highlights specified text in AMP documents.
 */
export class HighlightHandler {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?Array<Element>} */
    this.highlightedNodes_ = null;
    this.initHighlight_();
  }

  /** @private */
  initHighlight_() {
    const ampdoc = this.ampdoc_;
    const url = ampdoc.getUrl();
    const hash = parseUrl(url).hash;
    const params = parseQueryString(hash);
    const highlightJSON = params['highlight'];
    if (!highlightJSON) {
      return;
    }

    const highlight = parseJson(highlightJSON);
    const win = ampdoc.win;
    var sens = findSentences(win.document.body, highlight['s']);
    if (!sens) {
      return;
    }
    let spans = markTextRangeList(sens);
    if (spans.length <= 0) {
      return;
    }
    for (let n of spans) {
      n['style']['backgroundColor'] = '#ff0';
      n['style']['color'] = '#333';
    }
    this.highlightedNodes_ = spans;
    let viewer = Services.viewerForDoc(this.ampdoc_);
    let visibility = viewer.getVisibilityState();
    if (visibility == 'visible') {
      Services.viewportForDoc(ampdoc).animateScrollIntoView(spans[0], 500);
    } else {
      let called = false;
      viewer.onVisibilityChanged(()=>{
        // TODO(yunabe): Unregister the handler.
        if (called || viewer.getVisibilityState() != 'visible') {
          return;
        }
        Services.viewportForDoc(ampdoc).animateScrollIntoView(spans[0], 500);
        viewer.sendMessage('highlightEvent', null);
        called = true;
      });
    }

    // TODO(yunabe): Unregister this handler when the highlight is dismissed.
    win.document.body.addEventListener('click', this.dismissHighlight_.bind(this));
  }

  /**
   * @param {!Messaging} messaging
   */
  setupMessaging(messaging) {
    messaging.registerHandler(HIGHLIGHT_DISMISS, this.handleDismissHighlight_.bind(this));
  }

  /**
   * @private
   */
  dismissHighlight_() {
    if (!this.highlightedNodes_) {
      return;
    }
    for (let n of this.highlightedNodes_) {
      n['style']['backgroundColor'] = '';
      n['style']['color'] = '';
    }
  }

  /**
   * @param {string} type
   * @param {*} payload
   * @param {boolean} awaitResponse
   * @return {!Promise<?>|undefined}
   * @private
   */
  handleDismissHighlight_(type, payload, awaitResponse) {
    this.dismissHighlight_();
  }
}
