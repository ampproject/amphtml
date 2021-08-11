function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Services } from "../../../src/service";
import { VisibilityModel } from "./visibility-model";
import { dev, user } from "../../../src/log";
import { dict, map } from "../../../src/core/types/object";
import { getFriendlyIframeEmbedOptional } from "../../../src/iframe-helper";
import { getMinOpacity } from "./opacity";
import { getMode } from "../../../src/mode";
import { getParentWindowFrameElement } from "../../../src/service-helpers";
import { isArray, isFiniteNumber } from "../../../src/core/types";

import {
layoutPositionRelativeToScrolledViewport,
layoutRectLtwh } from "../../../src/core/dom/layout/rect";

import { rootNodeFor } from "../../../src/core/dom";

var TAG = 'amp-analytics/visibility-manager';

var PROP = '__AMP_VIS';
var VISIBILITY_ID_PROP = '__AMP_VIS_ID';

export var DEFAULT_THRESHOLD = [
0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65,
0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];


/** @type {number} */
var visibilityIdCounter = 1;

/**
 * @param {!Element} element
 * @return {number}
 */
function getElementId(element) {
  var id = element[VISIBILITY_ID_PROP];
  if (!id) {
    id = ++visibilityIdCounter;
    element[VISIBILITY_ID_PROP] = id;
  }
  return id;
}

/**
 * @param {!Node} rootNode
 * @return {!VisibilityManager}
 */
export function provideVisibilityManager(rootNode) {
  if (!rootNode[PROP]) {
    rootNode[PROP] = createVisibilityManager(rootNode);
  }
  return rootNode[PROP];
}

/**
 * @param {!Node} rootNode
 * @return {!VisibilityManager}
 */
function createVisibilityManager(rootNode) {
  // TODO(#22733): cleanup when ampdoc-fie is launched.
  var ampdoc = Services.ampdoc(rootNode);
  var frame = getParentWindowFrameElement(rootNode);
  var embed = frame && getFriendlyIframeEmbedOptional(frame);
  var frameRootNode = frame && rootNodeFor(frame);
  if (embed && frameRootNode) {
    return new VisibilityManagerForEmbed(
    provideVisibilityManager(frameRootNode),
    embed);

  }
  return new VisibilityManagerForDoc(ampdoc);
}

/**
 * A base class for `VisibilityManagerForDoc` and `VisibilityManagerForEmbed`.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all visibility triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 * @abstract
 */
