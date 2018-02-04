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

import * as st from '../../../src/style';
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-lightbox-0.1.css';
import {Gestures} from '../../../src/gesture';
import {KeyCodes} from '../../../src/utils/key-codes';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {SwipeXYRecognizer} from '../../../src/gesture-recognizers';
import {computedStyle, setImportantStyles} from '../../../src/style';
import {debounce} from '../../../src/utils/rate-limit';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {toArray} from '../../../src/types';

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
    this.componentDescendants_ = null;

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

    /** @const {function()} */
    this.boundReschedule_ = debounce(this.win, () => {
      const container = dev().assertElement(this.container_);
      this.scheduleLayout(container);
      this.scheduleResume(container);
    }, 500);
  }

  /** @override */
  buildCallback() {
    this.element.classList.add('i-amphtml-overlay');
    this.maybeSetTransparentBody_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * Takes ownership of all AMP element descendants.
   * @private
   */
  takeOwnershipOfDescendants_() {
    dev().assert(this.isScrollable_);
    this.getComponentDescendants_(/* opt_refresh */ true).forEach(child => {
      this.setAsOwner(child);
    });
  }

  /**
   * Gets a list of all AMP element descendants.
   * @param {boolean=} opt_refresh Whether to requery the descendants.
   * @return {!Array<!Element>}
   * @private
   */
  getComponentDescendants_(opt_refresh) {
    if (!this.componentDescendants_ || opt_refresh) {
      this.componentDescendants_ = toArray(
          this.element.getElementsByClassName('i-amphtml-element'));
    }
    return this.componentDescendants_;
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

    const children = this.getRealChildren();

    this.container_ = this.element.ownerDocument.createElement('div');
    if (!this.isScrollable_) {
      this.applyFillContent(this.container_);
    }
    this.element.appendChild(this.container_);

    children.forEach(child => {
      this.container_.appendChild(child);
    });

    // If scrollable, take ownership of existing children and all future
    // dynamically created children as well.
    if (this.isScrollable_) {
      this.takeOwnershipOfDescendants_();

      this.element.addEventListener(AmpEvents.DOM_UPDATE, () => {
        this.takeOwnershipOfDescendants_();
        this.updateChildrenInViewport_(this.pos_, this.pos_);
      });

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
      this.element.addEventListener('transitionend', this.boundReschedule_);
      this.element.addEventListener('animationend', this.boundReschedule_);
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
    this.element.removeEventListener('transitionend', this.boundReschedule_);
    this.element.removeEventListener('animationend', this.boundReschedule_);
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
      this.scheduleLayout(cell);
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
    const descendants = this.getComponentDescendants_();
    for (let i = 0; i < descendants.length; i++) {
      const descendant = descendants[i];
      let offsetTop = 0;
      for (let n = descendant;
        n && this.element.contains(n);
        n = n./*OK*/offsetParent) {
        offsetTop += n./*OK*/offsetTop;
      }
      // Check whether child element is almost visible in the lightbox given
      // current scrollTop position of lightbox
      // We consider element visible if within 2x containerHeight distance.
      const visibilityMargin = 2 * containerHeight;
      if (offsetTop + descendant./*OK*/offsetHeight >= pos - visibilityMargin &&
        offsetTop <= pos + visibilityMargin) {
        callback(descendant);
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

  /**
   * Sets the document body to transparent to allow for frame "merging" if the
   * element is under FIE.
   * The module-level execution of setTransparentBody() only works on inabox,
   * so we need to perform the check on element build time as well.
   * @private
   */
  maybeSetTransparentBody_() {
    if (this.getAmpDoc().win != this.win) { // in FIE
      setTransparentBody(this.getAmpDoc().win, /** @type {!HTMLBodyElement} */ (
        dev().assert(this.win.document.body)));
    }
  }
}


/**
 * Sets the document body to transparent to allow for frame "merging".
 * @param {!Window} win
 * @param {!HTMLBodyElement} body
 * @private
 */
function setTransparentBody(win, body) {
  Services.vsyncFor(win).run({
    measure(state) {
      state.alreadyTransparent =
          computedStyle(win, body)['background-color'] == 'rgba(0, 0, 0, 0)';
    },
    mutate(state) {
      if (!state.alreadyTransparent && !getMode().test) {

        // TODO(alanorozco): Create documentation page and link it here once the
        // A4A lightbox experiment is turned on.
        user().warn(TAG,
            'The background of the <body> element has been forced to ' +
            'transparent. If you need to set background, use an intermediate ' +
            'container.');
      }

      // set as !important regardless to prevent changes
      setImportantStyles(body, {background: 'transparent'});
    },
  }, {});
}


// TODO(alanorozco): refactor this somehow so we don't need to do a direct
// getMode check
if (getMode().runtime == 'inabox') {
  setTransparentBody(window, /** @type {!HTMLBodyElement} */ (
    dev().assert(document.body)));
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpLightbox, CSS);
});
