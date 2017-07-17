/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-lightbox-0.1.css';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {dev} from '../../../src/log';
import {Services} from '../../../src/services';
import * as st from '../../../src/style';

/** @const {string} */
const TAG = 'amp-lightbox';


class AmpLightbox extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?{width: number, height: number}} */
    this.size_ = null;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?Array<!Element>} */
    this.children_ = null;

    /** @private {number} */
    this.historyId_ = -1;

    /** @private {boolean} */
    this.active_ = false;

    /**  @private {?function(this:AmpLightbox, Event)}*/
    this.boundCloseOnEscape_ = null;

    /** @private {boolean} */
    this.isScrollable_ = false;

    /** @private {number} */
    this.pos_ = 0;

    /** @private {number} */
    this.oldPos_ = 0;

    /** @private {?number} */
    this.scrollTimerId_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * Lazily builds the lightbox DOM on the first open.
   * @private
   */
  initialize_() {
    if (this.container_) {
      return;
    }

    this.isScrollable_ = this.element.hasAttribute('scrollable');

    this.children_ = this.getRealChildren();

    this.container_ = this.element.ownerDocument.createElement('div');
    if (!this.isScrollable_) {
      this.applyFillContent(this.container_);
    }
    this.element.appendChild(this.container_);

    this.children_.forEach(child => {
      if (this.isScrollable_) {
        this.setAsOwner(child);
      }
      this.container_.appendChild(child);
    });

    if (this.isScrollable_) {
      this.element.addEventListener('scroll', this.scrollHandler_.bind(this));
    }

    this.registerAction('open', this.activate.bind(this));
    this.registerAction('close', this.close.bind(this));

    if (!this.isScrollable_) {
      const gestures = Gestures.get(this.element);
      gestures.onGesture(SwipeXYRecognizer, () => {
        // Consume to block scroll events and side-swipe.
      });
    }
  }

  /** @override */
  layoutCallback() {
    return Promise.resolve();
  }

  /** @override */
  activate() {
    if (this.active_) {
      return;
    }
    this.initialize_();
    this.boundCloseOnEscape_ = this.closeOnEscape_.bind(this);
    this.win.document.documentElement.addEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.getViewport().enterLightboxMode(this.element)
        .then(() => this.finalizeOpen_());
  }

  finalizeOpen_() {
    if (this.isScrollable_) {
      st.setStyle(this.element, 'webkitOverflowScrolling', 'touch');
    }
    this.mutateElement(() => {
      st.setStyles(this.element, {
        display: '',
        opacity: 0,
        // TODO(dvoytenko): use new animations support instead.
        transition: 'opacity 0.1s ease-in',
      });
      Services.vsyncFor(this.win).mutate(() => {
        st.setStyle(this.element, 'opacity', '');
      });
    }).then(() => {
      const container = dev().assertElement(this.container_);
      if (!this.isScrollable_) {
        this.updateInViewport(container, true);
      } else {
        this.scrollHandler_();
        this.updateChildrenInViewport_(this.pos_, this.pos_);
      }
      // TODO: instead of laying out children all at once, layout children based
      // on visibility.
      this.scheduleLayout(container);
      this.scheduleResume(container);
    });

    this.getHistory_().push(this.close.bind(this)).then(historyId => {
      this.historyId_ = historyId;
    });

    this.active_ = true;
  }

  /**
   * Handles closing the lightbox when the ESC key is pressed.
   * @param {!Event} event.
   * @private
   */
  closeOnEscape_(event) {
    if (event.keyCode == KeyCodes.ESCAPE) {
      this.close();
    }
  }

  /**
   * Clean up when closing lightbox.
   */
  close() {
    if (!this.active_) {
      return;
    }
    if (this.isScrollable_) {
      st.setStyle(this.element, 'webkitOverflowScrolling', '');
    }
    this.getViewport().leaveLightboxMode(this.element)
        .then(() => this.finalizeClose_());
  }

  finalizeClose_() {
    this./*OK*/collapse();
    if (this.historyId_ != -1) {
      this.getHistory_().pop(this.historyId_);
    }
    this.win.document.documentElement.removeEventListener(
        'keydown', this.boundCloseOnEscape_);
    this.boundCloseOnEscape_ = null;
    this.schedulePause(dev().assertElement(this.container_));
    this.active_ = false;
  }

  /**
   * Handles scroll on the amp-lightbox.
   * The scroll throttling and visibility calculation is similar to
   * the implementation in scrollable-carousel
   * @private
   */
  scrollHandler_() {
    // If scroll top is 0, it's set to 1 to avoid scroll-freeze issue.
    const currentScrollTop = this.element./*OK*/scrollTop || 1;
    this.element./*OK*/scrollTop = currentScrollTop;

    this.pos_ = currentScrollTop;

    if (this.scrollTimerId_ === null) {
      this.waitForScroll_(currentScrollTop);
    }
  }

  /**
   * Throttle scrolling events and update the lightbox
   * when scrolling slowly or when the scrolling ends.
   * @param {number} startingScrollTop
   * @private
   */
  waitForScroll_(startingScrollTop) {
    this.scrollTimerId_ = Services.timerFor(this.win).delay(() => {
      if (Math.abs(startingScrollTop - this.pos_) < 30) {
        dev().fine(TAG, 'slow scrolling: ' + startingScrollTop + ' - '
            + this.pos_);
        this.scrollTimerId_ = null;
        this.update_(this.pos_);
      } else {
        dev().fine(TAG, 'fast scrolling: ' + startingScrollTop + ' - '
            + this.pos_);
        this.waitForScroll_(this.pos_);
      }
    }, 100);
  }

  /**
   * Update the inViewport status given current position.
   * @param {number} pos
   * @private
   */
  update_(pos) {
    dev().fine(TAG, 'update_');
    this.updateChildrenInViewport_(pos, this.oldPos_);
    this.oldPos_ = pos;
    this.pos_ = pos;
  }

  /**
   * Update the inViewport status of children when scroll position changed.
   * @param {number} newPos
   * @param {number} oldPos
   * @private
   */
  updateChildrenInViewport_(newPos, oldPos) {
    const seen = [];
    this.forEachVisibleChild_(newPos, cell => {
      seen.push(cell);
      this.updateInViewport(cell, true);
    });
    if (oldPos != newPos) {
      this.forEachVisibleChild_(oldPos, cell => {
        if (!seen.includes(cell)) {
          this.updateInViewport(cell, false);
        }
      });
    }
  }

  /**
   * Call the callback function for each child element that is visible in the
   * lightbox given current scroll position.
   * @param {number} pos
   * @param {function(!Element)} callback
   * @private
   */
  forEachVisibleChild_(pos, callback) {
    const containerHeight = this.getSize_().height;
    for (let i = 0; i < this.children_.length; i++) {
      const child = this.children_[i];
      // Check whether child element is visible in the lightbox given
      // current scrollTop position of lightbox
      if (child./*OK*/offsetTop + child./*OK*/offsetHeight >= pos &&
          child./*OK*/offsetTop <= pos + containerHeight) {
        callback(child);
      }
    }
  }

  /**
   * Returns the size of the lightbox.
   * @return {!{width: number, height: number}}
   */
  getSize_() {
    if (!this.size_) {
      this.size_ = {
        width: this.element./*OK*/clientWidth,
        height: this.element./*OK*/clientHeight,
      };
    }
    return this.size_;
  }

  getHistory_() {
    return Services.historyForDoc(this.getAmpDoc());
  }
}

AMP.registerElement('amp-lightbox', AmpLightbox, CSS);
