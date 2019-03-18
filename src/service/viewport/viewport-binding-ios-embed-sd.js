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

import {Observable} from '../../observable';
import {Services} from '../../services';
import {ViewportBindingDef} from './viewport-binding-def';
import {
  assertDoesNotContainDisplay,
  computedStyle,
  px,
  setImportantStyles,
  setInitialDisplay,
} from '../../style';
import {dev} from '../../log';
import {htmlFor} from '../../static-template';
import {isExperimentOn} from '../../experiments';
import {layoutRectLtwh} from '../../layout-rect';
import {waitForBody} from '../../dom';
import {whenDocumentReady} from '../../document-ready';

const TAG_ = 'Viewport';

/**
 * This includes only styles that are necessary for layout, but not normally
 * inherited. The inherited styles, such as `font`, are inherited automatically.
 * The main styles that need to be additionally handled are `display`,
 * `padding`, etc.
 */
const INHERIT_STYLES = [
  'align-content',
  'align-items',
  'align-self',
  'alignment-baseline',
  'backface-visibility',
  'box-sizing',
  'column-count',
  'column-fill',
  'column-gap',
  'column-rule',
  'column-span',
  'column-width',
  'columns',
  'display',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'gap',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-gap',
  'grid-row',
  'grid-template',
  'justify-content',
  'justify-items',
  'justify-self',
  'margin',
  'order',
  'padding',
  'perspective',
  'perspective-origin',
  'place-content',
  'place-items',
  'place-self',
  'table-layout',
];


/**
 * Implementation of ViewportBindingDef based for iframed iOS case where iframes
 * are not scrollable. Scrolling accomplished here by attaching shadow root,
 * which distributes all body children inside a scrollable `<div>`.
 *
 * @implements {ViewportBindingDef}
 * @visibleForTesting
 */
