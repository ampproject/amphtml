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

import {Observable} from './observable';

/**
 * The elapsed time cutoff that determines if a user intended to stop the
 * synthetic scroll momentum.
 * @const @private {number}
 */
const SCROLL_INTENTION_ELAPSED_CUTOFF = (1000 / 60) * 3;


/**
 * The number of pixels necessary to fire a scroll event. A scroll event will
 * always fire at the end of a scroll, but only after this many pixels have
 * changed during the scroll.
 * @const @private {number}
 */
const SCROLL_EVENT_DELTA = 2.1;

/**
 * Manages scrolling of embedded AMP document in iOS, since iOS doesn't
 * natively scroll embedded documents well. This "synthetic" scrolling keeps
 * track of fixed position elements so that they may be scrolled in unison. It
 * also keeps track of iframes so that they can be disabled during scrolling
 * (so they don't start a native scroll during our synthetic scroll).
 *
 * This is a substantially modified version of Kinetic Scrolling.
 */
export class SyntheticScroll {

  /**
   * @param {!HTMLBodyElement} body
   * @param {number} scrollTop the body's current scrollTop
   * @param {number} scrollHeight the body's current scrollHeight
   */
  constructor(scrollEl, scrollTop, scrollHeight) {
    const doc = scrollEl.ownerDocument;
    const body = doc.body;

    /**
     * @const @private {!Window}
     */
    this.win_ = doc.defaultView;

    /**
     * We store the style reference directly to speed things up.
     * @const @private {!CSSStyleDeclaration}
     **/
    this.scrollStyle_ = scrollEl.style;

    /**
     * We track the iframes on the page so we may disable direct interaction
     * during scrolling. This prevents them from causing native scrolling.
     * When scrolling is done, they will be re-enabled.
     * @const @private {!Array<!CSSStyleDeclaration>}
     **/
    this.iframeStyles_ = [];

    /**
     * A list of fixed position elements that we should scroll with the doc.
     * @const @private {!Array<!CSSStyleDeclaration>}
     */
    this.fixedElementStyles_ = [];

    /**
     * A helper element that records the last position we scrolled to. This
     * allows us to determine how much the user scrolled natively.
     * @const @private {!Element}
     */
    this.scrollMoveEl_ = doc.createElement('div');
    this.scrollMoveEl_.id = '-amp-scrollmove';
    body.appendChild(this.scrollMoveEl_);

    /**
     * The body's current scrollTop position. This is synchronized after every
     * synthetic scroll and at the start of the synthetic scroll after a native
     * scroll.
     * @private {number}
     */
    this.scrollTop_ = scrollTop;

    /**
     * The minimum value that we may scroll the scroller to. This may be less
     * than zero so we may "overscroll" upwards after synchronizing the body's
     * scrollTop and our synthetic scroll offset.
     * @private {number}
     */
    this.minScrollTop_ = 0;

    /**
     * The maximum value that we may scroll the scroller to.
     * @private {number}
     */
    this.maxScrollTop_ = Math.round(scrollHeight - this.win_./*REVIEW*/innerHeight);

    /**
     * The current scroll offset from the body's own scrollTop. After synthetic
     * scrolling, this value will be added to the scrollTop.
     * @private {number}
     */
    this.offset_ = 0;

    /**
     * The scroll offset that last fired a scroll event. Used to prevent
     * hundreds of scroll events for fractional scrolls.
     * @private {number}
     */
    this.lastScrollEventOffset_ = 0;

    /**
     * The identifier for the finger touch we are currently tracking. We need
     * to track a single finger to properly calculate the ypos-deltas.
     * @private {number}
     */
    this.touchId_ = 0;

    /**
     * Records the y position of the last touch event, and is used to
     * determine how much movement happened in the current touch event.
     * @private {number}
     */
    this.reference_ = 0;

    /**
     * Records the timestamp of the last touch event, and is used to
     * determine how much time elapsed between now.
     * @private {number}
     */
    this.timestamp_ = 0;

    /**
     * A calculated velocity that the current scroll gives the doc.
     * @private {number}
     */
    this.velocity_ = 0;

    /**
     * A total distance between the current offset and where the doc should
     * end up after accounting for the velocity.
     * @private {number}
     */
    this.amplitude_ = 0;

    /**
     * The target offset that scroll velocity carries us to.
     * @private {number}
     */
    this.target_ = 0;

    /**
     * The animation frame id for our synthetic momentum scrolling step
     * function.
     * @private {number}
     */
    this.autoScrolling_ = 0;

    /**
     * Used to determine if the page is currently synthetic scrolling.
     * @private {boolean}
     */
    this.scrolling_ = false;

    /**
     * Used to determine if the user has native scrolled (due to an iframe).
     * To account for our own scrolling of the body element (synchronizing the
     * scrollTop and our synthetic scrolling), this value may be null meaning
     * that this scroll event is expected. If so, it will be set to false after
     * the expected scroll. Otherwise, it will be true indicating a native
     * scroll.
     * @private {boolean|null}
     */
    this.bodyScrolled_ = false;

    /**
     * A cached promise to perform microtasks. I've opted to directly use a
     * promise instead of the timer utility to avoid the cancel logic and the
     * associated function allocation, we know when it's has been canceled.
     */
    this.promise_ = Promise.resolve();

    /**
     * The synthetic momentum scroll, bound to this context.
     * @private @const
     */
    this.boundAutoScroll_ = () => this.autoScroll_();

    /**
     * The synthetic momentum scroll, bound to this context.
     * @private @const
     */
    this.boundForceRedrawMicrotask_ = () => this.forceRedrawMicrotask_();

    /** @private @const {!Observable} */
    this.scrollObservable_ = new Observable();

    // We listen on the document level so that, even if the HTML or BODY has
    // padding, margin, etc, the touch event will still cause scrolling.
    doc.addEventListener('touchstart', this.touchstart_.bind(this));
    doc.addEventListener('touchmove', this.touchmove_.bind(this));
    doc.addEventListener('touchend', this.touchend_.bind(this));
    // Native scrolling does some weird things. When the user native scrolls
    // due to an iframe, the only event fired in this doc is a `scroll` on
    // the body element.
    body.addEventListener('scroll', this.bodyScroll_.bind(this));

    // Promote the scroller to it's own GPU rendering layer.
    this.scrollStyle_.willChange = 'transform';
  }

