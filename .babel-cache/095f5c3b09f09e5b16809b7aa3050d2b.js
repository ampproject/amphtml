function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import { devAssert, devAssertElement } from "../core/assert";
import { Deferred } from "../core/data-structures/promise";
import { removeNoScriptElements } from "./dom-writer";

/**
 * @param {!Function} cb
 * @return {!Promise}
 */
var DEFAULT_TRANSFER_THROTTLE_FUNC = function DEFAULT_TRANSFER_THROTTLE_FUNC(cb) {
  return Promise.resolve(cb());
};

export var DomTransformStream = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {(function(!Function):!Promise)=} opt_transferThrottleFunc
   */
  function DomTransformStream(win, opt_transferThrottleFunc) {
    _classCallCheck(this, DomTransformStream);

    var headDefer = new Deferred();

    /**
     * Resolves when head has been written to in memory document.
     * @const @private {!Promise<!Element>}
     */
    this.headPromise_ = headDefer.promise;

    /** @const @private {!function(!Element)} */
    this.headResolver_ = headDefer.resolve;
    var transferDefer = new Deferred();

    /**
     * Resovles when complete doc has been transfered to the target
     * body.
     * @const @private {!Promise}
     */
    this.bodyTransferPromise_ = transferDefer.promise;

    /** @const @private {!function(!Promise)} */
    this.bodyTransferResolver_ = transferDefer.resolve;

    /** @private {?Element} */
    this.detachedBody_ = null;
    var targetBodyDefer = new Deferred();

    /**
     * Resolves when target body is ready to receive elements.
     * @private {!Promise<!Element>}
     */
    this.targetBodyPromise_ = targetBodyDefer.promise;

    /** @const @private {!function(!Element)} */
    this.targetBodyResolver_ = targetBodyDefer.resolve;

    /** @private {?Promise} */
    this.currentChunkTransferPromise_ = null;

    /** @private {boolean} */
    this.shouldTransfer_ = false;

    /** @private @const */
    this.transferThrottle_ = opt_transferThrottleFunc || DEFAULT_TRANSFER_THROTTLE_FUNC;
  }

  /**
   * Callback passed into DetachedDomStream constructor. Receives updated
   * document everytime a new chunk is written.
   * Resolves headPromise when body is available, and streams to body iff
   * bodyTransfer() has been called.
   * @param {!Document} detachedDoc
   */
  _createClass(DomTransformStream, [{
    key: "onChunk",
    value: function onChunk(detachedDoc) {
      // <body> is newly formed.
      if (!this.detachedBody_ && detachedDoc.body) {
        this.detachedBody_ = detachedDoc.body;
        this.headResolver_(devAssertElement(detachedDoc.head));
      }

      // If bodyTransfer has already been called, keep transferring on new chunks.
      if (this.shouldTransfer_) {
        this.transferBodyChunk_();
      }
    }
    /**
     * Callback passed into DetachedDomStream constructor. Called with complete
     * doc when stream is closed.
     * Schedules final transfer, then resovles body complete promise.
     * @param {!Document} unusedCompleteDoc
     */

  }, {
    key: "onEnd",
    value: function onEnd(unusedCompleteDoc) {
      this.bodyTransferResolver_(this.transferBodyChunk_());
    }
    /**
     * Promise that will resolve with <head> when available.
     * @return {!Promise<!Element>}
     */

  }, {
    key: "waitForHead",
    value: function waitForHead() {
      return this.headPromise_;
    }
    /**
     * Start the body transfer process. Should only be called once.
     * @param {!Element} targetBody body element to be appended to.
     * @return {!Promise} resolves when doc has been fully transferred.
     */

  }, {
    key: "transferBody",
    value: function transferBody(targetBody) {
      var _this = this;

      devAssertElement(targetBody, 'No target body given to DomTransformStream.transferBody');
      devAssert(!this.shouldTransfer_, 'DomTransformStream.transferBody should only be called once');
      this.shouldTransfer_ = true;
      this.targetBodyResolver_(targetBody);
      this.headPromise_.then(function () {
        var attrs = _this.detachedBody_.attributes;

        for (var i = 0; i < attrs.length; i++) {
          var _attrs$i = attrs[i],
              name = _attrs$i.name,
              value = _attrs$i.value;
          targetBody.setAttribute(name, value);
        }
      });
      this.transferBodyChunk_();
      return this.bodyTransferPromise_;
    }
    /**
     * Transfers available body elements in vsync cycle.
     * @return {!Promise}
     */

  }, {
    key: "transferBodyChunk_",
    value: function transferBodyChunk_() {
      var _this2 = this;

      if (this.currentChunkTransferPromise_) {
        return this.currentChunkTransferPromise_;
      }

      this.currentChunkTransferPromise_ = Promise.all([this.targetBodyPromise_, this.headPromise_]).then(function (resolvedElements) {
        var transferThrottle = _this2.transferThrottle_;
        return transferThrottle(function () {
          _this2.currentChunkTransferPromise_ = null;
          var targetBody = resolvedElements[0];
          removeNoScriptElements(devAssertElement(_this2.detachedBody_));

          while (_this2.detachedBody_.firstChild) {
            targetBody.appendChild(_this2.detachedBody_.firstChild);
          }
        });
      });
      return this.currentChunkTransferPromise_;
    }
  }]);

  return DomTransformStream;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS10cmFuZm9ybS1zdHJlYW0uanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwiZGV2QXNzZXJ0RWxlbWVudCIsIkRlZmVycmVkIiwicmVtb3ZlTm9TY3JpcHRFbGVtZW50cyIsIkRFRkFVTFRfVFJBTlNGRVJfVEhST1RUTEVfRlVOQyIsImNiIiwiUHJvbWlzZSIsInJlc29sdmUiLCJEb21UcmFuc2Zvcm1TdHJlYW0iLCJ3aW4iLCJvcHRfdHJhbnNmZXJUaHJvdHRsZUZ1bmMiLCJoZWFkRGVmZXIiLCJoZWFkUHJvbWlzZV8iLCJwcm9taXNlIiwiaGVhZFJlc29sdmVyXyIsInRyYW5zZmVyRGVmZXIiLCJib2R5VHJhbnNmZXJQcm9taXNlXyIsImJvZHlUcmFuc2ZlclJlc29sdmVyXyIsImRldGFjaGVkQm9keV8iLCJ0YXJnZXRCb2R5RGVmZXIiLCJ0YXJnZXRCb2R5UHJvbWlzZV8iLCJ0YXJnZXRCb2R5UmVzb2x2ZXJfIiwiY3VycmVudENodW5rVHJhbnNmZXJQcm9taXNlXyIsInNob3VsZFRyYW5zZmVyXyIsInRyYW5zZmVyVGhyb3R0bGVfIiwiZGV0YWNoZWREb2MiLCJib2R5IiwiaGVhZCIsInRyYW5zZmVyQm9keUNodW5rXyIsInVudXNlZENvbXBsZXRlRG9jIiwidGFyZ2V0Qm9keSIsInRoZW4iLCJhdHRycyIsImF0dHJpYnV0ZXMiLCJpIiwibGVuZ3RoIiwibmFtZSIsInZhbHVlIiwic2V0QXR0cmlidXRlIiwiYWxsIiwicmVzb2x2ZWRFbGVtZW50cyIsInRyYW5zZmVyVGhyb3R0bGUiLCJmaXJzdENoaWxkIiwiYXBwZW5kQ2hpbGQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVIsRUFBbUJDLGdCQUFuQjtBQUNBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxzQkFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFD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LEtBQWI7QUFDQVAsVUFBQUEsVUFBVSxDQUFDUSxZQUFYLENBQXdCRixJQUF4QixFQUE4QkMsS0FBOUI7QUFDRDtBQUNGLE9BTkQ7QUFRQSxXQUFLVCxrQkFBTDtBQUVBLGFBQU8sS0FBS1osb0JBQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTVIQTtBQUFBO0FBQUEsV0E2SEUsOEJBQXFCO0FBQUE7O0FBQ25CLFVBQUksS0FBS00sNEJBQVQsRUFBdUM7QUFDckMsZUFBTyxLQUFLQSw0QkFBWjtBQUNEOztBQUVELFdBQUtBLDRCQUFMLEdBQW9DaEIsT0FBTyxDQUFDaUMsR0FBUixDQUFZLENBQzlDLEtBQUtuQixrQkFEeUMsRUFFOUMsS0FBS1IsWUFGeUMsQ0FBWixFQUdqQ21CLElBSGlDLENBRzVCLFVBQUNTLGdCQUFELEVBQXNCO0FBQzVCLFlBQU1DLGdCQUFnQixHQUFHLE1BQUksQ0FBQ2pCLGlCQUE5QjtBQUNBLGVBQU9pQixnQkFBZ0IsQ0FBQyxZQUFNO0FBQzVCLFVBQUEsTUFBSSxDQUFDbkIsNEJBQUwsR0FBb0MsSUFBcEM7QUFDQSxjQUFNUSxVQUFVLEdBQUdVLGdCQUFnQixDQUFDLENBQUQsQ0FBbkM7QUFDQXJDLFVBQUFBLHNCQUFzQixDQUFDRixnQkFBZ0IsQ0FBQyxNQUFJLENBQUNpQixhQUFOLENBQWpCLENBQXRCOztBQUNBLGlCQUFPLE1BQUksQ0FBQ0EsYUFBTCxDQUFtQndCLFVBQTFCLEVBQXNDO0FBQ3BDWixZQUFBQSxVQUFVLENBQUNhLFdBQVgsQ0FBdUIsTUFBSSxDQUFDekIsYUFBTCxDQUFtQndCLFVBQTFDO0FBQ0Q7QUFDRixTQVBzQixDQUF2QjtBQVFELE9BYm1DLENBQXBDO0FBZUEsYUFBTyxLQUFLcEIsNEJBQVo7QUFDRDtBQWxKSDs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7ZGV2QXNzZXJ0LCBkZXZBc3NlcnRFbGVtZW50fSBmcm9tICcjY29yZS9hc3NlcnQnO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuXG5pbXBvcnQge3JlbW92ZU5vU2NyaXB0RWxlbWVudHN9IGZyb20gJy4vZG9tLXdyaXRlcic7XG5cbi8qKlxuICogQHBhcmFtIHshRnVuY3Rpb259IGNiXG4gKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAqL1xuY29uc3QgREVGQVVMVF9UUkFOU0ZFUl9USFJPVFRMRV9GVU5DID0gKGNiKSA9PiBQcm9taXNlLnJlc29sdmUoY2IoKSk7XG5cbmV4cG9ydCBjbGFzcyBEb21UcmFuc2Zvcm1TdHJlYW0ge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHsoZnVuY3Rpb24oIUZ1bmN0aW9uKTohUHJvbWlzZSk9fSBvcHRfdHJhbnNmZXJUaHJvdHRsZUZ1bmNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgb3B0X3RyYW5zZmVyVGhyb3R0bGVGdW5jKSB7XG4gICAgY29uc3QgaGVhZERlZmVyID0gbmV3IERlZmVycmVkKCk7XG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgd2hlbiBoZWFkIGhhcyBiZWVuIHdyaXR0ZW4gdG8gaW4gbWVtb3J5IGRvY3VtZW50LlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7IVByb21pc2U8IUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMuaGVhZFByb21pc2VfID0gaGVhZERlZmVyLnByb21pc2U7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshZnVuY3Rpb24oIUVsZW1lbnQpfSAqL1xuICAgIHRoaXMuaGVhZFJlc29sdmVyXyA9IGhlYWREZWZlci5yZXNvbHZlO1xuXG4gICAgY29uc3QgdHJhbnNmZXJEZWZlciA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIC8qKlxuICAgICAqIFJlc292bGVzIHdoZW4gY29tcGxldGUgZG9jIGhhcyBiZWVuIHRyYW5zZmVyZWQgdG8gdGhlIHRhcmdldFxuICAgICAqIGJvZHkuXG4gICAgICogQGNvbnN0IEBwcml2YXRlIHshUHJvbWlzZX1cbiAgICAgKi9cbiAgICB0aGlzLmJvZHlUcmFuc2ZlclByb21pc2VfID0gdHJhbnNmZXJEZWZlci5wcm9taXNlO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IWZ1bmN0aW9uKCFQcm9taXNlKX0gKi9cbiAgICB0aGlzLmJvZHlUcmFuc2ZlclJlc29sdmVyXyA9IHRyYW5zZmVyRGVmZXIucmVzb2x2ZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5kZXRhY2hlZEJvZHlfID0gbnVsbDtcblxuICAgIGNvbnN0IHRhcmdldEJvZHlEZWZlciA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIHdoZW4gdGFyZ2V0IGJvZHkgaXMgcmVhZHkgdG8gcmVjZWl2ZSBlbGVtZW50cy5cbiAgICAgKiBAcHJpdmF0ZSB7IVByb21pc2U8IUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMudGFyZ2V0Qm9keVByb21pc2VfID0gdGFyZ2V0Qm9keURlZmVyLnByb21pc2U7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshZnVuY3Rpb24oIUVsZW1lbnQpfSAqL1xuICAgIHRoaXMudGFyZ2V0Qm9keVJlc29sdmVyXyA9IHRhcmdldEJvZHlEZWZlci5yZXNvbHZlO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UHJvbWlzZX0gKi9cbiAgICB0aGlzLmN1cnJlbnRDaHVua1RyYW5zZmVyUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuc2hvdWxkVHJhbnNmZXJfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy50cmFuc2ZlclRocm90dGxlXyA9XG4gICAgICBvcHRfdHJhbnNmZXJUaHJvdHRsZUZ1bmMgfHwgREVGQVVMVF9UUkFOU0ZFUl9USFJPVFRMRV9GVU5DO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIHBhc3NlZCBpbnRvIERldGFjaGVkRG9tU3RyZWFtIGNvbnN0cnVjdG9yLiBSZWNlaXZlcyB1cGRhdGVkXG4gICAqIGRvY3VtZW50IGV2ZXJ5dGltZSBhIG5ldyBjaHVuayBpcyB3cml0dGVuLlxuICAgKiBSZXNvbHZlcyBoZWFkUHJvbWlzZSB3aGVuIGJvZHkgaXMgYXZhaWxhYmxlLCBhbmQgc3RyZWFtcyB0byBib2R5IGlmZlxuICAgKiBib2R5VHJhbnNmZXIoKSBoYXMgYmVlbiBjYWxsZWQuXG4gICAqIEBwYXJhbSB7IURvY3VtZW50fSBkZXRhY2hlZERvY1xuICAgKi9cbiAgb25DaHVuayhkZXRhY2hlZERvYykge1xuICAgIC8vIDxib2R5PiBpcyBuZXdseSBmb3JtZWQuXG4gICAgaWYgKCF0aGlzLmRldGFjaGVkQm9keV8gJiYgZGV0YWNoZWREb2MuYm9keSkge1xuICAgICAgdGhpcy5kZXRhY2hlZEJvZHlfID0gZGV0YWNoZWREb2MuYm9keTtcbiAgICAgIHRoaXMuaGVhZFJlc29sdmVyXyhkZXZBc3NlcnRFbGVtZW50KGRldGFjaGVkRG9jLmhlYWQpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBib2R5VHJhbnNmZXIgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQsIGtlZXAgdHJhbnNmZXJyaW5nIG9uIG5ldyBjaHVua3MuXG4gICAgaWYgKHRoaXMuc2hvdWxkVHJhbnNmZXJfKSB7XG4gICAgICB0aGlzLnRyYW5zZmVyQm9keUNodW5rXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBwYXNzZWQgaW50byBEZXRhY2hlZERvbVN0cmVhbSBjb25zdHJ1Y3Rvci4gQ2FsbGVkIHdpdGggY29tcGxldGVcbiAgICogZG9jIHdoZW4gc3RyZWFtIGlzIGNsb3NlZC5cbiAgICogU2NoZWR1bGVzIGZpbmFsIHRyYW5zZmVyLCB0aGVuIHJlc292bGVzIGJvZHkgY29tcGxldGUgcHJvbWlzZS5cbiAgICogQHBhcmFtIHshRG9jdW1lbnR9IHVudXNlZENvbXBsZXRlRG9jXG4gICAqL1xuICBvbkVuZCh1bnVzZWRDb21wbGV0ZURvYykge1xuICAgIHRoaXMuYm9keVRyYW5zZmVyUmVzb2x2ZXJfKHRoaXMudHJhbnNmZXJCb2R5Q2h1bmtfKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2l0aCA8aGVhZD4gd2hlbiBhdmFpbGFibGUuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFFbGVtZW50Pn1cbiAgICovXG4gIHdhaXRGb3JIZWFkKCkge1xuICAgIHJldHVybiB0aGlzLmhlYWRQcm9taXNlXztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgYm9keSB0cmFuc2ZlciBwcm9jZXNzLiBTaG91bGQgb25seSBiZSBjYWxsZWQgb25jZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0Qm9keSBib2R5IGVsZW1lbnQgdG8gYmUgYXBwZW5kZWQgdG8uXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSByZXNvbHZlcyB3aGVuIGRvYyBoYXMgYmVlbiBmdWxseSB0cmFuc2ZlcnJlZC5cbiAgICovXG4gIHRyYW5zZmVyQm9keSh0YXJnZXRCb2R5KSB7XG4gICAgZGV2QXNzZXJ0RWxlbWVudChcbiAgICAgIHRhcmdldEJvZHksXG4gICAgICAnTm8gdGFyZ2V0IGJvZHkgZ2l2ZW4gdG8gRG9tVHJhbnNmb3JtU3RyZWFtLnRyYW5zZmVyQm9keSdcbiAgICApO1xuXG4gICAgZGV2QXNzZXJ0KFxuICAgICAgIXRoaXMuc2hvdWxkVHJhbnNmZXJfLFxuICAgICAgJ0RvbVRyYW5zZm9ybVN0cmVhbS50cmFuc2ZlckJvZHkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uY2UnXG4gICAgKTtcblxuICAgIHRoaXMuc2hvdWxkVHJhbnNmZXJfID0gdHJ1ZTtcbiAgICB0aGlzLnRhcmdldEJvZHlSZXNvbHZlcl8odGFyZ2V0Qm9keSk7XG5cbiAgICB0aGlzLmhlYWRQcm9taXNlXy50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IGF0dHJzID0gdGhpcy5kZXRhY2hlZEJvZHlfLmF0dHJpYnV0ZXM7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHtuYW1lLCB2YWx1ZX0gPSBhdHRyc1tpXTtcbiAgICAgICAgdGFyZ2V0Qm9keS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy50cmFuc2ZlckJvZHlDaHVua18oKTtcblxuICAgIHJldHVybiB0aGlzLmJvZHlUcmFuc2ZlclByb21pc2VfO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZmVycyBhdmFpbGFibGUgYm9keSBlbGVtZW50cyBpbiB2c3luYyBjeWNsZS5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICB0cmFuc2ZlckJvZHlDaHVua18oKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudENodW5rVHJhbnNmZXJQcm9taXNlXykge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudENodW5rVHJhbnNmZXJQcm9taXNlXztcbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnRDaHVua1RyYW5zZmVyUHJvbWlzZV8gPSBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLnRhcmdldEJvZHlQcm9taXNlXyxcbiAgICAgIHRoaXMuaGVhZFByb21pc2VfLFxuICAgIF0pLnRoZW4oKHJlc29sdmVkRWxlbWVudHMpID0+IHtcbiAgICAgIGNvbnN0IHRyYW5zZmVyVGhyb3R0bGUgPSB0aGlzLnRyYW5zZmVyVGhyb3R0bGVfO1xuICAgICAgcmV0dXJuIHRyYW5zZmVyVGhyb3R0bGUoKCkgPT4ge1xuICAgICAgICB0aGlzLmN1cnJlbnRDaHVua1RyYW5zZmVyUHJvbWlzZV8gPSBudWxsO1xuICAgICAgICBjb25zdCB0YXJnZXRCb2R5ID0gcmVzb2x2ZWRFbGVtZW50c1swXTtcbiAgICAgICAgcmVtb3ZlTm9TY3JpcHRFbGVtZW50cyhkZXZBc3NlcnRFbGVtZW50KHRoaXMuZGV0YWNoZWRCb2R5XykpO1xuICAgICAgICB3aGlsZSAodGhpcy5kZXRhY2hlZEJvZHlfLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICB0YXJnZXRCb2R5LmFwcGVuZENoaWxkKHRoaXMuZGV0YWNoZWRCb2R5Xy5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5jdXJyZW50Q2h1bmtUcmFuc2ZlclByb21pc2VfO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/utils/dom-tranform-stream.js