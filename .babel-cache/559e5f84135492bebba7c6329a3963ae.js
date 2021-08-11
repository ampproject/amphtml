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
import { VisibilityState } from "../core/constants/visibility-state";
import { containsNotSelf, hasNextNodeInDocumentOrder, isIframed } from "../core/dom";
import { LayoutPriority } from "../core/dom/layout";
import { removeItem } from "../core/types/array";
import { READY_SCAN_SIGNAL } from "./resources-interface";
import { getServiceForDoc, registerServiceBuilderForDoc } from "../service-helpers";
var ID = 'scheduler';
var ROOT_MARGIN = '250% 31.25%';

/** @implements {../service.Disposable} */
export var Scheduler = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc  */
  function Scheduler(ampdoc) {
    var _this = this;

    _classCallCheck(this, Scheduler);

    /** @private @const */
    this.ampdoc_ = ampdoc;
    var win = ampdoc.win;

    /** @private @const {!IntersectionObserver} */
    this.observer_ = new win.IntersectionObserver(function (e) {
      return _this.observed_(e);
    }, {
      // Root bounds are not important, so we can use the `root:null` for a
      // top-level window.
      root: isIframed(win) ?
      /** @type {?} */
      win.document : null,
      rootMargin: ROOT_MARGIN
    });

    /** @private @const {!Map<!Element, !IntersectionObserver>} */
    this.containerMap_ = new Map();

    /** @private @const {!Map<!AmpElement, {asap: boolean, isIntersecting: boolean}>} */
    this.targets_ = new Map();

    /** @private {?Array<!AmpElement>} */
    this.parsingTargets_ = [];

    /** @private {boolean} */
    this.scheduledReady_ = false;
    ampdoc.whenReady().then(function () {
      return _this.checkParsing_();
    });

    /** @private {?UnlistenDef} */
    this.visibilityUnlisten_ = ampdoc.onVisibilityChanged(function () {
      return _this.docVisibilityChanged_();
    });
  }

  /** @override */
  _createClass(Scheduler, [{
    key: "dispose",
    value: function dispose() {
      this.observer_.disconnect();
      this.targets_.clear();

      if (this.visibilityUnlisten_) {
        this.visibilityUnlisten_();
        this.visibilityUnlisten_ = null;
      }
    }
    /**
     * @param {!AmpElement} target
     */

  }, {
    key: "scheduleAsap",
    value: function scheduleAsap(target) {
      this.targets_.set(target, {
        asap: true,
        isIntersecting: false
      });
      this.waitParsing_(target);
    }
    /**
     * @param {!AmpElement} target
     */

  }, {
    key: "schedule",
    value: function schedule(target) {
      if (this.targets_.has(target)) {
        return;
      }

      if (target.deferredMount()) {
        this.targets_.set(target, {
          asap: false,
          isIntersecting: false
        });
        this.observer_.observe(target);

        if (this.containerMap_.size > 0) {
          this.containerMap_.forEach(function (observer, container) {
            if (containsNotSelf(container, target)) {
              observer.observe(target);
            }
          });
        }
      } else {
        this.targets_.set(target, {
          asap: false,
          isIntersecting: true
        });
      }

      this.waitParsing_(target);
    }
    /**
     * @param {!AmpElement} target
     */

  }, {
    key: "unschedule",
    value: function unschedule(target) {
      if (!this.targets_.has(target)) {
        return;
      }

      this.targets_.delete(target);
      this.observer_.unobserve(target);

      if (this.containerMap_.size > 0) {
        this.containerMap_.forEach(function (observer) {
          observer.unobserve(target);
        });
      }

      if (this.parsingTargets_) {
        removeItem(this.parsingTargets_, target);
        this.checkParsing_();
      }
    }
    /**
     * Adds the observer for the specified container. The first observer to
     * find an intersection will trigger the element's mount.
     *
     * @param {!Element} container
     * @param {!Element=} opt_scroller
     */

  }, {
    key: "setContainer",
    value: function setContainer(container, opt_scroller) {
      var _this2 = this;

      if (this.containerMap_.has(container)) {
        return;
      }

      // Create observer.
      var win = this.ampdoc_.win;
      var observer = new win.IntersectionObserver(function (e) {
        return _this2.observed_(e);
      }, {
        root: opt_scroller || container,
        rootMargin: ROOT_MARGIN
      });
      this.containerMap_.set(container, observer);
      // Subscribe all pending children. Ignore `asap` targets since they
      // will be scheduled immediately and do not need an intersection
      // observer input.
      this.targets_.forEach(function (_ref, target) {
        var asap = _ref.asap;

        if (!asap && containsNotSelf(container, target)) {
          observer.observe(target);
        }
      });
    }
    /**
     * Removes the container and its observer that were set by the `setContainer`.
     *
     * @param {!Element} container
     */

  }, {
    key: "removeContainer",
    value: function removeContainer(container) {
      var observer = this.containerMap_.get(container);

      if (!observer) {
        return;
      }

      // Disconnect. All children will be unobserved automatically.
      observer.disconnect();
      this.containerMap_.delete(container);
    }
    /** @private*/

  }, {
    key: "signalScanReady_",
    value: function signalScanReady_() {
      var _this3 = this;

      if (this.ampdoc_.isReady() && !this.scheduledReady_) {
        this.scheduledReady_ = true;
        var win = this.ampdoc_.win;
        win.setTimeout(function () {
          // This signal mainly signifies that some of the elements have been
          // discovered and scheduled.
          _this3.ampdoc_.signals().signal(READY_SCAN_SIGNAL);
        }, 50);
      }
    }
    /** @private */

  }, {
    key: "docVisibilityChanged_",
    value: function docVisibilityChanged_() {
      var _this4 = this;

      var vs = this.ampdoc_.getVisibilityState();

      if (vs == VisibilityState.VISIBLE || vs == VisibilityState.HIDDEN || vs == VisibilityState.PRERENDER) {
        this.targets_.forEach(function (_, target) {
          return _this4.maybeBuild_(target);
        });
      }
    }
    /**
     * @param {!AmpElement} target
     * @private
     */

  }, {
    key: "waitParsing_",
    value: function waitParsing_(target) {
      var parsingTargets = this.parsingTargets_;

      if (parsingTargets) {
        if (!parsingTargets.includes(target)) {
          parsingTargets.push(target);
        }

        this.checkParsing_();
      } else {
        this.maybeBuild_(target);
      }
    }
    /** @private */

  }, {
    key: "checkParsing_",
    value: function checkParsing_() {
      var documentReady = this.ampdoc_.isReady();
      var parsingTargets = this.parsingTargets_;

      if (parsingTargets) {
        for (var i = 0; i < parsingTargets.length; i++) {
          var target = parsingTargets[i];

          if (documentReady || hasNextNodeInDocumentOrder(target, this.ampdoc_.getRootNode())) {
            parsingTargets.splice(i--, 1);
            this.maybeBuild_(target);
          }
        }
      }

      if (documentReady) {
        this.parsingTargets_ = null;
        this.signalScanReady_();
      }
    }
    /**
     * @param {!Array<!IntersectionObserverEntry>} entries
     * @private
     */

  }, {
    key: "observed_",
    value: function observed_(entries) {
      for (var i = 0; i < entries.length; i++) {
        var _entries$i = entries[i],
            isThisIntersecting = _entries$i.isIntersecting,
            target = _entries$i.target;
        var ampTarget =
        /** @type {!AmpElement} */
        target;
        var current = this.targets_.get(ampTarget);

        if (!current) {
          continue;
        }

        var isIntersecting = isThisIntersecting || current.isIntersecting;

        if (isIntersecting !== current.isIntersecting) {
          this.targets_.set(ampTarget, {
            asap: current.asap,
            isIntersecting: isIntersecting
          });
        }

        if (isIntersecting) {
          this.maybeBuild_(ampTarget);
        }
      }
    }
    /**
     * @param {!AmpElement} target
     * @private
     */

  }, {
    key: "maybeBuild_",
    value: function maybeBuild_(target) {
      var parsingTargets = this.parsingTargets_;
      var parsed = !(parsingTargets && parsingTargets.includes(target));

      var _ref2 = this.targets_.get(target) || {
        asap: false,
        isIntersecting: false
      },
          asap = _ref2.asap,
          isIntersecting = _ref2.isIntersecting;

      var vs = this.ampdoc_.getVisibilityState();
      var toBuild = parsed && (asap || isIntersecting) && (vs == VisibilityState.VISIBLE || // Hidden (hidden tab) allows full build.
      vs == VisibilityState.HIDDEN || // Prerender can only proceed when allowed.
      vs == VisibilityState.PRERENDER && target.prerenderAllowed());

      if (!toBuild) {
        return;
      }

      this.unschedule(target);
      // The high-priority elements are scheduled via `setTimeout`. All other
      // elements are scheduled via the `requestIdleCallback`.
      var win = this.ampdoc_.win;
      var scheduler = asap || target.getBuildPriority() <= LayoutPriority.CONTENT ? win.setTimeout : win.requestIdleCallback || win.setTimeout;
      scheduler(function () {
        return target.mountInternal();
      });
    }
  }]);

  return Scheduler;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Scheduler}
 */
