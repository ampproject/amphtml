function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { ScrollManager } from "./scroll-manager";
import { Services } from "../../../src/service";
import {
closestAncestorElementBySelector,
matches,
scopedQuerySelector } from "../../../src/core/dom/query";

import { dev, user, userAssert } from "../../../src/log";
import { getDataParamsFromAttributes } from "../../../src/core/dom";
import { getMode } from "../../../src/mode";
import { isArray } from "../../../src/core/types";
import { layoutRectLtwh } from "../../../src/core/dom/layout/rect";
import { map } from "../../../src/core/types/object";

import { provideVisibilityManager } from "./visibility-manager";

import { tryResolve } from "../../../src/core/data-structures/promise";
import { whenContentIniLoad } from "../../../src/ini-load";

var TAG = 'amp-analytics/analytics-root';
var VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;

/**
 * An analytics root. Analytics can be scoped to either ampdoc, embed or
 * an arbitrary AMP element.
 *
 * TODO(#22733): merge analytics root properties into ampdoc.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 */
export var AnalyticsRoot = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AnalyticsRoot(ampdoc) {_classCallCheck(this, AnalyticsRoot);
    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.trackers_ = map();

    /** @private {?./visibility-manager.VisibilityManager} */
    this.visibilityManager_ = null;

    /** @private {?./scroll-manager.ScrollManager} */
    this.scrollManager_ = null;
  }

  /** @override */_createClass(AnalyticsRoot, [{ key: "dispose", value:
    function dispose() {
      for (var k in this.trackers_) {
        this.trackers_[k].dispose();
        delete this.trackers_[k];
      }
      if (this.visibilityManager_) {
        this.visibilityManager_.dispose();
      }
      if (this.scrollManager_) {
        this.scrollManager_.dispose();
      }
    }

    /**
     * Returns the type of the tracker.
     * @return {string}
     * @abstract
     */ }, { key: "getType", value:
    function getType() {}

    /**
     * The root node the analytics is scoped to.
     *
     * @return {!Document|!ShadowRoot}
     * @abstract
     */ }, { key: "getRoot", value:
    function getRoot() {}

    /**
     * The viewer of analytics root
     * @return {!../../../src/service/viewer-interface.ViewerInterface}
     */ }, { key: "getViewer", value:
    function getViewer() {
      return Services.viewerForDoc(this.ampdoc);
    }

    /**
     * The root element within the analytics root.
     *
     * @return {!Element}
     */ }, { key: "getRootElement", value:
    function getRootElement() {
      var root = this.getRoot();
      // In the case of a shadow doc, its host will be used as
      // a refrence point
      return (/** @type {!Element} */(
        root.host || root.documentElement || root.body || root));

    }

    /**
     * The host element of the analytics root.
     *
     * @return {?Element}
     * @abstract
     */ }, { key: "getHostElement", value:
    function getHostElement() {}

    /**
     * The signals for the root.
     *
     * @return {!../../../src/utils/signals.Signals}
     * @abstract
     */ }, { key: "signals", value:
    function signals() {}

    /**
     * Whether this analytics root contains the specified node.
     *
     * @param {!Node} node
     * @return {boolean}
     */ }, { key: "contains", value:
    function contains(node) {
      return this.getRoot().contains(node);
    }

    /**
     * Returns the element with the specified ID in the scope of this root.
     *
     * @param {string} unusedId
     * @return {?Element}
     * @abstract
     */ }, { key: "getElementById", value:
    function getElementById(unusedId) {}

    /**
     * Returns the tracker for the specified name and list of allowed types.
     *
     * @param {string} name
     * @param {!Object<string, typeof ./events.EventTracker>} allowlist
     * @return {?./events.EventTracker}
     */ }, { key: "getTrackerForAllowlist", value:
    function getTrackerForAllowlist(name, allowlist) {
      var trackerProfile = allowlist[name];
      if (trackerProfile) {
        return this.getTracker(name, trackerProfile);
      }
      return null;
    }

    /**
     * Returns the tracker for the specified name and type. If the tracker
     * has not been requested before, it will be created.
     *
     * @param {string} name
     * @param {typeof ./events.CustomEventTracker|typeof ./events.ClickEventTracker|typeof ./events.ScrollEventTracker|typeof ./events.SignalTracker|typeof ./events.IniLoadTracker|typeof ./events.VideoEventTracker|typeof ./events.VideoEventTracker|typeof ./events.VisibilityTracker|typeof ./events.AmpStoryEventTracker} klass
     * @return {!./events.EventTracker}
     */ }, { key: "getTracker", value:
    function getTracker(name, klass) {
      var tracker = this.trackers_[name];
      if (!tracker) {
        tracker = new klass(this);
        this.trackers_[name] = tracker;
      }
      return tracker;
    }

    /**
     * Returns the tracker for the specified name or `null`.
     * @param {string} name
     * @return {?./events.EventTracker}
     */ }, { key: "getTrackerOptional", value:
    function getTrackerOptional(name) {
      return this.trackers_[name] || null;
    }

    /**
     * Searches the element that matches the selector within the scope of the
     * analytics root in relationship to the specified context node.
     *
     * @param {!Element} context
     * @param {string} selector DOM query selector.
     * @param {?string=} selectionMethod Allowed values are `null`,
     *   `'closest'` and `'scope'`.
     * @return {!Promise<!Element>} Element corresponding to the selector.
     */ }, { key: "getElement", value:
    function getElement(context, selector) {var _this = this;var selectionMethod = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      // Special case selectors. The selection method is irrelavant.
      // And no need to wait for document ready.
      if (selector == ':root') {
        return tryResolve(function () {return _this.getRootElement();});
      }
      if (selector == ':host') {
        return new Promise(function (resolve) {
          resolve(
          user().assertElement(
          _this.getHostElement(), "Element \"".concat(
          selector, "\" not found")));


        });
      }

      // Wait for document-ready to avoid false missed searches
      return this.ampdoc.whenReady().then(function () {
        var found;
        var result = null;
        // Query search based on the selection method.
        try {
          if (selectionMethod == 'scope') {
            found = scopedQuerySelector(context, selector);
          } else if (selectionMethod == 'closest') {
            found = closestAncestorElementBySelector(context, selector);
          } else {
            found = _this.getRoot().querySelector(selector);
          }
        } catch (e) {
          userAssert(false, "Invalid query selector ".concat(selector));
        }

        // DOM search can "look" outside the boundaries of the root, thus make
        // sure the result is contained.
        if (found && _this.contains(found)) {
          result = found;
        }
        return user().assertElement(result, "Element \"".concat(selector, "\" not found"));
      });
    }

    /**
     * @param {!Array<string>} selectors Array of DOM query selectors.
     * @param {boolean} useDataVars Indicator if DataVars restristiction should be applied.
     * Default set to true.
     * @return {!Promise<!Array<!Element>>} Element corresponding to the selector.
     */ }, { key: "getElementsByQuerySelectorAll_", value:
    function getElementsByQuerySelectorAll_(selectors) {var _this2 = this;var useDataVars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      // Wait for document-ready to avoid false missed searches
      return this.ampdoc.whenReady().then(function () {
        var elements = [];
        for (var i = 0; i < selectors.length; i++) {
          var nodeList = void 0;
          var elementArray = [];
          var selector = selectors[i];
          try {
            nodeList = _this2.getRoot().querySelectorAll(selector);
          } catch (e) {
            userAssert(false, "Invalid query selector ".concat(selector));
          }
          for (var j = 0; j < nodeList.length; j++) {
            if (_this2.contains(nodeList[j])) {
              elementArray.push(nodeList[j]);
            }
          }
          elementArray = useDataVars ?
          _this2.getDataVarsElements_(elementArray, selector) :
          elementArray;
          userAssert(elementArray.length, "Element \"".concat(selector, "\" not found"));
          elements = elements.concat(elementArray);
        }
        // Return unique
        return elements.filter(
        function (element, index) {return elements.indexOf(element) === index;});

      });
    }

    /**
     * Return all elements that have a data-vars attribute.
     * @param {!Array<!Element>} elementArray
     * @param {string} selector
     * @return {!Array<!Element>}
     */ }, { key: "getDataVarsElements_", value:
    function getDataVarsElements_(elementArray, selector) {
      var removedCount = 0;
      var dataVarsArray = [];
      for (var i = 0; i < elementArray.length; i++) {
        var dataVarKeys = Object.keys(
        getDataParamsFromAttributes(
        elementArray[i],
        /* computeParamNameFunc */undefined,
        VARIABLE_DATA_ATTRIBUTE_KEY));


        if (dataVarKeys.length) {
          dataVarsArray.push(elementArray[i]);
        } else {
          removedCount++;
        }
      }
      if (removedCount) {
        user().warn(
        TAG,
        '%s element(s) ommited from selector "%s"' +
        ' because no data-vars-* attribute was found.',
        removedCount,
        selector);

      }
      return dataVarsArray;
    }

    /**
     * Searches the AMP element that matches the selector within the scope of the
     * analytics root in relationship to the specified context node.
     *
     * @param {!Element} context
     * @param {string} selector DOM query selector.
     * @param {?string=} selectionMethod Allowed values are `null`,
     *   `'closest'` and `'scope'`.
     * @return {!Promise<!AmpElement>} AMP element corresponding to the selector if found.
     */ }, { key: "getAmpElement", value:
    function getAmpElement(context, selector, selectionMethod) {var _this3 = this;
      return this.getElement(context, selector, selectionMethod).then(
      function (element) {
        _this3.verifyAmpElements_([element], selector);
        return element;
      });

    }

    /**
     * Searches for the element(s) that matches the selector
     * within the scope of the analytics root in relationship to
     * the specified context node.
     *
     * @param {!Element} context
     * @param {!Array<string>|string} selectors DOM query selector(s).
     * @param {?string=} selectionMethod Allowed values are `null`,
     *   `'closest'` and `'scope'`.
     * @param {boolean} useDataVars Indicator if DataVars restristiction should be applied.
     * Default set to true.
     * @return {!Promise<!Array<!Element>>} Array of elements corresponding to the selector if found.
     */ }, { key: "getElements", value:
    function getElements(context, selectors, selectionMethod) {var useDataVars = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      if (isArray(selectors)) {
        userAssert(
        !selectionMethod,
        'Cannot have selectionMethod %s defined with an array selector.',
        selectionMethod);

        return this.getElementsByQuerySelectorAll_(
        /** @type {!Array<string>} */(selectors),
        useDataVars);

      }
      return this.getElement(
      context,
      /** @type {string} */(selectors),
      selectionMethod).
      then(function (element) {return [element];});
    }

    /**
     * @param {!Array<Element>} elements
     * @param {string} selector
     */ }, { key: "verifyAmpElements_", value:
    function verifyAmpElements_(elements, selector) {
      for (var i = 0; i < elements.length; i++) {
        userAssert(
        elements[i].classList.contains('i-amphtml-element'),
        'Element "%s" is required to be an AMP element',
        selector);

      }
    }

    /**
     * Creates listener-filter for DOM events to check against the specified
     * selector. If the node (or its ancestors) match the selector the listener
     * will be called.
     *
     * @param {function(!Element, !Event)} listener The first argument is the
     *   matched target node and the second is the original event.
     * @param {!Element} context
     * @param {string} selector DOM query selector.
     * @param {?string=} selectionMethod Allowed values are `null`,
     *   `'closest'` and `'scope'`.
     * @return {function(!Event)}
     */ }, { key: "createSelectiveListener", value:
    function createSelectiveListener(listener, context, selector) {var _this4 = this;var selectionMethod = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return function (event) {
        if (selector == ':host') {
          // `:host` is not reachable via selective listener b/c event path
          // cannot be retargeted across the boundary of the embed.
          return;
        }

        // Navigate up the DOM tree to find the actual target.
        var rootElement = _this4.getRootElement();
        var isSelectAny = selector == '*';
        var isSelectRoot = selector == ':root';
        var target = event.target;
        while (target) {
          // Target must be contained by this root.
          if (!_this4.contains(target)) {
            break;
          }
          // `:scope` context must contain the target.
          if (
          selectionMethod == 'scope' &&
          !isSelectRoot &&
          !context.contains(target))
          {
            break;
          }
          // `closest()` target must contain the conext.
          if (selectionMethod == 'closest' && !target.contains(context)) {
            // However, the search must continue!
            target = target.parentElement;
            continue;
          }

          // Check if the target matches the selector.
          if (
          isSelectAny || (
          isSelectRoot && target == rootElement) ||
          tryMatches_(target, selector))
          {
            listener(target, event);
            // Don't fire the event multiple times even if the more than one
            // ancestor matches the selector.
            break;
          }

          target = target.parentElement;
        }
      };
    }

    /**
     * Returns the promise that will be resolved as soon as the elements within
     * the root have been loaded inside the first viewport of the root.
     * @return {!Promise}
     * @abstract
     */ }, { key: "whenIniLoaded", value:
    function whenIniLoaded() {}

    /**
     * Returns the visibility root corresponding to this analytics root (ampdoc
     * or embed). The visibility root is created lazily as needed and takes
     * care of all visibility tracking functions.
     * @return {!./visibility-manager.VisibilityManager}
     */ }, { key: "getVisibilityManager", value:
    function getVisibilityManager() {
      if (!this.visibilityManager_) {
        this.visibilityManager_ = provideVisibilityManager(this.getRoot());
      }
      return this.visibilityManager_;
    }

    /**
     *  Returns the Scroll Managet corresponding to this analytics root.
     * The Scroll Manager is created lazily as needed, and will handle
     * calling all handlers for a scroll event.
     * @return {!./scroll-manager.ScrollManager}
     */ }, { key: "getScrollManager", value:
    function getScrollManager() {
      // TODO (zhouyx@): Disallow scroll trigger with host API
      if (!this.scrollManager_) {
        this.scrollManager_ = new ScrollManager(this);
      }

      return this.scrollManager_;
    } }]);return AnalyticsRoot;}();


