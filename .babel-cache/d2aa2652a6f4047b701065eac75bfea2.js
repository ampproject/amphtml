function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { MessageType } from "../../../src/3p-frame-messaging";
import { Services } from "../../../src/service";
import { SubscriptionApi } from "../../../src/iframe-helper";
import { dict } from "../../../src/core/types/object";
import { intersectionEntryToJson } from "../../../src/core/dom/layout/intersection";

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
export var LegacyAdIntersectionObserverHost = /*#__PURE__*/function () {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} adIframe Iframe element which requested the
   *     intersection data.
   */
  function LegacyAdIntersectionObserverHost(baseElement, adIframe) {
    var _this = this;

    _classCallCheck(this, LegacyAdIntersectionObserverHost);

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
    this.postMessageApi_ = new SubscriptionApi(adIframe, MessageType.SEND_INTERSECTIONS, true, // is3p
    // Each time someone subscribes we make sure that they
    // get an update.
    function () {
      return _this.startSendingIntersectionChanges_();
    });

    /** @private {?Function} */
    this.unlistenViewportChanges_ = null;
  }

  /**
   * Fires element intersection
   */
  _createClass(LegacyAdIntersectionObserverHost, [{
    key: "fire",
    value: function fire() {
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

  }, {
    key: "unlistenOnOutViewport_",
    value: function unlistenOnOutViewport_() {
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

  }, {
    key: "startSendingIntersectionChanges_",
    value: function startSendingIntersectionChanges_() {
      var _this2 = this;

      if (!this.intersectionObserver_) {
        this.intersectionObserver_ = new IntersectionObserver(function (entries) {
          var lastEntry = entries[entries.length - 1];

          _this2.onViewportCallback_(lastEntry);
        });
        this.intersectionObserver_.observe(this.baseElement_.element);
      }

      if (!this.fireInOb_) {
        this.fireInOb_ = new IntersectionObserver(function (entries) {
          var lastEntry = entries[entries.length - 1];

          _this2.sendElementIntersection_(lastEntry);
        });
      }

      this.fire();
    }
    /**
     * Triggered when the ad either enters or exits the visible viewport.
     * @param {!IntersectionObserverEntry} entry handed over by the IntersectionObserver.
     */

  }, {
    key: "onViewportCallback_",
    value: function onViewportCallback_(entry) {
      var inViewport = entry.intersectionRatio != 0;

      if (this.inViewport_ == inViewport) {
        return;
      }

      this.inViewport_ = inViewport;
      // Lets the ad know that it became visible or no longer is.
      this.sendElementIntersection_(entry);

      // And update the ad about its position in the viewport while
      // it is visible.
      if (inViewport) {
        var send = this.fire.bind(this);
        // Scroll events.
        var unlistenScroll = this.baseElement_.getViewport().onScroll(send);
        // Throttled scroll events. Also fires for resize events.
        var unlistenChanged = this.baseElement_.getViewport().onChanged(send);

        this.unlistenViewportChanges_ = function () {
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

  }, {
    key: "sendElementIntersection_",
    value: function sendElementIntersection_(entry) {
      var change = intersectionEntryToJson(entry);

      // rootBounds is always null in 3p iframe (e.g. Viewer).
      // See https://github.com/w3c/IntersectionObserver/issues/79
      //
      // Since before using a real InOb we used to provide rootBounds,
      // we are temporarily continuing to do so now.
      // TODO: determine if consumers rely on this functionality and remove if not.
      if (change.rootBounds === null) {
        change.rootBounds = this.baseElement_.getViewport().getRect();
      }

      if (this.pendingChanges_.length > 0 && this.pendingChanges_[this.pendingChanges_.length - 1].time == change.time) {
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

  }, {
    key: "flush_",
    value: function flush_() {
      this.flushTimeout_ = 0;

      if (!this.pendingChanges_.length) {
        return;
      }

      // Note that SubscribeApi multicasts the update to all interested windows.
      this.postMessageApi_.send(MessageType.INTERSECTION, dict({
        'changes': this.pendingChanges_
      }));
      this.pendingChanges_.length = 0;
    }
    /**
     * Provide a function to clear timeout before set this intersection to null.
     */

  }, {
    key: "destroy",
    value: function destroy() {
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
  }]);

  return LegacyAdIntersectionObserverHost;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlZ2FjeS1hZC1pbnRlcnNlY3Rpb24tb2JzZXJ2ZXItaG9zdC5qcyJdLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIlNlcnZpY2VzIiwiU3Vic2NyaXB0aW9uQXBpIiwiZGljdCIsImludGVyc2VjdGlvbkVudHJ5VG9Kc29uIiwiTGVnYWN5QWRJbnRlcnNlY3Rpb25PYnNlcnZlckhvc3QiLCJiYXNlRWxlbWVudCIsImFkSWZyYW1lIiwiYmFzZUVsZW1lbnRfIiwidGltZXJfIiwidGltZXJGb3IiLCJ3aW4iLCJpbnRlcnNlY3Rpb25PYnNlcnZlcl8iLCJmaXJlSW5PYl8iLCJpblZpZXdwb3J0XyIsInBlbmRpbmdDaGFuZ2VzXyIsImZsdXNoVGltZW91dF8iLCJib3VuZEZsdXNoXyIsImZsdXNoXyIsImJpbmQiLCJwb3N0TWVzc2FnZUFwaV8iLCJTRU5EX0lOVEVSU0VDVElPTlMiLCJzdGFydFNlbmRpbmdJbnRlcnNlY3Rpb25DaGFuZ2VzXyIsInVubGlzdGVuVmlld3BvcnRDaGFuZ2VzXyIsInVub2JzZXJ2ZSIsImVsZW1lbnQiLCJvYnNlcnZlIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJlbnRyaWVzIiwibGFzdEVudHJ5IiwibGVuZ3RoIiwib25WaWV3cG9ydENhbGxiYWNrXyIsInNlbmRFbGVtZW50SW50ZXJzZWN0aW9uXyIsImZpcmUiLCJlbnRyeSIsImluVmlld3BvcnQiLCJpbnRlcnNlY3Rpb25SYXRpbyIsInNlbmQiLCJ1bmxpc3RlblNjcm9sbCIsImdldFZpZXdwb3J0Iiwib25TY3JvbGwiLCJ1bmxpc3RlbkNoYW5nZWQiLCJvbkNoYW5nZWQiLCJ1bmxpc3Rlbk9uT3V0Vmlld3BvcnRfIiwiY2hhbmdlIiwicm9vdEJvdW5kcyIsImdldFJlY3QiLCJ0aW1lIiwicHVzaCIsImRlbGF5IiwiSU5URVJTRUNUSU9OIiwiZGlzY29ubmVjdCIsImNhbmNlbCIsImRlc3Ryb3kiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFmO0FBQ0EsYUFBS3RDLFNBQUwsR0FBaUIsSUFBakI7QUFDRDs7QUFDRCxXQUFLSixNQUFMLENBQVkyQyxNQUFaLENBQW1CLEtBQUtwQyxhQUF4QjtBQUNBLFdBQUsyQixzQkFBTDtBQUNBLFdBQUt2QixlQUFMLENBQXFCaUMsT0FBckI7QUFDRDtBQXJNSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7TWVzc2FnZVR5cGV9IGZyb20gJy4uLy4uLy4uL3NyYy8zcC1mcmFtZS1tZXNzYWdpbmcnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25BcGl9IGZyb20gJy4uLy4uLy4uL3NyYy9pZnJhbWUtaGVscGVyJztcbmltcG9ydCB7ZGljdH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7aW50ZXJzZWN0aW9uRW50cnlUb0pzb259IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvaW50ZXJzZWN0aW9uJztcblxuLyoqXG4gKiBMZWdhY3lBZEludGVyc2VjdGlvbk9ic2VydmVySG9zdCBleGlzdHMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgdG8gc3VwcG9ydFxuICogdGhlIGNvbnRleHQub2JzZXJ2ZUludGVyc2VjdCBBUEkgaW4gM1AgYWQuXG4gKiBVc2UgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIzcEhvc3QgaW5zdGVhZC5cbiAqXG4gKiBUaGUgTGVnYWN5QWRJbnRlcnNlY3Rpb25PYnNlcnZlckhvc3QgY2xhc3MgbGV0cyBhIDNQIGFkIHNoYXJlIGl0cyB2aWV3cG9ydFxuICogaW50ZXJzZWN0aW9uIGRhdGEgd2l0aCBhbiBpZnJhbWUgb2YgaXRzIGNob2ljZSAobW9zdCBsaWtlbHkgY29udGFpbmVkIHdpdGhpblxuICogdGhlIGVsZW1lbnQgaXRzZWxmLikgaW4gdGhlIGZvcm1hdCBvZiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5LlxuICogV2hlbiBpbnN0YW50aWF0ZWQgdGhlIGNsYXNzIHdpbGwgc3RhcnQgbGlzdGVuaW5nIGZvciBhXG4gKiAnc2VuZC1pbnRlcnNlY3Rpb25zJyBwb3N0TWVzc2FnZSBmcm9tIHRoZSBpZnJhbWUsIGFuZCBvbmx5IHRoZW4gd291bGQgc3RhcnRcbiAqIHNlbmRpbmcgaW50ZXJzZWN0aW9uIGRhdGEgdG8gdGhlIGlmcmFtZS4gVGhlIGludGVyc2VjdGlvbiBkYXRhIHdvdWxkIGJlIHNlbnRcbiAqIHdoZW4gdGhlIGVsZW1lbnQgZW50ZXJzL2V4aXRzIHRoZSB2aWV3cG9ydCwgYXMgd2VsbCBhcyBvbiBzY3JvbGxcbiAqIGFuZCByZXNpemUgd2hlbiB0aGUgZWxlbWVudCBpbnRlcnNlY3RzIHdpdGggdGhlIHZpZXdwb3J0LlxuICogVGhlIGNsYXNzIHVzZXMgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgdG8gbW9uaXRvciB0aGUgZWxlbWVudCdzIGVudGVyL2V4aXQgb2ZcbiAqIHRoZSB2aWV3cG9ydC4gSXQgYWxzbyBleHBvc2VzIGEgYGZpcmVgIG1ldGhvZCB0byBhbGxvdyBBTVAgdG8gc2VuZCB0aGVcbiAqIGludGVyc2VjdGlvbiBkYXRhIHRvIHRoZSBpZnJhbWUgYXQgcmVtZWFzdXJlLlxuICpcbiAqIE5vdGU6IFRoZSBMZWdhY3lBZEludGVyc2VjdGlvbk9ic2VydmVySG9zdCB3b3VsZCBub3Qgc2VuZCBhbnkgZGF0YVxuICogb3ZlciB0byB0aGUgaWZyYW1lIGlmIGl0IGhhZCBub3QgcmVxdWVzdGVkIHRoZSBpbnRlcnNlY3Rpb24gZGF0YSBhbHJlYWR5IHZpYVxuICogJ3NlbmQtaW50ZXJzZWN0aW9ucycgcG9zdE1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBMZWdhY3lBZEludGVyc2VjdGlvbk9ic2VydmVySG9zdCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBTVAuQmFzZUVsZW1lbnR9IGJhc2VFbGVtZW50XG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGFkSWZyYW1lIElmcmFtZSBlbGVtZW50IHdoaWNoIHJlcXVlc3RlZCB0aGVcbiAgICogICAgIGludGVyc2VjdGlvbiBkYXRhLlxuICAgKi9cbiAgY29uc3RydWN0b3IoYmFzZUVsZW1lbnQsIGFkSWZyYW1lKSB7XG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IUFNUC5CYXNlRWxlbWVudH0gKi9cbiAgICB0aGlzLmJhc2VFbGVtZW50XyA9IGJhc2VFbGVtZW50O1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3RpbWVyLWltcGwuVGltZXJ9ICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcihiYXNlRWxlbWVudC53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9ICovXG4gICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9ICovXG4gICAgdGhpcy5maXJlSW5PYl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaW5WaWV3cG9ydF8gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IUFycmF5PCFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5Pn0gKi9cbiAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzXyA9IFtdO1xuXG4gICAgLyoqIEBwcml2YXRlIHtudW1iZXJ8c3RyaW5nfSAqL1xuICAgIHRoaXMuZmx1c2hUaW1lb3V0XyA9IDA7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtmdW5jdGlvbigpfSAqL1xuICAgIHRoaXMuYm91bmRGbHVzaF8gPSB0aGlzLmZsdXNoXy5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogQW4gb2JqZWN0IHdoaWNoIGhhbmRsZXMgdHJhY2tpbmcgc3Vic2NyaWJlcnMgdG8gdGhlXG4gICAgICogaW50ZXJzZWN0aW9uIHVwZGF0ZXMgZm9yIHRoaXMgZWxlbWVudC5cbiAgICAgKiBUcmlnZ2VyZWQgYnkgY29udGV4dC5vYnNlcnZlSW50ZXJzZWN0aW9uKOKApikgaW5zaWRlIHRoZSBhZC9pZnJhbWVcbiAgICAgKiBvciBieSBkaXJlY3RseSBwb3N0aW5nIGEgc2VuZC1pbnRlcnNlY3Rpb25zIG1lc3NhZ2UuXG4gICAgICogQHByaXZhdGUgeyFTdWJzY3JpcHRpb25BcGl9XG4gICAgICovXG4gICAgdGhpcy5wb3N0TWVzc2FnZUFwaV8gPSBuZXcgU3Vic2NyaXB0aW9uQXBpKFxuICAgICAgYWRJZnJhbWUsXG4gICAgICBNZXNzYWdlVHlwZS5TRU5EX0lOVEVSU0VDVElPTlMsXG4gICAgICB0cnVlLCAvLyBpczNwXG4gICAgICAvLyBFYWNoIHRpbWUgc29tZW9uZSBzdWJzY3JpYmVzIHdlIG1ha2Ugc3VyZSB0aGF0IHRoZXlcbiAgICAgIC8vIGdldCBhbiB1cGRhdGUuXG4gICAgICAoKSA9PiB0aGlzLnN0YXJ0U2VuZGluZ0ludGVyc2VjdGlvbkNoYW5nZXNfKClcbiAgICApO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RnVuY3Rpb259ICovXG4gICAgdGhpcy51bmxpc3RlblZpZXdwb3J0Q2hhbmdlc18gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpcmVzIGVsZW1lbnQgaW50ZXJzZWN0aW9uXG4gICAqL1xuICBmaXJlKCkge1xuICAgIGlmICghdGhpcy5maXJlSW5PYl8pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maXJlSW5PYl8udW5vYnNlcnZlKHRoaXMuYmFzZUVsZW1lbnRfLmVsZW1lbnQpO1xuICAgIHRoaXMuZmlyZUluT2JfLm9ic2VydmUodGhpcy5iYXNlRWxlbWVudF8uZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgd2UgbmVlZCB0byB1bmxpc3RlbiB3aGVuIG1vdmluZyBvdXQgb2Ygdmlld3BvcnQsXG4gICAqIHVubGlzdGVuIGFuZCByZXNldCB1bmxpc3RlblZpZXdwb3J0Q2hhbmdlc18uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB1bmxpc3Rlbk9uT3V0Vmlld3BvcnRfKCkge1xuICAgIGlmICh0aGlzLnVubGlzdGVuVmlld3BvcnRDaGFuZ2VzXykge1xuICAgICAgdGhpcy51bmxpc3RlblZpZXdwb3J0Q2hhbmdlc18oKTtcbiAgICAgIHRoaXMudW5saXN0ZW5WaWV3cG9ydENoYW5nZXNfID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCB2aWEgcG9zdE1lc3NhZ2UgZnJvbSB0aGUgY2hpbGQgaWZyYW1lIHdoZW4gdGhlIGFkL2lmcmFtZSBzdGFydHNcbiAgICogb2JzZXJ2aW5nIGl0cyBwb3NpdGlvbiBpbiB0aGUgdmlld3BvcnQuXG4gICAqIFNldHMgYSBmbGFnLCBtZWFzdXJlcyB0aGUgaWZyYW1lIHBvc2l0aW9uIGlmIG5lY2Vzc2FyeSBhbmQgc2VuZHNcbiAgICogb25lIGNoYW5nZSByZWNvcmQgdG8gdGhlIGlmcmFtZS5cbiAgICogTm90ZSB0aGF0IHRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgbW9yZSB0aGFuIG9uY2UgaWYgYSBzaW5nbGUgYWRcbiAgICogaGFzIG11bHRpcGxlIHBhcnRpZXMgaW50ZXJlc3RlZCBpbiB2aWV3YWJpbGl0eSBkYXRhLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhcnRTZW5kaW5nSW50ZXJzZWN0aW9uQ2hhbmdlc18oKSB7XG4gICAgaWYgKCF0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyXykge1xuICAgICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8gPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICAgICAgY29uc3QgbGFzdEVudHJ5ID0gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLm9uVmlld3BvcnRDYWxsYmFja18obGFzdEVudHJ5KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8ub2JzZXJ2ZSh0aGlzLmJhc2VFbGVtZW50Xy5lbGVtZW50KTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmZpcmVJbk9iXykge1xuICAgICAgdGhpcy5maXJlSW5PYl8gPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICAgICAgY29uc3QgbGFzdEVudHJ5ID0gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLnNlbmRFbGVtZW50SW50ZXJzZWN0aW9uXyhsYXN0RW50cnkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZmlyZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJlZCB3aGVuIHRoZSBhZCBlaXRoZXIgZW50ZXJzIG9yIGV4aXRzIHRoZSB2aXNpYmxlIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0geyFJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSBlbnRyeSBoYW5kZWQgb3ZlciBieSB0aGUgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIuXG4gICAqL1xuICBvblZpZXdwb3J0Q2FsbGJhY2tfKGVudHJ5KSB7XG4gICAgY29uc3QgaW5WaWV3cG9ydCA9IGVudHJ5LmludGVyc2VjdGlvblJhdGlvICE9IDA7XG4gICAgaWYgKHRoaXMuaW5WaWV3cG9ydF8gPT0gaW5WaWV3cG9ydCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmluVmlld3BvcnRfID0gaW5WaWV3cG9ydDtcblxuICAgIC8vIExldHMgdGhlIGFkIGtub3cgdGhhdCBpdCBiZWNhbWUgdmlzaWJsZSBvciBubyBsb25nZXIgaXMuXG4gICAgdGhpcy5zZW5kRWxlbWVudEludGVyc2VjdGlvbl8oZW50cnkpO1xuXG4gICAgLy8gQW5kIHVwZGF0ZSB0aGUgYWQgYWJvdXQgaXRzIHBvc2l0aW9uIGluIHRoZSB2aWV3cG9ydCB3aGlsZVxuICAgIC8vIGl0IGlzIHZpc2libGUuXG4gICAgaWYgKGluVmlld3BvcnQpIHtcbiAgICAgIGNvbnN0IHNlbmQgPSB0aGlzLmZpcmUuYmluZCh0aGlzKTtcbiAgICAgIC8vIFNjcm9sbCBldmVudHMuXG4gICAgICBjb25zdCB1bmxpc3RlblNjcm9sbCA9IHRoaXMuYmFzZUVsZW1lbnRfLmdldFZpZXdwb3J0KCkub25TY3JvbGwoc2VuZCk7XG4gICAgICAvLyBUaHJvdHRsZWQgc2Nyb2xsIGV2ZW50cy4gQWxzbyBmaXJlcyBmb3IgcmVzaXplIGV2ZW50cy5cbiAgICAgIGNvbnN0IHVubGlzdGVuQ2hhbmdlZCA9IHRoaXMuYmFzZUVsZW1lbnRfLmdldFZpZXdwb3J0KCkub25DaGFuZ2VkKHNlbmQpO1xuICAgICAgdGhpcy51bmxpc3RlblZpZXdwb3J0Q2hhbmdlc18gPSAoKSA9PiB7XG4gICAgICAgIHVubGlzdGVuU2Nyb2xsKCk7XG4gICAgICAgIHVubGlzdGVuQ2hhbmdlZCgpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51bmxpc3Rlbk9uT3V0Vmlld3BvcnRfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzICdpbnRlcnNlY3Rpb24nIG1lc3NhZ2UgdG8gYWQvaWZyYW1lIHdpdGggaW50ZXJzZWN0aW9uIGNoYW5nZSByZWNvcmRzXG4gICAqIGlmIHRoaXMgaGFzIGJlZW4gYWN0aXZhdGVkIGFuZCB3ZSBtZWFzdXJlZCB0aGUgbGF5b3V0IGJveCBvZiB0aGUgaWZyYW1lXG4gICAqIGF0IGxlYXN0IG9uY2UuXG4gICAqIEBwYXJhbSB7IUludGVyc2VjdGlvbk9ic2VydmVyRW50cnl9IGVudHJ5IC0gaGFuZGVkIG92ZXIgYnkgdGhlIEludGVyc2VjdGlvbk9ic2VydmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2VuZEVsZW1lbnRJbnRlcnNlY3Rpb25fKGVudHJ5KSB7XG4gICAgY29uc3QgY2hhbmdlID0gaW50ZXJzZWN0aW9uRW50cnlUb0pzb24oZW50cnkpO1xuICAgIC8vIHJvb3RCb3VuZHMgaXMgYWx3YXlzIG51bGwgaW4gM3AgaWZyYW1lIChlLmcuIFZpZXdlcikuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93M2MvSW50ZXJzZWN0aW9uT2JzZXJ2ZXIvaXNzdWVzLzc5XG4gICAgLy9cbiAgICAvLyBTaW5jZSBiZWZvcmUgdXNpbmcgYSByZWFsIEluT2Igd2UgdXNlZCB0byBwcm92aWRlIHJvb3RCb3VuZHMsXG4gICAgLy8gd2UgYXJlIHRlbXBvcmFyaWx5IGNvbnRpbnVpbmcgdG8gZG8gc28gbm93LlxuICAgIC8vIFRPRE86IGRldGVybWluZSBpZiBjb25zdW1lcnMgcmVseSBvbiB0aGlzIGZ1bmN0aW9uYWxpdHkgYW5kIHJlbW92ZSBpZiBub3QuXG4gICAgaWYgKGNoYW5nZS5yb290Qm91bmRzID09PSBudWxsKSB7XG4gICAgICBjaGFuZ2Uucm9vdEJvdW5kcyA9IHRoaXMuYmFzZUVsZW1lbnRfLmdldFZpZXdwb3J0KCkuZ2V0UmVjdCgpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXNfLmxlbmd0aCA+IDAgJiZcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXNfW3RoaXMucGVuZGluZ0NoYW5nZXNfLmxlbmd0aCAtIDFdLnRpbWUgPT0gY2hhbmdlLnRpbWVcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wZW5kaW5nQ2hhbmdlc18ucHVzaChjaGFuZ2UpO1xuICAgIGlmICghdGhpcy5mbHVzaFRpbWVvdXRfKSB7XG4gICAgICAvLyBTZW5kIG9uZSBpbW1lZGlhdGVseSwg4oCmXG4gICAgICB0aGlzLmZsdXNoXygpO1xuICAgICAgLy8gYnV0IG9ubHkgc2VuZCBhIG1heGltdW0gb2YgMTAgcG9zdE1lc3NhZ2VzIHBlciBzZWNvbmQuXG4gICAgICB0aGlzLmZsdXNoVGltZW91dF8gPSB0aGlzLnRpbWVyXy5kZWxheSh0aGlzLmJvdW5kRmx1c2hfLCAxMDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZmx1c2hfKCkge1xuICAgIHRoaXMuZmx1c2hUaW1lb3V0XyA9IDA7XG4gICAgaWYgKCF0aGlzLnBlbmRpbmdDaGFuZ2VzXy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gTm90ZSB0aGF0IFN1YnNjcmliZUFwaSBtdWx0aWNhc3RzIHRoZSB1cGRhdGUgdG8gYWxsIGludGVyZXN0ZWQgd2luZG93cy5cbiAgICB0aGlzLnBvc3RNZXNzYWdlQXBpXy5zZW5kKFxuICAgICAgTWVzc2FnZVR5cGUuSU5URVJTRUNUSU9OLFxuICAgICAgZGljdCh7XG4gICAgICAgICdjaGFuZ2VzJzogdGhpcy5wZW5kaW5nQ2hhbmdlc18sXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5wZW5kaW5nQ2hhbmdlc18ubGVuZ3RoID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm92aWRlIGEgZnVuY3Rpb24gdG8gY2xlYXIgdGltZW91dCBiZWZvcmUgc2V0IHRoaXMgaW50ZXJzZWN0aW9uIHRvIG51bGwuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyXykge1xuICAgICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8uZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5maXJlSW5PYl8pIHtcbiAgICAgIHRoaXMuZmlyZUluT2JfLmRpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMuZmlyZUluT2JfID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy50aW1lcl8uY2FuY2VsKHRoaXMuZmx1c2hUaW1lb3V0Xyk7XG4gICAgdGhpcy51bmxpc3Rlbk9uT3V0Vmlld3BvcnRfKCk7XG4gICAgdGhpcy5wb3N0TWVzc2FnZUFwaV8uZGVzdHJveSgpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-ad/0.1/legacy-ad-intersection-observer-host.js