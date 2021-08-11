function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
import { Services } from "../../../src/service";
import { VisibilityModel } from "./visibility-model";
import { dev, user } from "../../../src/log";
import { dict, map } from "../../../src/core/types/object";
import { getFriendlyIframeEmbedOptional } from "../../../src/iframe-helper";
import { getMinOpacity } from "./opacity";
import { getMode } from "../../../src/mode";
import { getParentWindowFrameElement } from "../../../src/service-helpers";
import { isArray, isFiniteNumber } from "../../../src/core/types";
import { layoutPositionRelativeToScrolledViewport, layoutRectLtwh } from "../../../src/core/dom/layout/rect";
import { rootNodeFor } from "../../../src/core/dom";
var TAG = 'amp-analytics/visibility-manager';
var PROP = '__AMP_VIS';
var VISIBILITY_ID_PROP = '__AMP_VIS_ID';
export var DEFAULT_THRESHOLD = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];

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
    return new VisibilityManagerForEmbed(provideVisibilityManager(frameRootNode), embed);
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
  function VisibilityManager(parent, ampdoc) {
    var _this = this;

    _classCallCheck(this, VisibilityManager);

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
   */
  _createClass(VisibilityManager, [{
    key: "addChild_",
    value: function addChild_(child) {
      if (!this.children_) {
        this.children_ = [];
      }

      this.children_.push(child);
    }
    /**
     * @param {!VisibilityManager} child
     * @private
     */

  }, {
    key: "removeChild_",
    value: function removeChild_(child) {
      if (this.children_) {
        var index = this.children_.indexOf(child);

        if (index != -1) {
          this.children_.splice(index, 1);
        }
      }
    }
    /** @override */

  }, {
    key: "dispose",
    value: function dispose() {
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
     */

  }, {
    key: "unsubscribe",
    value: function unsubscribe(handler) {
      this.unsubscribe_.push(handler);
    }
    /**
     * The start time from which all visibility events and times are measured.
     * @return {number}
     * @abstract
     */

  }, {
    key: "getStartTime",
    value: function getStartTime() {}
    /**
     * Whether the visibility root is currently in the background.
     * @return {boolean}
     * @abstract
     */

  }, {
    key: "isBackgrounded",
    value: function isBackgrounded() {}
    /**
     * Whether the visibility root has been created in the background mode.
     * @return {boolean}
     * @abstract
     */

  }, {
    key: "isBackgroundedAtStart",
    value: function isBackgroundedAtStart() {}
    /**
     * Returns the root's, root's parent's and root's children's
     * lowest opacity value
     * @return {number}
     * @abstract
     */

  }, {
    key: "getRootMinOpacity",
    value: function getRootMinOpacity() {}
    /**
     * Returns the root's layout rect.
     * @return {!../../../src/layout-rect.LayoutRectDef}
     * @abstract
     */

  }, {
    key: "getRootLayoutBox",
    value: function getRootLayoutBox() {}
    /**
     * @return {number}
     */

  }, {
    key: "getRootVisibility",
    value: function getRootVisibility() {
      if (!this.parent) {
        return this.rootVisibility_;
      }

      return this.parent.getRootVisibility() > 0 ? this.rootVisibility_ : 0;
    }
    /**
     * @param {number} visibility
     */

  }, {
    key: "setRootVisibility",
    value: function setRootVisibility(visibility) {
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
     */

  }, {
    key: "maybeUpdateMaxScrollDepth",
    value: function maybeUpdateMaxScrollDepth(depth) {
      if (depth > this.maxScrollDepth_) {
        this.maxScrollDepth_ = depth;
      }
    }
    /**
     * Gets the maximum amount that the user has scrolled down the page.
     * @return {number} depth
     */

  }, {
    key: "getMaxScrollDepth",
    value: function getMaxScrollDepth() {
      return this.maxScrollDepth_;
    }
    /** @private */

  }, {
    key: "updateModels_",
    value: function updateModels_() {
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
     */

  }, {
    key: "listenRoot",
    value: function listenRoot(spec, readyPromise, createReportPromiseFunc, callback) {
      var calcVisibility = this.getRootVisibility.bind(this);
      return this.createModelAndListen_(calcVisibility, spec, readyPromise, createReportPromiseFunc, callback);
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
     */

  }, {
    key: "listenElement",
    value: function listenElement(element, spec, readyPromise, createReportPromiseFunc, callback) {
      var calcVisibility = this.getElementVisibility.bind(this, element);
      return this.createModelAndListen_(calcVisibility, spec, readyPromise, createReportPromiseFunc, callback, element);
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
     */

  }, {
    key: "createModelAndListen_",
    value: function createModelAndListen_(calcVisibility, spec, readyPromise, createReportPromiseFunc, callback, opt_element) {
      if (spec['visiblePercentageThresholds'] && spec['visiblePercentageMin'] == undefined && spec['visiblePercentageMax'] == undefined) {
        var unlisteners = [];
        var ranges = spec['visiblePercentageThresholds'];

        if (!ranges || !isArray(ranges)) {
          user().error(TAG, 'invalid visiblePercentageThresholds');
          return function () {};
        }

        for (var i = 0; i < ranges.length; i++) {
          var percents = ranges[i];

          if (!isArray(percents) || percents.length != 2) {
            user().error(TAG, 'visiblePercentageThresholds entry length is not 2');
            continue;
          }

          if (!isFiniteNumber(percents[0]) || !isFiniteNumber(percents[1])) {
            // not valid number
            user().error(TAG, 'visiblePercentageThresholds entry is not valid number');
            continue;
          }

          var min = Number(percents[0]);
          var max = Number(percents[1]);

          // Min and max must be valid percentages. Min may not be more than max.
          // Max is inclusive. Min is usually exclusive, but there are two
          // special cases: if min and max are both 0, or both 100, then both
          // are inclusive. Otherwise it would not be possible to trigger an
          // event on exactly 0% or 100%.
          if (min < 0 || max > 100 || min > max || min == max && min != 100 && max != 0) {
            user().error(TAG, 'visiblePercentageThresholds entry invalid min/max value');
            continue;
          }

          var newSpec = spec;
          newSpec['visiblePercentageMin'] = min;
          newSpec['visiblePercentageMax'] = max;

          var _model = new VisibilityModel(newSpec, calcVisibility,
          /** @type {?../../../src/service/viewport/viewport-impl.ViewportImpl} */
          Services.viewportForDoc(this.ampdoc));

          unlisteners.push(this.listen_(_model, spec, readyPromise, createReportPromiseFunc, callback, opt_element));
        }

        return function () {
          unlisteners.forEach(function (unlistener) {
            return unlistener();
          });
        };
      }

      var model = new VisibilityModel(spec, calcVisibility,
      /** @type {?../../../src/service/viewport/viewport-impl.ViewportImpl} */
      Services.viewportForDoc(this.ampdoc));
      return this.listen_(model, spec, readyPromise, createReportPromiseFunc, callback, opt_element);
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
     */

  }, {
    key: "listen_",
    value: function listen_(model, spec, readyPromise, createReportPromiseFunc, callback, opt_element) {
      var _this2 = this;

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

          Object.assign(state, dict({
            'intersectionRatio': intersectionRatio,
            'intersectionRect': JSON.stringify(intersectionRect)
          }));
        } else {
          state['opacity'] = _this2.getRootMinOpacity();
          state['intersectionRatio'] = _this2.getRootVisibility();
          layoutBox = _this2.getRootLayoutBox();
        }

        model.maybeDispose();

        if (layoutBox) {
          Object.assign(state, dict({
            'elementX': layoutBox.left,
            'elementY': layoutBox.top,
            'elementWidth': layoutBox.width,
            'elementHeight': layoutBox.height
          }));
          state['initialScrollDepth'] = layoutPositionRelativeToScrolledViewport(layoutBox, viewport, model.getInitialScrollDepth());
          state['maxScrollDepth'] = layoutPositionRelativeToScrolledViewport(layoutBox, viewport, _this2.getMaxScrollDepth());
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
        model.unsubscribe(this.observe(opt_element, function () {
          return model.update();
        }));
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
     */

  }, {
    key: "observe",
    value: function observe(unusedElement, unusedListener) {}
    /**
     * @param {!Element} unusedElement
     * @return {number}
     * @abstract
     */

  }, {
    key: "getElementVisibility",
    value: function getElementVisibility(unusedElement) {}
    /**
     * @param {!Element} unusedElement
     * @return {?JsonObject}
     * @abstract
     */

  }, {
    key: "getElementIntersectionRect",
    value: function getElementIntersectionRect(unusedElement) {}
  }]);

  return VisibilityManager;
}();

/**
 * The implementation of `VisibilityManager` for an AMP document. Two
 * distinct modes are supported: the main AMP doc and a in-a-box doc.
 */
export var VisibilityManagerForDoc = /*#__PURE__*/function (_VisibilityManager) {
  _inherits(VisibilityManagerForDoc, _VisibilityManager);

  var _super = _createSuper(VisibilityManagerForDoc);

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VisibilityManagerForDoc(ampdoc) {
    var _this3;

    _classCallCheck(this, VisibilityManagerForDoc);

    _this3 = _super.call(this,
    /* parent */
    null, ampdoc);

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

      var rootElement = dev().assertElement(root.documentElement || root.body || root);

      _this3.unsubscribe(_this3.observe(rootElement, _this3.setRootVisibility.bind(_assertThisInitialized(_this3))));

      // Observe inabox window resize event.
      var resizeListener = function resizeListener() {
        var id = getElementId(rootElement);
        var trackedRoot = _this3.trackedElements_[id];

        if (!trackedRoot) {
          return;
        }

        if (_this3.ampdoc.win.
        /*OK*/
        innerHeight < 1 || _this3.ampdoc.win.
        /*OK*/
        innerWidth < 1) {
          trackedRoot.isVisible = false;
        } else {
          trackedRoot.isVisible = true;
        }

        _this3.setRootVisibility(trackedRoot.isVisible ? trackedRoot.intersectionRatio : 0);
      };

      _this3.ampdoc.win.addEventListener('resize', resizeListener);

      _this3.unsubscribe(function () {
        _this3.ampdoc.win.removeEventListener('resize', resizeListener);
      });
    } else {
      // Main document: visibility is based on the ampdoc.
      _this3.setRootVisibility(_this3.ampdoc.isVisible() ? 1 : 0);

      _this3.unsubscribe(_this3.ampdoc.onVisibilityChanged(function () {
        var isVisible = _this3.ampdoc.isVisible();

        if (!isVisible) {
          _this3.backgrounded_ = true;
        }

        _this3.setRootVisibility(isVisible ? 1 : 0);
      }));
    }

    return _this3;
  }

  /** @override */
  _createClass(VisibilityManagerForDoc, [{
    key: "dispose",
    value: function dispose() {
      _get(_getPrototypeOf(VisibilityManagerForDoc.prototype), "dispose", this).call(this);

      if (this.intersectionObserver_) {
        this.intersectionObserver_.disconnect();
        this.intersectionObserver_ = null;
      }
    }
    /** @override */

  }, {
    key: "getStartTime",
    value: function getStartTime() {
      return dev().assertNumber(this.ampdoc.getFirstVisibleTime());
    }
    /** @override */

  }, {
    key: "isBackgrounded",
    value: function isBackgrounded() {
      return this.backgrounded_;
    }
    /** @override */

  }, {
    key: "isBackgroundedAtStart",
    value: function isBackgroundedAtStart() {
      return this.backgroundedAtStart_;
    }
    /** @override */

  }, {
    key: "getRootMinOpacity",
    value: function getRootMinOpacity() {
      var root = this.ampdoc.getRootNode();
      var rootElement = dev().assertElement(root.documentElement || root.body || root);
      return getMinOpacity(rootElement);
    }
    /** @override */

  }, {
    key: "getRootLayoutBox",
    value: function getRootLayoutBox() {
      // This code is the same for "in-a-box" and standalone doc.
      var root = this.ampdoc.getRootNode();
      var rootElement = dev().assertElement(root.documentElement || root.body || root);
      return this.viewport_.getLayoutRect(rootElement);
    }
    /** @override */

  }, {
    key: "observe",
    value: function observe(element, listener) {
      var _this4 = this;

      var id = getElementId(element);
      var trackedElement = this.trackedElements_[id];

      if (!trackedElement) {
        trackedElement = {
          element: element,
          intersectionRatio: 0,
          intersectionRect: null,
          isVisible: false,
          boundingClientRect: null,
          listeners: []
        };
        this.trackedElements_[id] = trackedElement;
      } else if (trackedElement.intersectionRatio > 0 && trackedElement.isVisible) {
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
    /** @override */

  }, {
    key: "getElementVisibility",
    value: function getElementVisibility(element) {
      if (this.getRootVisibility() == 0) {
        return 0;
      }

      var id = getElementId(element);
      var trackedElement = this.trackedElements_[id];
      return trackedElement && trackedElement.isVisible && trackedElement.intersectionRatio || 0;
    }
    /**
     * Gets the intersection element.
     *
     * @param {!Element} element
     * @return {?JsonObject}
     */

  }, {
    key: "getElementIntersectionRect",
    value: function getElementIntersectionRect(element) {
      if (this.getElementVisibility(element) <= 0) {
        return null;
      }

      var id = getElementId(element);
      var trackedElement = this.trackedElements_[id];

      if (trackedElement) {
        return (
          /** @type {!JsonObject} */
          trackedElement.intersectionRect
        );
      }

      return null;
    }
    /**
     * @return {!IntersectionObserver}
     * @private
     */

  }, {
    key: "getIntersectionObserver_",
    value: function getIntersectionObserver_() {
      if (!this.intersectionObserver_) {
        var win = this.ampdoc.win;
        this.intersectionObserver_ = new win.IntersectionObserver(this.onIntersectionChanges_.bind(this), {
          threshold: DEFAULT_THRESHOLD
        });
      }

      return this.intersectionObserver_;
    }
    /**
     * @param {!Array<!IntersectionObserverEntry>} entries
     * @private
     */

  }, {
    key: "onIntersectionChanges_",
    value: function onIntersectionChanges_(entries) {
      var _this5 = this;

      entries.forEach(function (change) {
        var intersection = change.intersectionRect;
        // IntersectionRect type now changed from ClientRect to DOMRectReadOnly.
        // TODO(@zhouyx): Fix all InOb related type.
        intersection = layoutRectLtwh(Number(intersection.left), Number(intersection.top), Number(intersection.width), Number(intersection.height));
        var boundingClientRect = change.boundingClientRect;
        boundingClientRect = boundingClientRect && layoutRectLtwh(Number(boundingClientRect.left), Number(boundingClientRect.top), Number(boundingClientRect.width), Number(boundingClientRect.height));

        _this5.onIntersectionChange_(change.target, change.intersectionRatio, intersection, boundingClientRect);
      });
    }
    /**
     * @param {!Element} target
     * @param {number} intersectionRatio
     * @param {!../../../src/layout-rect.LayoutRectDef} intersectionRect
     * @param {!../../../src/layout-rect.LayoutRectDef} boundingClientRect
     * @private
     */

  }, {
    key: "onIntersectionChange_",
    value: function onIntersectionChange_(target, intersectionRatio, intersectionRect, boundingClientRect) {
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
          trackedElement.listeners[i](trackedElement.isVisible ? intersectionRatio : 0);
        }
      }
    }
  }]);

  return VisibilityManagerForDoc;
}(VisibilityManager);

/**
 * The implementation of `VisibilityManager` for a FIE embed. This visibility
 * root delegates most of tracking functions to its parent, the ampdoc root.
 */
export var VisibilityManagerForEmbed = /*#__PURE__*/function (_VisibilityManager2) {
  _inherits(VisibilityManagerForEmbed, _VisibilityManager2);

  var _super2 = _createSuper(VisibilityManagerForEmbed);

  /**
   * @param {!VisibilityManager} parent
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  function VisibilityManagerForEmbed(parent, embed) {
    var _this6;

    _classCallCheck(this, VisibilityManagerForEmbed);

    _this6 = _super2.call(this, parent, parent.ampdoc);

    /** @const */
    _this6.embed = embed;

    /** @const @private {boolean} */
    _this6.backgroundedAtStart_ = _this6.parent.isBackgrounded();

    _this6.unsubscribe(_this6.parent.observe(dev().assertElement(embed.host), _this6.setRootVisibility.bind(_assertThisInitialized(_this6))));

    return _this6;
  }

  /** @override */
  _createClass(VisibilityManagerForEmbed, [{
    key: "getStartTime",
    value: function getStartTime() {
      return this.embed.getStartTime();
    }
    /** @override */

  }, {
    key: "isBackgrounded",
    value: function isBackgrounded() {
      return this.parent.isBackgrounded();
    }
    /** @override */

  }, {
    key: "isBackgroundedAtStart",
    value: function isBackgroundedAtStart() {
      return this.backgroundedAtStart_;
    }
    /** @override */

  }, {
    key: "getRootMinOpacity",
    value: function getRootMinOpacity() {
      var rootElement = dev().assertElement(this.embed.iframe);
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
     */

  }, {
    key: "getRootLayoutBox",
    value: function getRootLayoutBox() {
      var rootElement = dev().assertElement(this.embed.iframe);
      return Services.viewportForDoc(this.ampdoc).getLayoutRect(rootElement);
    }
    /** @override */

  }, {
    key: "observe",
    value: function observe(element, listener) {
      return this.parent.observe(element, listener);
    }
    /** @override */

  }, {
    key: "getElementVisibility",
    value: function getElementVisibility(element) {
      if (this.getRootVisibility() == 0) {
        return 0;
      }

      return this.parent.getElementVisibility(element);
    }
    /**
     * Returns intersecting element.
     * @override
     */

  }, {
    key: "getElementIntersectionRect",
    value: function getElementIntersectionRect(element) {
      if (this.getRootVisibility() == 0) {
        return null;
      }

      return this.parent.getElementIntersectionRect(element);
    }
  }]);

  return VisibilityManagerForEmbed;
}(VisibilityManager);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpc2liaWxpdHktbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsIlZpc2liaWxpdHlNb2RlbCIsImRldiIsInVzZXIiLCJkaWN0IiwibWFwIiwiZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZE9wdGlvbmFsIiwiZ2V0TWluT3BhY2l0eSIsImdldE1vZGUiLCJnZXRQYXJlbnRXaW5kb3dGcmFtZUVsZW1lbnQiLCJpc0FycmF5IiwiaXNGaW5pdGVOdW1iZXIiLCJsYXlvdXRQb3NpdGlvblJlbGF0aXZlVG9TY3JvbGxlZFZpZXdwb3J0IiwibGF5b3V0UmVjdEx0d2giLCJyb290Tm9kZUZvciIsIlRBRyIsIlBST1AiLCJWSVNJQklMSVRZX0lEX1BST1AiLCJERUZBVUxUX1RIUkVTSE9MRCIsInZpc2liaWxpdHlJZENvdW50ZXIiLCJnZXRFbGVtZW50SWQiLCJlbGVtZW50IiwiaWQiLCJwcm92aWRlVmlzaWJpbGl0eU1hbmFnZXIiLCJyb290Tm9kZSIsImNyZWF0ZVZpc2liaWxpdHlNYW5hZ2VyIiwiYW1wZG9jIiwiZnJhbWUiLCJlbWJlZCIsImZyYW1lUm9vdE5vZGUiLCJWaXNpYmlsaXR5TWFuYWdlckZvckVtYmVkIiwiVmlzaWJpbGl0eU1hbmFnZXJGb3JEb2MiLCJWaXNpYmlsaXR5TWFuYWdlciIsInBhcmVudCIsInJvb3RWaXNpYmlsaXR5XyIsIm1vZGVsc18iLCJjaGlsZHJlbl8iLCJ1bnN1YnNjcmliZV8iLCJtYXhTY3JvbGxEZXB0aF8iLCJhZGRDaGlsZF8iLCJ2aWV3cG9ydCIsInZpZXdwb3J0Rm9yRG9jIiwib25DaGFuZ2VkIiwibWF5YmVVcGRhdGVNYXhTY3JvbGxEZXB0aCIsImdldFNjcm9sbFRvcCIsImNoaWxkIiwicHVzaCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInNldFJvb3RWaXNpYmlsaXR5IiwiaSIsImxlbmd0aCIsImRpc3Bvc2UiLCJmb3JFYWNoIiwidW5zdWJzY3JpYmUiLCJyZW1vdmVDaGlsZF8iLCJoYW5kbGVyIiwiZ2V0Um9vdFZpc2liaWxpdHkiLCJ2aXNpYmlsaXR5IiwidXBkYXRlTW9kZWxzXyIsImRlcHRoIiwidXBkYXRlIiwic3BlYyIsInJlYWR5UHJvbWlzZSIsImNyZWF0ZVJlcG9ydFByb21pc2VGdW5jIiwiY2FsbGJhY2siLCJjYWxjVmlzaWJpbGl0eSIsImJpbmQiLCJjcmVhdGVNb2RlbEFuZExpc3Rlbl8iLCJnZXRFbGVtZW50VmlzaWJpbGl0eSIsIm9wdF9lbGVtZW50IiwidW5kZWZpbmVkIiwidW5saXN0ZW5lcnMiLCJyYW5nZXMiLCJlcnJvciIsInBlcmNlbnRzIiwibWluIiwiTnVtYmVyIiwibWF4IiwibmV3U3BlYyIsIm1vZGVsIiwibGlzdGVuXyIsInVubGlzdGVuZXIiLCJzZXRSZXBvcnRSZWFkeSIsInNjcm9sbERlcHRoIiwic2V0UmVhZHkiLCJ0aGVuIiwibWF5YmVTZXRJbml0aWFsU2Nyb2xsRGVwdGgiLCJvblRyaWdnZXJFdmVudCIsInN0YXJ0VGltZSIsImdldFN0YXJ0VGltZSIsInN0YXRlIiwiZ2V0U3RhdGUiLCJpc0JhY2tncm91bmRlZCIsImlzQmFja2dyb3VuZGVkQXRTdGFydCIsIkRhdGUiLCJub3ciLCJsYXlvdXRCb3giLCJnZXRMYXlvdXRSZWN0IiwiaW50ZXJzZWN0aW9uUmF0aW8iLCJpbnRlcnNlY3Rpb25SZWN0IiwiZ2V0RWxlbWVudEludGVyc2VjdGlvblJlY3QiLCJPYmplY3QiLCJhc3NpZ24iLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0Um9vdE1pbk9wYWNpdHkiLCJnZXRSb290TGF5b3V0Qm94IiwibWF5YmVEaXNwb3NlIiwibGVmdCIsInRvcCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0SW5pdGlhbFNjcm9sbERlcHRoIiwiZ2V0TWF4U2Nyb2xsRGVwdGgiLCJvYnNlcnZlIiwidW51c2VkRWxlbWVudCIsInVudXNlZExpc3RlbmVyIiwidmlld3BvcnRfIiwiYmFja2dyb3VuZGVkXyIsImlzVmlzaWJsZSIsImJhY2tncm91bmRlZEF0U3RhcnRfIiwidHJhY2tlZEVsZW1lbnRzXyIsImludGVyc2VjdGlvbk9ic2VydmVyXyIsIndpbiIsInJ1bnRpbWUiLCJyb290IiwiZ2V0Um9vdE5vZGUiLCJyb290RWxlbWVudCIsImFzc2VydEVsZW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJib2R5IiwicmVzaXplTGlzdGVuZXIiLCJ0cmFja2VkUm9vdCIsImlubmVySGVpZ2h0IiwiaW5uZXJXaWR0aCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25WaXNpYmlsaXR5Q2hhbmdlZCIsImRpc2Nvbm5lY3QiLCJhc3NlcnROdW1iZXIiLCJnZXRGaXJzdFZpc2libGVUaW1lIiwibGlzdGVuZXIiLCJ0cmFja2VkRWxlbWVudCIsImJvdW5kaW5nQ2xpZW50UmVjdCIsImxpc3RlbmVycyIsImdldEludGVyc2VjdGlvbk9ic2VydmVyXyIsInVub2JzZXJ2ZSIsIkludGVyc2VjdGlvbk9ic2VydmVyIiwib25JbnRlcnNlY3Rpb25DaGFuZ2VzXyIsInRocmVzaG9sZCIsImVudHJpZXMiLCJjaGFuZ2UiLCJpbnRlcnNlY3Rpb24iLCJvbkludGVyc2VjdGlvbkNoYW5nZV8iLCJ0YXJnZXQiLCJNYXRoIiwiaG9zdCIsImlmcmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLGVBQVI7QUFDQSxTQUFRQyxHQUFSLEVBQWFDLElBQWI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLEdBQWQ7QUFDQSxTQUFRQyw4QkFBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsMkJBQVI7QUFDQSxTQUFRQyxPQUFSLEVBQWlCQyxjQUFqQjtBQUVBLFNBQ0VDLHdDQURGLEVBRUVDLGNBRkY7QUFJQSxTQUFRQyxXQUFSO0FBRUEsSUFBTUMsR0FBRyxHQUFH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SCxXQUFELENBQXBCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2REE7QUFBQTtBQUFBLFdBd0RFLDRCQUFtQjtBQUNqQixVQUFNQSxXQUFXLEdBQUcvSCxHQUFHLEdBQUdnSSxhQUFOLENBQW9CLEtBQUt0RyxLQUFMLENBQVdtSSxNQUEvQixDQUFwQjtBQUNBLGFBQU8vSixRQUFRLENBQUN5QyxjQUFULENBQXdCLEtBQUtmLE1BQTdCLEVBQXFDeUUsYUFBckMsQ0FBbUQ4QixXQUFuRCxDQUFQO0FBQ0Q7QUFFRDs7QUE3REY7QUFBQTtBQUFBLFdBOERFLGlCQUFRNUcsT0FBUixFQUFpQjBILFFBQWpCLEVBQTJCO0FBQ3pCLGFBQU8sS0FBSzlHLE1BQUwsQ0FBWW1GLE9BQVosQ0FBb0IvRixPQUFwQixFQUE2QjBILFFBQTdCLENBQVA7QUFDRDtBQUVEOztBQWxFRjtBQUFBO0FBQUEsV0FtRUUsOEJBQXFCMUgsT0FBckIsRUFBOEI7QUFDNUIsVUFBSSxLQUFLcUMsaUJBQUwsTUFBNEIsQ0FBaEMsRUFBbUM7QUFDakMsZUFBTyxDQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFLekIsTUFBTCxDQUFZcUMsb0JBQVosQ0FBaUNqRCxPQUFqQyxDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3RUE7QUFBQTtBQUFBLFdBOEVFLG9DQUEyQkEsT0FBM0IsRUFBb0M7QUFDbEMsVUFBSSxLQUFLcUMsaUJBQUwsTUFBNEIsQ0FBaEMsRUFBbUM7QUFDakMsZUFBTyxJQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFLekIsTUFBTCxDQUFZcUUsMEJBQVosQ0FBdUNqRixPQUF2QyxDQUFQO0FBQ0Q7QUFuRkg7O0FBQUE7QUFBQSxFQUErQ1csaUJBQS9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7VmlzaWJpbGl0eU1vZGVsfSBmcm9tICcuL3Zpc2liaWxpdHktbW9kZWwnO1xuaW1wb3J0IHtkZXYsIHVzZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0LCBtYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2dldEZyaWVuZGx5SWZyYW1lRW1iZWRPcHRpb25hbH0gZnJvbSAnLi4vLi4vLi4vc3JjL2lmcmFtZS1oZWxwZXInO1xuaW1wb3J0IHtnZXRNaW5PcGFjaXR5fSBmcm9tICcuL29wYWNpdHknO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuLi8uLi8uLi9zcmMvbW9kZSc7XG5pbXBvcnQge2dldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2lzQXJyYXksIGlzRmluaXRlTnVtYmVyfSBmcm9tICcjY29yZS90eXBlcyc7XG5cbmltcG9ydCB7XG4gIGxheW91dFBvc2l0aW9uUmVsYXRpdmVUb1Njcm9sbGVkVmlld3BvcnQsXG4gIGxheW91dFJlY3RMdHdoLFxufSBmcm9tICcjY29yZS9kb20vbGF5b3V0L3JlY3QnO1xuaW1wb3J0IHtyb290Tm9kZUZvcn0gZnJvbSAnI2NvcmUvZG9tJztcblxuY29uc3QgVEFHID0gJ2FtcC1hbmFseXRpY3MvdmlzaWJpbGl0eS1tYW5hZ2VyJztcblxuY29uc3QgUFJPUCA9ICdfX0FNUF9WSVMnO1xuY29uc3QgVklTSUJJTElUWV9JRF9QUk9QID0gJ19fQU1QX1ZJU19JRCc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RIUkVTSE9MRCA9IFtcbiAgMCwgMC4wNSwgMC4xLCAwLjE1LCAwLjIsIDAuMjUsIDAuMywgMC4zNSwgMC40LCAwLjQ1LCAwLjUsIDAuNTUsIDAuNiwgMC42NSxcbiAgMC43LCAwLjc1LCAwLjgsIDAuODUsIDAuOSwgMC45NSwgMSxcbl07XG5cbi8qKiBAdHlwZSB7bnVtYmVyfSAqL1xubGV0IHZpc2liaWxpdHlJZENvdW50ZXIgPSAxO1xuXG4vKipcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0RWxlbWVudElkKGVsZW1lbnQpIHtcbiAgbGV0IGlkID0gZWxlbWVudFtWSVNJQklMSVRZX0lEX1BST1BdO1xuICBpZiAoIWlkKSB7XG4gICAgaWQgPSArK3Zpc2liaWxpdHlJZENvdW50ZXI7XG4gICAgZWxlbWVudFtWSVNJQklMSVRZX0lEX1BST1BdID0gaWQ7XG4gIH1cbiAgcmV0dXJuIGlkO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IU5vZGV9IHJvb3ROb2RlXG4gKiBAcmV0dXJuIHshVmlzaWJpbGl0eU1hbmFnZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlVmlzaWJpbGl0eU1hbmFnZXIocm9vdE5vZGUpIHtcbiAgaWYgKCFyb290Tm9kZVtQUk9QXSkge1xuICAgIHJvb3ROb2RlW1BST1BdID0gY3JlYXRlVmlzaWJpbGl0eU1hbmFnZXIocm9vdE5vZGUpO1xuICB9XG4gIHJldHVybiByb290Tm9kZVtQUk9QXTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFOb2RlfSByb290Tm9kZVxuICogQHJldHVybiB7IVZpc2liaWxpdHlNYW5hZ2VyfVxuICovXG5mdW5jdGlvbiBjcmVhdGVWaXNpYmlsaXR5TWFuYWdlcihyb290Tm9kZSkge1xuICAvLyBUT0RPKCMyMjczMyk6IGNsZWFudXAgd2hlbiBhbXBkb2MtZmllIGlzIGxhdW5jaGVkLlxuICBjb25zdCBhbXBkb2MgPSBTZXJ2aWNlcy5hbXBkb2Mocm9vdE5vZGUpO1xuICBjb25zdCBmcmFtZSA9IGdldFBhcmVudFdpbmRvd0ZyYW1lRWxlbWVudChyb290Tm9kZSk7XG4gIGNvbnN0IGVtYmVkID0gZnJhbWUgJiYgZ2V0RnJpZW5kbHlJZnJhbWVFbWJlZE9wdGlvbmFsKGZyYW1lKTtcbiAgY29uc3QgZnJhbWVSb290Tm9kZSA9IGZyYW1lICYmIHJvb3ROb2RlRm9yKGZyYW1lKTtcbiAgaWYgKGVtYmVkICYmIGZyYW1lUm9vdE5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFZpc2liaWxpdHlNYW5hZ2VyRm9yRW1iZWQoXG4gICAgICBwcm92aWRlVmlzaWJpbGl0eU1hbmFnZXIoZnJhbWVSb290Tm9kZSksXG4gICAgICBlbWJlZFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIG5ldyBWaXNpYmlsaXR5TWFuYWdlckZvckRvYyhhbXBkb2MpO1xufVxuXG4vKipcbiAqIEEgYmFzZSBjbGFzcyBmb3IgYFZpc2liaWxpdHlNYW5hZ2VyRm9yRG9jYCBhbmQgYFZpc2liaWxpdHlNYW5hZ2VyRm9yRW1iZWRgLlxuICogVGhlIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgY29ycmVzcG9uZHMgMToxIHRvIGBBbmFseXRpY3NSb290YC4gSXQgcmVwcmVzZW50c1xuICogYSBjb2xsZWN0aW9uIG9mIGFsbCB2aXNpYmlsaXR5IHRyaWdnZXJzIGRlY2xhcmVkIHdpdGhpbiB0aGUgYEFuYWx5dGljc1Jvb3RgLlxuICogQGltcGxlbWVudHMgey4uLy4uLy4uL3NyYy9zZXJ2aWNlLkRpc3Bvc2FibGV9XG4gKiBAYWJzdHJhY3RcbiAqL1xuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7P1Zpc2liaWxpdHlNYW5hZ2VyfSBwYXJlbnRcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmVudCwgYW1wZG9jKSB7XG4gICAgLyoqIEBjb25zdCBAcHJvdGVjdGVkICovXG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAvKiogQGNvbnN0IEBwcm90ZWN0ZWQgKi9cbiAgICB0aGlzLmFtcGRvYyA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMucm9vdFZpc2liaWxpdHlfID0gMDtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFBcnJheTwhVmlzaWJpbGl0eU1vZGVsPn0+ICovXG4gICAgdGhpcy5tb2RlbHNfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUgez9BcnJheTwhVmlzaWJpbGl0eU1hbmFnZXI+fSAqL1xuICAgIHRoaXMuY2hpbGRyZW5fID0gbnVsbDtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFBcnJheTwhVW5saXN0ZW5EZWY+fSAqL1xuICAgIHRoaXMudW5zdWJzY3JpYmVfID0gW107XG5cbiAgICAvKiogQHByaXZhdGUge251bWJlcn0gTWF4aW11bSBzY3JvbGwgcG9zaXRpb24gYXR0YWluZWQgKi9cbiAgICB0aGlzLm1heFNjcm9sbERlcHRoXyA9IDA7XG5cbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGFyZW50LmFkZENoaWxkXyh0aGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3cG9ydCA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jKTtcbiAgICB2aWV3cG9ydC5vbkNoYW5nZWQoKCkgPT4ge1xuICAgICAgdGhpcy5tYXliZVVwZGF0ZU1heFNjcm9sbERlcHRoKHZpZXdwb3J0LmdldFNjcm9sbFRvcCgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFWaXNpYmlsaXR5TWFuYWdlcn0gY2hpbGRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFkZENoaWxkXyhjaGlsZCkge1xuICAgIGlmICghdGhpcy5jaGlsZHJlbl8pIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5fID0gW107XG4gICAgfVxuICAgIHRoaXMuY2hpbGRyZW5fLnB1c2goY2hpbGQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVZpc2liaWxpdHlNYW5hZ2VyfSBjaGlsZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQ2hpbGRfKGNoaWxkKSB7XG4gICAgaWYgKHRoaXMuY2hpbGRyZW5fKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hpbGRyZW5fLmluZGV4T2YoY2hpbGQpO1xuICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW5fLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkaXNwb3NlKCkge1xuICAgIC8vIEdpdmUgdGhlIGNoYW5jZSBmb3IgYWxsIGV2ZW50cyB0byBjb21wbGV0ZS5cbiAgICB0aGlzLnNldFJvb3RWaXNpYmlsaXR5KDApO1xuXG4gICAgLy8gRGlzcG9zZSBhbGwgbW9kZWxzLlxuICAgIGZvciAobGV0IGkgPSB0aGlzLm1vZGVsc18ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHRoaXMubW9kZWxzX1tpXS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgLy8gVW5zdWJzY3JpYmUgZXZlcnl0aGluZyBlbHNlLlxuICAgIHRoaXMudW5zdWJzY3JpYmVfLmZvckVhY2goKHVuc3Vic2NyaWJlKSA9PiB7XG4gICAgICB1bnN1YnNjcmliZSgpO1xuICAgIH0pO1xuICAgIHRoaXMudW5zdWJzY3JpYmVfLmxlbmd0aCA9IDA7XG5cbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkXyh0aGlzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hpbGRyZW5fKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW5fLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW5fW2ldLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshVW5saXN0ZW5EZWZ9IGhhbmRsZXJcbiAgICovXG4gIHVuc3Vic2NyaWJlKGhhbmRsZXIpIHtcbiAgICB0aGlzLnVuc3Vic2NyaWJlXy5wdXNoKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzdGFydCB0aW1lIGZyb20gd2hpY2ggYWxsIHZpc2liaWxpdHkgZXZlbnRzIGFuZCB0aW1lcyBhcmUgbWVhc3VyZWQuXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBnZXRTdGFydFRpbWUoKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSB2aXNpYmlsaXR5IHJvb3QgaXMgY3VycmVudGx5IGluIHRoZSBiYWNrZ3JvdW5kLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGlzQmFja2dyb3VuZGVkKCkge31cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdmlzaWJpbGl0eSByb290IGhhcyBiZWVuIGNyZWF0ZWQgaW4gdGhlIGJhY2tncm91bmQgbW9kZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBpc0JhY2tncm91bmRlZEF0U3RhcnQoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb290J3MsIHJvb3QncyBwYXJlbnQncyBhbmQgcm9vdCdzIGNoaWxkcmVuJ3NcbiAgICogbG93ZXN0IG9wYWNpdHkgdmFsdWVcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGdldFJvb3RNaW5PcGFjaXR5KCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm9vdCdzIGxheW91dCByZWN0LlxuICAgKiBAcmV0dXJuIHshLi4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWZ9XG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgZ2V0Um9vdExheW91dEJveCgpIHt9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICovXG4gIGdldFJvb3RWaXNpYmlsaXR5KCkge1xuICAgIGlmICghdGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvb3RWaXNpYmlsaXR5XztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmdldFJvb3RWaXNpYmlsaXR5KCkgPiAwID8gdGhpcy5yb290VmlzaWJpbGl0eV8gOiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2aXNpYmlsaXR5XG4gICAqL1xuICBzZXRSb290VmlzaWJpbGl0eSh2aXNpYmlsaXR5KSB7XG4gICAgdGhpcy5yb290VmlzaWJpbGl0eV8gPSB2aXNpYmlsaXR5O1xuICAgIHRoaXMudXBkYXRlTW9kZWxzXygpO1xuICAgIGlmICh0aGlzLmNoaWxkcmVuXykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNoaWxkcmVuXy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmNoaWxkcmVuX1tpXS51cGRhdGVNb2RlbHNfKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgbWF4aW11bSBhbW91bnQgdGhhdCB0aGUgdXNlciBoYXMgc2Nyb2xsZWQgZG93biB0aGUgcGFnZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXG4gICAqL1xuICBtYXliZVVwZGF0ZU1heFNjcm9sbERlcHRoKGRlcHRoKSB7XG4gICAgaWYgKGRlcHRoID4gdGhpcy5tYXhTY3JvbGxEZXB0aF8pIHtcbiAgICAgIHRoaXMubWF4U2Nyb2xsRGVwdGhfID0gZGVwdGg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1heGltdW0gYW1vdW50IHRoYXQgdGhlIHVzZXIgaGFzIHNjcm9sbGVkIGRvd24gdGhlIHBhZ2UuXG4gICAqIEByZXR1cm4ge251bWJlcn0gZGVwdGhcbiAgICovXG4gIGdldE1heFNjcm9sbERlcHRoKCkge1xuICAgIHJldHVybiB0aGlzLm1heFNjcm9sbERlcHRoXztcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICB1cGRhdGVNb2RlbHNfKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tb2RlbHNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLm1vZGVsc19baV0udXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbnMgdG8gdGhlIHZpc2liaWxpdHkgZXZlbnRzIG9uIHRoZSByb290IGFzIHRoZSB3aG9sZSBhbmQgdGhlIGdpdmVuXG4gICAqIHZpc2liaWxpdHkgc3BlYy4gVGhlIHZpc2liaWxpdHkgdHJhY2tpbmcgY2FuIGJlIGRlZmVycmVkIHVudGlsXG4gICAqIGByZWFkeVByb21pc2VgIGlzIHJlc29sdmVkLCBpZiBzcGVjaWZpZWQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHNwZWNcbiAgICogQHBhcmFtIHs/UHJvbWlzZX0gcmVhZHlQcm9taXNlXG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9uKCk6IVByb21pc2V9IGNyZWF0ZVJlcG9ydFByb21pc2VGdW5jXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUpzb25PYmplY3QpfSBjYWxsYmFja1xuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBsaXN0ZW5Sb290KHNwZWMsIHJlYWR5UHJvbWlzZSwgY3JlYXRlUmVwb3J0UHJvbWlzZUZ1bmMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgY2FsY1Zpc2liaWxpdHkgPSB0aGlzLmdldFJvb3RWaXNpYmlsaXR5LmJpbmQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlTW9kZWxBbmRMaXN0ZW5fKFxuICAgICAgY2FsY1Zpc2liaWxpdHksXG4gICAgICBzcGVjLFxuICAgICAgcmVhZHlQcm9taXNlLFxuICAgICAgY3JlYXRlUmVwb3J0UHJvbWlzZUZ1bmMsXG4gICAgICBjYWxsYmFja1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVucyB0byB0aGUgdmlzaWJpbGl0eSBldmVudHMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBhbmQgdGhlIGdpdmVuXG4gICAqIHZpc2liaWxpdHkgc3BlYy4gVGhlIHZpc2liaWxpdHkgdHJhY2tpbmcgY2FuIGJlIGRlZmVycmVkIHVudGlsXG4gICAqIGByZWFkeVByb21pc2VgIGlzIHJlc29sdmVkLCBpZiBzcGVjaWZpZWQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gc3BlY1xuICAgKiBAcGFyYW0gez9Qcm9taXNlfSByZWFkeVByb21pc2VcbiAgICogQHBhcmFtIHs/ZnVuY3Rpb24oKTohUHJvbWlzZX0gY3JlYXRlUmVwb3J0UHJvbWlzZUZ1bmNcbiAgICogQHBhcmFtIHtmdW5jdGlvbighSnNvbk9iamVjdCl9IGNhbGxiYWNrXG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIGxpc3RlbkVsZW1lbnQoXG4gICAgZWxlbWVudCxcbiAgICBzcGVjLFxuICAgIHJlYWR5UHJvbWlzZSxcbiAgICBjcmVhdGVSZXBvcnRQcm9taXNlRnVuYyxcbiAgICBjYWxsYmFja1xuICApIHtcbiAgICBjb25zdCBjYWxjVmlzaWJpbGl0eSA9IHRoaXMuZ2V0RWxlbWVudFZpc2liaWxpdHkuYmluZCh0aGlzLCBlbGVtZW50KTtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVNb2RlbEFuZExpc3Rlbl8oXG4gICAgICBjYWxjVmlzaWJpbGl0eSxcbiAgICAgIHNwZWMsXG4gICAgICByZWFkeVByb21pc2UsXG4gICAgICBjcmVhdGVSZXBvcnRQcm9taXNlRnVuYyxcbiAgICAgIGNhbGxiYWNrLFxuICAgICAgZWxlbWVudFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHZpc2liaWxpdHlNb2RlbCBhbmQgbGlzdGVuIHRvIHZpc2libGUgZXZlbnRzLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6bnVtYmVyfSBjYWxjVmlzaWJpbGl0eVxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBzcGVjXG4gICAqIEBwYXJhbSB7P1Byb21pc2V9IHJlYWR5UHJvbWlzZVxuICAgKiBAcGFyYW0gez9mdW5jdGlvbigpOiFQcm9taXNlfSBjcmVhdGVSZXBvcnRQcm9taXNlRnVuY1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFKc29uT2JqZWN0KX0gY2FsbGJhY2tcbiAgICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9lbGVtZW50XG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIGNyZWF0ZU1vZGVsQW5kTGlzdGVuXyhcbiAgICBjYWxjVmlzaWJpbGl0eSxcbiAgICBzcGVjLFxuICAgIHJlYWR5UHJvbWlzZSxcbiAgICBjcmVhdGVSZXBvcnRQcm9taXNlRnVuYyxcbiAgICBjYWxsYmFjayxcbiAgICBvcHRfZWxlbWVudFxuICApIHtcbiAgICBpZiAoXG4gICAgICBzcGVjWyd2aXNpYmxlUGVyY2VudGFnZVRocmVzaG9sZHMnXSAmJlxuICAgICAgc3BlY1sndmlzaWJsZVBlcmNlbnRhZ2VNaW4nXSA9PSB1bmRlZmluZWQgJiZcbiAgICAgIHNwZWNbJ3Zpc2libGVQZXJjZW50YWdlTWF4J10gPT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICBjb25zdCB1bmxpc3RlbmVycyA9IFtdO1xuICAgICAgY29uc3QgcmFuZ2VzID0gc3BlY1sndmlzaWJsZVBlcmNlbnRhZ2VUaHJlc2hvbGRzJ107XG4gICAgICBpZiAoIXJhbmdlcyB8fCAhaXNBcnJheShyYW5nZXMpKSB7XG4gICAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdpbnZhbGlkIHZpc2libGVQZXJjZW50YWdlVGhyZXNob2xkcycpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge307XG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwZXJjZW50cyA9IHJhbmdlc1tpXTtcbiAgICAgICAgaWYgKCFpc0FycmF5KHBlcmNlbnRzKSB8fCBwZXJjZW50cy5sZW5ndGggIT0gMikge1xuICAgICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICd2aXNpYmxlUGVyY2VudGFnZVRocmVzaG9sZHMgZW50cnkgbGVuZ3RoIGlzIG5vdCAyJ1xuICAgICAgICAgICk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0Zpbml0ZU51bWJlcihwZXJjZW50c1swXSkgfHwgIWlzRmluaXRlTnVtYmVyKHBlcmNlbnRzWzFdKSkge1xuICAgICAgICAgIC8vIG5vdCB2YWxpZCBudW1iZXJcbiAgICAgICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAndmlzaWJsZVBlcmNlbnRhZ2VUaHJlc2hvbGRzIGVudHJ5IGlzIG5vdCB2YWxpZCBudW1iZXInXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtaW4gPSBOdW1iZXIocGVyY2VudHNbMF0pO1xuICAgICAgICBjb25zdCBtYXggPSBOdW1iZXIocGVyY2VudHNbMV0pO1xuICAgICAgICAvLyBNaW4gYW5kIG1heCBtdXN0IGJlIHZhbGlkIHBlcmNlbnRhZ2VzLiBNaW4gbWF5IG5vdCBiZSBtb3JlIHRoYW4gbWF4LlxuICAgICAgICAvLyBNYXggaXMgaW5jbHVzaXZlLiBNaW4gaXMgdXN1YWxseSBleGNsdXNpdmUsIGJ1dCB0aGVyZSBhcmUgdHdvXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZXM6IGlmIG1pbiBhbmQgbWF4IGFyZSBib3RoIDAsIG9yIGJvdGggMTAwLCB0aGVuIGJvdGhcbiAgICAgICAgLy8gYXJlIGluY2x1c2l2ZS4gT3RoZXJ3aXNlIGl0IHdvdWxkIG5vdCBiZSBwb3NzaWJsZSB0byB0cmlnZ2VyIGFuXG4gICAgICAgIC8vIGV2ZW50IG9uIGV4YWN0bHkgMCUgb3IgMTAwJS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIG1pbiA8IDAgfHxcbiAgICAgICAgICBtYXggPiAxMDAgfHxcbiAgICAgICAgICBtaW4gPiBtYXggfHxcbiAgICAgICAgICAobWluID09IG1heCAmJiBtaW4gIT0gMTAwICYmIG1heCAhPSAwKVxuICAgICAgICApIHtcbiAgICAgICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAndmlzaWJsZVBlcmNlbnRhZ2VUaHJlc2hvbGRzIGVudHJ5IGludmFsaWQgbWluL21heCB2YWx1ZSdcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld1NwZWMgPSBzcGVjO1xuICAgICAgICBuZXdTcGVjWyd2aXNpYmxlUGVyY2VudGFnZU1pbiddID0gbWluO1xuICAgICAgICBuZXdTcGVjWyd2aXNpYmxlUGVyY2VudGFnZU1heCddID0gbWF4O1xuICAgICAgICBjb25zdCBtb2RlbCA9IG5ldyBWaXNpYmlsaXR5TW9kZWwoXG4gICAgICAgICAgbmV3U3BlYyxcbiAgICAgICAgICBjYWxjVmlzaWJpbGl0eSxcbiAgICAgICAgICAvKiogQHR5cGUgez8uLi8uLi8uLi9zcmMvc2VydmljZS92aWV3cG9ydC92aWV3cG9ydC1pbXBsLlZpZXdwb3J0SW1wbH0gKi9cbiAgICAgICAgICAoU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5hbXBkb2MpKVxuICAgICAgICApO1xuICAgICAgICB1bmxpc3RlbmVycy5wdXNoKFxuICAgICAgICAgIHRoaXMubGlzdGVuXyhcbiAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgc3BlYyxcbiAgICAgICAgICAgIHJlYWR5UHJvbWlzZSxcbiAgICAgICAgICAgIGNyZWF0ZVJlcG9ydFByb21pc2VGdW5jLFxuICAgICAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgICAgICBvcHRfZWxlbWVudFxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIHVubGlzdGVuZXJzLmZvckVhY2goKHVubGlzdGVuZXIpID0+IHVubGlzdGVuZXIoKSk7XG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBtb2RlbCA9IG5ldyBWaXNpYmlsaXR5TW9kZWwoXG4gICAgICBzcGVjLFxuICAgICAgY2FsY1Zpc2liaWxpdHksXG4gICAgICAvKiogQHR5cGUgez8uLi8uLi8uLi9zcmMvc2VydmljZS92aWV3cG9ydC92aWV3cG9ydC1pbXBsLlZpZXdwb3J0SW1wbH0gKi9cbiAgICAgIChTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmFtcGRvYykpXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5saXN0ZW5fKFxuICAgICAgbW9kZWwsXG4gICAgICBzcGVjLFxuICAgICAgcmVhZHlQcm9taXNlLFxuICAgICAgY3JlYXRlUmVwb3J0UHJvbWlzZUZ1bmMsXG4gICAgICBjYWxsYmFjayxcbiAgICAgIG9wdF9lbGVtZW50XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFWaXNpYmlsaXR5TW9kZWx9IG1vZGVsXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHNwZWNcbiAgICogQHBhcmFtIHs/UHJvbWlzZX0gcmVhZHlQcm9taXNlXG4gICAqIEBwYXJhbSB7P2Z1bmN0aW9uKCk6IVByb21pc2V9IGNyZWF0ZVJlcG9ydFByb21pc2VGdW5jXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUpzb25PYmplY3QpfSBjYWxsYmFja1xuICAgKiBAcGFyYW0geyFFbGVtZW50PX0gb3B0X2VsZW1lbnRcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbGlzdGVuXyhcbiAgICBtb2RlbCxcbiAgICBzcGVjLFxuICAgIHJlYWR5UHJvbWlzZSxcbiAgICBjcmVhdGVSZXBvcnRQcm9taXNlRnVuYyxcbiAgICBjYWxsYmFjayxcbiAgICBvcHRfZWxlbWVudFxuICApIHtcbiAgICBpZiAoY3JlYXRlUmVwb3J0UHJvbWlzZUZ1bmMpIHtcbiAgICAgIG1vZGVsLnNldFJlcG9ydFJlYWR5KGNyZWF0ZVJlcG9ydFByb21pc2VGdW5jKTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3cG9ydCA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jKTtcbiAgICBjb25zdCBzY3JvbGxEZXB0aCA9IHZpZXdwb3J0LmdldFNjcm9sbFRvcCgpO1xuICAgIHRoaXMubWF5YmVVcGRhdGVNYXhTY3JvbGxEZXB0aChzY3JvbGxEZXB0aCk7XG5cbiAgICAvLyBCbG9jayB2aXNpYmlsaXR5LlxuICAgIGlmIChyZWFkeVByb21pc2UpIHtcbiAgICAgIG1vZGVsLnNldFJlYWR5KGZhbHNlKTtcbiAgICAgIHJlYWR5UHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgbW9kZWwuc2V0UmVhZHkodHJ1ZSk7XG4gICAgICAgIG1vZGVsLm1heWJlU2V0SW5pdGlhbFNjcm9sbERlcHRoKHNjcm9sbERlcHRoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBtb2RlbC5tYXliZVNldEluaXRpYWxTY3JvbGxEZXB0aChzY3JvbGxEZXB0aCk7XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyB0aGUgZXZlbnQuXG4gICAgbW9kZWwub25UcmlnZ2VyRXZlbnQoKCkgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRUaW1lID0gdGhpcy5nZXRTdGFydFRpbWUoKTtcbiAgICAgIGNvbnN0IHN0YXRlID0gbW9kZWwuZ2V0U3RhdGUoc3RhcnRUaW1lKTtcblxuICAgICAgLy8gQWRkaXRpb25hbCBkb2MtbGV2ZWwgc3RhdGUuXG4gICAgICBzdGF0ZVsnYmFja2dyb3VuZGVkJ10gPSB0aGlzLmlzQmFja2dyb3VuZGVkKCkgPyAxIDogMDtcbiAgICAgIHN0YXRlWydiYWNrZ3JvdW5kZWRBdFN0YXJ0J10gPSB0aGlzLmlzQmFja2dyb3VuZGVkQXRTdGFydCgpID8gMSA6IDA7XG4gICAgICBzdGF0ZVsndG90YWxUaW1lJ10gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAvLyBPcHRpb25hbGx5LCBlbGVtZW50LWxldmVsIHN0YXRlLlxuICAgICAgbGV0IGxheW91dEJveDtcbiAgICAgIGlmIChvcHRfZWxlbWVudCkge1xuICAgICAgICBzdGF0ZVsnZWxlbWVudElkJ10gPSBvcHRfZWxlbWVudC5pZDtcbiAgICAgICAgc3RhdGVbJ29wYWNpdHknXSA9IGdldE1pbk9wYWNpdHkob3B0X2VsZW1lbnQpO1xuICAgICAgICBsYXlvdXRCb3ggPSB2aWV3cG9ydC5nZXRMYXlvdXRSZWN0KG9wdF9lbGVtZW50KTtcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uUmF0aW8gPSB0aGlzLmdldEVsZW1lbnRWaXNpYmlsaXR5KG9wdF9lbGVtZW50KTtcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uUmVjdCA9IHRoaXMuZ2V0RWxlbWVudEludGVyc2VjdGlvblJlY3Qob3B0X2VsZW1lbnQpO1xuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGRpY3Qoe1xuICAgICAgICAgICAgJ2ludGVyc2VjdGlvblJhdGlvJzogaW50ZXJzZWN0aW9uUmF0aW8sXG4gICAgICAgICAgICAnaW50ZXJzZWN0aW9uUmVjdCc6IEpTT04uc3RyaW5naWZ5KGludGVyc2VjdGlvblJlY3QpLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0ZVsnb3BhY2l0eSddID0gdGhpcy5nZXRSb290TWluT3BhY2l0eSgpO1xuICAgICAgICBzdGF0ZVsnaW50ZXJzZWN0aW9uUmF0aW8nXSA9IHRoaXMuZ2V0Um9vdFZpc2liaWxpdHkoKTtcbiAgICAgICAgbGF5b3V0Qm94ID0gdGhpcy5nZXRSb290TGF5b3V0Qm94KCk7XG4gICAgICB9XG4gICAgICBtb2RlbC5tYXliZURpc3Bvc2UoKTtcblxuICAgICAgaWYgKGxheW91dEJveCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgIGRpY3Qoe1xuICAgICAgICAgICAgJ2VsZW1lbnRYJzogbGF5b3V0Qm94LmxlZnQsXG4gICAgICAgICAgICAnZWxlbWVudFknOiBsYXlvdXRCb3gudG9wLFxuICAgICAgICAgICAgJ2VsZW1lbnRXaWR0aCc6IGxheW91dEJveC53aWR0aCxcbiAgICAgICAgICAgICdlbGVtZW50SGVpZ2h0JzogbGF5b3V0Qm94LmhlaWdodCxcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgICBzdGF0ZVsnaW5pdGlhbFNjcm9sbERlcHRoJ10gPSBsYXlvdXRQb3NpdGlvblJlbGF0aXZlVG9TY3JvbGxlZFZpZXdwb3J0KFxuICAgICAgICAgIGxheW91dEJveCxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBtb2RlbC5nZXRJbml0aWFsU2Nyb2xsRGVwdGgoKVxuICAgICAgICApO1xuICAgICAgICBzdGF0ZVsnbWF4U2Nyb2xsRGVwdGgnXSA9IGxheW91dFBvc2l0aW9uUmVsYXRpdmVUb1Njcm9sbGVkVmlld3BvcnQoXG4gICAgICAgICAgbGF5b3V0Qm94LFxuICAgICAgICAgIHZpZXdwb3J0LFxuICAgICAgICAgIHRoaXMuZ2V0TWF4U2Nyb2xsRGVwdGgoKVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY2FsbGJhY2soc3RhdGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5tb2RlbHNfLnB1c2gobW9kZWwpO1xuICAgIG1vZGVsLnVuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5tb2RlbHNfLmluZGV4T2YobW9kZWwpO1xuICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgIHRoaXMubW9kZWxzXy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gT2JzZXJ2ZSB0aGUgZWxlbWVudCB2aWEgSW5PYi5cbiAgICBpZiAob3B0X2VsZW1lbnQpIHtcbiAgICAgIC8vIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhpcyBoYXBwZW5zIGFmdGVyIGFsbCB0aGUgc2V0dXAgaXMgZG9uZSwgYi9jXG4gICAgICAvLyBpbnRlcnNlY3Rpb24gb2JzZXJ2ZXIgY2FuIGZpcmUgaW1tZWRpZGF0ZWx5LiBQZXIgc3BlYywgdGhpcyBzaG91bGRcbiAgICAgIC8vIE5PVCBoYXBwZW4uIEhvd2V2ZXIsIGFsbCBvZiB0aGUgZXhpc3RpbmcgSW5PYiBwb2x5ZmlsbHMsIGFzIHdlbGwgYXNcbiAgICAgIC8vIHNvbWUgdmVyc2lvbnMgb2YgbmF0aXZlIGltcGxlbWVudGF0aW9ucywgbWFrZSB0aGlzIG1pc3Rha2UuXG4gICAgICBtb2RlbC51bnN1YnNjcmliZSh0aGlzLm9ic2VydmUob3B0X2VsZW1lbnQsICgpID0+IG1vZGVsLnVwZGF0ZSgpKSk7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdXBkYXRlLlxuICAgIG1vZGVsLnVwZGF0ZSgpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBtb2RlbC5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPYnNlcnZlcyB0aGUgaW50ZXJzZWN0aW9ucyBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW4gdGhlIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSB1bnVzZWRFbGVtZW50XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24obnVtYmVyKX0gdW51c2VkTGlzdGVuZXJcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgb2JzZXJ2ZSh1bnVzZWRFbGVtZW50LCB1bnVzZWRMaXN0ZW5lcikge31cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdW51c2VkRWxlbWVudFxuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgZ2V0RWxlbWVudFZpc2liaWxpdHkodW51c2VkRWxlbWVudCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdW51c2VkRWxlbWVudFxuICAgKiBAcmV0dXJuIHs/SnNvbk9iamVjdH1cbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBnZXRFbGVtZW50SW50ZXJzZWN0aW9uUmVjdCh1bnVzZWRFbGVtZW50KSB7fVxufVxuXG4vKipcbiAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBgVmlzaWJpbGl0eU1hbmFnZXJgIGZvciBhbiBBTVAgZG9jdW1lbnQuIFR3b1xuICogZGlzdGluY3QgbW9kZXMgYXJlIHN1cHBvcnRlZDogdGhlIG1haW4gQU1QIGRvYyBhbmQgYSBpbi1hLWJveCBkb2MuXG4gKi9cbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5TWFuYWdlckZvckRvYyBleHRlbmRzIFZpc2liaWxpdHlNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICBzdXBlcigvKiBwYXJlbnQgKi8gbnVsbCwgYW1wZG9jKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLnZpZXdwb3J0XyA9IFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKGFtcGRvYyk7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5iYWNrZ3JvdW5kZWRfID0gIWFtcGRvYy5pc1Zpc2libGUoKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5iYWNrZ3JvdW5kZWRBdFN0YXJ0XyA9IHRoaXMuaXNCYWNrZ3JvdW5kZWQoKTtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdFxuICAgICAqIEBwcml2YXRlIHshT2JqZWN0PG51bWJlciwge1xuICAgICAqICAgZWxlbWVudDogIUVsZW1lbnQsXG4gICAgICogICBpbnRlcnNlY3Rpb25SYXRpbzogbnVtYmVyLFxuICAgICAqICAgaXNWaXNpYmxlOiBib29sZWFuLFxuICAgICAqICAgYm91bmRpbmdDbGllbnRSZWN0OiA/Li4vLi4vLi4vc3JjL2xheW91dC1yZWN0LkxheW91dFJlY3REZWYsXG4gICAgICogICBsaXN0ZW5lcnM6ICFBcnJheTxmdW5jdGlvbihudW1iZXIpPlxuICAgICAqIH0+fVxuICAgICAqL1xuICAgIHRoaXMudHJhY2tlZEVsZW1lbnRzXyA9IG1hcCgpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/SW50ZXJzZWN0aW9uT2JzZXJ2ZXJ9ICovXG4gICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8gPSBudWxsO1xuXG4gICAgaWYgKGdldE1vZGUodGhpcy5hbXBkb2Mud2luKS5ydW50aW1lID09ICdpbmFib3gnKSB7XG4gICAgICAvLyBJbi1hLWJveDogdmlzaWJpbGl0eSBkZXBlbmRzIG9uIHRoZSBJbk9iLlxuICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuYW1wZG9jLmdldFJvb3ROb2RlKCk7XG4gICAgICBjb25zdCByb290RWxlbWVudCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICAgIHJvb3QuZG9jdW1lbnRFbGVtZW50IHx8IHJvb3QuYm9keSB8fCByb290XG4gICAgICApO1xuICAgICAgdGhpcy51bnN1YnNjcmliZShcbiAgICAgICAgdGhpcy5vYnNlcnZlKHJvb3RFbGVtZW50LCB0aGlzLnNldFJvb3RWaXNpYmlsaXR5LmJpbmQodGhpcykpXG4gICAgICApO1xuICAgICAgLy8gT2JzZXJ2ZSBpbmFib3ggd2luZG93IHJlc2l6ZSBldmVudC5cbiAgICAgIGNvbnN0IHJlc2l6ZUxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBpZCA9IGdldEVsZW1lbnRJZChyb290RWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHRyYWNrZWRSb290ID0gdGhpcy50cmFja2VkRWxlbWVudHNfW2lkXTtcbiAgICAgICAgaWYgKCF0cmFja2VkUm9vdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5hbXBkb2Mud2luLi8qT0sqLyBpbm5lckhlaWdodCA8IDEgfHxcbiAgICAgICAgICB0aGlzLmFtcGRvYy53aW4uLypPSyovIGlubmVyV2lkdGggPCAxXG4gICAgICAgICkge1xuICAgICAgICAgIHRyYWNrZWRSb290LmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyYWNrZWRSb290LmlzVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRSb290VmlzaWJpbGl0eShcbiAgICAgICAgICB0cmFja2VkUm9vdC5pc1Zpc2libGUgPyB0cmFja2VkUm9vdC5pbnRlcnNlY3Rpb25SYXRpbyA6IDBcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmFtcGRvYy53aW4uYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplTGlzdGVuZXIpO1xuXG4gICAgICB0aGlzLnVuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5hbXBkb2Mud2luLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUxpc3RlbmVyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBNYWluIGRvY3VtZW50OiB2aXNpYmlsaXR5IGlzIGJhc2VkIG9uIHRoZSBhbXBkb2MuXG4gICAgICB0aGlzLnNldFJvb3RWaXNpYmlsaXR5KHRoaXMuYW1wZG9jLmlzVmlzaWJsZSgpID8gMSA6IDApO1xuICAgICAgdGhpcy51bnN1YnNjcmliZShcbiAgICAgICAgdGhpcy5hbXBkb2Mub25WaXNpYmlsaXR5Q2hhbmdlZCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgaXNWaXNpYmxlID0gdGhpcy5hbXBkb2MuaXNWaXNpYmxlKCk7XG4gICAgICAgICAgaWYgKCFpc1Zpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZGVkXyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2V0Um9vdFZpc2liaWxpdHkoaXNWaXNpYmxlID8gMSA6IDApO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyXykge1xuICAgICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8uZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0U3RhcnRUaW1lKCkge1xuICAgIHJldHVybiBkZXYoKS5hc3NlcnROdW1iZXIodGhpcy5hbXBkb2MuZ2V0Rmlyc3RWaXNpYmxlVGltZSgpKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNCYWNrZ3JvdW5kZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja2dyb3VuZGVkXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNCYWNrZ3JvdW5kZWRBdFN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLmJhY2tncm91bmRlZEF0U3RhcnRfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290TWluT3BhY2l0eSgpIHtcbiAgICBjb25zdCByb290ID0gdGhpcy5hbXBkb2MuZ2V0Um9vdE5vZGUoKTtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICByb290LmRvY3VtZW50RWxlbWVudCB8fCByb290LmJvZHkgfHwgcm9vdFxuICAgICk7XG4gICAgcmV0dXJuIGdldE1pbk9wYWNpdHkocm9vdEVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290TGF5b3V0Qm94KCkge1xuICAgIC8vIFRoaXMgY29kZSBpcyB0aGUgc2FtZSBmb3IgXCJpbi1hLWJveFwiIGFuZCBzdGFuZGFsb25lIGRvYy5cbiAgICBjb25zdCByb290ID0gdGhpcy5hbXBkb2MuZ2V0Um9vdE5vZGUoKTtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICByb290LmRvY3VtZW50RWxlbWVudCB8fCByb290LmJvZHkgfHwgcm9vdFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMudmlld3BvcnRfLmdldExheW91dFJlY3Qocm9vdEVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvYnNlcnZlKGVsZW1lbnQsIGxpc3RlbmVyKSB7XG4gICAgY29uc3QgaWQgPSBnZXRFbGVtZW50SWQoZWxlbWVudCk7XG4gICAgbGV0IHRyYWNrZWRFbGVtZW50ID0gdGhpcy50cmFja2VkRWxlbWVudHNfW2lkXTtcbiAgICBpZiAoIXRyYWNrZWRFbGVtZW50KSB7XG4gICAgICB0cmFja2VkRWxlbWVudCA9IHtcbiAgICAgICAgZWxlbWVudCxcbiAgICAgICAgaW50ZXJzZWN0aW9uUmF0aW86IDAsXG4gICAgICAgIGludGVyc2VjdGlvblJlY3Q6IG51bGwsXG4gICAgICAgIGlzVmlzaWJsZTogZmFsc2UsXG4gICAgICAgIGJvdW5kaW5nQ2xpZW50UmVjdDogbnVsbCxcbiAgICAgICAgbGlzdGVuZXJzOiBbXSxcbiAgICAgIH07XG4gICAgICB0aGlzLnRyYWNrZWRFbGVtZW50c19baWRdID0gdHJhY2tlZEVsZW1lbnQ7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRyYWNrZWRFbGVtZW50LmludGVyc2VjdGlvblJhdGlvID4gMCAmJlxuICAgICAgdHJhY2tlZEVsZW1lbnQuaXNWaXNpYmxlXG4gICAgKSB7XG4gICAgICAvLyBUaGlzIGhhcyBhbHJlYWR5IGJlZW4gdHJhY2tlZCBhbmQgdGhlIGBpbnRlcnNlY3Rpb25SYXRpb2AgaXMgZnJlc2guXG4gICAgICBsaXN0ZW5lcih0cmFja2VkRWxlbWVudC5pbnRlcnNlY3Rpb25SYXRpbyk7XG4gICAgfVxuICAgIHRyYWNrZWRFbGVtZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB0aGlzLmdldEludGVyc2VjdGlvbk9ic2VydmVyXygpLm9ic2VydmUoZWxlbWVudCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnN0IHRyYWNrZWRFbGVtZW50ID0gdGhpcy50cmFja2VkRWxlbWVudHNfW2lkXTtcbiAgICAgIGlmICh0cmFja2VkRWxlbWVudCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRyYWNrZWRFbGVtZW50Lmxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgICAgdHJhY2tlZEVsZW1lbnQubGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWNrZWRFbGVtZW50Lmxpc3RlbmVycy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgIHRoaXMuaW50ZXJzZWN0aW9uT2JzZXJ2ZXJfLnVub2JzZXJ2ZShlbGVtZW50KTtcbiAgICAgICAgICBkZWxldGUgdGhpcy50cmFja2VkRWxlbWVudHNfW2lkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEVsZW1lbnRWaXNpYmlsaXR5KGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy5nZXRSb290VmlzaWJpbGl0eSgpID09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBjb25zdCBpZCA9IGdldEVsZW1lbnRJZChlbGVtZW50KTtcbiAgICBjb25zdCB0cmFja2VkRWxlbWVudCA9IHRoaXMudHJhY2tlZEVsZW1lbnRzX1tpZF07XG4gICAgcmV0dXJuIChcbiAgICAgICh0cmFja2VkRWxlbWVudCAmJlxuICAgICAgICB0cmFja2VkRWxlbWVudC5pc1Zpc2libGUgJiZcbiAgICAgICAgdHJhY2tlZEVsZW1lbnQuaW50ZXJzZWN0aW9uUmF0aW8pIHx8XG4gICAgICAwXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbnRlcnNlY3Rpb24gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHs/SnNvbk9iamVjdH1cbiAgICovXG4gIGdldEVsZW1lbnRJbnRlcnNlY3Rpb25SZWN0KGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy5nZXRFbGVtZW50VmlzaWJpbGl0eShlbGVtZW50KSA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBnZXRFbGVtZW50SWQoZWxlbWVudCk7XG4gICAgY29uc3QgdHJhY2tlZEVsZW1lbnQgPSB0aGlzLnRyYWNrZWRFbGVtZW50c19baWRdO1xuICAgIGlmICh0cmFja2VkRWxlbWVudCkge1xuICAgICAgcmV0dXJuIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh0cmFja2VkRWxlbWVudC5pbnRlcnNlY3Rpb25SZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUludGVyc2VjdGlvbk9ic2VydmVyfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0SW50ZXJzZWN0aW9uT2JzZXJ2ZXJfKCkge1xuICAgIGlmICghdGhpcy5pbnRlcnNlY3Rpb25PYnNlcnZlcl8pIHtcbiAgICAgIGNvbnN0IHt3aW59ID0gdGhpcy5hbXBkb2M7XG4gICAgICB0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyXyA9IG5ldyB3aW4uSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoXG4gICAgICAgIHRoaXMub25JbnRlcnNlY3Rpb25DaGFuZ2VzXy5iaW5kKHRoaXMpLFxuICAgICAgICB7dGhyZXNob2xkOiBERUZBVUxUX1RIUkVTSE9MRH1cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmludGVyc2VjdGlvbk9ic2VydmVyXztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBcnJheTwhSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeT59IGVudHJpZXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uSW50ZXJzZWN0aW9uQ2hhbmdlc18oZW50cmllcykge1xuICAgIGVudHJpZXMuZm9yRWFjaCgoY2hhbmdlKSA9PiB7XG4gICAgICBsZXQgaW50ZXJzZWN0aW9uID0gY2hhbmdlLmludGVyc2VjdGlvblJlY3Q7XG4gICAgICAvLyBJbnRlcnNlY3Rpb25SZWN0IHR5cGUgbm93IGNoYW5nZWQgZnJvbSBDbGllbnRSZWN0IHRvIERPTVJlY3RSZWFkT25seS5cbiAgICAgIC8vIFRPRE8oQHpob3V5eCk6IEZpeCBhbGwgSW5PYiByZWxhdGVkIHR5cGUuXG4gICAgICBpbnRlcnNlY3Rpb24gPSBsYXlvdXRSZWN0THR3aChcbiAgICAgICAgTnVtYmVyKGludGVyc2VjdGlvbi5sZWZ0KSxcbiAgICAgICAgTnVtYmVyKGludGVyc2VjdGlvbi50b3ApLFxuICAgICAgICBOdW1iZXIoaW50ZXJzZWN0aW9uLndpZHRoKSxcbiAgICAgICAgTnVtYmVyKGludGVyc2VjdGlvbi5oZWlnaHQpXG4gICAgICApO1xuICAgICAgbGV0IHtib3VuZGluZ0NsaWVudFJlY3R9ID0gY2hhbmdlO1xuICAgICAgYm91bmRpbmdDbGllbnRSZWN0ID1cbiAgICAgICAgYm91bmRpbmdDbGllbnRSZWN0ICYmXG4gICAgICAgIGxheW91dFJlY3RMdHdoKFxuICAgICAgICAgIE51bWJlcihib3VuZGluZ0NsaWVudFJlY3QubGVmdCksXG4gICAgICAgICAgTnVtYmVyKGJvdW5kaW5nQ2xpZW50UmVjdC50b3ApLFxuICAgICAgICAgIE51bWJlcihib3VuZGluZ0NsaWVudFJlY3Qud2lkdGgpLFxuICAgICAgICAgIE51bWJlcihib3VuZGluZ0NsaWVudFJlY3QuaGVpZ2h0KVxuICAgICAgICApO1xuICAgICAgdGhpcy5vbkludGVyc2VjdGlvbkNoYW5nZV8oXG4gICAgICAgIGNoYW5nZS50YXJnZXQsXG4gICAgICAgIGNoYW5nZS5pbnRlcnNlY3Rpb25SYXRpbyxcbiAgICAgICAgaW50ZXJzZWN0aW9uLFxuICAgICAgICBib3VuZGluZ0NsaWVudFJlY3RcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshRWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbnRlcnNlY3Rpb25SYXRpb1xuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn0gaW50ZXJzZWN0aW9uUmVjdFxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn0gYm91bmRpbmdDbGllbnRSZWN0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkludGVyc2VjdGlvbkNoYW5nZV8oXG4gICAgdGFyZ2V0LFxuICAgIGludGVyc2VjdGlvblJhdGlvLFxuICAgIGludGVyc2VjdGlvblJlY3QsXG4gICAgYm91bmRpbmdDbGllbnRSZWN0XG4gICkge1xuICAgIGludGVyc2VjdGlvblJhdGlvID0gTWF0aC5taW4oTWF0aC5tYXgoaW50ZXJzZWN0aW9uUmF0aW8sIDApLCAxKTtcbiAgICBjb25zdCBpZCA9IGdldEVsZW1lbnRJZCh0YXJnZXQpO1xuICAgIGNvbnN0IHRyYWNrZWRFbGVtZW50ID0gdGhpcy50cmFja2VkRWxlbWVudHNfW2lkXTtcblxuICAgIC8vIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gdGhlIEluT2IgdjIgaXNWaXNpYmxlIGRlZmluaXRpb24uXG4gICAgLy8gaXNWaXNpYmxlIGhlcmUgb25seSBjaGVja3MgZm9yIGVsZW1lbnQgc2l6ZVxuICAgIGxldCBpc1Zpc2libGUgPSB0cnVlO1xuXG4gICAgaWYgKGJvdW5kaW5nQ2xpZW50UmVjdC53aWR0aCA8IDEgfHwgYm91bmRpbmdDbGllbnRSZWN0LmhlaWdodCA8IDEpIHtcbiAgICAgIC8vIFNldCBpc1Zpc2libGUgdG8gZmFsc2Ugd2hlbiB0aGUgZWxlbWVudCBpcyBub3QgdmlzaWJsZS5cbiAgICAgIC8vIFVzZSA8IDEgYmVjYXVzZSB0aGUgd2lkdGgvaGVpZ2h0IGNhblxuICAgICAgLy8gYmUgYSBkb3VibGUgdmFsdWUgb24gaGlnaCByZXNvbHV0aW9uIHNjcmVlblxuICAgICAgaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0cmFja2VkRWxlbWVudCkge1xuICAgICAgdHJhY2tlZEVsZW1lbnQuaXNWaXNpYmxlID0gaXNWaXNpYmxlO1xuICAgICAgdHJhY2tlZEVsZW1lbnQuaW50ZXJzZWN0aW9uUmF0aW8gPSBpbnRlcnNlY3Rpb25SYXRpbztcbiAgICAgIHRyYWNrZWRFbGVtZW50LmludGVyc2VjdGlvblJlY3QgPSBpbnRlcnNlY3Rpb25SZWN0O1xuICAgICAgdHJhY2tlZEVsZW1lbnQuYm91bmRpbmdDbGllbnRSZWN0ID0gYm91bmRpbmdDbGllbnRSZWN0O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmFja2VkRWxlbWVudC5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdHJhY2tlZEVsZW1lbnQubGlzdGVuZXJzW2ldKFxuICAgICAgICAgIHRyYWNrZWRFbGVtZW50LmlzVmlzaWJsZSA/IGludGVyc2VjdGlvblJhdGlvIDogMFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiBgVmlzaWJpbGl0eU1hbmFnZXJgIGZvciBhIEZJRSBlbWJlZC4gVGhpcyB2aXNpYmlsaXR5XG4gKiByb290IGRlbGVnYXRlcyBtb3N0IG9mIHRyYWNraW5nIGZ1bmN0aW9ucyB0byBpdHMgcGFyZW50LCB0aGUgYW1wZG9jIHJvb3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5TWFuYWdlckZvckVtYmVkIGV4dGVuZHMgVmlzaWJpbGl0eU1hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHshVmlzaWJpbGl0eU1hbmFnZXJ9IHBhcmVudFxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvZnJpZW5kbHktaWZyYW1lLWVtYmVkLkZyaWVuZGx5SWZyYW1lRW1iZWR9IGVtYmVkXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJlbnQsIGVtYmVkKSB7XG4gICAgc3VwZXIocGFyZW50LCBwYXJlbnQuYW1wZG9jKTtcblxuICAgIC8qKiBAY29uc3QgKi9cbiAgICB0aGlzLmVtYmVkID0gZW1iZWQ7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuYmFja2dyb3VuZGVkQXRTdGFydF8gPSB0aGlzLnBhcmVudC5pc0JhY2tncm91bmRlZCgpO1xuXG4gICAgdGhpcy51bnN1YnNjcmliZShcbiAgICAgIHRoaXMucGFyZW50Lm9ic2VydmUoXG4gICAgICAgIGRldigpLmFzc2VydEVsZW1lbnQoZW1iZWQuaG9zdCksXG4gICAgICAgIHRoaXMuc2V0Um9vdFZpc2liaWxpdHkuYmluZCh0aGlzKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFN0YXJ0VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbWJlZC5nZXRTdGFydFRpbWUoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNCYWNrZ3JvdW5kZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmlzQmFja2dyb3VuZGVkKCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzQmFja2dyb3VuZGVkQXRTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrZ3JvdW5kZWRBdFN0YXJ0XztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Um9vdE1pbk9wYWNpdHkoKSB7XG4gICAgY29uc3Qgcm9vdEVsZW1lbnQgPSBkZXYoKS5hc3NlcnRFbGVtZW50KHRoaXMuZW1iZWQuaWZyYW1lKTtcbiAgICByZXR1cm4gZ2V0TWluT3BhY2l0eShyb290RWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbGF5b3V0IGJveCBvZiB0aGUgZW1iZWRkZWQgZG9jdW1lbnQuIE5vdGUgdGhhdCB0aGlzIG1heSBiZVxuICAgKiBzbWFsbGVyIHRoYW4gdGhlIHNpemUgYWxsb2NhdGVkIGJ5IHRoZSBob3N0LiBJbiB0aGF0IGNhc2UsIHRoZSBkb2N1bWVudFxuICAgKiB3aWxsIGJlIGNlbnRlcmVkLCBhbmQgdGhlIHVuZmlsbGVkIHNwYWNlIHdpbGwgbm90IGJlIHJlZmxlY3RlZCBpbiB0aGlzXG4gICAqIHJldHVybiB2YWx1ZS5cbiAgICogZW1iZWQuaWZyYW1lIGlzIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSByb290IGxheW91dGJveCwgc2luY2UgaXQgaXMgbW9yZVxuICAgKiBpbXBvcnRhbnQgZm9yIHRoZSBlbWJlZGRlZCBkb2N1bWVudCB0byBrbm93IGl0cyBvd24gc2l6ZSwgcmF0aGVyIHRoYW5cbiAgICogdGhlIHNpemUgb2YgdGhlIGhvc3QgcmVjdGFuZ2xlIHdoaWNoIGl0IG1heSBvciBtYXkgbm90IGVudGlyZWx5IGZpbGwuXG4gICAqIGVtYmVkLmhvc3QgaXMgdXNlZCB0byBjYWxjdWxhdGUgdGhlIHJvb3QgdmlzaWJpbGl0eSwgaG93ZXZlciwgc2luY2VcbiAgICogdGhlIHZpc2liaWxpdHkgb2YgdGhlIGhvc3QgZWxlbWVudCBkaXJlY3RseSBkZXRlcm1pbmVzIHRoZSBlbWJlZGRlZFxuICAgKiBkb2N1bWVudCdzIHZpc2liaWxpdHkuXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZ2V0Um9vdExheW91dEJveCgpIHtcbiAgICBjb25zdCByb290RWxlbWVudCA9IGRldigpLmFzc2VydEVsZW1lbnQodGhpcy5lbWJlZC5pZnJhbWUpO1xuICAgIHJldHVybiBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmFtcGRvYykuZ2V0TGF5b3V0UmVjdChyb290RWxlbWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9ic2VydmUoZWxlbWVudCwgbGlzdGVuZXIpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQub2JzZXJ2ZShlbGVtZW50LCBsaXN0ZW5lcik7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldEVsZW1lbnRWaXNpYmlsaXR5KGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy5nZXRSb290VmlzaWJpbGl0eSgpID09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYXJlbnQuZ2V0RWxlbWVudFZpc2liaWxpdHkoZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpbnRlcnNlY3RpbmcgZWxlbWVudC5cbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBnZXRFbGVtZW50SW50ZXJzZWN0aW9uUmVjdChlbGVtZW50KSB7XG4gICAgaWYgKHRoaXMuZ2V0Um9vdFZpc2liaWxpdHkoKSA9PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmdldEVsZW1lbnRJbnRlcnNlY3Rpb25SZWN0KGVsZW1lbnQpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/visibility-manager.js