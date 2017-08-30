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
import {checkAndFix as checkAndFixIosScrollfreezeBug} from
    './ios-scrollfreeze-bug';
import {layoutRectLtwh} from '../../layout-rect';
import {dev} from '../../log';
import {onDocumentReady, whenDocumentReady} from '../../document-ready';
import {Services} from '../../services';
import {setStyle, setStyles, computedStyle} from '../../style';
import {ViewportBindingDef} from './viewport-binding-def';


const TAG_ = 'Viewport';


/**
 * Implementation of ViewportBindingDef based on the native window in case when
 * the AMP document is embedded in a IFrame on iOS. It assumes that the native
 * window is sized properly and events represent the actual resize events.
 * The main difference from natural binding is that in this case, the document
 * itself is not scrollable, but instead only "body" is scrollable.
 *
 * Visible for testing.
 *
 * @implements {ViewportBindingDef}
 */
export class ViewportBindingNaturalIosEmbed_ {
  /**
   * @param {!Window} win
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(win, ampdoc) {
    /** @const {!Window} */
    this.win = win;

    /** @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private {?Element} */
    this.scrollPosEl_ = null;

    /** @private {?Element} */
    this.scrollMoveEl_ = null;

    /** @private {?Element} */
    this.endPosEl_ = null;

    /** @private {!../../service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win);

    /** @private {!{x: number, y: number}} */
    this.pos_ = {x: 0, y: 0};

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    /** @private @const {!Observable} */
    this.resizeObservable_ = new Observable();

    /** @private {number} */
    this.paddingTop_ = 0;

    // Mark as a legacy viewport.
    this.win.document.documentElement.classList.add(
        'i-amphtml-ios-embed-legacy');

    // Microtask is necessary here to let Safari to recalculate scrollWidth
    // post DocumentReady signal.
    whenDocumentReady(this.win.document).then(() => this.setup_());
    this.win.addEventListener('resize', () => this.resizeObservable_.fire());