export var VisibilityManager = /*#__PURE__*/function () {
  /**
   * @param {?VisibilityManager} parent
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VisibilityManager(parent, ampdoc) {var _this = this;_classCallCheck(this, VisibilityManager);
    /** @const @protected */
    this.parent = parent;

    /** @const @protected */
    this.ampdoc = ampdoc;

    /** @private {number} */
    this.rootVisibility_ = 0;

    /** @const @private {!Array<!VisibilityModel>}> */
    this.models_ = [];

    /** @private {?Array<!VisibilityManager>} */
    this.children_ = null;

    /** @const @private {!Array<!UnlistenDef>} */
    this.unsubscribe_ = [];

    /** @private {number} Maximum scroll position attained */
    this.maxScrollDepth_ = 0;

    if (this.parent) {
      this.parent.addChild_(this);
    }

    var viewport = Services.viewportForDoc(this.ampdoc);
    viewport.onChanged(function () {
      _this.maybeUpdateMaxScrollDepth(viewport.getScrollTop());
    });
  }

  /**
   * @param {!VisibilityManager} child
   * @private
   */_createClass(VisibilityManager, [{ key: "addChild_", value:
    function addChild_(child) {
      if (!this.children_) {
        this.children_ = [];
      }
      this.children_.push(child);
    }

    /**
     * @param {!VisibilityManager} child
     * @private
     */ }, { key: "removeChild_", value:
    function removeChild_(child) {
      if (this.children_) {
        var index = this.children_.indexOf(child);
        if (index != -1) {
          this.children_.splice(index, 1);
        }
      }
    }

    /** @override */ }, { key: "dispose", value:
    function dispose() {
      // Give the chance for all events to complete.
      this.setRootVisibility(0);

      // Dispose all models.
      for (var i = this.models_.length - 1; i >= 0; i--) {
        this.models_[i].dispose();
      }

      // Unsubscribe everything else.
      this.unsubscribe_.forEach(function (unsubscribe) {
        unsubscribe();
      });
      this.unsubscribe_.length = 0;

      if (this.parent) {
        this.parent.removeChild_(this);
      }
      if (this.children_) {
        for (var _i = 0; _i < this.children_.length; _i++) {
          this.children_[_i].dispose();
        }
      }
    }

    /**
     * @param {!UnlistenDef} handler
     */ }, { key: "unsubscribe", value:
    function unsubscribe(handler) {
      this.unsubscribe_.push(handler);
    }

    /**
     * The start time from which all visibility events and times are measured.
     * @return {number}
     * @abstract
     */ }, { key: "getStartTime", value:
    function getStartTime() {}

    /**
     * Whether the visibility root is currently in the background.
     * @return {boolean}
     * @abstract
     */ }, { key: "isBackgrounded", value:
    function isBackgrounded() {}

    /**
     * Whether the visibility root has been created in the background mode.
     * @return {boolean}
     * @abstract
     */ }, { key: "isBackgroundedAtStart", value:
    function isBackgroundedAtStart() {}

    /**
     * Returns the root's, root's parent's and root's children's
     * lowest opacity value
     * @return {number}
     * @abstract
     */ }, { key: "getRootMinOpacity", value:
    function getRootMinOpacity() {}

    /**
     * Returns the root's layout rect.
     * @return {!../../../src/layout-rect.LayoutRectDef}
     * @abstract
     */ }, { key: "getRootLayoutBox", value:
    function getRootLayoutBox() {}

    /**
     * @return {number}
     */ }, { key: "getRootVisibility", value:
    function getRootVisibility() {
      if (!this.parent) {
        return this.rootVisibility_;
      }
      return this.parent.getRootVisibility() > 0 ? this.rootVisibility_ : 0;
    }

    /**
     * @param {number} visibility
     */ }, { key: "setRootVisibility", value:
    function setRootVisibility(visibility) {
      this.rootVisibility_ = visibility;
      this.updateModels_();
      if (this.children_) {
        for (var i = 0; i < this.children_.length; i++) {
          this.children_[i].updateModels_();
        }
      }
    }

    /**
     * Update the maximum amount that the user has scrolled down the page.
     * @param {number} depth
     */ }, { key: "maybeUpdateMaxScrollDepth", value:
    function maybeUpdateMaxScrollDepth(depth) {
      if (depth > this.maxScrollDepth_) {
        this.maxScrollDepth_ = depth;
      }
    }

    /**
     * Gets the maximum amount that the user has scrolled down the page.
     * @return {number} depth
     */ }, { key: "getMaxScrollDepth", value:
    function getMaxScrollDepth() {
      return this.maxScrollDepth_;
    }

    /** @private */ }, { key: "updateModels_", value:
    function updateModels_() {
      for (var i = 0; i < this.models_.length; i++) {
        this.models_[i].update();
      }
    }

    /**
     * Listens to the visibility events on the root as the whole and the given
     * visibility spec. The visibility tracking can be deferred until
     * `readyPromise` is resolved, if specified.
     * @param {!JsonObject} spec
     * @param {?Promise} readyPromise
     * @param {?function():!Promise} createReportPromiseFunc
     * @param {function(!JsonObject)} callback
     * @return {!UnlistenDef}
     */ }, { key: "listenRoot", value:
    function listenRoot(spec, readyPromise, createReportPromiseFunc, callback) {
      var calcVisibility = this.getRootVisibility.bind(this);
      return this.createModelAndListen_(
      calcVisibility,
      spec,
      readyPromise,
      createReportPromiseFunc,
      callback);

    }

    /**
     * Listens to the visibility events for the specified element and the given
     * visibility spec. The visibility tracking can be deferred until
     * `readyPromise` is resolved, if specified.
     * @param {!Element} element
     * @param {!JsonObject} spec
     * @param {?Promise} readyPromise
     * @param {?function():!Promise} createReportPromiseFunc
     * @param {function(!JsonObject)} callback
     * @return {!UnlistenDef}
     */ }, { key: "listenElement", value:
    function listenElement(
    element,
    spec,
    readyPromise,
    createReportPromiseFunc,
    callback)
    {
      var calcVisibility = this.getElementVisibility.bind(this, element);
      return this.createModelAndListen_(
      calcVisibility,
      spec,
      readyPromise,
      createReportPromiseFunc,
      callback,
      element);

    }

    /**
     * Create visibilityModel and listen to visible events.
     * @param {function():number} calcVisibility
     * @param {!JsonObject} spec
     * @param {?Promise} readyPromise
     * @param {?function():!Promise} createReportPromiseFunc
     * @param {function(!JsonObject)} callback
     * @param {!Element=} opt_element
     * @return {!UnlistenDef}
     */ }, { key: "createModelAndListen_", value:
    function createModelAndListen_(
    calcVisibility,
    spec,
    readyPromise,
    createReportPromiseFunc,
    callback,
    opt_element)
    {
      if (
      spec['visiblePercentageThresholds'] &&
      spec['visiblePercentageMin'] == undefined &&
      spec['visiblePercentageMax'] == undefined)
      {
        var unlisteners = [];
        var ranges = spec['visiblePercentageThresholds'];
        if (!ranges || !isArray(ranges)) {
          user().error(TAG, 'invalid visiblePercentageThresholds');
          return function () {};
        }
        for (var i = 0; i < ranges.length; i++) {
          var percents = ranges[i];
          if (!isArray(percents) || percents.length != 2) {
            user().error(
            TAG,
            'visiblePercentageThresholds entry length is not 2');

            continue;
          }
          if (!isFiniteNumber(percents[0]) || !isFiniteNumber(percents[1])) {
            // not valid number
            user().error(
            TAG,
            'visiblePercentageThresholds entry is not valid number');

            continue;
          }
          var min = Number(percents[0]);
          var max = Number(percents[1]);
          // Min and max must be valid percentages. Min may not be more than max.
          // Max is inclusive. Min is usually exclusive, but there are two
          // special cases: if min and max are both 0, or both 100, then both
          // are inclusive. Otherwise it would not be possible to trigger an
          // event on exactly 0% or 100%.
          if (
          min < 0 ||
          max > 100 ||
          min > max || (
          min == max && min != 100 && max != 0))
          {
            user().error(
            TAG,
            'visiblePercentageThresholds entry invalid min/max value');

            continue;
          }
          var newSpec = spec;
          newSpec['visiblePercentageMin'] = min;
          newSpec['visiblePercentageMax'] = max;
          var _model = new VisibilityModel(
          newSpec,
          calcVisibility,
          /** @type {?../../../src/service/viewport/viewport-impl.ViewportImpl} */(
          Services.viewportForDoc(this.ampdoc)));

          unlisteners.push(
          this.listen_(
          _model,
          spec,
          readyPromise,
          createReportPromiseFunc,
          callback,
          opt_element));


        }
        return function () {
          unlisteners.forEach(function (unlistener) {return unlistener();});
        };
      }
      var model = new VisibilityModel(
      spec,
      calcVisibility,
      /** @type {?../../../src/service/viewport/viewport-impl.ViewportImpl} */(
      Services.viewportForDoc(this.ampdoc)));

      return this.listen_(
      model,
      spec,
      readyPromise,
      createReportPromiseFunc,
      callback,
      opt_element);

    }

    /**
     * @param {!VisibilityModel} model
     * @param {!JsonObject} spec
     * @param {?Promise} readyPromise
     * @param {?function():!Promise} createReportPromiseFunc
     * @param {function(!JsonObject)} callback
     * @param {!Element=} opt_element
     * @return {!UnlistenDef}
     * @private
     */ }, { key: "listen_", value:
    function listen_(
    model,
    spec,
    readyPromise,
    createReportPromiseFunc,
    callback,
    opt_element)
    {var _this2 = this;
      if (createReportPromiseFunc) {
        model.setReportReady(createReportPromiseFunc);
      }

      var viewport = Services.viewportForDoc(this.ampdoc);
      var scrollDepth = viewport.getScrollTop();
      this.maybeUpdateMaxScrollDepth(scrollDepth);

      // Block visibility.
      if (readyPromise) {
        model.setReady(false);
        readyPromise.then(function () {
          model.setReady(true);
          model.maybeSetInitialScrollDepth(scrollDepth);
        });
      } else {
        model.maybeSetInitialScrollDepth(scrollDepth);
      }

      // Process the event.
      model.onTriggerEvent(function () {
        var startTime = _this2.getStartTime();
        var state = model.getState(startTime);

        // Additional doc-level state.
        state['backgrounded'] = _this2.isBackgrounded() ? 1 : 0;
        state['backgroundedAtStart'] = _this2.isBackgroundedAtStart() ? 1 : 0;
        state['totalTime'] = Date.now() - startTime;

        // Optionally, element-level state.
        var layoutBox;
        if (opt_element) {
          state['elementId'] = opt_element.id;
          state['opacity'] = getMinOpacity(opt_element);
          layoutBox = viewport.getLayoutRect(opt_element);
          var intersectionRatio = _this2.getElementVisibility(opt_element);
          var intersectionRect = _this2.getElementIntersectionRect(opt_element);
          Object.assign(
          state,
          dict({
            'intersectionRatio': intersectionRatio,
            'intersectionRect': JSON.stringify(intersectionRect) }));


        } else {
          state['opacity'] = _this2.getRootMinOpacity();
          state['intersectionRatio'] = _this2.getRootVisibility();
          layoutBox = _this2.getRootLayoutBox();
        }
        model.maybeDispose();

        if (layoutBox) {
          Object.assign(
          state,
          dict({
            'elementX': layoutBox.left,
            'elementY': layoutBox.top,
            'elementWidth': layoutBox.width,
            'elementHeight': layoutBox.height }));


          state['initialScrollDepth'] = layoutPositionRelativeToScrolledViewport(
          layoutBox,
          viewport,
          model.getInitialScrollDepth());

          state['maxScrollDepth'] = layoutPositionRelativeToScrolledViewport(
          layoutBox,
          viewport,
          _this2.getMaxScrollDepth());

        }
        callback(state);
      });

      this.models_.push(model);
      model.unsubscribe(function () {
        var index = _this2.models_.indexOf(model);
        if (index != -1) {
          _this2.models_.splice(index, 1);
        }
      });

      // Observe the element via InOb.
      if (opt_element) {
        // It's important that this happens after all the setup is done, b/c
        // intersection observer can fire immedidately. Per spec, this should
        // NOT happen. However, all of the existing InOb polyfills, as well as
        // some versions of native implementations, make this mistake.
        model.unsubscribe(this.observe(opt_element, function () {return model.update();}));
      }

      // Start update.
      model.update();
      return function () {
        model.dispose();
      };
    }

    /**
     * Observes the intersections of the specified element in the viewport.
     * @param {!Element} unusedElement
     * @param {function(number)} unusedListener
     * @return {!UnlistenDef}
     * @protected
     * @abstract
     */ }, { key: "observe", value:
    function observe(unusedElement, unusedListener) {}

    /**
     * @param {!Element} unusedElement
     * @return {number}
     * @abstract
     */ }, { key: "getElementVisibility", value:
    function getElementVisibility(unusedElement) {}

    /**
     * @param {!Element} unusedElement
     * @return {?JsonObject}
     * @abstract
     */ }, { key: "getElementIntersectionRect", value:
    function getElementIntersectionRect(unusedElement) {} }]);return VisibilityManager;}();