  /**
   * Adds a fixed position element to the list we track. When the doc is
   * scrolled, we will scroll the element in unison.
   *
   * @param {!Element} element
   */
  addFixedElement(element) {
    const style = element.style;
    this.fixedElementStyles_.push(style);
    // Promote the element to it's own GPU rendering layer. This allows us to
    // scroll the element in unison with the doc.
    style.transform = `translate3d(0, 0, 0)`;
  }

  /**
   * Removes the fixed position element from our list.
   *
   * @param {!Element} element
   */
  removeFixedElement(element) {
    const style = element.style;
    const index = this.fixedElementStyles_.indexOf(style);

    if (index > -1) {
      this.fixedElementStyles_.splice(index, 1);
      style.transform = '';
    }
  }

  /**
   * Adds an iframe to the list we track. When the doc is scrolled, we will
   * disable interaction with the element to prevent native scrolling from
   * kicking in. When scrolling has stopped, we will re-enable.
   *
   * @param {!HTMLIFrameElement} iframe
   */
  addIframe(iframe) {
    const style = iframe.style;
    this.iframeStyles_.push(style);

    // Offset is only present during scrolling, in which case we need to
    // disable interacting with the iframe.
    if (this.offset) {
      style.pointerEvents = 'none';
    }
  }

  /**
   * Removes the iframe from our list.
   *
   * @param {!HTMLIFrameElement} iframe
   */
  removeIframe(iframe) {
    const style = iframe.style;
    const index = this.iframeStyles_.indexOf(style);

    if (index > -1) {
      this.iframeStyles_.splice(index, 1);
      style.pointerEvents = '';
    }
  }

