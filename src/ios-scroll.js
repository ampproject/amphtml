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
   * @param {HTMLBodyElement} body
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
     * @const @private {Element}
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
    this.min_ = -scrollTop;

    /**
     * The maximum value that we may scroll the scroller to.
     * @private {number}
     */
    this.max_ = Math.round(scrollHeight - this.win_./*OK*/innerHeight);

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
     * The synthetic momentum scroll, bound to this context.
     * @private @const
     */
    this.boundAutoScroll_ = this.autoScroll_.bind(this);

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
   *
   * @param {number} ypos
   */
  setScrollTop(ypos) {
    this.scrollTo_(ypos);
    this.scrollStopped_();
  }

  /**
   * Calculates the current scrollTop.
   */
  getScrollTop() {
    const delta = this.bodyScrolled_ ?
        -this.scrollMoveEl_./*OK*/getBoundingClientRect().top  :
        0;
    return this.scrollTop_ + this.offset_ + delta;
  }

  /**
   * Resize the scroll element. Usually triggered after an orientation change.
   *
   * @param {number} scrollTop
   * @param {number} scrollHeight
   */
  resize(scrollTop, scrollHeight) {
    var delta = this.scrollMoveEl_./*OK*/getBoundingClientRect().top;
    this.scrollTop_ = scrollTop + delta;
    this.min_ = -this.scrollTop_;
    this.max_ = Math.round(scrollHeight - this.win_./*OK*/innerHeight) - delta;
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
   * @private
   */
  scrollTo_(yPos) {
    const y = Math.min(Math.max(yPos, this.min_), this.max_);
    if (y === this.offset_) {
      return false;
    }
    const scrollEventDelta = Math.abs(this.lastScrollEventOffset_ - y);
    this.offset_ = y;

    // "Scroll" by moving the scroller element in the opposite direction of
    // the scroll.
    // We remove the transform when there is no offset so that the body may be
    // sync'd with our synthetic scroll position.
    this.scrollStyle_.style.transform = y ? `translate3d(0, ${-y}px, 0)` : '';

    // Because the scroller now (usually) has a transform, it is now a
    // "positioned" ancestor.  Thus, fixed elements are fixed based on it and
    // will move. So, we need to scroll them in the same direction as the
    // scroll.  When there is no offset, the scroller will not have a transform
    // so we don't need additional offsetting.
    const fixedOffset = y === 0 ? 0 : y + this.scrollTop_;
    const fixeds = this.fixedElementStyles_;
    for (let i = 0; i < fixeds.length; i++) {
      fixeds[i].transform = `translate3d(0, ${fixedOffset}px, 0)`;
    }

    if (y === 0 || scrollEventDelta > SCROLL_EVENT_DELTA) {
      this.lastScrollEventOffset_ = y;
      this.scrollObservable_.fire();
    }

    return true;
  }

  /**
   * Determines the y position of a touch event relative to the screen.
   *
   * @param {!TouchEvent} event
   * @return {number}
   */
  eventY_(event) {
    // Surprisingly, `touchend` does not provide a Touch inside `touches`,
    // but every `TouchEvent` will provide one inside `changedTouches`.
    return event.changedTouches[0].screenY;
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
      if (this.scrollTo_(this.target_ - delta)) {
        this.autoScrolling_ = requestAnimationFrame(this.boundAutoScroll);
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
   * @param {TouchEvent} event
   */
  scrollStarted_(event) {
    if (this.bodyScrolled_) {
      // If the user is still scrolling natively, this will stop it and start
      // the synthetic scrolling.
      event.preventDefault();
      event.stopPropagation();

      // The doc has scrolled natively, causing our synthetic scroll to be out
      // of sync with the real scrollTop. We must calculate the difference
      // and adjust.
      const delta = -this.scrollMoveEl_./*OK*/getBoundingClientRect().top;
      this.scrollTop_ += delta;
      this.min_ -= delta;
      this.max_ -= delta;
      this.bodyScrolled_ = false;
    }

    this.setIframeInteractionAllowed_(false);
  }

  /**
   * Called when the doc stops scrolling, either because there was not enough
   * velocity to have synthetic momentum or we are at our target offset from
   * the momentum.
   */
  scrollStopped_() {
    // To allow native scrolling on iframes, we must adjust the doc's real
    // scrollTop to match where we syntheticly scrolled (else, the user
    // wouldn't be able to natively scroll up because Safari thinks
    // they're "at" the top of the doc).
    this.scrollTop_ += this.offset_;
    this.min_ -= offset;
    this.max_ -= offset;
    this.scrollTo_(0);
    // Suppress this body scrolled event, we expect it.
    this.bodyScrolled_ = null;
    this.scrollMoveEl_.style.transform = 'translateY(' + this.scrollTop_ + 'px)';
    this.scrollMoveEl_./*OK*/scrollIntoView(true);

    this.setIframeInteractionAllowed_(true);
  }

  /**
   * Enables or disables interaction with iframes.
   *
   * @param {boolean} allowed
   */
  setIframeInteractionAllowed_(allowed) {
    const value = allowed ? '' : 'none';
    const styles = this.iframeStyles_;
    for (let i = 0; i < styles.length; i++) {
      styles[i].pointerEvents = value;
    }
  }

  /**
   * A callback bound to the `touchstart` event on the document.
   *
   * @param {TouchEvent} event
   */
  touchstart_(event) {
    // We don't allow zooming
    if (event.touches.length > 1) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.autoScrolling_) {
      cancelAnimationFrame(this.autoScrolling_);
      this.autoScrolling_ = 0;
    } else {
      this.scrollStarted_();
    }

    this.velocity_ = 0;
    this.amplitude_ = 0;
    this.timestamp_ = Date.now();
    this.reference_ = this.eventY_(event);
  }

  /**
   * A callback bound to the `touchmove` event on the document.
   *
   * @param {TouchEvent} event
   */
  touchmove_(event) {
    // We don't allow zooming
    if (event.touches.length > 1) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const y = this.eventY_(event);
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
   * @param {TouchEvent} event
   */
  touchend_(event) {
    // We don't allow zooming
    if (event.touches.length > 1) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Only simulate momentum if we think the user meant to have it.  Ie. if
    // you hang your finger for a few milliseconds, you probably meant to stop
    // the scrolling entirely.
    const elapsed = Date.now() - this.timestamp_;
    if (elapsed < SCROLL_INTENTION_ELAPSED_CUTOFF) {
      // Determine where we should stop the synthetic momentum.
      // The multiplier is arbitrary.
      const multiplier = 1.1;
      this.amplitude_ = multiplier * this.velocity_;
      this.target_ = Math.round(this.offset_ + this.amplitude_);
      this.autoScrolling_ = requestAnimationFrame(this.boundAutoScroll);
    } else {
      this.scrollStopped_();
    }
  }

  /**
   * A callback bound to the `scroll` event on the body. This is used to
   * determine if a native scroll happened.
   *
   * @param {TouchEvent} event
   */
  bodyScroll_() {
    this.bodyScrolled_ = this.bodyScrolled_ === null ? false : true;
  }
}
