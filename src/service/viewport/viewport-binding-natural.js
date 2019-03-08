/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {computedStyle, px, setImportantStyles} from '../../style';
import {dev} from '../../log';
import {isExperimentOn} from '../../experiments';
import {layoutRectLtwh} from '../../layout-rect';


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
    this.boundScrollEventListener_ = () => {
      this.scrollObservable_.fire();
    };

    /** @const {function()} */
    this.boundResizeEventListener_ = () => this.resizeObservable_.fire();

    /** @private @const {boolean} */
    this.useLayers_ = isExperimentOn(this.win, 'layers');

    dev().fine(TAG_, 'initialized natural viewport');
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
        'i-amphtml-scroll-disabled');
  }

  /** @override */
  resetScroll() {
    // TODO(jridgewell): Recursively disable scroll
    this.win.document.documentElement.classList.remove(
        'i-amphtml-scroll-disabled');
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
    const winWidth = this.win./*OK*/innerWidth;
    const winHeight = this.win./*OK*/innerHeight;
    if (winWidth && winHeight) {
      return {width: winWidth, height: winHeight};
    }
    const el = this.win.document.documentElement;
    return {width: el./*OK*/clientWidth, height: el./*OK*/clientHeight};
  }

  /** @override */
  getScrollTop() {
    const pageScrollTop = this.getScrollingElement()./*OK*/scrollTop ||
        this.win./*OK*/pageYOffset;
    const {host} = this.ampdoc.getRootNode();
    return (host ? pageScrollTop - host./*OK*/offsetTop : pageScrollTop);
  }

  /** @override */
  getScrollLeft() {
    // The html is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.getScrollingElement()./*OK*/scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.getScrollingElement()./*OK*/scrollHeight;
  }

  /** @override */
  getContentHeight() {
    // Don't use scrollHeight, since it returns `MAX(viewport_height,
    // document_height)` (we only want the latter), and it doesn't account
    // for margins. Also, don't use documentElement's rect height because
    // there's no workable analog for either ios-embed-* modes.
    const scrollingElement = this.getScrollingElement();
    const rect = scrollingElement./*OK*/getBoundingClientRect();
    const style = computedStyle(this.win, scrollingElement);
    // The Y-position of any element can be offset by the vertical margin
    // of its first child, and this is _not_ accounted for in `rect.height`.
    // This "top gap" causes smaller than expected contentHeight, so calculate
    // and add it manually. Note that the "top gap" includes any padding-top
    // on ancestor elements, and the "bottom gap" remains unaddressed.
    const topGapPlusPadding = rect.top + this.getScrollTop();
    return rect.height
        + topGapPlusPadding
        + parseInt(style.marginTop, 10)
        + parseInt(style.marginBottom, 10);
  }

  /** @override */
  contentHeightChanged() {
    // Nothing to do here.
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
    this.getScrollingElement()./*OK*/scrollTop = scrollTop;
  }

  /** @override */
  getScrollingElement() {
    const doc = this.win.document;
    if (doc./*OK*/scrollingElement) {
      return doc./*OK*/scrollingElement;
    }
    if (doc.body
        // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit
        // browsers have to use `body` and NOT `documentElement` for
        // scrolling purposes. This has mostly being resolved via
        // `scrollingElement` property, but this branch is still necessary
        // for backward compatibility purposes.
        && this.platform_.isWebKit()) {
      return doc.body;
    }
    return doc.documentElement;
  }

  /** @override */
  getScrollingElementScrollsLikeViewport() {
    return true;
  }
}