/**
 * The implementation of the analytics root for an ampdoc.
 */
export var AmpdocAnalyticsRoot = /*#__PURE__*/function (_AnalyticsRoot) {_inherits(AmpdocAnalyticsRoot, _AnalyticsRoot);var _super = _createSuper(AmpdocAnalyticsRoot);
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AmpdocAnalyticsRoot(ampdoc) {_classCallCheck(this, AmpdocAnalyticsRoot);return _super.call(this,
    ampdoc);
  }

  /** @override */_createClass(AmpdocAnalyticsRoot, [{ key: "getType", value:
    function getType() {
      return 'ampdoc';
    }

    /** @override */ }, { key: "getRoot", value:
    function getRoot() {
      return this.ampdoc.getRootNode();
    }

    /** @override */ }, { key: "getHostElement", value:
    function getHostElement() {
      // ampdoc is always the root of everything - no host.
      return null;
    }

    /** @override */ }, { key: "signals", value:
    function signals() {
      return this.ampdoc.signals();
    }

    /** @override */ }, { key: "getElementById", value:
    function getElementById(id) {
      return this.ampdoc.getElementById(id);
    }

    /** @override */ }, { key: "whenIniLoaded", value:
    function whenIniLoaded() {
      var viewport = Services.viewportForDoc(this.ampdoc);
      var rect;
      if (getMode(this.ampdoc.win).runtime == 'inabox') {
        // TODO(dvoytenko, #7971): This is currently addresses incorrect position
        // calculations in a in-a-box viewport where all elements are offset
        // to the bottom of the embed. The current approach, even if fixed, still
        // creates a significant probability of risk condition.
        // Once address, we can simply switch to the 0/0 approach in the `else`
        // clause.
        rect = viewport.getLayoutRect(this.getRootElement());
      } else {
        var size = viewport.getSize();
        rect = layoutRectLtwh(0, 0, size.width, size.height);
      }
      return whenContentIniLoad(this.ampdoc, this.ampdoc.win, rect);
    } }]);return AmpdocAnalyticsRoot;}(AnalyticsRoot);


