function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
var FOCUS_HISTORY_TIMEOUT_ = 1000 * 60; // 1min
var TAG_ = 'Mutator';

/**
 * @implements {MutatorInterface}
 */
export var MutatorImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function MutatorImpl(ampdoc) {var _this = this;_classCallCheck(this, MutatorImpl);
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!./resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = Services. /*OK*/vsyncFor(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);

    this.activeHistory_.onFocus(function (element) {
      _this.checkPendingChangeSize_(element);
    });
  }

  /** @override */_createClass(MutatorImpl, [{ key: "forceChangeSize", value:
    function forceChangeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {
      this.scheduleChangeSize_(
      Resource.forElement(element),
      newHeight,
      newWidth,
      opt_newMargins,
      /* event */undefined,
      /* force */true,
      opt_callback);

    }

    /** @override */ }, { key: "requestChangeSize", value:
    function requestChangeSize(element, newHeight, newWidth, opt_newMargins, opt_event) {var _this2 = this;
      return new Promise(function (resolve, reject) {
        _this2.scheduleChangeSize_(
        Resource.forElement(element),
        newHeight,
        newWidth,
        opt_newMargins,
        opt_event,
        /* force */false,
        function (success) {
          if (success) {
            resolve();
          } else {
            reject(new Error('changeSize attempt denied'));
          }
        });

      });
    }

    /** @override */ }, { key: "expandElement", value:
    function expandElement(element) {
      var resource = Resource.forElement(element);
      resource.completeExpand();
      this.resources_.schedulePass(FOUR_FRAME_DELAY_);
    }

    /** @override */ }, { key: "attemptCollapse", value:
    function attemptCollapse(element) {var _this3 = this;
      return new Promise(function (resolve, reject) {
        _this3.scheduleChangeSize_(
        Resource.forElement(element),
        0,
        0,
        /* newMargin */undefined,
        /* event */undefined,
        /* force */false,
        function (success) {
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

    /** @override */ }, { key: "collapseElement", value:
    function collapseElement(element) {
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

    /** @override */ }, { key: "measureElement", value:
    function measureElement(measurer) {
      return this.vsync_.measurePromise(measurer);
    }

    /** @override */ }, { key: "mutateElement", value:
    function mutateElement(element, mutator, skipRemeasure) {
      return this.measureMutateElementResources_(
      element,
      null,
      mutator,
      skipRemeasure);

    }

    /** @override */ }, { key: "measureMutateElement", value:
    function measureMutateElement(element, measurer, mutator) {
      return this.measureMutateElementResources_(element, measurer, mutator);
    }

    /**
     * Returns the layout margins for the resource.
     * @param {!Resource} resource
     * @return {!../layout-rect.LayoutMarginsDef}
     * @private
     */ }, { key: "getLayoutMargins_", value:
    function getLayoutMargins_(resource) {
      var style = computedStyle(this.win, resource.element);
      return {
        top: parseInt(style.marginTop, 10) || 0,
        right: parseInt(style.marginRight, 10) || 0,
        bottom: parseInt(style.marginBottom, 10) || 0,
        left: parseInt(style.marginLeft, 10) || 0 };

    }

    /**
     * Handles element mutation (and measurement) APIs in the Resources system.
     *
     * @param {!Element} element
     * @param {?function()} measurer
     * @param {function()} mutator
     * @param {boolean} skipRemeasure
     * @return {!Promise}
     */ }, { key: "measureMutateElementResources_", value:
    function measureMutateElementResources_(
    element,
    measurer,
    mutator)

    {var _this4 = this;var skipRemeasure = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
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
        } });

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
     */ }, { key: "dirtyElement", value:
    function dirtyElement(element) {
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
     */ }, { key: "checkPendingChangeSize_", value:
    function checkPendingChangeSize_(element) {
      var resourceElement = closest(
      element,
      function (el) {return !!Resource.forElementOptional(el);});

      if (!resourceElement) {
        return;
      }
      var resource = Resource.forElement(resourceElement);
      var pendingChangeSize = resource.getPendingChangeSize();
      if (pendingChangeSize !== undefined) {
        this.scheduleChangeSize_(
        resource,
        pendingChangeSize.height,
        pendingChangeSize.width,
        pendingChangeSize.margins,
        /* event */undefined,
        /* force */true);

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
     */ }, { key: "scheduleChangeSize_", value:
    function scheduleChangeSize_(
    resource,
    newHeight,
    newWidth,
    newMargins,
    event,
    force,
    opt_callback)
    {var _this5 = this;
      if (resource.hasBeenMeasured() && !newMargins) {
        this.completeScheduleChangeSize_(
        resource,
        newHeight,
        newWidth,
        undefined,
        event,
        force,
        opt_callback);

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
          var marginChange = newMargins ?
          {
            newMargins: newMargins,
            currentMargins: _this5.getLayoutMargins_(resource) } :

          undefined;
          _this5.completeScheduleChangeSize_(
          resource,
          newHeight,
          newWidth,
          marginChange,
          event,
          force,
          opt_callback);

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
     */ }, { key: "completeScheduleChangeSize_", value:
    function completeScheduleChangeSize_(
    resource,
    newHeight,
    newWidth,
    marginChange,
    event,
    force,
    opt_callback)
    {
      resource.resetPendingChangeSize();
      var layoutSize = resource.getLayoutSize();
      if (
      (newHeight === undefined || newHeight == layoutSize.height) && (
      newWidth === undefined || newWidth == layoutSize.width) && (
      marginChange === undefined ||
      !areMarginsChanged(
      marginChange.currentMargins,
      marginChange.newMargins)))

      {
        if (
        newHeight === undefined &&
        newWidth === undefined &&
        marginChange === undefined)
        {
          dev().error(
          TAG_,
          'attempting to change size with undefined dimensions',
          resource.debugid);

        }
        // Nothing to do.
        if (opt_callback) {
          opt_callback( /* success */true);
        }
        return;
      }

      this.resources_.updateOrEnqueueMutateTask(
      resource,
      /** {!ChangeSizeRequestDef} */{
        resource: resource,
        newHeight: newHeight,
        newWidth: newWidth,
        marginChange: marginChange,
        event: event,
        force: force,
        callback: opt_callback });


      // With IntersectionObserver, we still want to schedule a pass to execute
      // the requested measures of the newly resized element(s).
      this.resources_.schedulePassVsync();
    } }]);return MutatorImpl;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installMutatorServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'mutator', MutatorImpl);
}
// /Users/mszylkowski/src/amphtml/src/service/mutator-impl.js