/**
 * The implementation of `VisibilityManager` for an AMP document. Two
 * distinct modes are supported: the main AMP doc and a in-a-box doc.
 */
export var VisibilityManagerForDoc = /*#__PURE__*/function (_VisibilityManager) {_inherits(VisibilityManagerForDoc, _VisibilityManager);var _super = _createSuper(VisibilityManagerForDoc);
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VisibilityManagerForDoc(ampdoc) {var _this3;_classCallCheck(this, VisibilityManagerForDoc);
    _this3 = _super.call(this, /* parent */null, ampdoc);

    /** @const @private */
    _this3.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {boolean} */
    _this3.backgrounded_ = !ampdoc.isVisible();

    /** @const @private {boolean} */
    _this3.backgroundedAtStart_ = _this3.isBackgrounded();

    /**
     * @const
     * @private {!Object<number, {
     *   element: !Element,
     *   intersectionRatio: number,
     *   isVisible: boolean,
     *   boundingClientRect: ?../../../src/layout-rect.LayoutRectDef,
     *   listeners: !Array<function(number)>
     * }>}
     */
    _this3.trackedElements_ = map();

    /** @private {?IntersectionObserver} */
    _this3.intersectionObserver_ = null;

    if (getMode(_this3.ampdoc.win).runtime == 'inabox') {
      // In-a-box: visibility depends on the InOb.
      var root = _this3.ampdoc.getRootNode();
      var rootElement = /** @type {!Element} */(
      root.documentElement || root.body || root);

      _this3.unsubscribe(
      _this3.observe(rootElement, _this3.setRootVisibility.bind(_assertThisInitialized(_this3))));

      // Observe inabox window resize event.
      var resizeListener = function resizeListener() {
        var id = getElementId(rootElement);
        var trackedRoot = _this3.trackedElements_[id];
        if (!trackedRoot) {
          return;
        }
        if (
        _this3.ampdoc.win. /*OK*/innerHeight < 1 ||
        _this3.ampdoc.win. /*OK*/innerWidth < 1)
        {
          trackedRoot.isVisible = false;
        } else {
          trackedRoot.isVisible = true;
        }
        _this3.setRootVisibility(
        trackedRoot.isVisible ? trackedRoot.intersectionRatio : 0);

      };
      _this3.ampdoc.win.addEventListener('resize', resizeListener);

      _this3.unsubscribe(function () {
        _this3.ampdoc.win.removeEventListener('resize', resizeListener);
      });
    } else {
      // Main document: visibility is based on the ampdoc.
      _this3.setRootVisibility(_this3.ampdoc.isVisible() ? 1 : 0);
      _this3.unsubscribe(
      _this3.ampdoc.onVisibilityChanged(function () {
        var isVisible = _this3.ampdoc.isVisible();
        if (!isVisible) {
          _this3.backgrounded_ = true;
        }
        _this3.setRootVisibility(isVisible ? 1 : 0);
      }));

    }return _this3;
  }

  /** @override */_createClass(VisibilityManagerForDoc, [{ key: "dispose", value:
    function dispose() {
      _get(_getPrototypeOf(VisibilityManagerForDoc.prototype), "dispose", this).call(this);
      if (this.intersectionObserver_) {
        this.intersectionObserver_.disconnect();
        this.intersectionObserver_ = null;
      }
    }

    /** @override */ }, { key: "getStartTime", value:
    function getStartTime() {
      return (/** @type {number} */(this.ampdoc.getFirstVisibleTime()));
    }

    /** @override */ }, { key: "isBackgrounded", value:
    function isBackgrounded() {
      return this.backgrounded_;
    }

    /** @override */ }, { key: "isBackgroundedAtStart", value:
    function isBackgroundedAtStart() {
      return this.backgroundedAtStart_;
    }

    /** @override */ }, { key: "getRootMinOpacity", value:
    function getRootMinOpacity() {
      var root = this.ampdoc.getRootNode();
      var rootElement = /** @type {!Element} */(
      root.documentElement || root.body || root);

      return getMinOpacity(rootElement);
    }

    /** @override */ }, { key: "getRootLayoutBox", value:
    function getRootLayoutBox() {
      // This code is the same for "in-a-box" and standalone doc.
      var root = this.ampdoc.getRootNode();
      var rootElement = /** @type {!Element} */(
      root.documentElement || root.body || root);

      return this.viewport_.getLayoutRect(rootElement);
    }

    /** @override */ }, { key: "observe", value:
    function observe(element, listener) {var _this4 = this;
      var id = getElementId(element);
      var trackedElement = this.trackedElements_[id];
      if (!trackedElement) {
        trackedElement = {
          element: element,
          intersectionRatio: 0,
          intersectionRect: null,
          isVisible: false,
          boundingClientRect: null,
          listeners: [] };

        this.trackedElements_[id] = trackedElement;
      } else if (
      trackedElement.intersectionRatio > 0 &&
      trackedElement.isVisible)
      {
        // This has already been tracked and the `intersectionRatio` is fresh.
        listener(trackedElement.intersectionRatio);
      }
      trackedElement.listeners.push(listener);
      this.getIntersectionObserver_().observe(element);
      return function () {
        var trackedElement = _this4.trackedElements_[id];
        if (trackedElement) {
          var index = trackedElement.listeners.indexOf(listener);
          if (index != -1) {
            trackedElement.listeners.splice(index, 1);
          }
          if (trackedElement.listeners.length == 0) {
            _this4.intersectionObserver_.unobserve(element);
            delete _this4.trackedElements_[id];
          }
        }
      };
    }

    /** @override */ }, { key: "getElementVisibility", value:
    function getElementVisibility(element) {
      if (this.getRootVisibility() == 0) {
        return 0;
      }
      var id = getElementId(element);
      var trackedElement = this.trackedElements_[id];
      return (
      (trackedElement &&
      trackedElement.isVisible &&
      trackedElement.intersectionRatio) ||
      0);

    }

    /**
     * Gets the intersection element.
     *
     * @param {!Element} element
     * @return {?JsonObject}
     */ }, { key: "getElementIntersectionRect", value:
    function getElementIntersectionRect(element) {
      if (this.getElementVisibility(element) <= 0) {
        return null;
      }
      var id = getElementId(element);
      var trackedElement = this.trackedElements_[id];
      if (trackedElement) {
        return (/** @type {!JsonObject} */(trackedElement.intersectionRect));
      }
      return null;
    }

    /**
     * @return {!IntersectionObserver}
     * @private
     */ }, { key: "getIntersectionObserver_", value:
    function getIntersectionObserver_() {
      if (!this.intersectionObserver_) {
        var win = this.ampdoc.win;
        this.intersectionObserver_ = new win.IntersectionObserver(
        this.onIntersectionChanges_.bind(this),
        { threshold: DEFAULT_THRESHOLD });

      }
      return this.intersectionObserver_;
    }

    /**
     * @param {!Array<!IntersectionObserverEntry>} entries
     * @private
     */ }, { key: "onIntersectionChanges_", value:
    function onIntersectionChanges_(entries) {var _this5 = this;
      entries.forEach(function (change) {
        var intersection = change.intersectionRect;
        // IntersectionRect type now changed from ClientRect to DOMRectReadOnly.
        // TODO(@zhouyx): Fix all InOb related type.
        intersection = layoutRectLtwh(
        Number(intersection.left),
        Number(intersection.top),
        Number(intersection.width),
        Number(intersection.height));

        var boundingClientRect = change.boundingClientRect;
        boundingClientRect =
        boundingClientRect &&
        layoutRectLtwh(
        Number(boundingClientRect.left),
        Number(boundingClientRect.top),
        Number(boundingClientRect.width),
        Number(boundingClientRect.height));

        _this5.onIntersectionChange_(
        change.target,
        change.intersectionRatio,
        intersection,
        boundingClientRect);

      });
    }

    /**
     * @param {!Element} target
     * @param {number} intersectionRatio
     * @param {!../../../src/layout-rect.LayoutRectDef} intersectionRect
     * @param {!../../../src/layout-rect.LayoutRectDef} boundingClientRect
     * @private
     */ }, { key: "onIntersectionChange_", value:
    function onIntersectionChange_(
    target,
    intersectionRatio,
    intersectionRect,
    boundingClientRect)
    {
      intersectionRatio = Math.min(Math.max(intersectionRatio, 0), 1);
      var id = getElementId(target);
      var trackedElement = this.trackedElements_[id];

      // This is different from the InOb v2 isVisible definition.
      // isVisible here only checks for element size
      var isVisible = true;

      if (boundingClientRect.width < 1 || boundingClientRect.height < 1) {
        // Set isVisible to false when the element is not visible.
        // Use < 1 because the width/height can
        // be a double value on high resolution screen
        isVisible = false;
      }
      if (trackedElement) {
        trackedElement.isVisible = isVisible;
        trackedElement.intersectionRatio = intersectionRatio;
        trackedElement.intersectionRect = intersectionRect;
        trackedElement.boundingClientRect = boundingClientRect;
        for (var i = 0; i < trackedElement.listeners.length; i++) {
          trackedElement.listeners[i](
          trackedElement.isVisible ? intersectionRatio : 0);

        }
      }
    } }]);return VisibilityManagerForDoc;}(VisibilityManager);