  /**
   * Scrolls the document to position ypos.
   * TODO kill momentum
   *
   * @param {number} ypos
   */
  setScrollTop(ypos) {
    const y = Math.min(Math.max(yPos, this.minScrollTop_), this.maxScrollTop_);
    this.lastScrollEventOffset_ = y;
    this.scrollTop_ = y;

    // TODO move this into it's own method with scrollStopped_'s.
    // Suppress this body scrolled event, we expect it.
    this.bodyScrolled_ = null;
    this.scrollMoveEl_.style.transform = 'translateY(' + this.scrollTop_ + 'px)';
    this.scrollMoveEl_./*REVIEW*/scrollIntoView(true);
  }

  /**
   * Calculates the current scrollTop.
   */
  getScrollTop() {
    const delta = this.bodyScrolled_ ?
        -this.scrollMoveEl_./*REVIEW*/getBoundingClientRect().top  :
        0;
    // offset will be truthy if we are scrolling. Else, scrollTop
    // will be the current scrollTop.
    return (this.offset_ || this.scrollTop_) + delta;
  }

  /**
   * Resize the scroll element. Usually triggered after an orientation change.
   * TODO kill momentum
   *
   * @param {number} scrollTop
   * @param {number} scrollHeight
   */
  resize(scrollTop, scrollHeight) {
    var delta = this.scrollMoveEl_./*REVIEW*/getBoundingClientRect().top;
    this.scrollTop_ = scrollTop + delta;
    this.maxScrollTop_ = Math.round(scrollHeight - this.win_./*REVIEW*/innerHeight);
  }

  /**
   * Registers the handler for scroll events.
   *
   * @param {!function()} handler
   * @return {!Unlisten}
   */
  onScroll(handler) {
    return this.scrollObservable_.add(handler);
  }

  /**
   * Synthetically scrolls the document to position ypos. This does not change
   * the body's scrollTop.
   *
   * @param {number} ypos
   * @param {boolean} opt_suppressScrollEvent Whether to suppress scroll events
   *     and updating the associated throttle. This is used during
   *     synchronization to prevent double scroll events.
   * @private
   */
  scrollTo_(yPos, opt_suppressScrollEvent) {
    const y = Math.min(Math.max(yPos, this.minScrollTop_), this.maxScrollTop_);
    if (y === this.offset_) {
      return false;
    }
    const scrollEventDelta = Math.abs(this.lastScrollEventOffset_ - y);
    this.offset_ = y;

    // "Scroll" by moving the scroller element in the opposite direction of
    // the scroll.
    this.scrollStyle_.transform = y ? `translate3d(0, ${-y}px, 0)` : '';

    const fixeds = this.fixedElementStyles_;
    const translation = `translate3d(0, ${y}px, 0)`;
    for (let i = 0; i < fixeds.length; i++) {
      fixeds[i].transform = translation;
    }

    // The only time we scroll to 0 is when we're synchronizing the scrollTop
    // and synthetic scroll. In that case, the body's own scroll event will
    // fire.
    if (!opt_suppressScrollEvent && scrollEventDelta > SCROLL_EVENT_DELTA) {
      this.lastScrollEventOffset_ = y;
      this.scrollObservable_.fire();
    }

    return true;
  }

  /**
   * Finds the touch event we are currently tracking.
   *
   * @param {!TouchEvent} event
   * @return {boolean} opt_end Whether we only care about the touchend touch.
   * @return {?Touch}
   */
  touch_(event, opt_end) {
    let touch;
    if (opt_end) {
      touch = event.changedTouches[0];
      //  If this is a single-finger scroll, this will be the finger we are
      //  tracking. If this is a multi-finger scroll, this may be the finger
      //  or it may be one of the other fingers we are not tracking.
      if (touch.identifier === this.touchId_) {
          this.touchId_ = 0;
          return touch;
      }

      return;
    }

    const touches = event.touches;

    // If we're not tracking a touch yet, just grab the first and track it.
    if (!this.touchId_) {
      touch = touches[0];
      this.touchId_ = touch.identifier;
      return touch;
    }

    // This loop is guaranteed to find the touch we're tracking since it must
    // be in this array until a touchEnd event (which would have stopped us
    // from tracking it).
    for (let i = 0; i < touches.length; i++) {
      touch = touches[i];
      if (touch.identifier === this.touchId_) {
        return touch;
      }
    }
  }

