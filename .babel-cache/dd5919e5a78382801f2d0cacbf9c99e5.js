function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { MessageType } from "../../../src/3p-frame-messaging";
import { SubscriptionApi } from "../../../src/iframe-helper";
import { dev, devAssert } from "../../../src/log";

/** @private @const {string} */
var TAG_ = 'amp-analytics/iframe-transport-message-queue';

/** @private @const {number} */
var MAX_QUEUE_SIZE_ = 100;

/**
 * @visibleForTesting
 */
export var IframeTransportMessageQueue = /*#__PURE__*/function () {
  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   * messages to
   */
  function IframeTransportMessageQueue(win, frame) {
    var _this = this;

    _classCallCheck(this, IframeTransportMessageQueue);

    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;

    /** @private {boolean} */
    this.isReady_ = false;

    /**
     * @private
     * {!Array<!../../../src/3p-frame-messaging.IframeTransportEvent>}
     */
    this.pendingEvents_ = [];

    /** @private {!../../../src/iframe-helper.SubscriptionApi} */
    this.postMessageApi_ = new SubscriptionApi(this.frame_, MessageType.SEND_IFRAME_TRANSPORT_EVENTS, true, function () {
      _this.setIsReady();
    });
  }

  /**
   * Returns whether the queue has been marked as ready yet
   * @return {boolean}
   * @visibleForTesting
   */
  _createClass(IframeTransportMessageQueue, [{
    key: "isReady",
    value: function isReady() {
      return this.isReady_;
    }
    /**
     * Indicate that a cross-domain frame is ready to receive messages, and
     * send all messages that were previously queued for it.
     * @visibleForTesting
     */

  }, {
    key: "setIsReady",
    value: function setIsReady() {
      this.isReady_ = true;
      this.flushQueue_();
    }
    /**
     * Returns how many creativeId -> message(s) mappings there are
     * @return {number}
     * @visibleForTesting
     */

  }, {
    key: "queueSize",
    value: function queueSize() {
      return this.pendingEvents_.length;
    }
    /**
     * Enqueues an event to be sent to a cross-domain iframe.
     * @param {!../../../src/3p-frame-messaging.IframeTransportEvent} event
     * Identifies the event and which Transport instance (essentially which
     * creative) is sending it.
     */

  }, {
    key: "enqueue",
    value: function enqueue(event) {
      devAssert(event && event.creativeId && event.message, 'Attempted to enqueue malformed message for: ' + event.creativeId);
      this.pendingEvents_.push(event);

      if (this.queueSize() >= MAX_QUEUE_SIZE_) {
        dev().warn(TAG_, 'Exceeded maximum size of queue for: ' + event.creativeId);
        this.pendingEvents_.shift();
      }

      this.flushQueue_();
    }
    /**
     * Send queued data (if there is any) to a cross-domain iframe
     * @private
     */

  }, {
    key: "flushQueue_",
    value: function flushQueue_() {
      if (this.isReady() && this.queueSize()) {
        this.postMessageApi_.send(MessageType.IFRAME_TRANSPORT_EVENTS,
        /** @type {!JsonObject} */
        {
          events: this.pendingEvents_
        });
        this.pendingEvents_ = [];
      }
    }
  }]);

  return IframeTransportMessageQueue;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlmcmFtZS10cmFuc3BvcnQtbWVzc2FnZS1xdWV1ZS5qcyJdLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIlN1YnNjcmlwdGlvbkFwaSIsImRldiIsImRldkFzc2VydCIsIlRBR18iLCJNQVhfUVVFVUVfU0laRV8iLCJJZnJhbWVUcmFuc3BvcnRNZXNzYWdlUXVldWUiLCJ3aW4iLCJmcmFtZSIsImZyYW1lXyIsImlzUmVhZHlfIiwicGVuZGluZ0V2ZW50c18iLCJwb3N0TWVzc2FnZUFwaV8iLCJTRU5EX0lGUkFNRV9UUkFOU1BPUlRfRVZFTlRTIiwic2V0SXNSZWFkeSIsImZsdXNoUXVldWVfIiwibGVuZ3RoIiwiZXZlbnQiLCJjcmVhdGl2ZUlkIiwibWVzc2FnZSIsInB1c2giLCJxdWV1ZVNpemUiLCJ3YXJuIiwic2hpZnQiLCJpc1JlYWR5Iiwic2VuZCIsIklGUkFNRV9UUkFOU1BPUlRfRVZFTlRTIiwiZXZlbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxXQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjs7QUFFQTtBQUNBLElBQU1DLElBQUksR0FBRyw4Q0FBYjs7QUFFQTtBQUNBLElBQU1DLGVBQWUsR0FBRyxHQUF4Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQywyQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLHVDQUFZQyxHQUFaLEVBQWlCQyxLQUFqQixFQUF3QjtBQUFBOztBQUFBOztBQUN0QjtBQUNBLFNBQUtDLE1BQUwsR0FBY0QsS0FBZDs7QUFFQTtBQUNBLFNBQUtFLFFBQUwsR0FBZ0IsS0FBaEI7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxTQUFLQyxjQUFMLEdBQXNCLEVBQXRCOztBQUVBO0FBQ0EsU0FBS0MsZUFBTCxHQUF1QixJQUFJWCxlQUFKLENBQ3JCLEtBQUtRLE1BRGdCLEVBRXJCVCxXQUFXLENBQUNhLDRCQUZTLEVBR3JCLElBSHFCLEVBSXJCLFlBQU07QUFDSixNQUFBLEtBQUksQ0FBQ0MsVUFBTDtBQUNELEtBTm9CLENBQXZCO0FBUUQ7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQW5DQTtBQUFBO0FBQUEsV0FvQ0UsbUJBQVU7QUFDUixhQUFPLEtBQUtKLFFBQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBNUNBO0FBQUE7QUFBQSxXQTZDRSxzQkFBYTtBQUNYLFdBQUtBLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxXQUFLSyxXQUFMO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXREQTtBQUFBO0FBQUEsV0F1REUscUJBQVk7QUFDVixhQUFPLEtBQUtKLGNBQUwsQ0FBb0JLLE1BQTNCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaEVBO0FBQUE7QUFBQSxXQWlFRSxpQkFBUUMsS0FBUixFQUFlO0FBQ2JkLE1BQUFBLFNBQVMsQ0FDUGMsS0FBSyxJQUFJQSxLQUFLLENBQUNDLFVBQWYsSUFBNkJELEtBQUssQ0FBQ0UsT0FENUIsRUFFUCxpREFBaURGLEtBQUssQ0FBQ0MsVUFGaEQsQ0FBVDtBQUlBLFdBQUtQLGNBQUwsQ0FBb0JTLElBQXBCLENBQXlCSCxLQUF6Qjs7QUFDQSxVQUFJLEtBQUtJLFNBQUwsTUFBb0JoQixlQUF4QixFQUF5QztBQUN2Q0gsUUFBQUEsR0FBRyxHQUFHb0IsSUFBTixDQUNFbEIsSUFERixFQUVFLHlDQUF5Q2EsS0FBSyxDQUFDQyxVQUZqRDtBQUlBLGFBQUtQLGNBQUwsQ0FBb0JZLEtBQXBCO0FBQ0Q7O0FBQ0QsV0FBS1IsV0FBTDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBcEZBO0FBQUE7QUFBQSxXQXFGRSx1QkFBYztBQUNaLFVBQUksS0FBS1MsT0FBTCxNQUFrQixLQUFLSCxTQUFMLEVBQXRCLEVBQXdDO0FBQ3RDLGFBQUtULGVBQUwsQ0FBcUJhLElBQXJCLENBQ0V6QixXQUFXLENBQUMwQix1QkFEZDtBQUVFO0FBQ0M7QUFBQ0MsVUFBQUEsTUFBTSxFQUFFLEtBQUtoQjtBQUFkLFNBSEg7QUFLQSxhQUFLQSxjQUFMLEdBQXNCLEVBQXRCO0FBQ0Q7QUFDRjtBQTlGSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7TWVzc2FnZVR5cGV9IGZyb20gJy4uLy4uLy4uL3NyYy8zcC1mcmFtZS1tZXNzYWdpbmcnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25BcGl9IGZyb20gJy4uLy4uLy4uL3NyYy9pZnJhbWUtaGVscGVyJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBUQUdfID0gJ2FtcC1hbmFseXRpY3MvaWZyYW1lLXRyYW5zcG9ydC1tZXNzYWdlLXF1ZXVlJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgTUFYX1FVRVVFX1NJWkVfID0gMTAwO1xuXG4vKipcbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgY2xhc3MgSWZyYW1lVHJhbnNwb3J0TWVzc2FnZVF1ZXVlIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7IVdpbmRvd30gd2luIFRoZSB3aW5kb3cgZWxlbWVudFxuICAgKiBAcGFyYW0geyFIVE1MSUZyYW1lRWxlbWVudH0gZnJhbWUgVGhlIGNyb3NzLWRvbWFpbiBpZnJhbWUgdG8gc2VuZFxuICAgKiBtZXNzYWdlcyB0b1xuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBmcmFtZSkge1xuICAgIC8qKiBAcHJpdmF0ZSB7IUhUTUxJRnJhbWVFbGVtZW50fSAqL1xuICAgIHRoaXMuZnJhbWVfID0gZnJhbWU7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1JlYWR5XyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiB7IUFycmF5PCEuLi8uLi8uLi9zcmMvM3AtZnJhbWUtbWVzc2FnaW5nLklmcmFtZVRyYW5zcG9ydEV2ZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLnBlbmRpbmdFdmVudHNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvaWZyYW1lLWhlbHBlci5TdWJzY3JpcHRpb25BcGl9ICovXG4gICAgdGhpcy5wb3N0TWVzc2FnZUFwaV8gPSBuZXcgU3Vic2NyaXB0aW9uQXBpKFxuICAgICAgdGhpcy5mcmFtZV8sXG4gICAgICBNZXNzYWdlVHlwZS5TRU5EX0lGUkFNRV9UUkFOU1BPUlRfRVZFTlRTLFxuICAgICAgdHJ1ZSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRJc1JlYWR5KCk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHF1ZXVlIGhhcyBiZWVuIG1hcmtlZCBhcyByZWFkeSB5ZXRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBpc1JlYWR5KCkge1xuICAgIHJldHVybiB0aGlzLmlzUmVhZHlfO1xuICB9XG5cbiAgLyoqXG4gICAqIEluZGljYXRlIHRoYXQgYSBjcm9zcy1kb21haW4gZnJhbWUgaXMgcmVhZHkgdG8gcmVjZWl2ZSBtZXNzYWdlcywgYW5kXG4gICAqIHNlbmQgYWxsIG1lc3NhZ2VzIHRoYXQgd2VyZSBwcmV2aW91c2x5IHF1ZXVlZCBmb3IgaXQuXG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgc2V0SXNSZWFkeSgpIHtcbiAgICB0aGlzLmlzUmVhZHlfID0gdHJ1ZTtcbiAgICB0aGlzLmZsdXNoUXVldWVfKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBob3cgbWFueSBjcmVhdGl2ZUlkIC0+IG1lc3NhZ2UocykgbWFwcGluZ3MgdGhlcmUgYXJlXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQHZpc2libGVGb3JUZXN0aW5nXG4gICAqL1xuICBxdWV1ZVNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZ0V2ZW50c18ubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEVucXVldWVzIGFuIGV2ZW50IHRvIGJlIHNlbnQgdG8gYSBjcm9zcy1kb21haW4gaWZyYW1lLlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvM3AtZnJhbWUtbWVzc2FnaW5nLklmcmFtZVRyYW5zcG9ydEV2ZW50fSBldmVudFxuICAgKiBJZGVudGlmaWVzIHRoZSBldmVudCBhbmQgd2hpY2ggVHJhbnNwb3J0IGluc3RhbmNlIChlc3NlbnRpYWxseSB3aGljaFxuICAgKiBjcmVhdGl2ZSkgaXMgc2VuZGluZyBpdC5cbiAgICovXG4gIGVucXVldWUoZXZlbnQpIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICBldmVudCAmJiBldmVudC5jcmVhdGl2ZUlkICYmIGV2ZW50Lm1lc3NhZ2UsXG4gICAgICAnQXR0ZW1wdGVkIHRvIGVucXVldWUgbWFsZm9ybWVkIG1lc3NhZ2UgZm9yOiAnICsgZXZlbnQuY3JlYXRpdmVJZFxuICAgICk7XG4gICAgdGhpcy5wZW5kaW5nRXZlbnRzXy5wdXNoKGV2ZW50KTtcbiAgICBpZiAodGhpcy5xdWV1ZVNpemUoKSA+PSBNQVhfUVVFVUVfU0laRV8pIHtcbiAgICAgIGRldigpLndhcm4oXG4gICAgICAgIFRBR18sXG4gICAgICAgICdFeGNlZWRlZCBtYXhpbXVtIHNpemUgb2YgcXVldWUgZm9yOiAnICsgZXZlbnQuY3JlYXRpdmVJZFxuICAgICAgKTtcbiAgICAgIHRoaXMucGVuZGluZ0V2ZW50c18uc2hpZnQoKTtcbiAgICB9XG4gICAgdGhpcy5mbHVzaFF1ZXVlXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgcXVldWVkIGRhdGEgKGlmIHRoZXJlIGlzIGFueSkgdG8gYSBjcm9zcy1kb21haW4gaWZyYW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmbHVzaFF1ZXVlXygpIHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KCkgJiYgdGhpcy5xdWV1ZVNpemUoKSkge1xuICAgICAgdGhpcy5wb3N0TWVzc2FnZUFwaV8uc2VuZChcbiAgICAgICAgTWVzc2FnZVR5cGUuSUZSQU1FX1RSQU5TUE9SVF9FVkVOVFMsXG4gICAgICAgIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovXG4gICAgICAgICh7ZXZlbnRzOiB0aGlzLnBlbmRpbmdFdmVudHNffSlcbiAgICAgICk7XG4gICAgICB0aGlzLnBlbmRpbmdFdmVudHNfID0gW107XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/iframe-transport-message-queue.js