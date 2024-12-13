import {whenDocumentReady} from '#core/document/ready';
import {moveLayoutRect} from '#core/dom/layout/rect';
import {resetStyles, setInitialDisplay, setStyles} from '#core/dom/style';
import {once} from '#core/types/function';
import {parseJson} from '#core/types/object/json';
import {parseQueryString} from '#core/types/string/url';

import {Services} from '#service';

import {listenOnce} from '#utils/event-helper';

import {findSentences, markTextRangeList} from './findtext';

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

/** @typedef {{sentences: !Array<string>, skipScrollAnimation: boolean, skipRendering: boolean}} */
export let HighlightInfoDef;

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
 * Text fragment prefix to add to the URL
 * @type {string}
 */
const TEXT_FRAGMENT_PREFIX = ':~:';

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
  let skipScrollAnimation = false;
  if (highlight['na']) {
    skipScrollAnimation = true;
  }
  return {
    sentences: sens,
    skipScrollAnimation,
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
    /** @private @const {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(ampdoc);
    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);

    /** @private {?Array<!Element>} */
    this.highlightedNodes_ = null;

    const platform =
      /* @type {!./service/platform-impl.Platform} */ Services.platformFor(
        this.ampdoc_.win
      );

    // Chrome 81 added support for text fragment proposal. However, it is
    // not supported across iframes but Chrome 81 thru 92 report
    // `'fragmentDirective' in document = true` which breaks feature detection.
    // Chrome 93 supports the proposal that works across iframes, hence this
    // version check.
    // TODO(dmanek): remove `ifChrome()` from unit tests when we remove
    // Chrome version detection below
    if (
      'fragmentDirective' in document &&
      platform.isChrome() &&
      platform.getMajorVersion() >= 93
    ) {
      ampdoc
        .whenFirstVisible()
        .then(() => this.highlightUsingTextFragments_(highlightInfo));
    } else {
      whenDocumentReady(ampdoc.win.document).then(() => {
        this.initHighlight_(highlightInfo);
      });
    }
  }

  /**
   * @param {!HighlightInfoDef} highlightInfo
   * @private
   */
  highlightUsingTextFragments_(highlightInfo) {
    const {sentences} = highlightInfo;
    if (!sentences?.length) {
      return;
    }
    const fragment = sentences
      .map((text) => 'text=' + encodeURIComponent(text))
      .join('&');
    this.updateUrlWithTextFragment_(fragment);
  }

  /**
   * @param {string} fragment
   * @private
   */
  updateUrlWithTextFragment_(fragment) {
    const {hash} = this.ampdoc_.win.location;
    if (hash) {
      this.ampdoc_.win.location.replace(hash + TEXT_FRAGMENT_PREFIX + fragment);
    } else {
      this.ampdoc_.win.location.replace('#' + TEXT_FRAGMENT_PREFIX + fragment);
    }
  }

  /**
   * @param {string} state
   * @param {JsonObject=} opt_params
   * @private
   */
  sendHighlightState_(state, opt_params) {
    const params = {'state': state};
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
      win,
      this.ampdoc_.getBody(),
      highlightInfo.sentences
    );
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
   * Registers a callback invoked once when the doc becomes visible.
   * @param {function()} handler
   */
  onVisibleOnce(handler) {
    // TODO(yunabe): Unregister the handler.
    handler = once(handler);
    this.ampdoc_.onVisibilityChanged(() => {
      if (this.ampdoc_.getVisibilityState() != 'visible') {
        return;
      }
      handler();
    });
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
    this.sendHighlightState_('found', {'scroll': scrollTop});
    if (highlightInfo.skipRendering) {
      return;
    }

    for (let i = 0; i < this.highlightedNodes_.length; i++) {
      const n = this.highlightedNodes_[i];
      // The background color is same as Android Chrome text finding (yellow).
      setStyles(n, {
        backgroundColor: '#fcff00',
        color: '#000',
      });
    }

    const visibility = this.ampdoc_.getVisibilityState();
    if (!highlightInfo.skipScrollAnimation) {
      if (visibility == 'visible') {
        this.animateScrollToTop_(scrollTop);
      } else {
        // Scroll to the animation start position before the page becomes visible
        // so that the top of the page is not painted when it becomes visible.
        this.scrollToAnimationStart_(scrollTop);
        this.onVisibleOnce(() => {
          this.animateScrollToTop_(this.calcTopToCenterHighlightedNodes_());
        });
      }
    } else {
      if (visibility == 'visible') {
        this.scrollToTopWitoutAnimation_(scrollTop);
      } else {
        this.viewport_.setScrollTop(scrollTop);
        this.onVisibleOnce(() => {
          this.scrollToTopWitoutAnimation_(
            this.calcTopToCenterHighlightedNodes_()
          );
        });
      }
    }
    listenOnce(
      this.ampdoc_.getBody(),
      'click',
      this.dismissHighlight_.bind(this)
    );
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
      const {bottom, top} = moveLayoutRect(
        viewport.getLayoutRect(nodes[i]),
        0,
        -paddingTop
      );
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
   * Equivalent to animateScrollToTop_ without scroll animation.
   * @param {number} top
   * @private
   */
  scrollToTopWitoutAnimation_(top) {
    this.sendHighlightState_('auto_scroll');
    this.viewport_.setScrollTop(top);
    this.sendHighlightState_('shown');
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
    const shownParam = {};
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
      HIGHLIGHT_DISMISS,
      this.dismissHighlight_.bind(this)
    );
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
