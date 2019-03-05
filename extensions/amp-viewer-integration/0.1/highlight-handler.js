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
import {dict} from '../../../src/utils/object';
import {findSentences, markTextRangeList} from './findtext';
import {listenOnce} from '../../../src/event-helper';
import {moveLayoutRect} from '../../../src/layout-rect';
import {parseJson} from '../../../src/json';
import {parseQueryString} from '../../../src/url';
import {resetStyles, setInitialDisplay, setStyles} from '../../../src/style';
import {whenDocumentReady} from '../../../src/document-ready';

/**
 * The message name sent by viewers to dismiss highlights.
 * @type {string}
 */
const HIGHLIGHT_DISMISS = 'highlightDismiss';

/**
 * The message name sent by AMP doc to notify the change of the state of text
 * highlighting.
 * @type {string}
 */
const HIGHLIGHT_STATE = 'highlightState';

/**
 *
 * @type {string}
 */
const PARAM_OLD_TOP_DISCREPANCY = 'od';

/**
 * @type {string}
 */
const PARAM_NEW_TOP_DISCREPANCY = 'nd';

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

/** @typedef {{sentences: !Array<string>, skipRendering: boolean}} */
let HighlightInfoDef;

/**
 * The height of scrolling-down animation to highlighted texts.
 * @type {number}
 */
const SCROLL_ANIMATION_HEIGHT = 500;

/**
 * The height of the margin placed before highlighted texts.
 * This margin is necessary to avoid the overlap with the common floating
 * header UI.
 * TODO(yunabe): Calculate this dynamically using elements in FixedLayer.
 * @type {number}
 */