  /**
   * Tracks the velocity of touch movement using a sliding equation.
   *
   * @param {number} delta the change in y position since the last velocity
   *     tracking.
   */
  track_(delta) {
    const now = Date.now();
    const elapsed = now - this.timestamp_;
    this.timestamp_ = now;

    // An arbitrary sliding acceleration equation to gain speed based on the
    // last velocity.
    // Constants have been pulled out to highlight that they may change.
    const pixelsPerDelta = 500;
    const currentWeight = 0.8;
    const lastWeight = 1 - currentWeight;
    const v = pixelsPerDelta * delta / (1 + elapsed);
    this.velocity_ = (currentWeight * v) + (lastWeight * this.velocity_);
  }

  /**
   * A step function that simulates momentum using a velocity and total offset
   * amplitude. We approach the target offset exponentially, backing off as we
   * get closer.
   */
  autoScroll_() {
    this.autoScrolling_ = 0;

    // We approach the target exponentially, slowing down as we get closer.
    // Note that duration is arbitrary, it just "feels" right.
    const duration = 450;
    const elapsed = Date.now() - this.timestamp_;
    const delta = this.amplitude_ * Math.exp(-elapsed / duration);

    if (Math.abs(delta) > 0.3) {
      // Only continue autoscrolling if we are not at the bounds of the doc.
      if (this.scrollTo_(this.target_ - delta)) {
        this.autoScrolling_ = this.win_.requestAnimationFrame(
          this.boundAutoScroll_
        );
        return;
      }
    } else {
      this.scrollTo_(this.target_);
    }
    this.scrollStopped_();
  }

  /**
   * Called when the doc first starts scrolling (ie, there is no scroll
   * synthetic scroll momentum). This will be called if the user natively
   * scrolls the document, then continues the scroll outside of the iframe.
   *
   * @param {?TouchEvent} event
   */
  scrollStarted_(event) {
    this.scrolling_ = true;

    if (this.bodyScrolled_) {
      // If the user is still scrolling natively, this will stop it and start
      // the synthetic scrolling.
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // The doc has scrolled natively, causing our synthetic scroll to be out
      // of sync with the real scrollTop. We must calculate the difference
      // and adjust.
      const delta = this.scrollMoveEl_./*REVIEW*/getBoundingClientRect().top;
      this.scrollTop_ -= delta;
      this.bodyScrolled_ = false;
    }

    // Make the entire body visible so that we may transform its box to scroll.
    // Without this, we'd be scrolling the body but no content would be visible
    // outside the overflow cropping.
    this.scrollStyle_.overflowY = 'visible';
    this.scrollStyle_.overflowX = 'visible';
    // Now that we're entirely visible, we must translate the body into our
    // current scroll position.
    this.scrollTo_(this.scrollTop_, true);

    this.setIframeInteractionAllowed_(false);
  }

  /**
   * Called when the doc stops scrolling, either because there was not enough
   * velocity to have synthetic momentum or we are at our target offset from
   * the momentum.
   */
  scrollStopped_() {
    this.scrolling_ = false;

    // To allow native scrolling on iframes, we must adjust the doc's real
    // scrollTop to match where we syntheticly scrolled (else, the user
    // wouldn't be able to natively scroll up because Safari thinks
    // they're "at" the top of the doc).
    this.scrollTop_ = this.offset_;
    // Go back to native scroll mode, so that iframes can cause native
    // scrolling.
    this.scrollTo_(0, true);
    this.scrollStyle_.overflowY = 'auto';
    this.scrollStyle_.overflowX = 'hidden';

    // Suppress this body scrolled event, we expect it.
    // TODO move this into it's own method with setScrollTop's.
    this.bodyScrolled_ = null;
    this.scrollMoveEl_.style.transform = 'translateY(' + this.scrollTop_ + 'px)';
    this.scrollMoveEl_./*REVIEW*/scrollIntoView(true);

    this.forcePositionFixedRedraw_();
    this.setIframeInteractionAllowed_(true);
  }

  /**
   * Part one of two to force a repaint. This removes any transform from the
   * elements (which would normally force a repaint, but Safari can't scroll
   * and repaint a fixed element in the same tick for some unknown reason).
   * We fix this by dirtying the elements again in the next tick.
   * This is an ugly hack. :sadpanda:
   */
  forcePositionFixedRedraw_() {
    const fixeds = this.fixedElementStyles_;
    for (let i = 0; i < fixeds.length; i++) {
      fixeds[i].transform = '';
    }
    this.promise_.then(this.boundForceRedrawMicrotask_);
  }