export function getSchedulerForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, ID, Scheduler);
  return (
    /** @type {!Scheduler} */
    getServiceForDoc(ampdoc, ID)
  );
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVkdWxlci5qcyJdLCJuYW1lcyI6WyJWaXNpYmlsaXR5U3RhdGUiLCJjb250YWluc05vdFNlbGYiLCJoYXNOZXh0Tm9kZUluRG9jdW1lbnRPcmRlciIsImlzSWZyYW1lZCIsIkxheW91dFByaW9yaXR5IiwicmVtb3ZlSXRlbSIsIlJFQURZX1NDQU5fU0lHTkFMIiwiZ2V0U2VydmljZUZvckRvYyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJJRCIsIlJPT1RfTUFSR0lOIiwiU2NoZWR1bGVyIiwiYW1wZG9jIiwiYW1wZG9jXyIsIndpbiIsIm9ic2VydmVyXyIsIkludGVyc2VjdGlvbk9ic2VydmVyIiwiZSIsIm9ic2VydmVkXyIsInJvb3QiLCJkb2N1bWVudCIsInJvb3RNYXJnaW4iLCJjb250YWluZXJNYXBfIiwiTWFwIiwidGFyZ2V0c18iLCJwYXJzaW5nVGFyZ2V0c18iLCJzY2hlZHVsZWRSZWFkeV8iLCJ3aGVuUmVhZHkiLCJ0aGVuIiwiY2hlY2tQYXJzaW5nXyIsInZpc2liaWxpdHlVbmxpc3Rlbl8iLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwiZG9jVmlzaWJpbGl0eUNoYW5nZWRfIiwiZGlzY29ubmVjdCIsImNsZWFyIiwidGFyZ2V0Iiwic2V0IiwiYXNhcCIsImlzSW50ZXJzZWN0aW5nIiwid2FpdFBhcnNpbmdfIiwiaGFzIiwiZGVmZXJyZWRNb3VudCIsIm9ic2VydmUiLCJzaXplIiwiZm9yRWFjaCIsIm9ic2VydmVyIiwiY29udGFpbmVyIiwiZGVsZXRlIiwidW5vYnNlcnZlIiwib3B0X3Njcm9sbGVyIiwiZ2V0IiwiaXNSZWFkeSIsInNldFRpbWVvdXQiLCJzaWduYWxzIiwic2lnbmFsIiwidnMiLCJnZXRWaXNpYmlsaXR5U3RhdGUiLCJWSVNJQkxFIiwiSElEREVOIiwiUFJFUkVOREVSIiwiXyIsIm1heWJlQnVpbGRfIiwicGFyc2luZ1RhcmdldHMiLCJpbmNsdWRlcyIsInB1c2giLCJkb2N1bWVudFJlYWR5IiwiaSIsImxlbmd0aCIsImdldFJvb3ROb2RlIiwic3BsaWNlIiwic2lnbmFsU2NhblJlYWR5XyIsImVudHJpZXMiLCJpc1RoaXNJbnRlcnNlY3RpbmciLCJhbXBUYXJnZXQiLCJjdXJyZW50IiwicGFyc2VkIiwidG9CdWlsZCIsInByZXJlbmRlckFsbG93ZWQiLCJ1bnNjaGVkdWxlIiwic2NoZWR1bGVyIiwiZ2V0QnVpbGRQcmlvcml0eSIsIkNPTlRFTlQiLCJyZXF1ZXN0SWRsZUNhbGxiYWNrIiwibW91bnRJbnRlcm5hbCIsImdldFNjaGVkdWxlckZvckRvYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsZUFBUjtBQUNBLFNBQ0VDLGVBREYsRUFFRUMsMEJBRkYsRUFHRUMsU0FIRjtBQUtBLFNBQVFDLGNBQVI7QUFDQSxTQUFRQyxVQUFSO0FBRUEsU0FBUUMsaUJBQVI7QUFFQSxTQUNFQyxnQkFERixFQUVFQyw0QkFGRjtBQUtBLElBQU1DLEVBQUUsR0FBRyxXQUFYO0FBRUEsSUFBTUMsV0FBVyxHQUFHLGFBQXBCOztBQUVBO0FBQ0EsV0FBYUMsU0FBYjtBQUNFO0FBQ0EscUJBQVlDLE1BQVosRUFBb0I7QUFBQTs7QUFBQTs7QUFDbEI7QUFDQSxTQUFLQyxPQUFMLEdBQWVELE1BQWY7QUFFQSxRQUFPRSxHQUFQLEdBQWNGLE1BQWQsQ0FBT0UsR0FBUDs7QUFFQTtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsSUFBSUQsR0FBRyxDQUFDRSxvQkFBUixDQUE2QixVQUFDQyxDQUFEO0FBQUEsYUFBTyxLQUFJLENBQUNDLFNBQUwsQ0FBZUQsQ0FBZixDQUFQO0FBQUEsS0FBN0IsRUFBdUQ7QUFDdEU7QUFDQTtBQUNBRSxNQUFBQSxJQUFJLEVBQUVoQixTQUFTLENBQUNXLEdBQUQsQ0FBVDtBQUFpQjtBQUFrQkEsTUFBQUEsR0FBRyxDQUFDTSxRQUF2QyxHQUFtRCxJQUhhO0FBSXRF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QSxnQkFBZ0IsQ0FBQ0ssTUFBRCxFQUFTSCxFQUFUO0FBQWxEO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtWaXNpYmlsaXR5U3RhdGV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy92aXNpYmlsaXR5LXN0YXRlJztcbmltcG9ydCB7XG4gIGNvbnRhaW5zTm90U2VsZixcbiAgaGFzTmV4dE5vZGVJbkRvY3VtZW50T3JkZXIsXG4gIGlzSWZyYW1lZCxcbn0gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7TGF5b3V0UHJpb3JpdHl9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQnO1xuaW1wb3J0IHtyZW1vdmVJdGVtfSBmcm9tICcjY29yZS90eXBlcy9hcnJheSc7XG5cbmltcG9ydCB7UkVBRFlfU0NBTl9TSUdOQUx9IGZyb20gJy4vcmVzb3VyY2VzLWludGVyZmFjZSc7XG5cbmltcG9ydCB7XG4gIGdldFNlcnZpY2VGb3JEb2MsXG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MsXG59IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbmNvbnN0IElEID0gJ3NjaGVkdWxlcic7XG5cbmNvbnN0IFJPT1RfTUFSR0lOID0gJzI1MCUgMzEuMjUlJztcblxuLyoqIEBpbXBsZW1lbnRzIHsuLi9zZXJ2aWNlLkRpc3Bvc2FibGV9ICovXG5leHBvcnQgY2xhc3MgU2NoZWR1bGVyIHtcbiAgLyoqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2MgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgKi9cbiAgICB0aGlzLmFtcGRvY18gPSBhbXBkb2M7XG5cbiAgICBjb25zdCB7d2lufSA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFJbnRlcnNlY3Rpb25PYnNlcnZlcn0gKi9cbiAgICB0aGlzLm9ic2VydmVyXyA9IG5ldyB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKGUpID0+IHRoaXMub2JzZXJ2ZWRfKGUpLCB7XG4gICAgICAvLyBSb290IGJvdW5kcyBhcmUgbm90IGltcG9ydGFudCwgc28gd2UgY2FuIHVzZSB0aGUgYHJvb3Q6bnVsbGAgZm9yIGFcbiAgICAgIC8vIHRvcC1sZXZlbCB3aW5kb3cuXG4gICAgICByb290OiBpc0lmcmFtZWQod2luKSA/IC8qKiBAdHlwZSB7P30gKi8gKHdpbi5kb2N1bWVudCkgOiBudWxsLFxuICAgICAgcm9vdE1hcmdpbjogUk9PVF9NQVJHSU4sXG4gICAgfSk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshTWFwPCFFbGVtZW50LCAhSW50ZXJzZWN0aW9uT2JzZXJ2ZXI+fSAqL1xuICAgIHRoaXMuY29udGFpbmVyTWFwXyA9IG5ldyBNYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFNYXA8IUFtcEVsZW1lbnQsIHthc2FwOiBib29sZWFuLCBpc0ludGVyc2VjdGluZzogYm9vbGVhbn0+fSAqL1xuICAgIHRoaXMudGFyZ2V0c18gPSBuZXcgTWFwKCk7XG5cbiAgICAvKiogQHByaXZhdGUgez9BcnJheTwhQW1wRWxlbWVudD59ICovXG4gICAgdGhpcy5wYXJzaW5nVGFyZ2V0c18gPSBbXTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnNjaGVkdWxlZFJlYWR5XyA9IGZhbHNlO1xuXG4gICAgYW1wZG9jLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4gdGhpcy5jaGVja1BhcnNpbmdfKCkpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/VW5saXN0ZW5EZWZ9ICovXG4gICAgdGhpcy52aXNpYmlsaXR5VW5saXN0ZW5fID0gYW1wZG9jLm9uVmlzaWJpbGl0eUNoYW5nZWQoKCkgPT5cbiAgICAgIHRoaXMuZG9jVmlzaWJpbGl0eUNoYW5nZWRfKClcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMub2JzZXJ2ZXJfLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLnRhcmdldHNfLmNsZWFyKCk7XG4gICAgaWYgKHRoaXMudmlzaWJpbGl0eVVubGlzdGVuXykge1xuICAgICAgdGhpcy52aXNpYmlsaXR5VW5saXN0ZW5fKCk7XG4gICAgICB0aGlzLnZpc2liaWxpdHlVbmxpc3Rlbl8gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSB0YXJnZXRcbiAgICovXG4gIHNjaGVkdWxlQXNhcCh0YXJnZXQpIHtcbiAgICB0aGlzLnRhcmdldHNfLnNldCh0YXJnZXQsIHthc2FwOiB0cnVlLCBpc0ludGVyc2VjdGluZzogZmFsc2V9KTtcbiAgICB0aGlzLndhaXRQYXJzaW5nXyh0YXJnZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IHRhcmdldFxuICAgKi9cbiAgc2NoZWR1bGUodGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0c18uaGFzKHRhcmdldCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0LmRlZmVycmVkTW91bnQoKSkge1xuICAgICAgdGhpcy50YXJnZXRzXy5zZXQodGFyZ2V0LCB7YXNhcDogZmFsc2UsIGlzSW50ZXJzZWN0aW5nOiBmYWxzZX0pO1xuICAgICAgdGhpcy5vYnNlcnZlcl8ub2JzZXJ2ZSh0YXJnZXQpO1xuICAgICAgaWYgKHRoaXMuY29udGFpbmVyTWFwXy5zaXplID4gMCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lck1hcF8uZm9yRWFjaCgob2JzZXJ2ZXIsIGNvbnRhaW5lcikgPT4ge1xuICAgICAgICAgIGlmIChjb250YWluc05vdFNlbGYoY29udGFpbmVyLCB0YXJnZXQpKSB7XG4gICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50YXJnZXRzXy5zZXQodGFyZ2V0LCB7YXNhcDogZmFsc2UsIGlzSW50ZXJzZWN0aW5nOiB0cnVlfSk7XG4gICAgfVxuXG4gICAgdGhpcy53YWl0UGFyc2luZ18odGFyZ2V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSB0YXJnZXRcbiAgICovXG4gIHVuc2NoZWR1bGUodGFyZ2V0KSB7XG4gICAgaWYgKCF0aGlzLnRhcmdldHNfLmhhcyh0YXJnZXQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRzXy5kZWxldGUodGFyZ2V0KTtcblxuICAgIHRoaXMub2JzZXJ2ZXJfLnVub2JzZXJ2ZSh0YXJnZXQpO1xuICAgIGlmICh0aGlzLmNvbnRhaW5lck1hcF8uc2l6ZSA+IDApIHtcbiAgICAgIHRoaXMuY29udGFpbmVyTWFwXy5mb3JFYWNoKChvYnNlcnZlcikgPT4ge1xuICAgICAgICBvYnNlcnZlci51bm9ic2VydmUodGFyZ2V0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhcnNpbmdUYXJnZXRzXykge1xuICAgICAgcmVtb3ZlSXRlbSh0aGlzLnBhcnNpbmdUYXJnZXRzXywgdGFyZ2V0KTtcbiAgICAgIHRoaXMuY2hlY2tQYXJzaW5nXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBvYnNlcnZlciBmb3IgdGhlIHNwZWNpZmllZCBjb250YWluZXIuIFRoZSBmaXJzdCBvYnNlcnZlciB0b1xuICAgKiBmaW5kIGFuIGludGVyc2VjdGlvbiB3aWxsIHRyaWdnZXIgdGhlIGVsZW1lbnQncyBtb3VudC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gY29udGFpbmVyXG4gICAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfc2Nyb2xsZXJcbiAgICovXG4gIHNldENvbnRhaW5lcihjb250YWluZXIsIG9wdF9zY3JvbGxlcikge1xuICAgIGlmICh0aGlzLmNvbnRhaW5lck1hcF8uaGFzKGNvbnRhaW5lcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgb2JzZXJ2ZXIuXG4gICAgY29uc3Qge3dpbn0gPSB0aGlzLmFtcGRvY187XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgd2luLkludGVyc2VjdGlvbk9ic2VydmVyKChlKSA9PiB0aGlzLm9ic2VydmVkXyhlKSwge1xuICAgICAgcm9vdDogb3B0X3Njcm9sbGVyIHx8IGNvbnRhaW5lcixcbiAgICAgIHJvb3RNYXJnaW46IFJPT1RfTUFSR0lOLFxuICAgIH0pO1xuICAgIHRoaXMuY29udGFpbmVyTWFwXy5zZXQoY29udGFpbmVyLCBvYnNlcnZlcik7XG5cbiAgICAvLyBTdWJzY3JpYmUgYWxsIHBlbmRpbmcgY2hpbGRyZW4uIElnbm9yZSBgYXNhcGAgdGFyZ2V0cyBzaW5jZSB0aGV5XG4gICAgLy8gd2lsbCBiZSBzY2hlZHVsZWQgaW1tZWRpYXRlbHkgYW5kIGRvIG5vdCBuZWVkIGFuIGludGVyc2VjdGlvblxuICAgIC8vIG9ic2VydmVyIGlucHV0LlxuICAgIHRoaXMudGFyZ2V0c18uZm9yRWFjaCgoe2FzYXB9LCB0YXJnZXQpID0+IHtcbiAgICAgIGlmICghYXNhcCAmJiBjb250YWluc05vdFNlbGYoY29udGFpbmVyLCB0YXJnZXQpKSB7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBjb250YWluZXIgYW5kIGl0cyBvYnNlcnZlciB0aGF0IHdlcmUgc2V0IGJ5IHRoZSBgc2V0Q29udGFpbmVyYC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gY29udGFpbmVyXG4gICAqL1xuICByZW1vdmVDb250YWluZXIoY29udGFpbmVyKSB7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLmNvbnRhaW5lck1hcF8uZ2V0KGNvbnRhaW5lcik7XG4gICAgaWYgKCFvYnNlcnZlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERpc2Nvbm5lY3QuIEFsbCBjaGlsZHJlbiB3aWxsIGJlIHVub2JzZXJ2ZWQgYXV0b21hdGljYWxseS5cbiAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5jb250YWluZXJNYXBfLmRlbGV0ZShjb250YWluZXIpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlKi9cbiAgc2lnbmFsU2NhblJlYWR5XygpIHtcbiAgICBpZiAodGhpcy5hbXBkb2NfLmlzUmVhZHkoKSAmJiAhdGhpcy5zY2hlZHVsZWRSZWFkeV8pIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVkUmVhZHlfID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHt3aW59ID0gdGhpcy5hbXBkb2NfO1xuICAgICAgd2luLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAvLyBUaGlzIHNpZ25hbCBtYWlubHkgc2lnbmlmaWVzIHRoYXQgc29tZSBvZiB0aGUgZWxlbWVudHMgaGF2ZSBiZWVuXG4gICAgICAgIC8vIGRpc2NvdmVyZWQgYW5kIHNjaGVkdWxlZC5cbiAgICAgICAgdGhpcy5hbXBkb2NfLnNpZ25hbHMoKS5zaWduYWwoUkVBRFlfU0NBTl9TSUdOQUwpO1xuICAgICAgfSwgNTApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBkb2NWaXNpYmlsaXR5Q2hhbmdlZF8oKSB7XG4gICAgY29uc3QgdnMgPSB0aGlzLmFtcGRvY18uZ2V0VmlzaWJpbGl0eVN0YXRlKCk7XG4gICAgaWYgKFxuICAgICAgdnMgPT0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEUgfHxcbiAgICAgIHZzID09IFZpc2liaWxpdHlTdGF0ZS5ISURERU4gfHxcbiAgICAgIHZzID09IFZpc2liaWxpdHlTdGF0ZS5QUkVSRU5ERVJcbiAgICApIHtcbiAgICAgIHRoaXMudGFyZ2V0c18uZm9yRWFjaCgoXywgdGFyZ2V0KSA9PiB0aGlzLm1heWJlQnVpbGRfKHRhcmdldCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSB0YXJnZXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHdhaXRQYXJzaW5nXyh0YXJnZXQpIHtcbiAgICBjb25zdCBwYXJzaW5nVGFyZ2V0cyA9IHRoaXMucGFyc2luZ1RhcmdldHNfO1xuICAgIGlmIChwYXJzaW5nVGFyZ2V0cykge1xuICAgICAgaWYgKCFwYXJzaW5nVGFyZ2V0cy5pbmNsdWRlcyh0YXJnZXQpKSB7XG4gICAgICAgIHBhcnNpbmdUYXJnZXRzLnB1c2godGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hlY2tQYXJzaW5nXygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1heWJlQnVpbGRfKHRhcmdldCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGNoZWNrUGFyc2luZ18oKSB7XG4gICAgY29uc3QgZG9jdW1lbnRSZWFkeSA9IHRoaXMuYW1wZG9jXy5pc1JlYWR5KCk7XG4gICAgY29uc3QgcGFyc2luZ1RhcmdldHMgPSB0aGlzLnBhcnNpbmdUYXJnZXRzXztcbiAgICBpZiAocGFyc2luZ1RhcmdldHMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyc2luZ1RhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gcGFyc2luZ1RhcmdldHNbaV07XG4gICAgICAgIGlmIChcbiAgICAgICAgICBkb2N1bWVudFJlYWR5IHx8XG4gICAgICAgICAgaGFzTmV4dE5vZGVJbkRvY3VtZW50T3JkZXIodGFyZ2V0LCB0aGlzLmFtcGRvY18uZ2V0Um9vdE5vZGUoKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcGFyc2luZ1RhcmdldHMuc3BsaWNlKGktLSwgMSk7XG5cbiAgICAgICAgICB0aGlzLm1heWJlQnVpbGRfKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRvY3VtZW50UmVhZHkpIHtcbiAgICAgIHRoaXMucGFyc2luZ1RhcmdldHNfID0gbnVsbDtcbiAgICAgIHRoaXMuc2lnbmFsU2NhblJlYWR5XygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBcnJheTwhSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeT59IGVudHJpZXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9ic2VydmVkXyhlbnRyaWVzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB7aXNJbnRlcnNlY3Rpbmc6IGlzVGhpc0ludGVyc2VjdGluZywgdGFyZ2V0fSA9IGVudHJpZXNbaV07XG4gICAgICBjb25zdCBhbXBUYXJnZXQgPSAvKiogQHR5cGUgeyFBbXBFbGVtZW50fSAqLyAodGFyZ2V0KTtcblxuICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudGFyZ2V0c18uZ2V0KGFtcFRhcmdldCk7XG4gICAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzSW50ZXJzZWN0aW5nID0gaXNUaGlzSW50ZXJzZWN0aW5nIHx8IGN1cnJlbnQuaXNJbnRlcnNlY3Rpbmc7XG4gICAgICBpZiAoaXNJbnRlcnNlY3RpbmcgIT09IGN1cnJlbnQuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgdGhpcy50YXJnZXRzXy5zZXQoYW1wVGFyZ2V0LCB7YXNhcDogY3VycmVudC5hc2FwLCBpc0ludGVyc2VjdGluZ30pO1xuICAgICAgfVxuICAgICAgaWYgKGlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICAgIHRoaXMubWF5YmVCdWlsZF8oYW1wVGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUJ1aWxkXyh0YXJnZXQpIHtcbiAgICBjb25zdCBwYXJzaW5nVGFyZ2V0cyA9IHRoaXMucGFyc2luZ1RhcmdldHNfO1xuICAgIGNvbnN0IHBhcnNlZCA9ICEocGFyc2luZ1RhcmdldHMgJiYgcGFyc2luZ1RhcmdldHMuaW5jbHVkZXModGFyZ2V0KSk7XG4gICAgY29uc3Qge2FzYXAsIGlzSW50ZXJzZWN0aW5nfSA9IHRoaXMudGFyZ2V0c18uZ2V0KHRhcmdldCkgfHwge1xuICAgICAgYXNhcDogZmFsc2UsXG4gICAgICBpc0ludGVyc2VjdGluZzogZmFsc2UsXG4gICAgfTtcbiAgICBjb25zdCB2cyA9IHRoaXMuYW1wZG9jXy5nZXRWaXNpYmlsaXR5U3RhdGUoKTtcbiAgICBjb25zdCB0b0J1aWxkID1cbiAgICAgIHBhcnNlZCAmJlxuICAgICAgKGFzYXAgfHwgaXNJbnRlcnNlY3RpbmcpICYmXG4gICAgICAodnMgPT0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEUgfHxcbiAgICAgICAgLy8gSGlkZGVuIChoaWRkZW4gdGFiKSBhbGxvd3MgZnVsbCBidWlsZC5cbiAgICAgICAgdnMgPT0gVmlzaWJpbGl0eVN0YXRlLkhJRERFTiB8fFxuICAgICAgICAvLyBQcmVyZW5kZXIgY2FuIG9ubHkgcHJvY2VlZCB3aGVuIGFsbG93ZWQuXG4gICAgICAgICh2cyA9PSBWaXNpYmlsaXR5U3RhdGUuUFJFUkVOREVSICYmIHRhcmdldC5wcmVyZW5kZXJBbGxvd2VkKCkpKTtcbiAgICBpZiAoIXRvQnVpbGQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnVuc2NoZWR1bGUodGFyZ2V0KTtcblxuICAgIC8vIFRoZSBoaWdoLXByaW9yaXR5IGVsZW1lbnRzIGFyZSBzY2hlZHVsZWQgdmlhIGBzZXRUaW1lb3V0YC4gQWxsIG90aGVyXG4gICAgLy8gZWxlbWVudHMgYXJlIHNjaGVkdWxlZCB2aWEgdGhlIGByZXF1ZXN0SWRsZUNhbGxiYWNrYC5cbiAgICBjb25zdCB7d2lufSA9IHRoaXMuYW1wZG9jXztcbiAgICBjb25zdCBzY2hlZHVsZXIgPVxuICAgICAgYXNhcCB8fCB0YXJnZXQuZ2V0QnVpbGRQcmlvcml0eSgpIDw9IExheW91dFByaW9yaXR5LkNPTlRFTlRcbiAgICAgICAgPyB3aW4uc2V0VGltZW91dFxuICAgICAgICA6IHdpbi5yZXF1ZXN0SWRsZUNhbGxiYWNrIHx8IHdpbi5zZXRUaW1lb3V0O1xuICAgIHNjaGVkdWxlcigoKSA9PiB0YXJnZXQubW91bnRJbnRlcm5hbCgpKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqIEByZXR1cm4geyFTY2hlZHVsZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2hlZHVsZXJGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCBJRCwgU2NoZWR1bGVyKTtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7IVNjaGVkdWxlcn0gKi8gKGdldFNlcnZpY2VGb3JEb2MoYW1wZG9jLCBJRCkpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/scheduler.js