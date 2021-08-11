function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { areMarginsChanged } from "../core/dom/layout/rect";
import { closest } from "../core/dom/query";
import { computedStyle } from "../core/dom/style";
import { isExperimentOn } from "../experiments";
import { Services } from "./";
import { MutatorInterface } from "./mutator-interface";
import { Resource } from "./resource";
import { FocusHistory } from "../focus-history";
import { dev } from "../log";
import { registerServiceBuilderForDoc } from "../service-helpers";
var FOUR_FRAME_DELAY_ = 70;
var FOCUS_HISTORY_TIMEOUT_ = 1000 * 60;
// 1min
var TAG_ = 'Mutator';

/**
 * @implements {MutatorInterface}
 */
export var MutatorImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function MutatorImpl(ampdoc) {
    var _this = this;

    _classCallCheck(this, MutatorImpl);

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!./resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = Services.
    /*OK*/
    vsyncFor(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);
    this.activeHistory_.onFocus(function (element) {
      _this.checkPendingChangeSize_(element);
    });
  }

  /** @override */
  _createClass(MutatorImpl, [{
    key: "forceChangeSize",
    value: function forceChangeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {
      this.scheduleChangeSize_(Resource.forElement(element), newHeight, newWidth, opt_newMargins,
      /* event */
      undefined,
      /* force */
      true, opt_callback);
    }
    /** @override */

  }, {
    key: "requestChangeSize",
    value: function requestChangeSize(element, newHeight, newWidth, opt_newMargins, opt_event) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.scheduleChangeSize_(Resource.forElement(element), newHeight, newWidth, opt_newMargins, opt_event,
        /* force */
        false, function (success) {
          if (success) {
            resolve();
          } else {
            reject(new Error('changeSize attempt denied'));
          }
        });
      });
    }
    /** @override */

  }, {
    key: "expandElement",
    value: function expandElement(element) {
      var resource = Resource.forElement(element);
      resource.completeExpand();
      this.resources_.schedulePass(FOUR_FRAME_DELAY_);
    }
    /** @override */

  }, {
    key: "attemptCollapse",
    value: function attemptCollapse(element) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.scheduleChangeSize_(Resource.forElement(element), 0, 0,
        /* newMargin */
        undefined,
        /* event */
        undefined,
        /* force */
        false, function (success) {
          if (success) {
            var resource = Resource.forElement(element);
            resource.completeCollapse();
            resolve();
          } else {
            reject(dev().createExpectedError('collapse attempt denied'));
          }
        });
      });
    }
    /** @override */

  }, {
    key: "collapseElement",
    value: function collapseElement(element) {
      var box = this.viewport_.getLayoutRect(element);

      if (box.width != 0 && box.height != 0) {
        if (isExperimentOn(this.win, 'dirty-collapse-element')) {
          this.dirtyElement(element);
        } else {
          this.resources_.setRelayoutTop(box.top);
        }
      }

      var resource = Resource.forElement(element);
      resource.completeCollapse();
      // Unlike completeExpand(), there's no requestMeasure() call here that
      // requires another pass (with IntersectionObserver).
      this.resources_.schedulePass(FOUR_FRAME_DELAY_);
    }
    /** @override */

  }, {
    key: "measureElement",
    value: function measureElement(measurer) {
      return this.vsync_.measurePromise(measurer);
    }
    /** @override */

  }, {
    key: "mutateElement",
    value: function mutateElement(element, mutator, skipRemeasure) {
      return this.measureMutateElementResources_(element, null, mutator, skipRemeasure);
    }
    /** @override */

  }, {
    key: "measureMutateElement",
    value: function measureMutateElement(element, measurer, mutator) {
      return this.measureMutateElementResources_(element, measurer, mutator);
    }
    /**
     * Returns the layout margins for the resource.
     * @param {!Resource} resource
     * @return {!../layout-rect.LayoutMarginsDef}
     * @private
     */

  }, {
    key: "getLayoutMargins_",
    value: function getLayoutMargins_(resource) {
      var style = computedStyle(this.win, resource.element);
      return {
        top: parseInt(style.marginTop, 10) || 0,
        right: parseInt(style.marginRight, 10) || 0,
        bottom: parseInt(style.marginBottom, 10) || 0,
        left: parseInt(style.marginLeft, 10) || 0
      };
    }
    /**
     * Handles element mutation (and measurement) APIs in the Resources system.
     *
     * @param {!Element} element
     * @param {?function()} measurer
     * @param {function()} mutator
     * @param {boolean} skipRemeasure
     * @return {!Promise}
     */

  }, {
    key: "measureMutateElementResources_",
    value: function measureMutateElementResources_(element, measurer, mutator, skipRemeasure) {
      var _this4 = this;

      if (skipRemeasure === void 0) {
        skipRemeasure = false;
      }

      var calcRelayoutTop = function calcRelayoutTop() {
        var box = _this4.viewport_.getLayoutRect(element);

        if (box.width != 0 && box.height != 0) {
          return box.top;
        }

        return -1;
      };

      var relayoutTop = -1;
      // TODO(jridgewell): support state
      return this.vsync_.runPromise({
        measure: function measure() {
          if (measurer) {
            measurer();
          }

          if (!skipRemeasure) {
            relayoutTop = calcRelayoutTop();
          }
        },
        mutate: function mutate() {
          mutator();

          // `skipRemeasure` is set by callers when we know that `mutator`
          // cannot cause a change in size/position e.g. toggleLoading().
          if (skipRemeasure) {
            return;
          }

          if (element.classList.contains('i-amphtml-element')) {
            var r = Resource.forElement(element);
            r.requestMeasure();
          }

          var ampElements = element.getElementsByClassName('i-amphtml-element');

          for (var i = 0; i < ampElements.length; i++) {
            var _r = Resource.forElement(ampElements[i]);

            _r.requestMeasure();
          }

          _this4.resources_.schedulePass(FOUR_FRAME_DELAY_);

          if (relayoutTop != -1) {
            _this4.resources_.setRelayoutTop(relayoutTop);
          }

          // Need to measure again in case the element has become visible or
          // shifted.
          _this4.vsync_.measure(function () {
            var updatedRelayoutTop = calcRelayoutTop();

            if (updatedRelayoutTop != -1 && updatedRelayoutTop != relayoutTop) {
              _this4.resources_.setRelayoutTop(updatedRelayoutTop);

              _this4.resources_.schedulePass(FOUR_FRAME_DELAY_);
            }

            _this4.resources_.maybeHeightChanged();
          });
        }
      });
    }
    /**
     * Dirties the cached element measurements after a mutation occurs.
     *
     * TODO(jridgewell): This API needs to be audited. Common practice is
     * to pass the amp-element in as the root even though we are only
     * mutating children. If the amp-element is passed, we invalidate
     * everything in the parent layer above it, where only invalidating the
     * amp-element was necessary (only children were mutated, only
     * amp-element's scroll box is affected).
     *
     * @param {!Element} element
     */

  }, {
    key: "dirtyElement",
    value: function dirtyElement(element) {
      var relayoutAll = false;
      var isAmpElement = element.classList.contains('i-amphtml-element');

      if (isAmpElement) {
        var r = Resource.forElement(element);
        this.resources_.setRelayoutTop(r.getLayoutBox().top);
      } else {
        relayoutAll = true;
      }

      this.resources_.schedulePass(FOUR_FRAME_DELAY_, relayoutAll);
    }
    /**
     * Reschedules change size request when an overflown element is activated.
     * @param {!Element} element
     * @private
     */

  }, {
    key: "checkPendingChangeSize_",
    value: function checkPendingChangeSize_(element) {
      var resourceElement = closest(element, function (el) {
        return !!Resource.forElementOptional(el);
      });

      if (!resourceElement) {
        return;
      }

      var resource = Resource.forElement(resourceElement);
      var pendingChangeSize = resource.getPendingChangeSize();

      if (pendingChangeSize !== undefined) {
        this.scheduleChangeSize_(resource, pendingChangeSize.height, pendingChangeSize.width, pendingChangeSize.margins,
        /* event */
        undefined,
        /* force */
        true);
      }
    }
    /**
     * Schedules change of the element's height.
     * @param {!Resource} resource
     * @param {number|undefined} newHeight
     * @param {number|undefined} newWidth
     * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} newMargins
     * @param {?Event|undefined} event
     * @param {boolean} force
     * @param {function(boolean)=} opt_callback A callback function
     * @private
     */

  }, {
    key: "scheduleChangeSize_",
    value: function scheduleChangeSize_(resource, newHeight, newWidth, newMargins, event, force, opt_callback) {
      var _this5 = this;

      if (resource.hasBeenMeasured() && !newMargins) {
        this.completeScheduleChangeSize_(resource, newHeight, newWidth, undefined, event, force, opt_callback);
      } else {
        // This is a rare case since most of times the element itself schedules
        // resize requests. However, this case is possible when another element
        // requests resize of a controlled element. This also happens when a
        // margin size change is requested, since existing margins have to be
        // measured in this instance.
        this.vsync_.measure(function () {
          if (!resource.hasBeenMeasured()) {
            resource.measure();
          }

          var marginChange = newMargins ? {
            newMargins: newMargins,
            currentMargins: _this5.getLayoutMargins_(resource)
          } : undefined;

          _this5.completeScheduleChangeSize_(resource, newHeight, newWidth, marginChange, event, force, opt_callback);
        });
      }
    }
    /**
     * @param {!Resource} resource
     * @param {number|undefined} newHeight
     * @param {number|undefined} newWidth
     * @param {!./resources-interface.MarginChangeDef|undefined} marginChange
     * @param {?Event|undefined} event
     * @param {boolean} force
     * @param {function(boolean)=} opt_callback A callback function
     * @private
     */

  }, {
    key: "completeScheduleChangeSize_",
    value: function completeScheduleChangeSize_(resource, newHeight, newWidth, marginChange, event, force, opt_callback) {
      resource.resetPendingChangeSize();
      var layoutSize = resource.getLayoutSize();

      if ((newHeight === undefined || newHeight == layoutSize.height) && (newWidth === undefined || newWidth == layoutSize.width) && (marginChange === undefined || !areMarginsChanged(marginChange.currentMargins, marginChange.newMargins))) {
        if (newHeight === undefined && newWidth === undefined && marginChange === undefined) {
          dev().error(TAG_, 'attempting to change size with undefined dimensions', resource.debugid);
        }

        // Nothing to do.
        if (opt_callback) {
          opt_callback(
          /* success */
          true);
        }

        return;
      }

      this.resources_.updateOrEnqueueMutateTask(resource,
      /** {!ChangeSizeRequestDef} */
      {
        resource: resource,
        newHeight: newHeight,
        newWidth: newWidth,
        marginChange: marginChange,
        event: event,
        force: force,
        callback: opt_callback
      });
      // With IntersectionObserver, we still want to schedule a pass to execute
      // the requested measures of the newly resized element(s).
      this.resources_.schedulePassVsync();
    }
  }]);

  return MutatorImpl;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installMutatorServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'mutator', MutatorImpl);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm11dGF0b3ItaW1wbC5qcyJdLCJuYW1lcyI6WyJhcmVNYXJnaW5zQ2hhbmdlZCIsImNsb3Nlc3QiLCJjb21wdXRlZFN0eWxlIiwiaXNFeHBlcmltZW50T24iLCJTZXJ2aWNlcyIsIk11dGF0b3JJbnRlcmZhY2UiLCJSZXNvdXJjZSIsIkZvY3VzSGlzdG9yeSIsImRldiIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJGT1VSX0ZSQU1FX0RFTEFZXyIsIkZPQ1VTX0hJU1RPUllfVElNRU9VVF8iLCJUQUdfIiwiTXV0YXRvckltcGwiLCJhbXBkb2MiLCJ3aW4iLCJyZXNvdXJjZXNfIiwicmVzb3VyY2VzRm9yRG9jIiwidmlld3BvcnRfIiwidmlld3BvcnRGb3JEb2MiLCJ2c3luY18iLCJ2c3luY0ZvciIsImFjdGl2ZUhpc3RvcnlfIiwib25Gb2N1cyIsImVsZW1lbnQiLCJjaGVja1BlbmRpbmdDaGFuZ2VTaXplXyIsIm5ld0hlaWdodCIsIm5ld1dpZHRoIiwib3B0X2NhbGxiYWNrIiwib3B0X25ld01hcmdpbnMiLCJzY2hlZHVsZUNoYW5nZVNpemVfIiwiZm9yRWxlbWVudCIsInVuZGVmaW5lZCIsIm9wdF9ldmVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic3VjY2VzcyIsIkVycm9yIiwicmVzb3VyY2UiLCJjb21wbGV0ZUV4cGFuZCIsInNjaGVkdWxlUGFzcyIsImNvbXBsZXRlQ29sbGFwc2UiLCJjcmVhdGVFeHBlY3RlZEVycm9yIiwiYm94IiwiZ2V0TGF5b3V0UmVjdCIsIndpZHRoIiwiaGVpZ2h0IiwiZGlydHlFbGVtZW50Iiwic2V0UmVsYXlvdXRUb3AiLCJ0b3AiLCJtZWFzdXJlciIsIm1lYXN1cmVQcm9taXNlIiwibXV0YXRvciIsInNraXBSZW1lYXN1cmUiLCJtZWFzdXJlTXV0YXRlRWxlbWVudFJlc291cmNlc18iLCJzdHlsZSIsInBhcnNlSW50IiwibWFyZ2luVG9wIiwicmlnaHQiLCJtYXJnaW5SaWdodCIsImJvdHRvbSIsIm1hcmdpbkJvdHRvbSIsImxlZnQiLCJtYXJnaW5MZWZ0IiwiY2FsY1JlbGF5b3V0VG9wIiwicmVsYXlvdXRUb3AiLCJydW5Qcm9taXNlIiwibWVhc3VyZSIsIm11dGF0ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiciIsInJlcXVlc3RNZWFzdXJlIiwiYW1wRWxlbWVudHMiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiaSIsImxlbmd0aCIsInVwZGF0ZWRSZWxheW91dFRvcCIsIm1heWJlSGVpZ2h0Q2hhbmdlZCIsInJlbGF5b3V0QWxsIiwiaXNBbXBFbGVtZW50IiwiZ2V0TGF5b3V0Qm94IiwicmVzb3VyY2VFbGVtZW50IiwiZWwiLCJmb3JFbGVtZW50T3B0aW9uYWwiLCJwZW5kaW5nQ2hhbmdlU2l6ZSIsImdldFBlbmRpbmdDaGFuZ2VTaXplIiwibWFyZ2lucyIsIm5ld01hcmdpbnMiLCJldmVudCIsImZvcmNlIiwiaGFzQmVlbk1lYXN1cmVkIiwiY29tcGxldGVTY2hlZHVsZUNoYW5nZVNpemVfIiwibWFyZ2luQ2hhbmdlIiwiY3VycmVudE1hcmdpbnMiLCJnZXRMYXlvdXRNYXJnaW5zXyIsInJlc2V0UGVuZGluZ0NoYW5nZVNpemUiLCJsYXlvdXRTaXplIiwiZ2V0TGF5b3V0U2l6ZSIsImVycm9yIiwiZGVidWdpZCIsInVwZGF0ZU9yRW5xdWV1ZU11dGF0ZVRhc2siLCJjYWxsYmFjayIsInNjaGVkdWxlUGFzc1ZzeW5jIiwiaW5zdGFsbE11dGF0b3JTZXJ2aWNlRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxpQkFBUjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxhQUFSO0FBRUEsU0FBUUMsY0FBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxnQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxZQUFSO0FBQ0Es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LENBQUNLLE1BQUQsRUFBUyxTQUFULEVBQW9CRCxXQUFwQixDQUE1QjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7YXJlTWFyZ2luc0NoYW5nZWR9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcmVjdCc7XG5pbXBvcnQge2Nsb3Nlc3R9IGZyb20gJyNjb3JlL2RvbS9xdWVyeSc7XG5pbXBvcnQge2NvbXB1dGVkU3R5bGV9IGZyb20gJyNjb3JlL2RvbS9zdHlsZSc7XG5cbmltcG9ydCB7aXNFeHBlcmltZW50T259IGZyb20gJyNleHBlcmltZW50cyc7XG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcblxuaW1wb3J0IHtNdXRhdG9ySW50ZXJmYWNlfSBmcm9tICcuL211dGF0b3ItaW50ZXJmYWNlJztcbmltcG9ydCB7UmVzb3VyY2V9IGZyb20gJy4vcmVzb3VyY2UnO1xuXG5pbXBvcnQge0ZvY3VzSGlzdG9yeX0gZnJvbSAnLi4vZm9jdXMtaGlzdG9yeSc7XG5pbXBvcnQge2Rldn0gZnJvbSAnLi4vbG9nJztcbmltcG9ydCB7cmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvY30gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcblxuY29uc3QgRk9VUl9GUkFNRV9ERUxBWV8gPSA3MDtcbmNvbnN0IEZPQ1VTX0hJU1RPUllfVElNRU9VVF8gPSAxMDAwICogNjA7IC8vIDFtaW5cbmNvbnN0IFRBR18gPSAnTXV0YXRvcic7XG5cbi8qKlxuICogQGltcGxlbWVudHMge011dGF0b3JJbnRlcmZhY2V9XG4gKi9cbmV4cG9ydCBjbGFzcyBNdXRhdG9ySW1wbCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0IHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gYW1wZG9jLndpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL3Jlc291cmNlcy1pbnRlcmZhY2UuUmVzb3VyY2VzSW50ZXJmYWNlfSAqL1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IFNlcnZpY2VzLnJlc291cmNlc0ZvckRvYyhhbXBkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vdmlld3BvcnQvdmlld3BvcnQtaW50ZXJmYWNlLlZpZXdwb3J0SW50ZXJmYWNlfSAqL1xuICAgIHRoaXMudmlld3BvcnRfID0gU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5hbXBkb2MpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vdnN5bmMtaW1wbC5Wc3luY30gKi9cbiAgICB0aGlzLnZzeW5jXyA9IFNlcnZpY2VzLi8qT0sqLyB2c3luY0Zvcih0aGlzLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRm9jdXNIaXN0b3J5fSAqL1xuICAgIHRoaXMuYWN0aXZlSGlzdG9yeV8gPSBuZXcgRm9jdXNIaXN0b3J5KHRoaXMud2luLCBGT0NVU19ISVNUT1JZX1RJTUVPVVRfKTtcblxuICAgIHRoaXMuYWN0aXZlSGlzdG9yeV8ub25Gb2N1cygoZWxlbWVudCkgPT4ge1xuICAgICAgdGhpcy5jaGVja1BlbmRpbmdDaGFuZ2VTaXplXyhlbGVtZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZm9yY2VDaGFuZ2VTaXplKGVsZW1lbnQsIG5ld0hlaWdodCwgbmV3V2lkdGgsIG9wdF9jYWxsYmFjaywgb3B0X25ld01hcmdpbnMpIHtcbiAgICB0aGlzLnNjaGVkdWxlQ2hhbmdlU2l6ZV8oXG4gICAgICBSZXNvdXJjZS5mb3JFbGVtZW50KGVsZW1lbnQpLFxuICAgICAgbmV3SGVpZ2h0LFxuICAgICAgbmV3V2lkdGgsXG4gICAgICBvcHRfbmV3TWFyZ2lucyxcbiAgICAgIC8qIGV2ZW50ICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIGZvcmNlICovIHRydWUsXG4gICAgICBvcHRfY2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZXF1ZXN0Q2hhbmdlU2l6ZShlbGVtZW50LCBuZXdIZWlnaHQsIG5ld1dpZHRoLCBvcHRfbmV3TWFyZ2lucywgb3B0X2V2ZW50KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc2NoZWR1bGVDaGFuZ2VTaXplXyhcbiAgICAgICAgUmVzb3VyY2UuZm9yRWxlbWVudChlbGVtZW50KSxcbiAgICAgICAgbmV3SGVpZ2h0LFxuICAgICAgICBuZXdXaWR0aCxcbiAgICAgICAgb3B0X25ld01hcmdpbnMsXG4gICAgICAgIG9wdF9ldmVudCxcbiAgICAgICAgLyogZm9yY2UgKi8gZmFsc2UsXG4gICAgICAgIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignY2hhbmdlU2l6ZSBhdHRlbXB0IGRlbmllZCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGV4cGFuZEVsZW1lbnQoZWxlbWVudCkge1xuICAgIGNvbnN0IHJlc291cmNlID0gUmVzb3VyY2UuZm9yRWxlbWVudChlbGVtZW50KTtcbiAgICByZXNvdXJjZS5jb21wbGV0ZUV4cGFuZCgpO1xuICAgIHRoaXMucmVzb3VyY2VzXy5zY2hlZHVsZVBhc3MoRk9VUl9GUkFNRV9ERUxBWV8pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhdHRlbXB0Q29sbGFwc2UoZWxlbWVudCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNjaGVkdWxlQ2hhbmdlU2l6ZV8oXG4gICAgICAgIFJlc291cmNlLmZvckVsZW1lbnQoZWxlbWVudCksXG4gICAgICAgIDAsXG4gICAgICAgIDAsXG4gICAgICAgIC8qIG5ld01hcmdpbiAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIGV2ZW50ICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogZm9yY2UgKi8gZmFsc2UsXG4gICAgICAgIChzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gUmVzb3VyY2UuZm9yRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgICAgIHJlc291cmNlLmNvbXBsZXRlQ29sbGFwc2UoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KGRldigpLmNyZWF0ZUV4cGVjdGVkRXJyb3IoJ2NvbGxhcHNlIGF0dGVtcHQgZGVuaWVkJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgY29sbGFwc2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgICBjb25zdCBib3ggPSB0aGlzLnZpZXdwb3J0Xy5nZXRMYXlvdXRSZWN0KGVsZW1lbnQpO1xuICAgIGlmIChib3gud2lkdGggIT0gMCAmJiBib3guaGVpZ2h0ICE9IDApIHtcbiAgICAgIGlmIChpc0V4cGVyaW1lbnRPbih0aGlzLndpbiwgJ2RpcnR5LWNvbGxhcHNlLWVsZW1lbnQnKSkge1xuICAgICAgICB0aGlzLmRpcnR5RWxlbWVudChlbGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVzb3VyY2VzXy5zZXRSZWxheW91dFRvcChib3gudG9wKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXNvdXJjZSA9IFJlc291cmNlLmZvckVsZW1lbnQoZWxlbWVudCk7XG4gICAgcmVzb3VyY2UuY29tcGxldGVDb2xsYXBzZSgpO1xuXG4gICAgLy8gVW5saWtlIGNvbXBsZXRlRXhwYW5kKCksIHRoZXJlJ3Mgbm8gcmVxdWVzdE1lYXN1cmUoKSBjYWxsIGhlcmUgdGhhdFxuICAgIC8vIHJlcXVpcmVzIGFub3RoZXIgcGFzcyAod2l0aCBJbnRlcnNlY3Rpb25PYnNlcnZlcikuXG4gICAgdGhpcy5yZXNvdXJjZXNfLnNjaGVkdWxlUGFzcyhGT1VSX0ZSQU1FX0RFTEFZXyk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG1lYXN1cmVFbGVtZW50KG1lYXN1cmVyKSB7XG4gICAgcmV0dXJuIHRoaXMudnN5bmNfLm1lYXN1cmVQcm9taXNlKG1lYXN1cmVyKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbXV0YXRlRWxlbWVudChlbGVtZW50LCBtdXRhdG9yLCBza2lwUmVtZWFzdXJlKSB7XG4gICAgcmV0dXJuIHRoaXMubWVhc3VyZU11dGF0ZUVsZW1lbnRSZXNvdXJjZXNfKFxuICAgICAgZWxlbWVudCxcbiAgICAgIG51bGwsXG4gICAgICBtdXRhdG9yLFxuICAgICAgc2tpcFJlbWVhc3VyZVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG1lYXN1cmVNdXRhdGVFbGVtZW50KGVsZW1lbnQsIG1lYXN1cmVyLCBtdXRhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMubWVhc3VyZU11dGF0ZUVsZW1lbnRSZXNvdXJjZXNfKGVsZW1lbnQsIG1lYXN1cmVyLCBtdXRhdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsYXlvdXQgbWFyZ2lucyBmb3IgdGhlIHJlc291cmNlLlxuICAgKiBAcGFyYW0geyFSZXNvdXJjZX0gcmVzb3VyY2VcbiAgICogQHJldHVybiB7IS4uL2xheW91dC1yZWN0LkxheW91dE1hcmdpbnNEZWZ9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRMYXlvdXRNYXJnaW5zXyhyZXNvdXJjZSkge1xuICAgIGNvbnN0IHN0eWxlID0gY29tcHV0ZWRTdHlsZSh0aGlzLndpbiwgcmVzb3VyY2UuZWxlbWVudCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogcGFyc2VJbnQoc3R5bGUubWFyZ2luVG9wLCAxMCkgfHwgMCxcbiAgICAgIHJpZ2h0OiBwYXJzZUludChzdHlsZS5tYXJnaW5SaWdodCwgMTApIHx8IDAsXG4gICAgICBib3R0b206IHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSwgMTApIHx8IDAsXG4gICAgICBsZWZ0OiBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0LCAxMCkgfHwgMCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgZWxlbWVudCBtdXRhdGlvbiAoYW5kIG1lYXN1cmVtZW50KSBBUElzIGluIHRoZSBSZXNvdXJjZXMgc3lzdGVtLlxuICAgKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9uKCl9IG1lYXN1cmVyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbXV0YXRvclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNraXBSZW1lYXN1cmVcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBtZWFzdXJlTXV0YXRlRWxlbWVudFJlc291cmNlc18oXG4gICAgZWxlbWVudCxcbiAgICBtZWFzdXJlcixcbiAgICBtdXRhdG9yLFxuICAgIHNraXBSZW1lYXN1cmUgPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBjYWxjUmVsYXlvdXRUb3AgPSAoKSA9PiB7XG4gICAgICBjb25zdCBib3ggPSB0aGlzLnZpZXdwb3J0Xy5nZXRMYXlvdXRSZWN0KGVsZW1lbnQpO1xuICAgICAgaWYgKGJveC53aWR0aCAhPSAwICYmIGJveC5oZWlnaHQgIT0gMCkge1xuICAgICAgICByZXR1cm4gYm94LnRvcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICAgIGxldCByZWxheW91dFRvcCA9IC0xO1xuICAgIC8vIFRPRE8oanJpZGdld2VsbCk6IHN1cHBvcnQgc3RhdGVcbiAgICByZXR1cm4gdGhpcy52c3luY18ucnVuUHJvbWlzZSh7XG4gICAgICBtZWFzdXJlOiAoKSA9PiB7XG4gICAgICAgIGlmIChtZWFzdXJlcikge1xuICAgICAgICAgIG1lYXN1cmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNraXBSZW1lYXN1cmUpIHtcbiAgICAgICAgICByZWxheW91dFRvcCA9IGNhbGNSZWxheW91dFRvcCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbXV0YXRlOiAoKSA9PiB7XG4gICAgICAgIG11dGF0b3IoKTtcblxuICAgICAgICAvLyBgc2tpcFJlbWVhc3VyZWAgaXMgc2V0IGJ5IGNhbGxlcnMgd2hlbiB3ZSBrbm93IHRoYXQgYG11dGF0b3JgXG4gICAgICAgIC8vIGNhbm5vdCBjYXVzZSBhIGNoYW5nZSBpbiBzaXplL3Bvc2l0aW9uIGUuZy4gdG9nZ2xlTG9hZGluZygpLlxuICAgICAgICBpZiAoc2tpcFJlbWVhc3VyZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLWVsZW1lbnQnKSkge1xuICAgICAgICAgIGNvbnN0IHIgPSBSZXNvdXJjZS5mb3JFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICAgIHIucmVxdWVzdE1lYXN1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhbXBFbGVtZW50cyA9IGVsZW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaS1hbXBodG1sLWVsZW1lbnQnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbXBFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHIgPSBSZXNvdXJjZS5mb3JFbGVtZW50KGFtcEVsZW1lbnRzW2ldKTtcbiAgICAgICAgICByLnJlcXVlc3RNZWFzdXJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNvdXJjZXNfLnNjaGVkdWxlUGFzcyhGT1VSX0ZSQU1FX0RFTEFZXyk7XG5cbiAgICAgICAgaWYgKHJlbGF5b3V0VG9wICE9IC0xKSB7XG4gICAgICAgICAgdGhpcy5yZXNvdXJjZXNfLnNldFJlbGF5b3V0VG9wKHJlbGF5b3V0VG9wKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOZWVkIHRvIG1lYXN1cmUgYWdhaW4gaW4gY2FzZSB0aGUgZWxlbWVudCBoYXMgYmVjb21lIHZpc2libGUgb3JcbiAgICAgICAgLy8gc2hpZnRlZC5cbiAgICAgICAgdGhpcy52c3luY18ubWVhc3VyZSgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdXBkYXRlZFJlbGF5b3V0VG9wID0gY2FsY1JlbGF5b3V0VG9wKCk7XG4gICAgICAgICAgaWYgKHVwZGF0ZWRSZWxheW91dFRvcCAhPSAtMSAmJiB1cGRhdGVkUmVsYXlvdXRUb3AgIT0gcmVsYXlvdXRUb3ApIHtcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VzXy5zZXRSZWxheW91dFRvcCh1cGRhdGVkUmVsYXlvdXRUb3ApO1xuICAgICAgICAgICAgdGhpcy5yZXNvdXJjZXNfLnNjaGVkdWxlUGFzcyhGT1VSX0ZSQU1FX0RFTEFZXyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucmVzb3VyY2VzXy5tYXliZUhlaWdodENoYW5nZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERpcnRpZXMgdGhlIGNhY2hlZCBlbGVtZW50IG1lYXN1cmVtZW50cyBhZnRlciBhIG11dGF0aW9uIG9jY3Vycy5cbiAgICpcbiAgICogVE9ETyhqcmlkZ2V3ZWxsKTogVGhpcyBBUEkgbmVlZHMgdG8gYmUgYXVkaXRlZC4gQ29tbW9uIHByYWN0aWNlIGlzXG4gICAqIHRvIHBhc3MgdGhlIGFtcC1lbGVtZW50IGluIGFzIHRoZSByb290IGV2ZW4gdGhvdWdoIHdlIGFyZSBvbmx5XG4gICAqIG11dGF0aW5nIGNoaWxkcmVuLiBJZiB0aGUgYW1wLWVsZW1lbnQgaXMgcGFzc2VkLCB3ZSBpbnZhbGlkYXRlXG4gICAqIGV2ZXJ5dGhpbmcgaW4gdGhlIHBhcmVudCBsYXllciBhYm92ZSBpdCwgd2hlcmUgb25seSBpbnZhbGlkYXRpbmcgdGhlXG4gICAqIGFtcC1lbGVtZW50IHdhcyBuZWNlc3NhcnkgKG9ubHkgY2hpbGRyZW4gd2VyZSBtdXRhdGVkLCBvbmx5XG4gICAqIGFtcC1lbGVtZW50J3Mgc2Nyb2xsIGJveCBpcyBhZmZlY3RlZCkuXG4gICAqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGRpcnR5RWxlbWVudChlbGVtZW50KSB7XG4gICAgbGV0IHJlbGF5b3V0QWxsID0gZmFsc2U7XG4gICAgY29uc3QgaXNBbXBFbGVtZW50ID0gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1lbGVtZW50Jyk7XG4gICAgaWYgKGlzQW1wRWxlbWVudCkge1xuICAgICAgY29uc3QgciA9IFJlc291cmNlLmZvckVsZW1lbnQoZWxlbWVudCk7XG4gICAgICB0aGlzLnJlc291cmNlc18uc2V0UmVsYXlvdXRUb3Aoci5nZXRMYXlvdXRCb3goKS50b3ApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWxheW91dEFsbCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMucmVzb3VyY2VzXy5zY2hlZHVsZVBhc3MoRk9VUl9GUkFNRV9ERUxBWV8sIHJlbGF5b3V0QWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlcyBjaGFuZ2Ugc2l6ZSByZXF1ZXN0IHdoZW4gYW4gb3ZlcmZsb3duIGVsZW1lbnQgaXMgYWN0aXZhdGVkLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjaGVja1BlbmRpbmdDaGFuZ2VTaXplXyhlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzb3VyY2VFbGVtZW50ID0gY2xvc2VzdChcbiAgICAgIGVsZW1lbnQsXG4gICAgICAoZWwpID0+ICEhUmVzb3VyY2UuZm9yRWxlbWVudE9wdGlvbmFsKGVsKVxuICAgICk7XG4gICAgaWYgKCFyZXNvdXJjZUVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVzb3VyY2UgPSBSZXNvdXJjZS5mb3JFbGVtZW50KHJlc291cmNlRWxlbWVudCk7XG4gICAgY29uc3QgcGVuZGluZ0NoYW5nZVNpemUgPSByZXNvdXJjZS5nZXRQZW5kaW5nQ2hhbmdlU2l6ZSgpO1xuICAgIGlmIChwZW5kaW5nQ2hhbmdlU2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlQ2hhbmdlU2l6ZV8oXG4gICAgICAgIHJlc291cmNlLFxuICAgICAgICBwZW5kaW5nQ2hhbmdlU2l6ZS5oZWlnaHQsXG4gICAgICAgIHBlbmRpbmdDaGFuZ2VTaXplLndpZHRoLFxuICAgICAgICBwZW5kaW5nQ2hhbmdlU2l6ZS5tYXJnaW5zLFxuICAgICAgICAvKiBldmVudCAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIGZvcmNlICovIHRydWVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyBjaGFuZ2Ugb2YgdGhlIGVsZW1lbnQncyBoZWlnaHQuXG4gICAqIEBwYXJhbSB7IVJlc291cmNlfSByZXNvdXJjZVxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IG5ld0hlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcnx1bmRlZmluZWR9IG5ld1dpZHRoXG4gICAqIEBwYXJhbSB7IS4uL2xheW91dC1yZWN0LkxheW91dE1hcmdpbnNDaGFuZ2VEZWZ8dW5kZWZpbmVkfSBuZXdNYXJnaW5zXG4gICAqIEBwYXJhbSB7P0V2ZW50fHVuZGVmaW5lZH0gZXZlbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGJvb2xlYW4pPX0gb3B0X2NhbGxiYWNrIEEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNjaGVkdWxlQ2hhbmdlU2l6ZV8oXG4gICAgcmVzb3VyY2UsXG4gICAgbmV3SGVpZ2h0LFxuICAgIG5ld1dpZHRoLFxuICAgIG5ld01hcmdpbnMsXG4gICAgZXZlbnQsXG4gICAgZm9yY2UsXG4gICAgb3B0X2NhbGxiYWNrXG4gICkge1xuICAgIGlmIChyZXNvdXJjZS5oYXNCZWVuTWVhc3VyZWQoKSAmJiAhbmV3TWFyZ2lucykge1xuICAgICAgdGhpcy5jb21wbGV0ZVNjaGVkdWxlQ2hhbmdlU2l6ZV8oXG4gICAgICAgIHJlc291cmNlLFxuICAgICAgICBuZXdIZWlnaHQsXG4gICAgICAgIG5ld1dpZHRoLFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIGV2ZW50LFxuICAgICAgICBmb3JjZSxcbiAgICAgICAgb3B0X2NhbGxiYWNrXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGlzIGEgcmFyZSBjYXNlIHNpbmNlIG1vc3Qgb2YgdGltZXMgdGhlIGVsZW1lbnQgaXRzZWxmIHNjaGVkdWxlc1xuICAgICAgLy8gcmVzaXplIHJlcXVlc3RzLiBIb3dldmVyLCB0aGlzIGNhc2UgaXMgcG9zc2libGUgd2hlbiBhbm90aGVyIGVsZW1lbnRcbiAgICAgIC8vIHJlcXVlc3RzIHJlc2l6ZSBvZiBhIGNvbnRyb2xsZWQgZWxlbWVudC4gVGhpcyBhbHNvIGhhcHBlbnMgd2hlbiBhXG4gICAgICAvLyBtYXJnaW4gc2l6ZSBjaGFuZ2UgaXMgcmVxdWVzdGVkLCBzaW5jZSBleGlzdGluZyBtYXJnaW5zIGhhdmUgdG8gYmVcbiAgICAgIC8vIG1lYXN1cmVkIGluIHRoaXMgaW5zdGFuY2UuXG4gICAgICB0aGlzLnZzeW5jXy5tZWFzdXJlKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXNvdXJjZS5oYXNCZWVuTWVhc3VyZWQoKSkge1xuICAgICAgICAgIHJlc291cmNlLm1lYXN1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXJnaW5DaGFuZ2UgPSBuZXdNYXJnaW5zXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIG5ld01hcmdpbnMsXG4gICAgICAgICAgICAgIGN1cnJlbnRNYXJnaW5zOiB0aGlzLmdldExheW91dE1hcmdpbnNfKHJlc291cmNlKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jb21wbGV0ZVNjaGVkdWxlQ2hhbmdlU2l6ZV8oXG4gICAgICAgICAgcmVzb3VyY2UsXG4gICAgICAgICAgbmV3SGVpZ2h0LFxuICAgICAgICAgIG5ld1dpZHRoLFxuICAgICAgICAgIG1hcmdpbkNoYW5nZSxcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBmb3JjZSxcbiAgICAgICAgICBvcHRfY2FsbGJhY2tcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFSZXNvdXJjZX0gcmVzb3VyY2VcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBuZXdIZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ8dW5kZWZpbmVkfSBuZXdXaWR0aFxuICAgKiBAcGFyYW0geyEuL3Jlc291cmNlcy1pbnRlcmZhY2UuTWFyZ2luQ2hhbmdlRGVmfHVuZGVmaW5lZH0gbWFyZ2luQ2hhbmdlXG4gICAqIEBwYXJhbSB7P0V2ZW50fHVuZGVmaW5lZH0gZXZlbnRcbiAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGJvb2xlYW4pPX0gb3B0X2NhbGxiYWNrIEEgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXBsZXRlU2NoZWR1bGVDaGFuZ2VTaXplXyhcbiAgICByZXNvdXJjZSxcbiAgICBuZXdIZWlnaHQsXG4gICAgbmV3V2lkdGgsXG4gICAgbWFyZ2luQ2hhbmdlLFxuICAgIGV2ZW50LFxuICAgIGZvcmNlLFxuICAgIG9wdF9jYWxsYmFja1xuICApIHtcbiAgICByZXNvdXJjZS5yZXNldFBlbmRpbmdDaGFuZ2VTaXplKCk7XG4gICAgY29uc3QgbGF5b3V0U2l6ZSA9IHJlc291cmNlLmdldExheW91dFNpemUoKTtcbiAgICBpZiAoXG4gICAgICAobmV3SGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgbmV3SGVpZ2h0ID09IGxheW91dFNpemUuaGVpZ2h0KSAmJlxuICAgICAgKG5ld1dpZHRoID09PSB1bmRlZmluZWQgfHwgbmV3V2lkdGggPT0gbGF5b3V0U2l6ZS53aWR0aCkgJiZcbiAgICAgIChtYXJnaW5DaGFuZ2UgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAhYXJlTWFyZ2luc0NoYW5nZWQoXG4gICAgICAgICAgbWFyZ2luQ2hhbmdlLmN1cnJlbnRNYXJnaW5zLFxuICAgICAgICAgIG1hcmdpbkNoYW5nZS5uZXdNYXJnaW5zXG4gICAgICAgICkpXG4gICAgKSB7XG4gICAgICBpZiAoXG4gICAgICAgIG5ld0hlaWdodCA9PT0gdW5kZWZpbmVkICYmXG4gICAgICAgIG5ld1dpZHRoID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgbWFyZ2luQ2hhbmdlID09PSB1bmRlZmluZWRcbiAgICAgICkge1xuICAgICAgICBkZXYoKS5lcnJvcihcbiAgICAgICAgICBUQUdfLFxuICAgICAgICAgICdhdHRlbXB0aW5nIHRvIGNoYW5nZSBzaXplIHdpdGggdW5kZWZpbmVkIGRpbWVuc2lvbnMnLFxuICAgICAgICAgIHJlc291cmNlLmRlYnVnaWRcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIC8vIE5vdGhpbmcgdG8gZG8uXG4gICAgICBpZiAob3B0X2NhbGxiYWNrKSB7XG4gICAgICAgIG9wdF9jYWxsYmFjaygvKiBzdWNjZXNzICovIHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVzb3VyY2VzXy51cGRhdGVPckVucXVldWVNdXRhdGVUYXNrKFxuICAgICAgcmVzb3VyY2UsXG4gICAgICAvKiogeyFDaGFuZ2VTaXplUmVxdWVzdERlZn0gKi8ge1xuICAgICAgICByZXNvdXJjZSxcbiAgICAgICAgbmV3SGVpZ2h0LFxuICAgICAgICBuZXdXaWR0aCxcbiAgICAgICAgbWFyZ2luQ2hhbmdlLFxuICAgICAgICBldmVudCxcbiAgICAgICAgZm9yY2UsXG4gICAgICAgIGNhbGxiYWNrOiBvcHRfY2FsbGJhY2ssXG4gICAgICB9XG4gICAgKTtcbiAgICAvLyBXaXRoIEludGVyc2VjdGlvbk9ic2VydmVyLCB3ZSBzdGlsbCB3YW50IHRvIHNjaGVkdWxlIGEgcGFzcyB0byBleGVjdXRlXG4gICAgLy8gdGhlIHJlcXVlc3RlZCBtZWFzdXJlcyBvZiB0aGUgbmV3bHkgcmVzaXplZCBlbGVtZW50KHMpLlxuICAgIHRoaXMucmVzb3VyY2VzXy5zY2hlZHVsZVBhc3NWc3luYygpO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbE11dGF0b3JTZXJ2aWNlRm9yRG9jKGFtcGRvYykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKGFtcGRvYywgJ211dGF0b3InLCBNdXRhdG9ySW1wbCk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/mutator-impl.js