  /**
   * Part two of the force repaint hack. This "dirties" the elements, forcing
   * the repaint.
   */
  forceRedrawMicrotask_() {
    // If we are currently scrolling, the repaint hack would move the fixed
    // position elements.
    if (this.scrolling_) {
      return;
    }

    const fixeds = this.fixedElementStyles_;
    for (let i = 0; i < fixeds.length; i++) {
      fixeds[i].transform = 'translate3d(0, 0, 0)';
    }
  }

  /**
   * Enables or disables interaction with iframes.
   *
   * @param {boolean} allowed
   */
  setIframeInteractionAllowed_(allowed) {
    const value = allowed ? '' : 'none';
    const iframes = this.iframeStyles_;
    for (let i = 0; i < iframes.length; i++) {
      iframes[i].pointerEvents = value;
    }
  }

  /**
   * A callback bound to the `touchstart` event on the document.
   *
   * @param {!TouchEvent} event
   */
  touchstart_(event) {
    // We're already tracking a finger, no need to track another.
    if (this.touchId_) {
      return;
    }

    // Only start the scroll if the body scrolled to avoid a bug with
    // repainting fixed position elements. We'll start scrolling on the
    // first touchmove event otherwise.
    if (this.bodyScrolled_) {
      this.scrollStarted_(event);
    }

    if (this.autoScrolling_) {
      this.win_.cancelAnimationFrame(this.autoScrolling_);
      this.autoScrolling_ = 0;
    }

    this.velocity_ = 0;
    this.amplitude_ = 0;
    this.timestamp_ = Date.now();
    this.reference_ = this.touch_(event).screenY;
  }

  /**
   * A callback bound to the `touchmove` event on the document.
   *
   * @param {!TouchEvent} event
   */
  touchmove_(event) {
    if (!this.scrolling_) {
      this.scrollStarted_();
    }

    const y = this.touch_(event).screenY;
    const delta = this.reference_ - y;
    this.track_(delta);
    this.reference_ = y;
    this.scrollTo_(this.offset_ + delta);

    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  /**
   * A callback bound to the `touchend` event on the document.
   *
   * @param {!TouchEvent} event
   */
  touchend_(event) {
    const touch = this.touch_(event, true);
    if (event.touches.length > 0) {
      // The finger we're tracking was removed, but there are still fingers
      // on the screen. Start tracking a new one.
      if (touch) {
        reference = this.touch_(event).screenY;
      }

      // We are still scrolling...
      return;
    }

    // When lifting multiple fingers simultaneously, Safari will send multiple
    // events with the next finger as removed but no fingers touching the
    // screen. Wait until we get the touchend event corresponding to the finger
    // we're tracking
    if (!touch) {
      return;
    }

    // We never actually scrolled, so there's no momentum.
    if (!this.scrolling_) {
      return;
    }

    // Only simulate momentum if we think the user meant to have it.  Ie. if
    // you hang your finger for a few milliseconds, you probably meant to stop
    // the scrolling entirely.
    // TODO do we need to compensate for multiple finger lifting not having the
    // right timestamp?
    const elapsed = Date.now() - this.timestamp_;
    if (elapsed < SCROLL_INTENTION_ELAPSED_CUTOFF) {
      // Determine where we should stop the synthetic momentum.
      // The multiplier is arbitrary.
      const multiplier = 1.1;
      this.amplitude_ = multiplier * this.velocity_;
      this.target_ = Math.round(this.offset_ + this.amplitude_);
      this.autoScrolling_ = this.win_.requestAnimationFrame(
        this.boundAutoScroll_
      );
    } else {
      this.scrollStopped_();
    }
  }

  /**
   * A callback bound to the `scroll` event on the body. This is used to
   * determine if a native scroll happened.
   */
  bodyScroll_() {
    this.bodyScrolled_ = this.bodyScrolled_ === null ? false : true;
    this.scrollObservable_.fire();
  }
}
