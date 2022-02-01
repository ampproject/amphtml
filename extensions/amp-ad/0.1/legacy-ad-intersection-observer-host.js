import {MessageType_Enum} from '#core/3p-frame-messaging';
import {intersectionEntryToJson} from '#core/dom/layout/intersection';

import {Services} from '#service';

import {SubscriptionApi} from '../../../src/iframe-helper';

/**
 * LegacyAdIntersectionObserverHost exists for backward compatibility to support
 * the context.observeIntersect API in 3P ad.
 * Use IntersectionObserver3pHost instead.
 *
 * The LegacyAdIntersectionObserverHost class lets a 3P ad share its viewport
 * intersection data with an iframe of its choice (most likely contained within
 * the element itself.) in the format of IntersectionObserverEntry.
 * When instantiated the class will start listening for a
 * 'send-intersections' postMessage from the iframe, and only then would start
 * sending intersection data to the iframe. The intersection data would be sent
 * when the element enters/exits the viewport, as well as on scroll
 * and resize when the element intersects with the viewport.
 * The class uses IntersectionObserver to monitor the element's enter/exit of
 * the viewport. It also exposes a `fire` method to allow AMP to send the
 * intersection data to the iframe at remeasure.
 *
 * Note: The LegacyAdIntersectionObserverHost would not send any data
 * over to the iframe if it had not requested the intersection data already via
 * 'send-intersections' postMessage.
 */
export class LegacyAdIntersectionObserverHost {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} adIframe Iframe element which requested the
   *     intersection data.
   */
  constructor(baseElement, adIframe) {
    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(baseElement.win);

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {?IntersectionObserver} */
    this.fireInOb_ = null;

    /** @private {boolean} */
    this.inViewport_ = false;

    /** @private {!Array<!IntersectionObserverEntry>} */
    this.pendingChanges_ = [];

    /** @private {number|string} */
    this.flushTimeout_ = 0;

    /** @private @const {function()} */
    this.boundFlush_ = this.flush_.bind(this);

    /**
     * An object which handles tracking subscribers to the
     * intersection updates for this element.
     * Triggered by context.observeIntersection(…) inside the ad/iframe
     * or by directly posting a send-intersections message.
     * @private {!SubscriptionApi}
     */
    this.postMessageApi_ = new SubscriptionApi(
      adIframe,
      MessageType_Enum.SEND_INTERSECTIONS,
      true, // is3p
      // Each time someone subscribes we make sure that they
      // get an update.
      () => this.startSendingIntersectionChanges_()
    );

    /** @private {?Function} */
    this.unlistenViewportChanges_ = null;
  }

  /**
   * Fires element intersection
   */
  fire() {
    if (!this.fireInOb_) {
      return;
    }
    this.fireInOb_.unobserve(this.baseElement_.element);
    this.fireInOb_.observe(this.baseElement_.element);
  }

  /**
   * Check if we need to unlisten when moving out of viewport,
   * unlisten and reset unlistenViewportChanges_.
   * @private
   */
  unlistenOnOutViewport_() {
    if (this.unlistenViewportChanges_) {
      this.unlistenViewportChanges_();
      this.unlistenViewportChanges_ = null;
    }
  }
  /**
   * Called via postMessage from the child iframe when the ad/iframe starts
   * observing its position in the viewport.
   * Sets a flag, measures the iframe position if necessary and sends
   * one change record to the iframe.
   * Note that this method may be called more than once if a single ad
   * has multiple parties interested in viewability data.
   * @private
   */
  startSendingIntersectionChanges_() {
    if (!this.intersectionObserver_) {
      this.intersectionObserver_ = new IntersectionObserver((entries) => {
        const lastEntry = entries[entries.length - 1];
        this.onViewportCallback_(lastEntry);
      });
      this.intersectionObserver_.observe(this.baseElement_.element);
    }
    if (!this.fireInOb_) {
      this.fireInOb_ = new IntersectionObserver((entries) => {
        const lastEntry = entries[entries.length - 1];
        this.sendElementIntersection_(lastEntry);
      });
    }
    this.fire();
  }

  /**
   * Triggered when the ad either enters or exits the visible viewport.
   * @param {!IntersectionObserverEntry} entry handed over by the IntersectionObserver.
   */
  onViewportCallback_(entry) {
    const inViewport = entry.intersectionRatio != 0;
    if (this.inViewport_ == inViewport) {
      return;
    }
    this.inViewport_ = inViewport;

    // Lets the ad know that it became visible or no longer is.
    this.sendElementIntersection_(entry);

    // And update the ad about its position in the viewport while
    // it is visible.
    if (inViewport) {
      const send = this.fire.bind(this);
      // Scroll events.
      const unlistenScroll = this.baseElement_.getViewport().onScroll(send);
      // Throttled scroll events. Also fires for resize events.
      const unlistenChanged = this.baseElement_.getViewport().onChanged(send);
      this.unlistenViewportChanges_ = () => {
        unlistenScroll();
        unlistenChanged();
      };
    } else {
      this.unlistenOnOutViewport_();
    }
  }

  /**
   * Sends 'intersection' message to ad/iframe with intersection change records
   * if this has been activated and we measured the layout box of the iframe
   * at least once.
   * @param {!IntersectionObserverEntry} entry - handed over by the IntersectionObserver.
   * @private
   */
  sendElementIntersection_(entry) {
    const change = intersectionEntryToJson(entry);
    // rootBounds is always null in 3p iframe (e.g. Viewer).
    // See https://github.com/w3c/IntersectionObserver/issues/79
    //
    // Since before using a real InOb we used to provide rootBounds,
    // we are temporarily continuing to do so now.
    // TODO: determine if consumers rely on this functionality and remove if not.
    if (change.rootBounds === null) {
      change.rootBounds = this.baseElement_.getViewport().getRect();
    }

    if (
      this.pendingChanges_.length > 0 &&
      this.pendingChanges_[this.pendingChanges_.length - 1].time == change.time
    ) {
      return;
    }
    this.pendingChanges_.push(change);
    if (!this.flushTimeout_) {
      // Send one immediately, …
      this.flush_();
      // but only send a maximum of 10 postMessages per second.
      this.flushTimeout_ = this.timer_.delay(this.boundFlush_, 100);
    }
  }

  /**
   * @private
   */
  flush_() {
    this.flushTimeout_ = 0;
    if (!this.pendingChanges_.length) {
      return;
    }
    // Note that SubscribeApi multicasts the update to all interested windows.
    this.postMessageApi_.send(MessageType_Enum.INTERSECTION, {
      'changes': this.pendingChanges_,
    });
    this.pendingChanges_.length = 0;
  }

  /**
   * Provide a function to clear timeout before set this intersection to null.
   */
  destroy() {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.disconnect();
      this.intersectionObserver_ = null;
    }
    if (this.fireInOb_) {
      this.fireInOb_.disconnect();
      this.fireInOb_ = null;
    }
    this.timer_.cancel(this.flushTimeout_);
    this.unlistenOnOutViewport_();
    this.postMessageApi_.destroy();
  }
}