    dev().fine(TAG_, 'initialized natural viewport for iOS embeds');
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
    return true;
  }

  /** @private */
  setup_() {
    const documentElement = this.win.document.documentElement;
    const documentBody = dev().assertElement(
        this.win.document.body);

    // Embedded scrolling on iOS is rather complicated. IFrames cannot be sized
    // and be scrollable. Sizing iframe by scrolling height has a big negative
    // that "fixed" position is essentially impossible. The only option we
    // found is to reset scrolling on the AMP doc, which overrides natural BODY
    // scrolling with overflow:auto. We need the following styling:
    // html {
    //   overflow: auto;
    //   -webkit-overflow-scrolling: touch;
    // }
    // body {
    //   position: absolute;
    //   overflow: auto;
    //   -webkit-overflow-scrolling: touch;
    // }
    setStyles(documentElement, {
      overflowY: 'auto',
      webkitOverflowScrolling: 'touch',
    });
    setStyles(documentBody, {
      overflowX: 'hidden',
      overflowY: 'auto',
      webkitOverflowScrolling: 'touch',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });

    // Insert scrollPos element into DOM. See {@link onScrolled_} for why
    // this is needed.
    this.scrollPosEl_ = this.win.document.createElement('div');
    this.scrollPosEl_.id = 'i-amphtml-scrollpos';
    setStyles(this.scrollPosEl_, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      visibility: 'hidden',
    });
    documentBody.appendChild(this.scrollPosEl_);

    // Insert scrollMove element into DOM. See {@link adjustScrollPos_} for why
    // this is needed.
    this.scrollMoveEl_ = this.win.document.createElement('div');
    this.scrollMoveEl_.id = 'i-amphtml-scrollmove';
    setStyles(this.scrollMoveEl_, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      visibility: 'hidden',
    });
    documentBody.appendChild(this.scrollMoveEl_);

    // Insert endPos element into DOM. See {@link getScrollHeight} for why
    // this is needed.
    this.endPosEl_ = this.win.document.createElement('div');
    this.endPosEl_.id = 'i-amphtml-endpos';
    setStyles(this.endPosEl_, {
      width: 0,
      height: 0,
      visibility: 'hidden',
    });
    // TODO(dvoytenko): not only it should be at the bottom at setup time,
    // but it must always be at the bottom. Consider using BODY "childList"
    // mutations to track this. For now, however, this is ok since we don't
    // allow arbitrary content inserted into BODY.
    documentBody.appendChild(this.endPosEl_);

    documentBody.addEventListener('scroll', this.onScrolled_.bind(this));

    // Correct iOS Safari scroll freezing issues if applicable.
    checkAndFixIosScrollfreezeBug(this.ampdoc);
  }

  /** @override */
  connect() {
    // Do nothing: ViewportBindingNaturalIosEmbed_ can only be used in the
    // single-doc mode.
  }

  /** @override */
  disconnect() {
    // Do nothing: ViewportBindingNaturalIosEmbed_ can only be used in the
    // single-doc mode.
  }

  /** @override */
  hideViewerHeader(transient, lastPaddingTop) {
    if (transient) {
      // Add extra paddingTop to make the content stay at the same position
      // when the hiding header operation is transient
      onDocumentReady(this.win.document, doc => {
        const body = dev().assertElement(doc.body);
        const existingPaddingTop =
            computedStyle(this.win, body).paddingTop || '0';
        setStyles(body, {
          paddingTop: `calc(${existingPaddingTop} + ${lastPaddingTop}px)`,
          borderTop: '',
        });
      });
    } else {
      this.updatePaddingTop(0);
    }
  }

  /** @override */
  showViewerHeader(transient, paddingTop) {
    if (!transient) {
      this.updatePaddingTop(paddingTop);
    }
    // No need to adjust borderTop and paddingTop when the showing header
    // operation is transient
  }

  /** @override */
  disableScroll() {
    // This is not supported in ViewportBindingNaturalIosEmbed_
  }

  /** @override */
  resetScroll() {
    // This is not supported in ViewportBindingNaturalIosEmbed_
  }

  /** @override */
  updatePaddingTop(paddingTop) {
    onDocumentReady(this.win.document, doc => {
      this.paddingTop_ = paddingTop;
      setStyles(dev().assertElement(doc.body), {
        borderTop: `${paddingTop}px solid transparent`,
        paddingTop: '',
      });
    });
  }

  /** @override */
  updateLightboxMode(lightboxMode) {
    // This code will no longer be needed with the newer iOS viewport
    // implementation.
    return new Promise(resolve => {
      onDocumentReady(this.win.document, doc => {
        Services.vsyncFor(this.win).mutatePromise(() => {
          setStyle(doc.body, 'borderTopStyle', lightboxMode ? 'none' : 'solid');
        }).then(resolve);
      });
    });
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
  getSize() {
    return {
      width: this.win./*OK*/innerWidth,
      height: this.win./*OK*/innerHeight,
    };
  }

  /** @override */
  getScrollTop() {
    return Math.round(this.pos_.y);
  }

  /** @override */
  getScrollLeft() {
    // The html is set to overflow-x: hidden so the document cannot be
    // scrolled horizontally. The scrollLeft will always be 0.
    return 0;
  }

  /** @override */
  getScrollWidth() {
    // There's no good way to calculate scroll width on iOS in this mode.
    return this.win./*OK*/innerWidth;
  }

  /** @override */
  getScrollHeight() {
    // We have to use a special "tail" element on iOS due to the issues outlined
    // in the {@link onScrolled_} method. Because we are forced to layout BODY
    // with position:absolute, we can no longer use BODY's scrollHeight to
    // determine scrolling height - it will always return the viewport height.
    // Instead, we append the "tail" element as the last child of BODY and use
    // it's viewport-relative position to calculate scrolling height.
    if (!this.endPosEl_) {
      return 0;
    }
    return Math.round(this.endPosEl_./*OK*/getBoundingClientRect().top -
        this.scrollPosEl_./*OK*/getBoundingClientRect().top);
  }

  /** @override */
  getLayoutRect(el) {
    const b = el./*OK*/getBoundingClientRect();
    return layoutRectLtwh(Math.round(b.left + this.pos_.x),
        Math.round(b.top + this.pos_.y),
        Math.round(b.width),
        Math.round(b.height));
  }

  /** @override */
  getLayoutRectAsync(el, opt_scrollLeft, opt_scrollTop) {
    return this.vsync_.measurePromise(() => {
      return this.getLayoutRect(el, opt_scrollLeft, opt_scrollTop);
    });
  }

  /** @override */
  setScrollTop(scrollTop) {
    this.setScrollPos_(scrollTop || 1);
  }

  /**
   * @param {!Event} event
   * @private
   */
  onScrolled_(event) {
    // We have to use a special "positioning" element on iOS due to the
    // following bugs:
    // - https://code.google.com/p/chromium/issues/detail?id=2891
    // - https://code.google.com/p/chromium/issues/detail?id=157855
    // - https://bugs.webkit.org/show_bug.cgi?id=106133
    // - https://bugs.webkit.org/show_bug.cgi?id=149264
    // This is an iOS-specific issue in the context of AMP, but Chrome bugs
    // are listed for reference. In a nutshell, this is because WebKit (and
    // Chrome as well) redirect body's scrollTop to documentElement instead of
    // body. Since in this case we are actually using direct body scrolling,
    // body's scrollTop would always return wrong values.
    // This will all change with a complete migration when
    // document./*OK*/scrollingElement will point to document.documentElement.
    // This already works correctly in Chrome with "scroll-top-left-interop"
    // flag turned on "chrome://flags/#scroll-top-left-interop".
    if (!this.scrollPosEl_) {
      return;
    }
    this.adjustScrollPos_(event);
    const rect = this.scrollPosEl_./*OK*/getBoundingClientRect();
    if (this.pos_.x != -rect.left || this.pos_.y != -rect.top) {
      this.pos_.x = -rect.left;
      this.pos_.y = -rect.top + this.paddingTop_;
      this.scrollObservable_.fire();
    }
  }

  /** @private */
  setScrollPos_(scrollPos) {
    if (!this.scrollMoveEl_) {
      return;
    }
    setStyle(this.scrollMoveEl_, 'transform',
        `translateY(${scrollPos - this.paddingTop_}px)`);
    this.scrollMoveEl_./*OK*/scrollIntoView(true);
  }

  /**
   * @param {!Event=} opt_event
   * @private
   */
  adjustScrollPos_(opt_event) {
    if (!this.scrollPosEl_ || !this.scrollMoveEl_) {
      return;
    }
    // Scroll document into a safe position to avoid scroll freeze on iOS.
    // This means avoiding scrollTop to be minimum (0) or maximum value.
    // This is very sad but very necessary. See #330 for more details.
    // Unfortunately, the same is very expensive to do on the bottom, due to
    // costly scrollHeight.
    const scrollTop = -this.scrollPosEl_./*OK*/getBoundingClientRect().top +
        this.paddingTop_;
    if (scrollTop == 0) {
      this.setScrollPos_(1);
      if (opt_event) {
        opt_event.preventDefault();
      }
      return;
    }
  }
}