/**
 * The implementation of the analytics root for FIE.
 * TODO(#22733): merge into AnalyticsRoot once ampdoc-fie is launched.
 */
export var EmbedAnalyticsRoot = /*#__PURE__*/function (_AnalyticsRoot2) {_inherits(EmbedAnalyticsRoot, _AnalyticsRoot2);var _super2 = _createSuper(EmbedAnalyticsRoot);
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  function EmbedAnalyticsRoot(ampdoc, embed) {var _this5;_classCallCheck(this, EmbedAnalyticsRoot);
    _this5 = _super2.call(this, ampdoc);
    /** @const */
    _this5.embed = embed;return _this5;
  }

  /** @override */_createClass(EmbedAnalyticsRoot, [{ key: "getType", value:
    function getType() {
      return 'embed';
    }

    /** @override */ }, { key: "getRoot", value:
    function getRoot() {
      return this.embed.win.document;
    }

    /** @override */ }, { key: "getHostElement", value:
    function getHostElement() {
      return this.embed.iframe;
    }

    /** @override */ }, { key: "signals", value:
    function signals() {
      return this.embed.signals();
    }

    /** @override */ }, { key: "getElementById", value:
    function getElementById(id) {
      return this.embed.win.document.getElementById(id);
    }

    /** @override */ }, { key: "whenIniLoaded", value:
    function whenIniLoaded() {
      return this.embed.whenIniLoaded();
    } }]);return EmbedAnalyticsRoot;}(AnalyticsRoot);


/**
 * @param  {!Element} el
 * @param  {string} selector
 * @return {boolean}
 */
function tryMatches_(el, selector) {
  try {
    return matches(el, selector);
  } catch (e) {
    user().error(TAG, 'Bad query selector.', selector, e);
    return false;
  }
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/analytics-root.js