export class ViewportBindingIosEmbedShadowRoot_ {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);

    const doc = this.win.document;
    const {documentElement} = doc;
    documentElement.classList.add('i-amphtml-ios-embed-sd');
    if (isExperimentOn(win, 'scroll-height-minheight')) {
      documentElement.classList.add('i-amphtml-body-minheight');
    }

    const scroller = htmlFor(doc)`
      <div id="i-amphtml-scroller">
        <div id="i-amphtml-body-wrapper">
          <slot></slot>
        </div>
      </div>`;

    /** @private @const {!Element} */
    this.scroller_ = scroller;

    // Wrapper for the `<body>`.
    /** @private @const {!Element} */
    this.wrapper_ = dev().assertElement(scroller.firstElementChild);

    // Notice that the -webkit-overflow-scrolling is set later.
    setInitialDisplay(this.scroller_, 'block');
    setImportantStyles(this.scroller_, {
      'overflow-x': 'hidden',
      'overflow-y': 'auto',
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'right': '0',
      'bottom': '0',
      'margin': '0',
      'width': '100%',
      'box-sizing': 'border-box',
      'padding-top': '0px', // Will be updated for top offset.
      // The scroller must have a 1px transparent border for two purposes:
      // (1) to cancel out margin collapse in body's children so that position
      //     absolute element is positioned correctly.
      // (2) to offset scroll adjustment to 1 to avoid scroll freeze problem.
      'border-top': '1px solid transparent',
    });
    setImportantStyles(this.wrapper_, {
      'overflow': 'visible',
      'position': 'relative',
      // Wrapper must additionally have `will-change: transform` to avoid iOS
      // rendering bug where contents inside the `-webkit-overflow-scrolling`
      // element would occasionally fail to paint. This bug appears to trigger
      // more often when Shadow DOM is involved. The cost of this is relatively
      // low since this only adds one additional layer for the body.
      'will-change': 'transform',
    });
    // Other properties will be copied from the `<body>`.

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.onScrolled_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = this.onResized_.bind(this);

    /** @private @const {boolean} */
    this.useLayers_ = isExperimentOn(this.win, 'layers');

    /** @private {boolean} */
    this.bodySyncScheduled_ = false;

    // Setup UI.
    /** @private {boolean} */
    this.setupDone_ = false;
    waitForBody(doc, this.setup_.bind(this));

    // Set overscroll (`-webkit-overflow-scrolling: touch`) later to avoid
    // iOS rendering bugs. See #8798 for details.
    whenDocumentReady(doc).then(() => {
      // There's no way to test `-webkit-overflow-scrolling` style on most of
      // browsers. Thus we'll use the `i-amphtml-ios-overscroll` class for
      // testing.
      this.scroller_.classList.add('i-amphtml-ios-overscroll');
      setImportantStyles(this.scroller_, {
        '-webkit-overflow-scrolling': 'touch',
      });
    });

    dev().fine(TAG_, 'initialized ios-embed-wrapper-sd viewport');
  }

  /** @override */
  ensureReadyForElements() {
    this.setup_();
  }

  /** @private */
  setup_() {
    if (this.setupDone_) {
      return;
    }
    this.setupDone_ = true;

    // Embedded scrolling on iOS is rather complicated. IFrames cannot be sized
    // and be scrollable. Sizing iframe by scrolling height has a big negative
    // that "fixed" position is essentially impossible. The only option we
    // found is to reset scrolling on the AMP doc, which wraps the natural BODY
    // children inside the `overflow:auto` element inside the shadow root of the
    // body. For reference, here are related
    // iOS issues (Chrome issues are also listed for reference):
    // - https://code.google.com/p/chromium/issues/detail?id=2891
    // - https://code.google.com/p/chromium/issues/detail?id=157855
    // - https://bugs.webkit.org/show_bug.cgi?id=106133
    // - https://bugs.webkit.org/show_bug.cgi?id=149264
    const doc = this.win.document;
    const body = dev().assertElement(doc.body, 'body is not available');
    const shadowRoot = body.attachShadow({mode: 'open'});

    // Main slot contained within the wrapper will absorb all undistributed
    // children.
    shadowRoot.appendChild(this.scroller_);

    // Update body styles and monitor for further changes.
    this.updateBodyStyles_();
    if (this.win.MutationObserver) {
      const bodyObserver = new this.win.MutationObserver(
          this.updateBodyStyles_.bind(this));
      bodyObserver.observe(body, {attributes: true});
    }

    // Make sure the scroll position is adjusted correctly.
    this.onScrolled_();
  }

  /** @private */
  updateBodyStyles_() {
    if (this.bodySyncScheduled_) {
      return;
    }

    const {body} = this.win.document;
    if (!body) {
      return;
    }

    // Many `<body>` styles are inherited to ensure that layout is preserved.
    // The most important: `display` and related styles.
    const inheritStyles = {};
    this.bodySyncScheduled_ = true;
    this.vsync_.run({
      measure: () => {
        const bodyStyles = computedStyle(this.win, body);
        INHERIT_STYLES.forEach(style => {
          inheritStyles[style] = bodyStyles[style] || '';
        });
      },
      mutate: () => {
        this.bodySyncScheduled_ = false;
        setImportantStyles(this.wrapper_, assertDoesNotContainDisplay(
            inheritStyles));
      },
    });
  }

  /** @private */
  onResized_() {
    this.resizeObservable_.fire();
    this.updateBodyStyles_();
  }

  /** @override */
  connect() {
    this.win.addEventListener('resize', this.boundResizeEventListener_);
    this.scroller_.addEventListener('scroll', this.boundScrollEventListener_);
  }

  /** @override */
  disconnect() {
    this.win.removeEventListener('resize', this.boundResizeEventListener_);
    this.scroller_.removeEventListener('scroll',
        this.boundScrollEventListener_);
  }

  /** @override */
  getBorderTop() {
    // iOS needs an extra pixel to avoid scroll freezing.
    return 1;
  }

  /** @override */
  requiresFixedLayerTransfer() {
    return !isExperimentOn(this.win, 'ios-embed-sd-notransfer');
  }

  /** @override */
  supportsPositionFixed() {
    return true;
  }

  /** @override */
  onScroll(callback) {
    this.scrollObservable_.add(callback);
  }

  /** @override */
  onResize(callback) {
    this.resizeObservable_.add(callback);
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    setImportantStyles(this.scroller_, {
      'padding-top': px(paddingTop),
    });
  }

  /** @override */
  hideViewerHeader(transient, unusedLastPaddingTop) {
    if (!transient) {
      this.updatePaddingTop(0);
    }
  }

  /** @override */
  showViewerHeader(transient, paddingTop) {
    if (!transient) {
      this.updatePaddingTop(paddingTop);
    }
  }

  /** @override */
  disableScroll() {
    // TODO(jridgewell): Recursively disable scroll
    setImportantStyles(this.scroller_, {
      'overflow-y': 'hidden',
      'position': 'fixed',
    });
  }

  /** @override */
  resetScroll() {
    // TODO(jridgewell): Recursively disable scroll
    setImportantStyles(this.scroller_, {
      'overflow-y': 'auto',
      'position': 'absolute',
    });
  }

  /** @override */
  updateLightboxMode(unusedLightboxMode) {
    // The layout is always accurate.
    return Promise.resolve();
  }

  /** @override */
  getSize() {
    return {
      width: this.win./*OK*/innerWidth,
      height: this.win./*OK*/innerHeight,
    };
  }

  /** @override */
  getScrollTop() {
    return this.scroller_./*OK*/scrollTop;
  }

  /** @override */
  getScrollLeft() {
    // The scroller is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.scroller_./*OK*/scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.scroller_./*OK*/scrollHeight;
  }

  /** @override */
  getContentHeight() {
    // Don't use scrollHeight, since it returns `MAX(viewport_height,
    // document_height)` (we only want the latter), and it doesn't account
    // for margins.
    const bodyWrapper = this.wrapper_;
    const rect = bodyWrapper./*OK*/getBoundingClientRect();
    const style = computedStyle(this.win, bodyWrapper);
    // The Y-position of any element can be offset by the vertical margin
    // of its first child, and this is _not_ accounted for in `rect.height`.
    // This "top gap" causes smaller than expected contentHeight, so calculate
    // and add it manually. Note that the "top gap" includes any padding-top
    // on ancestor elements and the scroller's border-top. The "bottom gap"
    // remains unaddressed.
    const topGapPlusPaddingAndBorder = rect.top + this.getScrollTop();
    return rect.height
        + topGapPlusPaddingAndBorder
        + parseInt(style.marginTop, 10)
        + parseInt(style.marginBottom, 10);
  }

  /** @override */
  contentHeightChanged() {
    if (isExperimentOn(this.win, 'scroll-height-bounce')) {
      // Refresh the overscroll (`-webkit-overflow-scrolling: touch`) to avoid
      // iOS rendering bugs. See #8798 for details.
      this.vsync_.mutate(() => {
        setImportantStyles(this.scroller_, {
          '-webkit-overflow-scrolling': 'auto',
        });
        this.vsync_.mutate(() => {
          setImportantStyles(this.scroller_, {
            '-webkit-overflow-scrolling': 'touch',
          });
        });
      });
    }
  }

  /** @override */
  getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
    const b = el./*OK*/getBoundingClientRect();
    if (this.useLayers_) {
      return layoutRectLtwh(b.left, b.top, b.width, b.height);
    }

    const scrollTop = opt_scrollTop != undefined
      ? opt_scrollTop
      : this.getScrollTop();
    const scrollLeft = opt_scrollLeft != undefined
      ? opt_scrollLeft
      : this.getScrollLeft();
    return layoutRectLtwh(Math.round(b.left + scrollLeft),
        Math.round(b.top + scrollTop),
        Math.round(b.width),
        Math.round(b.height));
  }

  /** @override */
  getRootClientRectAsync() {
    return Promise.resolve(null);
  }

  /** @override */
  setScrollTop(scrollTop) {
    // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue. See
    // `onScrolled_` for more details.
    this.scroller_./*OK*/scrollTop = scrollTop || 1;
  }

  /**
   * @param {!Event=} opt_event
   * @private
   */
  onScrolled_(opt_event) {
    // Scroll document into a safe position to avoid scroll freeze on iOS.
    // This means avoiding scrollTop to be minimum (0) or maximum value.
    // This is very sad but very necessary. See #330 for more details.
    // Unfortunately, the same is very expensive to do on the bottom, due to
    // costly scrollHeight.
    if (this.scroller_./*OK*/scrollTop == 0) {
      this.scroller_./*OK*/scrollTop = 1;
      if (opt_event) {
        opt_event.preventDefault();
      }
    }
    if (opt_event) {
      this.scrollObservable_.fire();
    }
  }

  /** @override */
  getScrollingElement() {
    return this.scroller_;
  }

  /** @override */
  getScrollingElementScrollsLikeViewport() {
    return false;
  }
}
