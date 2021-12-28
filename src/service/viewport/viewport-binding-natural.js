import {Observable} from '#core/data-structures/observable';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {computedStyle, px, setImportantStyles} from '#core/dom/style';

import {Services} from '#service';

import {dev} from '#utils/log';

import {
  ViewportBindingDef,
  marginBottomOfLastChild,
} from './viewport-binding-def';

const TAG_ = 'Viewport';

/**
 * Implementation of ViewportBindingDef based on the native window. It assumes
 * that the native window is sized properly and events represent the actual
 * scroll/resize events. This mode is applicable to a standalone document
 * display or when an iframe has a fixed size.
 *
 * Visible for testing.
 *
 * @implements {ViewportBindingDef}
 */
export class ViewportBindingNatural_ {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @const {!../../service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win);

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.handleScrollEvent_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = () => this.resizeObservable_.fire();

    dev().fine(TAG_, 'initialized natural viewport');
  }

  /** @private */
  handleScrollEvent_() {
    this.scrollObservable_.fire();
  }

  /** @override */
  connect() {
    this.win.addEventListener('scroll', this.boundScrollEventListener_);
    this.win.addEventListener('resize', this.boundResizeEventListener_);
  }

  /** @override */
  disconnect() {
    this.win.removeEventListener('scroll', this.boundScrollEventListener_);
    this.win.removeEventListener('resize', this.boundResizeEventListener_);
  }

  /** @override */
  ensureReadyForElements() {
    // Nothing.
  }

  /** @override */
  getBorderTop() {
    return 0;
  }

  /** @override */
  requiresFixedLayerTransfer() {
    return false;
  }

  /** @override */
  overrideGlobalScrollTo() {
    return false;
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
    setImportantStyles(this.win.document.documentElement, {
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
    this.win.document.documentElement.classList.add(
      'i-amphtml-scroll-disabled'
    );
  }

  /** @override */
  resetScroll() {
    // TODO(jridgewell): Recursively disable scroll
    this.win.document.documentElement.classList.remove(
      'i-amphtml-scroll-disabled'
    );
  }

  /** @override */
  updateLightboxMode(unusedLightboxMode) {
    // The layout is always accurate.
    return Promise.resolve();
  }

  /** @override */
  getSize() {
    // Prefer window innerWidth/innerHeight but fall back to
    // documentElement clientWidth/clientHeight.
    // documentElement./*OK*/clientHeight is buggy on iOS Safari
    // and thus cannot be used.
    const winWidth = this.win./*OK*/ innerWidth;
    const winHeight = this.win./*OK*/ innerHeight;
    if (winWidth && winHeight) {
      return {width: winWidth, height: winHeight};
    }
    const el = this.win.document.documentElement;
    return {width: el./*OK*/ clientWidth, height: el./*OK*/ clientHeight};
  }

  /** @override */
  getScrollTop() {
    const pageScrollTop =
      this.getScrollingElement()./*OK*/ scrollTop ||
      this.win./*OK*/ pageYOffset;
    const {host} = this.ampdoc.getRootNode();
    return host
      ? pageScrollTop - /** @type {!HTMLElement} */ (host)./*OK*/ offsetTop
      : pageScrollTop;
  }

  /** @override */
  getScrollLeft() {
    // The html is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.getScrollingElement()./*OK*/ scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.getScrollingElement()./*OK*/ scrollHeight;
  }

  /** @override */
  getContentHeight() {
    // Don't use scrollHeight, since it returns `MAX(viewport_height,
    // document_height)` (we only want the latter), and it doesn't account
    // for margins. Also, don't use documentElement's rect height because
    // there's no workable analog for either ios-embed-* modes.
    const content = this.getScrollingElement();
    const rect = content./*OK*/ getBoundingClientRect();

    // The Y-position of `content` can be offset by the vertical margin
    // of its first child, and this is _not_ accounted for in `rect.height`.
    // This causes smaller than expected content height, so add it manually.
    // Note this "top" value already includes padding-top of ancestor elements
    // and getBorderTop().
    const top = rect.top + this.getScrollTop();

    // As of Safari 12.1.1, the getBoundingClientRect().height does not include
    // the bottom margin of children and there's no other API that does.
    const childMarginBottom = Services.platformFor(this.win).isSafari()
      ? marginBottomOfLastChild(this.win, content)
      : 0;

    const style = computedStyle(this.win, content);
    return (
      top +
      parseInt(style.marginTop, 10) +
      rect.height +
      childMarginBottom +
      parseInt(style.marginBottom, 10)
    );
  }

  /** @override */
  contentHeightChanged() {
    // Nothing to do here.
  }

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
    this.getScrollingElement()./*OK*/ scrollTop = scrollTop;
  }

  /** @override */
  getScrollingElement() {
    const doc = this.win.document;
    if (doc./*OK*/ scrollingElement) {
      return doc./*OK*/ scrollingElement;
    }
    if (
      doc.body &&
      // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit
      // browsers have to use `body` and NOT `documentElement` for
      // scrolling purposes. This has mostly being resolved via
      // `scrollingElement` property, but this branch is still necessary
      // for backward compatibility purposes.
      this.platform_.isWebKit()
    ) {
      return doc.body;
    }
    return doc.documentElement;
  }

  /** @override */
  getScrollingElementScrollsLikeViewport() {
    return true;
  }
}