/**
 * The implementation of `VisibilityManager` for a FIE embed. This visibility
 * root delegates most of tracking functions to its parent, the ampdoc root.
 */
export var VisibilityManagerForEmbed = /*#__PURE__*/function (_VisibilityManager2) {_inherits(VisibilityManagerForEmbed, _VisibilityManager2);var _super2 = _createSuper(VisibilityManagerForEmbed);
  /**
   * @param {!VisibilityManager} parent
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  function VisibilityManagerForEmbed(parent, embed) {var _this6;_classCallCheck(this, VisibilityManagerForEmbed);
    _this6 = _super2.call(this, parent, parent.ampdoc);

    /** @const */
    _this6.embed = embed;

    /** @const @private {boolean} */
    _this6.backgroundedAtStart_ = _this6.parent.isBackgrounded();

    _this6.unsubscribe(
    _this6.parent.observe( /** @type {!Element} */(
    embed.host),
    _this6.setRootVisibility.bind(_assertThisInitialized(_this6))));return _this6;


  }

  /** @override */_createClass(VisibilityManagerForEmbed, [{ key: "getStartTime", value:
    function getStartTime() {
      return this.embed.getStartTime();
    }

    /** @override */ }, { key: "isBackgrounded", value:
    function isBackgrounded() {
      return this.parent.isBackgrounded();
    }

    /** @override */ }, { key: "isBackgroundedAtStart", value:
    function isBackgroundedAtStart() {
      return this.backgroundedAtStart_;
    }

    /** @override */ }, { key: "getRootMinOpacity", value:
    function getRootMinOpacity() {
      var rootElement = /** @type {!Element} */(this.embed.iframe);
      return getMinOpacity(rootElement);
    }

    /**
     * Gets the layout box of the embedded document. Note that this may be
     * smaller than the size allocated by the host. In that case, the document
     * will be centered, and the unfilled space will not be reflected in this
     * return value.
     * embed.iframe is used to calculate the root layoutbox, since it is more
     * important for the embedded document to know its own size, rather than
     * the size of the host rectangle which it may or may not entirely fill.
     * embed.host is used to calculate the root visibility, however, since
     * the visibility of the host element directly determines the embedded
     * document's visibility.
     * @override
     */ }, { key: "getRootLayoutBox", value:
    function getRootLayoutBox() {
      var rootElement = /** @type {!Element} */(this.embed.iframe);
      return Services.viewportForDoc(this.ampdoc).getLayoutRect(rootElement);
    }

    /** @override */ }, { key: "observe", value:
    function observe(element, listener) {
      return this.parent.observe(element, listener);
    }

    /** @override */ }, { key: "getElementVisibility", value:
    function getElementVisibility(element) {
      if (this.getRootVisibility() == 0) {
        return 0;
      }
      return this.parent.getElementVisibility(element);
    }

    /**
     * Returns intersecting element.
     * @override
     */ }, { key: "getElementIntersectionRect", value:
    function getElementIntersectionRect(element) {
      if (this.getRootVisibility() == 0) {
        return null;
      }
      return this.parent.getElementIntersectionRect(element);
    } }]);return VisibilityManagerForEmbed;}(VisibilityManager);
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/visibility-manager.js