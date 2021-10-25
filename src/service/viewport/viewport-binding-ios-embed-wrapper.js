import {Observable} from '#core/data-structures/observable';
import {whenDocumentReady} from '#core/document/ready';
import {waitForBodyOpen} from '#core/dom';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {computedStyle, px, setImportantStyles} from '#core/dom/style';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev} from '#utils/log';

import {
  ViewportBindingDef,
  marginBottomOfLastChild,
} from './viewport-binding-def';

const TAG_ = 'Viewport';

/**
 * Implementation of ViewportBindingDef based for iframed iOS case where iframes
 * are not scrollable. Scrolling accomplished here by inserting a scrollable
 * wrapper `<html id="i-amphtml-wrapper">` inside the `<html>` element and
 * reparenting the original `<body>` inside.
 *
 * @implements {ViewportBindingDef}
 * @visibleForTesting
 */
export class ViewportBindingIosEmbedWrapper_ {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @protected {!../vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(win);

    const doc = this.win.document;
    const {documentElement} = doc;
    const topClasses = documentElement.className;
    documentElement.classList.add('i-amphtml-ios-embed');

    const wrapper = doc.createElement('html');
    /** @private @const {!Element} */
    this.wrapper_ = wrapper;
    wrapper.id = 'i-amphtml-wrapper';
    wrapper.className = topClasses;

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.onScrolled_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = () => this.resizeObservable_.fire();

    /** @private {number} */
    this.paddingTop_ = 0;

    // Setup UI.
    /** @private {boolean} */
    this.setupDone_ = false;
    waitForBodyOpen(doc, this.setup_.bind(this));

    // Set overscroll (`-webkit-overflow-scrolling: touch`) later to avoid
    // iOS rendering bugs. See #8798 for details.
    whenDocumentReady(doc).then(() => {
      documentElement.classList.add('i-amphtml-ios-overscroll');
    });

    dev().fine(TAG_, 'initialized ios-embed-wrapper viewport');
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
    // inside the `overflow:auto` element. For reference, here are related
    // iOS issues (Chrome issues are also listed for reference):
    // - https://code.google.com/p/chromium/issues/detail?id=2891
    // - https://code.google.com/p/chromium/issues/detail?id=157855
    // - https://bugs.webkit.org/show_bug.cgi?id=106133
    // - https://bugs.webkit.org/show_bug.cgi?id=149264
    const doc = this.win.document;
    const body = dev().assertElement(doc.body, 'body is not available');
    doc.documentElement.appendChild(this.wrapper_);
    this.wrapper_.appendChild(body);
    // Redefine `document.body`, otherwise it'd be `null`.
    Object.defineProperty(doc, 'body', {
      get: () => body,
    });

    // Make sure the scroll position is adjusted correctly.
    this.onScrolled_();
  }

  /** @override */
  connect() {
    this.win.addEventListener('resize', this.boundResizeEventListener_);
    this.wrapper_.addEventListener('scroll', this.boundScrollEventListener_);
  }

  /** @override */
  disconnect() {
    this.win.removeEventListener('resize', this.boundResizeEventListener_);
    this.wrapper_.removeEventListener('scroll', this.boundScrollEventListener_);
  }

  /** @override */
  getBorderTop() {
    // iOS needs an extra pixel to avoid scroll freezing.
    return 1;
  }

  /** @override */
  requiresFixedLayerTransfer() {
    if (!isExperimentOn(this.win, 'ios-fixed-no-transfer')) {
      return true;
    }
    // The jumping fixed elements have been fixed in iOS 12.2.
    const iosVersion = parseFloat(
      Services.platformFor(this.win).getIosVersionString()
    );
    return iosVersion < 12.2;
  }

  /** @override */
  overrideGlobalScrollTo() {
    return true;
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
    this.paddingTop_ = paddingTop;
    setImportantStyles(this.wrapper_, {
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
    this.wrapper_.classList.add('i-amphtml-scroll-disabled');
  }

  /** @override */
  resetScroll() {
    // TODO(jridgewell): Recursively disable scroll
    this.wrapper_.classList.remove('i-amphtml-scroll-disabled');
  }

  /** @override */
  updateLightboxMode(unusedLightboxMode) {
    // The layout is always accurate.
    return Promise.resolve();
  }

  /** @override */
  getSize() {
    return {
      width: this.win./*OK*/ innerWidth,
      height: this.win./*OK*/ innerHeight,
    };
  }

  /** @override */
  getScrollTop() {
    return this.wrapper_./*OK*/ scrollTop;
  }

  /** @override */
  getScrollLeft() {
    // The wrapper is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.wrapper_./*OK*/ scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.wrapper_./*OK*/ scrollHeight;
  }

  /** @override */
  getContentHeight() {
    // The wrapped body, not this.wrapper_ itself, will have the correct height.
    const content = this.win.document.body;
    const {height} = content./*OK*/ getBoundingClientRect();

    // Unlike other viewport bindings, there's no need to include the
    // rect top since the wrapped body accounts for the top margin of children.
    // However, the parent's padding-top (this.paddingTop_) must be added.

    // As of Safari 12.1.1, the getBoundingClientRect().height does not include
    // the bottom margin of children and there's no other API that does.
    const childMarginBottom = marginBottomOfLastChild(this.win, content);

    const style = computedStyle(this.win, content);
    return (
      parseInt(style.marginTop, 10) +
      this.paddingTop_ +
      height +
      childMarginBottom +
      parseInt(style.marginBottom, 10)
    );
  }

  /** @override */
  contentHeightChanged() {}

  /** @override */
  getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
    const b = el./*OK*/ getBoundingClientRect();
    const scrollTop =
      opt_scrollTop != undefined ? opt_scrollTop : this.getScrollTop();
    const scrollLeft =
      opt_scrollLeft != undefined ? opt_scrollLeft : this.getScrollLeft();
    return layoutRectLtwh(
      Math.round(b.left + scrollLeft),
      Math.round(b.top + scrollTop),
      Math.round(b.width),
      Math.round(b.height)
    );
  }

  /** @override */
  getRootClientRectAsync() {
    return Promise.resolve(null);
  }

  /** @override */
  setScrollTop(scrollTop) {
    // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue. See
    // `onScrolled_` for more details.
    this.wrapper_./*OK*/ scrollTop = scrollTop || 1;
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
    if (this.wrapper_./*OK*/ scrollTop == 0) {
      this.wrapper_./*OK*/ scrollTop = 1;
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
    return this.wrapper_;
  }

  /** @override */
  getScrollingElementScrollsLikeViewport() {
    return false;
  }
}