const PAGE_TOP_MARGIN = 80;

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
  let skipRendering = false;
  if (highlight['n']) {
    skipRendering = true;
  }
  return {
    sentences: sens,
    skipRendering,
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
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);
    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);

    /** @private {?Array<!Element>} */
    this.highlightedNodes_ = null;

    whenDocumentReady(ampdoc.win.document).then(() => {
      this.initHighlight_(highlightInfo);
    });
  }

  /**
   * @param {string} state
   * @param {JsonObject=} opt_params
   * @private
   */
  sendHighlightState_(state, opt_params) {
    const params = dict({'state': state});
    for (const key in opt_params) {
      params[key] = opt_params[key];
    }
    this.viewer_.sendMessage(HIGHLIGHT_STATE, params);
  }

  /**
   * @param {!HighlightInfoDef} highlightInfo
   * @private
   */
  findHighlightedNodes_(highlightInfo) {
    const {win} = this.ampdoc_;
    const sens = findSentences(
        win, this.ampdoc_.getBody(), highlightInfo.sentences);
    if (!sens) {
      return;
    }
    const nodes = markTextRangeList(win, sens);
    if (!nodes || nodes.length == 0) {
      return;
    }
    this.highlightedNodes_ = nodes;
  }

  /**
   * @param {!HighlightInfoDef} highlightInfo
   * @private
   */
  initHighlight_(highlightInfo) {
    if (this.ampdoc_.win.document.querySelector('script[id="amp-access"]')) {
      // Disable highlighting if <amp-access> is used because highlighting
      // interacts badily with UI reflows by <amp-access>.
      // TODO(yunabe): Remove this once <amp-access> provides an API to delay
      // code execution after DOM manipulation by <amp-access>.
      this.sendHighlightState_('has_amp_access');
      return;
    }
    this.findHighlightedNodes_(highlightInfo);
    if (!this.highlightedNodes_) {
      this.sendHighlightState_('not_found');
      return;
    }
    const scrollTop = this.calcTopToCenterHighlightedNodes_();
    this.sendHighlightState_('found', dict({'scroll': scrollTop}));
    if (highlightInfo.skipRendering) {
      return;
    }

    for (let i = 0; i < this.highlightedNodes_.length; i++) {
      const n = this.highlightedNodes_[i];
      // The background color is same as Android Chrome text finding.
      // https://cs.chromium.org/chromium/src/chrome/android/java/res/values/colors.xml?l=158&rcl=8b461e376e824c72fec1d6d91cd6633ba344dd55&q=ff9632
      setStyles(n, {
        backgroundColor: '#ff9632',
        color: '#000',
      });
    }

    const visibility = this.viewer_.getVisibilityState();
    if (visibility == 'visible') {
      this.animateScrollToTop_(scrollTop);
    } else {
      // Scroll to the animation start position before the page becomes visible
      // so that the top of the page is not painted when it becomes visible.
      this.scrollToAnimationStart_(scrollTop);

      let called = false;
      this.viewer_.onVisibilityChanged(() => {
        // TODO(yunabe): Unregister the handler.
        if (called || this.viewer_.getVisibilityState() != 'visible') {
          return;
        }
        this.animateScrollToTop_(this.calcTopToCenterHighlightedNodes_());
        called = true;
      });
    }
    listenOnce(this.ampdoc_.getBody(), 'click',
        this.dismissHighlight_.bind(this));
  }

  /**
   * @return {number}
   * @private
   */
  calcTopToCenterHighlightedNodes_() {
    const nodes = this.highlightedNodes_;
    if (!nodes) {
      return 0;
    }
    const viewport = this.viewport_;
    let minTop = Number.MAX_VALUE;
    let maxBottom = 0;
    const paddingTop = viewport.getPaddingTop();
    for (let i = 0; i < nodes.length; i++) {
      // top and bottom returned by getLayoutRect includes the header padding
      // size. We need to cancel the padding to calculate the positions in
      // document.body like Viewport.animateScrollIntoView does.
      const {top, bottom} = moveLayoutRect(viewport.getLayoutRect(nodes[i]),
          0, -paddingTop);
      minTop = Math.min(minTop, top);
      maxBottom = Math.max(maxBottom, bottom);
    }
    if (minTop >= maxBottom) {
      return 0;
    }
    const height = viewport.getHeight() - paddingTop;
    let pos = (maxBottom + minTop - height) / 2;
    if (pos > minTop - PAGE_TOP_MARGIN) {
      pos = minTop - PAGE_TOP_MARGIN;
    }
    return pos > 0 ? pos : 0;
  }

  /**
   * @param {number} top
   * @private
   */
  scrollToAnimationStart_(top) {
    const start = Math.max(0, top - SCROLL_ANIMATION_HEIGHT);
    this.viewport_.setScrollTop(start);
  }

  /**
   * Adjust scroll-top if the right scroll position is changed or
   * the final scroll position is wrong after animation.
   * This is necessary to center highlighted texts properly in pages reported
   * in #18917
   * @param {number} oldTop
   * @return {?JsonObject}
   */
  mayAdjustTop_(oldTop) {
    // Double-check the highlighted nodes are centered after animation.
    const newTop = this.calcTopToCenterHighlightedNodes_();
    const current = this.viewport_.getScrollTop();
    if (current == newTop && current == oldTop) {
      return null;
    }
    const shownParam = dict();
    if (current != newTop) {
      this.viewport_.setScrollTop(newTop);
      shownParam[PARAM_NEW_TOP_DISCREPANCY] = current - newTop;
    }
    if (current != oldTop) {
      shownParam[PARAM_OLD_TOP_DISCREPANCY] = current - oldTop;
    }
    return shownParam;
  }

  /**
   * @param {number} top
   * @private
   */
  animateScrollToTop_(top) {
    // First, move to the start position of scroll animation.
    this.scrollToAnimationStart_(top);

    const sentinel = this.ampdoc_.win.document.createElement('div');
    // Notes:
    // The CSS of sentinel can be overwritten by user custom CSS.
    // We need to set display:block and other CSS fields explicitly here
    // so that these CSS won't be overwritten.
    // We use top and height here because they precede bottom
    // https://developer.mozilla.org/en-US/docs/Web/CSS/bottom
    //
    // TODO(yunabe): Revisit the safer way to implement scroll-animation.
    setInitialDisplay(sentinel, 'block');
    setStyles(sentinel, {
      'position': 'absolute',
      'top': Math.floor(top) + 'px',
      'height': '1px',
      'left': '0',
      'width': '1px',
      'pointer-events': 'none',
    });
    const body = this.ampdoc_.getBody();
    body.appendChild(sentinel);
    this.sendHighlightState_('auto_scroll');
    this.viewport_.animateScrollIntoView(sentinel).then(() => {
      body.removeChild(sentinel);
      this.sendHighlightState_('shown', this.mayAdjustTop_(top));
    });
  }

  /**
   * @param {!./messaging/messaging.Messaging} messaging
   */
  setupMessaging(messaging) {
    messaging.registerHandler(
        HIGHLIGHT_DISMISS, this.dismissHighlight_.bind(this));
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
}
