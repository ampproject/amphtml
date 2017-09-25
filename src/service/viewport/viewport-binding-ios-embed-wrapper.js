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
import {layoutRectLtwh} from '../../layout-rect';
import {dev} from '../../log';
import {whenDocumentReady} from '../../document-ready';
import {Services} from '../../services';
import {px, setStyle} from '../../style';
import {waitForBody} from '../../dom';
import {ViewportBindingDef} from './viewport-binding-def';

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
    const topClasses = this.win.document.documentElement.className;
    this.win.document.documentElement.className = '';
    this.win.document.documentElement.classList.add('i-amphtml-ios-embed');

    /** @private @const {!Element} */
    this.wrapper_ = this.win.document.createElement('html');
    this.wrapper_.id = 'i-amphtml-wrapper';
    this.wrapper_.className = topClasses;

    /** @private {!../../service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @const {function()} */
    this.boundScrollEventListener_ = this.onScrolled_.bind(this);

    /** @const {function()} */
    this.boundResizeEventListener_ = () => this.resizeObservable_.fire();

    // Setup UI.
    /** @private {boolean} */
    this.setupDone_ = false;
    waitForBody(this.win.document, this.setup_.bind(this));

    // Set overscroll (`-webkit-overflow-scrolling: touch`) later to avoid
    // iOS rendering bugs. See #8798 for details.
    whenDocumentReady(this.win.document).then(() => {
      this.win.document.documentElement.classList.add(
          'i-amphtml-ios-overscroll');
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

    // TODO(dvoytenko): test if checkAndFixIosScrollfreezeBug is required.

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
    setStyle(this.wrapper_, 'paddingTop', px(paddingTop));
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
    this.wrapper_.classList.add('i-amphtml-scroll-disabled');
  }

  /** @override */
  resetScroll() {
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
      width: this.win./*OK*/innerWidth,
      height: this.win./*OK*/innerHeight,
    };
  }

  /** @override */
  getScrollTop() {
    return this.wrapper_./*OK*/scrollTop;
  }

  /** @override */
  getScrollLeft() {
    // The wrapper is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    return this.wrapper_./*OK*/scrollWidth;
  }

  /** @override */
  getScrollHeight() {
    return this.wrapper_./*OK*/scrollHeight;
  }

  /** @override */
  getLayoutRect(el, opt_scrollLeft, opt_scrollTop) {
    const scrollTop = opt_scrollTop != undefined
        ? opt_scrollTop
        : this.getScrollTop();
    const scrollLeft = opt_scrollLeft != undefined
        ? opt_scrollLeft
        : this.getScrollLeft();
    const b = el./*OK*/getBoundingClientRect();
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
    this.wrapper_./*OK*/scrollTop = scrollTop || 1;
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
    if (this.wrapper_./*OK*/scrollTop == 0) {
      this.wrapper_./*OK*/scrollTop = 1;
      if (opt_event) {
        opt_event.preventDefault();
      }
    }
    if (opt_event) {
      this.scrollObservable_.fire();
    }
  }
}
