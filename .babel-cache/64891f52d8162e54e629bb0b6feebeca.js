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
import { ScrollManager } from "./scroll-manager";
import { Services } from "../../../src/service";
import { closestAncestorElementBySelector, matches, scopedQuerySelector } from "../../../src/core/dom/query";
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
  function AnalyticsRoot(ampdoc) {
    _classCallCheck(this, AnalyticsRoot);

    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.trackers_ = map();

    /** @private {?./visibility-manager.VisibilityManager} */
    this.visibilityManager_ = null;

    /** @private {?./scroll-manager.ScrollManager} */
    this.scrollManager_ = null;
  }

  /** @override */
  _createClass(AnalyticsRoot, [{
    key: "dispose",
    value: function dispose() {
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
     */

  }, {
    key: "getType",
    value: function getType() {}
    /**
     * The root node the analytics is scoped to.
     *
     * @return {!Document|!ShadowRoot}
     * @abstract
     */

  }, {
    key: "getRoot",
    value: function getRoot() {}
    /**
     * The viewer of analytics root
     * @return {!../../../src/service/viewer-interface.ViewerInterface}
     */

  }, {
    key: "getViewer",
    value: function getViewer() {
      return Services.viewerForDoc(this.ampdoc);
    }
    /**
     * The root element within the analytics root.
     *
     * @return {!Element}
     */

  }, {
    key: "getRootElement",
    value: function getRootElement() {
      var root = this.getRoot();
      // In the case of a shadow doc, its host will be used as
      // a refrence point
      return dev().assertElement(root.host || root.documentElement || root.body || root);
    }
    /**
     * The host element of the analytics root.
     *
     * @return {?Element}
     * @abstract
     */

  }, {
    key: "getHostElement",
    value: function getHostElement() {}
    /**
     * The signals for the root.
     *
     * @return {!../../../src/utils/signals.Signals}
     * @abstract
     */

  }, {
    key: "signals",
    value: function signals() {}
    /**
     * Whether this analytics root contains the specified node.
     *
     * @param {!Node} node
     * @return {boolean}
     */

  }, {
    key: "contains",
    value: function contains(node) {
      return this.getRoot().contains(node);
    }
    /**
     * Returns the element with the specified ID in the scope of this root.
     *
     * @param {string} unusedId
     * @return {?Element}
     * @abstract
     */

  }, {
    key: "getElementById",
    value: function getElementById(unusedId) {}
    /**
     * Returns the tracker for the specified name and list of allowed types.
     *
     * @param {string} name
     * @param {!Object<string, typeof ./events.EventTracker>} allowlist
     * @return {?./events.EventTracker}
     */

  }, {
    key: "getTrackerForAllowlist",
    value: function getTrackerForAllowlist(name, allowlist) {
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
     */

  }, {
    key: "getTracker",
    value: function getTracker(name, klass) {
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
     */

  }, {
    key: "getTrackerOptional",
    value: function getTrackerOptional(name) {
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
     */

  }, {
    key: "getElement",
    value: function getElement(context, selector, selectionMethod) {
      var _this = this;

      if (selectionMethod === void 0) {
        selectionMethod = null;
      }

      // Special case selectors. The selection method is irrelavant.
      // And no need to wait for document ready.
      if (selector == ':root') {
        return tryResolve(function () {
          return _this.getRootElement();
        });
      }

      if (selector == ':host') {
        return new Promise(function (resolve) {
          resolve(user().assertElement(_this.getHostElement(), "Element \"" + selector + "\" not found"));
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
          userAssert(false, "Invalid query selector " + selector);
        }

        // DOM search can "look" outside the boundaries of the root, thus make
        // sure the result is contained.
        if (found && _this.contains(found)) {
          result = found;
        }

        return user().assertElement(result, "Element \"" + selector + "\" not found");
      });
    }
    /**
     * @param {!Array<string>} selectors Array of DOM query selectors.
     * @param {boolean} useDataVars Indicator if DataVars restristiction should be applied.
     * Default set to true.
     * @return {!Promise<!Array<!Element>>} Element corresponding to the selector.
     */

  }, {
    key: "getElementsByQuerySelectorAll_",
    value: function getElementsByQuerySelectorAll_(selectors, useDataVars) {
      var _this2 = this;

      if (useDataVars === void 0) {
        useDataVars = true;
      }

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
            userAssert(false, "Invalid query selector " + selector);
          }

          for (var j = 0; j < nodeList.length; j++) {
            if (_this2.contains(nodeList[j])) {
              elementArray.push(nodeList[j]);
            }
          }

          elementArray = useDataVars ? _this2.getDataVarsElements_(elementArray, selector) : elementArray;
          userAssert(elementArray.length, "Element \"" + selector + "\" not found");
          elements = elements.concat(elementArray);
        }

        // Return unique
        return elements.filter(function (element, index) {
          return elements.indexOf(element) === index;
        });
      });
    }
    /**
     * Return all elements that have a data-vars attribute.
     * @param {!Array<!Element>} elementArray
     * @param {string} selector
     * @return {!Array<!Element>}
     */

  }, {
    key: "getDataVarsElements_",
    value: function getDataVarsElements_(elementArray, selector) {
      var removedCount = 0;
      var dataVarsArray = [];

      for (var i = 0; i < elementArray.length; i++) {
        var dataVarKeys = Object.keys(getDataParamsFromAttributes(elementArray[i],
        /* computeParamNameFunc */
        undefined, VARIABLE_DATA_ATTRIBUTE_KEY));

        if (dataVarKeys.length) {
          dataVarsArray.push(elementArray[i]);
        } else {
          removedCount++;
        }
      }

      if (removedCount) {
        user().warn(TAG, '%s element(s) ommited from selector "%s"' + ' because no data-vars-* attribute was found.', removedCount, selector);
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
     */

  }, {
    key: "getAmpElement",
    value: function getAmpElement(context, selector, selectionMethod) {
      var _this3 = this;

      return this.getElement(context, selector, selectionMethod).then(function (element) {
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
     */

  }, {
    key: "getElements",
    value: function getElements(context, selectors, selectionMethod, useDataVars) {
      if (useDataVars === void 0) {
        useDataVars = true;
      }

      if (isArray(selectors)) {
        userAssert(!selectionMethod, 'Cannot have selectionMethod %s defined with an array selector.', selectionMethod);
        return this.getElementsByQuerySelectorAll_(
        /** @type {!Array<string>} */
        selectors, useDataVars);
      }

      return this.getElement(context,
      /** @type {string} */
      selectors, selectionMethod).then(function (element) {
        return [element];
      });
    }
    /**
     * @param {!Array<Element>} elements
     * @param {string} selector
     */

  }, {
    key: "verifyAmpElements_",
    value: function verifyAmpElements_(elements, selector) {
      for (var i = 0; i < elements.length; i++) {
        userAssert(elements[i].classList.contains('i-amphtml-element'), 'Element "%s" is required to be an AMP element', selector);
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
     */

  }, {
    key: "createSelectiveListener",
    value: function createSelectiveListener(listener, context, selector, selectionMethod) {
      var _this4 = this;

      if (selectionMethod === void 0) {
        selectionMethod = null;
      }

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
          if (selectionMethod == 'scope' && !isSelectRoot && !context.contains(target)) {
            break;
          }

          // `closest()` target must contain the conext.
          if (selectionMethod == 'closest' && !target.contains(context)) {
            // However, the search must continue!
            target = target.parentElement;
            continue;
          }

          // Check if the target matches the selector.
          if (isSelectAny || isSelectRoot && target == rootElement || tryMatches_(target, selector)) {
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
     */

  }, {
    key: "whenIniLoaded",
    value: function whenIniLoaded() {}
    /**
     * Returns the visibility root corresponding to this analytics root (ampdoc
     * or embed). The visibility root is created lazily as needed and takes
     * care of all visibility tracking functions.
     * @return {!./visibility-manager.VisibilityManager}
     */

  }, {
    key: "getVisibilityManager",
    value: function getVisibilityManager() {
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
     */

  }, {
    key: "getScrollManager",
    value: function getScrollManager() {
      // TODO (zhouyx@): Disallow scroll trigger with host API
      if (!this.scrollManager_) {
        this.scrollManager_ = new ScrollManager(this);
      }

      return this.scrollManager_;
    }
  }]);

  return AnalyticsRoot;
}();

/**
 * The implementation of the analytics root for an ampdoc.
 */
export var AmpdocAnalyticsRoot = /*#__PURE__*/function (_AnalyticsRoot) {
  _inherits(AmpdocAnalyticsRoot, _AnalyticsRoot);

  var _super = _createSuper(AmpdocAnalyticsRoot);

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AmpdocAnalyticsRoot(ampdoc) {
    _classCallCheck(this, AmpdocAnalyticsRoot);

    return _super.call(this, ampdoc);
  }

  /** @override */
  _createClass(AmpdocAnalyticsRoot, [{
    key: "getType",
    value: function getType() {
      return 'ampdoc';
    }
    /** @override */

  }, {
    key: "getRoot",
    value: function getRoot() {
      return this.ampdoc.getRootNode();
    }
    /** @override */

  }, {
    key: "getHostElement",
    value: function getHostElement() {
      // ampdoc is always the root of everything - no host.
      return null;
    }
    /** @override */

  }, {
    key: "signals",
    value: function signals() {
      return this.ampdoc.signals();
    }
    /** @override */

  }, {
    key: "getElementById",
    value: function getElementById(id) {
      return this.ampdoc.getElementById(id);
    }
    /** @override */

  }, {
    key: "whenIniLoaded",
    value: function whenIniLoaded() {
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
    }
  }]);

  return AmpdocAnalyticsRoot;
}(AnalyticsRoot);

/**
 * The implementation of the analytics root for FIE.
 * TODO(#22733): merge into AnalyticsRoot once ampdoc-fie is launched.
 */
export var EmbedAnalyticsRoot = /*#__PURE__*/function (_AnalyticsRoot2) {
  _inherits(EmbedAnalyticsRoot, _AnalyticsRoot2);

  var _super2 = _createSuper(EmbedAnalyticsRoot);

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  function EmbedAnalyticsRoot(ampdoc, embed) {
    var _this5;

    _classCallCheck(this, EmbedAnalyticsRoot);

    _this5 = _super2.call(this, ampdoc);

    /** @const */
    _this5.embed = embed;
    return _this5;
  }

  /** @override */
  _createClass(EmbedAnalyticsRoot, [{
    key: "getType",
    value: function getType() {
      return 'embed';
    }
    /** @override */

  }, {
    key: "getRoot",
    value: function getRoot() {
      return this.embed.win.document;
    }
    /** @override */

  }, {
    key: "getHostElement",
    value: function getHostElement() {
      return this.embed.iframe;
    }
    /** @override */

  }, {
    key: "signals",
    value: function signals() {
      return this.embed.signals();
    }
    /** @override */

  }, {
    key: "getElementById",
    value: function getElementById(id) {
      return this.embed.win.document.getElementById(id);
    }
    /** @override */

  }, {
    key: "whenIniLoaded",
    value: function whenIniLoaded() {
      return this.embed.whenIniLoaded();
    }
  }]);

  return EmbedAnalyticsRoot;
}(AnalyticsRoot);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuYWx5dGljcy1yb290LmpzIl0sIm5hbWVzIjpbIlNjcm9sbE1hbmFnZXIiLCJTZXJ2aWNlcyIsImNsb3Nlc3RBbmNlc3RvckVsZW1lbnRCeVNlbGVjdG9yIiwibWF0Y2hlcyIsInNjb3BlZFF1ZXJ5U2VsZWN0b3IiLCJkZXYiLCJ1c2VyIiwidXNlckFzc2VydCIsImdldERhdGFQYXJhbXNGcm9tQXR0cmlidXRlcyIsImdldE1vZGUiLCJpc0FycmF5IiwibGF5b3V0UmVjdEx0d2giLCJtYXAiLCJwcm92aWRlVmlzaWJpbGl0eU1hbmFnZXIiLCJ0cnlSZXNvbHZlIiwid2hlbkNvbnRlbnRJbmlMb2FkIiwiVEFHIiwiVkFSSUFCTEVfREFUQV9BVFRSSUJVVEVfS0VZIiwiQW5hbHl0aWNzUm9vdCIsImFtcGRvYyIsInRyYWNrZXJzXyIsInZpc2liaWxpdHlNYW5hZ2VyXyIsInNjcm9sbE1hbmFnZXJfIiwiayIsImRpc3Bvc2UiLCJ2aWV3ZXJGb3JEb2MiLCJyb290IiwiZ2V0Um9vdCIsImFzc2VydEVsZW1lbnQiLCJob3N0IiwiZG9jdW1lbnRFbGVtZW50IiwiYm9keSIsIm5vZGUiLCJjb250YWlucyIsInVudXNlZElkIiwibmFtZSIsImFsbG93bGlzdCIsInRyYWNrZXJQcm9maWxlIiwiZ2V0VHJhY2tlciIsImtsYXNzIiwidHJhY2tlciIsImNvbnRleHQiLCJzZWxlY3RvciIsInNlbGVjdGlvbk1ldGhvZCIsImdldFJvb3RFbGVtZW50IiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRIb3N0RWxlbWVudCIsIndoZW5SZWFkeSIsInRoZW4iLCJmb3VuZCIsInJlc3VsdCIsInF1ZXJ5U2VsZWN0b3IiLCJlIiwic2VsZWN0b3JzIiwidXNlRGF0YVZhcnMiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJub2RlTGlzdCIsImVsZW1lbnRBcnJheSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJqIiwicHVzaCIsImdldERhdGFWYXJzRWxlbWVudHNfIiwiY29uY2F0IiwiZmlsdGVyIiwiZWxlbWVudCIsImluZGV4IiwiaW5kZXhPZiIsInJlbW92ZWRDb3VudCIsImRhdGFWYXJzQXJyYXkiLCJkYXRhVmFyS2V5cyIsIk9iamVjdCIsImtleXMiLCJ1bmRlZmluZWQiLCJ3YXJuIiwiZ2V0RWxlbWVudCIsInZlcmlmeUFtcEVsZW1lbnRzXyIsImdldEVsZW1lbnRzQnlRdWVyeVNlbGVjdG9yQWxsXyIsImNsYXNzTGlzdCIsImxpc3RlbmVyIiwiZXZlbnQiLCJyb290RWxlbWVudCIsImlzU2VsZWN0QW55IiwiaXNTZWxlY3RSb290IiwidGFyZ2V0IiwicGFyZW50RWxlbWVudCIsInRyeU1hdGNoZXNfIiwiQW1wZG9jQW5hbHl0aWNzUm9vdCIsImdldFJvb3ROb2RlIiwic2lnbmFscyIsImlkIiwiZ2V0RWxlbWVudEJ5SWQiLCJ2aWV3cG9ydCIsInZpZXdwb3J0Rm9yRG9jIiwicmVjdCIsIndpbiIsInJ1bnRpbWUiLCJnZXRMYXlvdXRSZWN0Iiwic2l6ZSIsImdldFNpemUiLCJ3aWR0aCIsImhlaWdodCIsIkVtYmVkQW5hbHl0aWNzUm9vdCIsImVtYmVkIiwiZG9jdW1lbnQiLCJpZnJhbWUiLCJ3aGVuSW5pTG9hZGVkIiwiZWwiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxhQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQ0VDLGdDQURGLEVBRUVDLE9BRkYsRUFHRUMsbUJBSEY7QUFLQSxTQUFRQyxHQUFSLEVBQWFDLElBQWIsRUFBbUJDLFVBQW5CO0FBQ0EsU0FBUUMsMkJBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLGNBQVI7QUFDQSxTQUFRQyxHQUFSO0FBRUEsU0FBUUMsd0JBQVI7QUFFQSxTQUFRQyxVQUFSO0FBQ0EsU0FBUUMsa0JBQVI7QUFFQSxJQUFN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O0FBQ1IsYUFBTyxLQUFLQSxLQUFMLENBQVdSLEdBQVgsQ0FBZVMsUUFBdEI7QUFDRDtBQUVEOztBQXJCRjtBQUFBO0FBQUEsV0FzQkUsMEJBQWlCO0FBQ2YsYUFBTyxLQUFLRCxLQUFMLENBQVdFLE1BQWxCO0FBQ0Q7QUFFRDs7QUExQkY7QUFBQTtBQUFBLFdBMkJFLG1CQUFVO0FBQ1IsYUFBTyxLQUFLRixLQUFMLENBQVdkLE9BQVgsRUFBUDtBQUNEO0FBRUQ7O0FBL0JGO0FBQUE7QUFBQSxXQWdDRSx3QkFBZUMsRUFBZixFQUFtQjtBQUNqQixhQUFPLEtBQUthLEtBQUwsQ0FBV1IsR0FBWCxDQUFlUyxRQUFmLENBQXdCYixjQUF4QixDQUF1Q0QsRUFBdkMsQ0FBUDtBQUNEO0FBRUQ7O0FBcENGO0FBQUE7QUFBQSxXQXFDRSx5QkFBZ0I7QUFDZCxhQUFPLEtBQUthLEtBQUwsQ0FBV0csYUFBWCxFQUFQO0FBQ0Q7QUF2Q0g7O0FBQUE7QUFBQSxFQUF3QzFGLGFBQXhDOztBQTBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU3NFLFdBQVQsQ0FBcUJxQixFQUFyQixFQUF5Qm5FLFFBQXpCLEVBQW1DO0FBQ2pDLE1BQUk7QUFDRixXQUFPdkMsT0FBTyxDQUFDMEcsRUFBRCxFQUFLbkUsUUFBTCxDQUFkO0FBQ0QsR0FGRCxDQUVFLE9BQU9XLENBQVAsRUFBVTtBQUNWL0MsSUFBQUEsSUFBSSxHQUFHd0csS0FBUCxDQUFhOUYsR0FBYixFQUFrQixxQkFBbEIsRUFBeUMwQixRQUF6QyxFQUFtRFcsQ0FBbkQ7QUFDQSxXQUFPLEtBQVA7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7U2Nyb2xsTWFuYWdlcn0gZnJvbSAnLi9zY3JvbGwtbWFuYWdlcic7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1xuICBjbG9zZXN0QW5jZXN0b3JFbGVtZW50QnlTZWxlY3RvcixcbiAgbWF0Y2hlcyxcbiAgc2NvcGVkUXVlcnlTZWxlY3Rvcixcbn0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7ZGV2LCB1c2VyLCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7Z2V0RGF0YVBhcmFtc0Zyb21BdHRyaWJ1dGVzfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuLi8uLi8uLi9zcmMvbW9kZSc7XG5pbXBvcnQge2lzQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7bGF5b3V0UmVjdEx0d2h9IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvcmVjdCc7XG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuaW1wb3J0IHtwcm92aWRlVmlzaWJpbGl0eU1hbmFnZXJ9IGZyb20gJy4vdmlzaWJpbGl0eS1tYW5hZ2VyJztcblxuaW1wb3J0IHt0cnlSZXNvbHZlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge3doZW5Db250ZW50SW5pTG9hZH0gZnJvbSAnLi4vLi4vLi4vc3JjL2luaS1sb2FkJztcblxuY29uc3QgVEFHID0gJ2FtcC1hbmFseXRpY3MvYW5hbHl0aWNzLXJvb3QnO1xuY29uc3QgVkFSSUFCTEVfREFUQV9BVFRSSUJVVEVfS0VZID0gL152YXJzKC4rKS87XG5cbi8qKlxuICogQW4gYW5hbHl0aWNzIHJvb3QuIEFuYWx5dGljcyBjYW4gYmUgc2NvcGVkIHRvIGVpdGhlciBhbXBkb2MsIGVtYmVkIG9yXG4gKiBhbiBhcmJpdHJhcnkgQU1QIGVsZW1lbnQuXG4gKlxuICogVE9ETygjMjI3MzMpOiBtZXJnZSBhbmFseXRpY3Mgcm9vdCBwcm9wZXJ0aWVzIGludG8gYW1wZG9jLlxuICpcbiAqIEBpbXBsZW1lbnRzIHsuLi8uLi8uLi9zcmMvc2VydmljZS5EaXNwb3NhYmxlfVxuICogQGFic3RyYWN0XG4gKi9cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3NSb290IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpcy5hbXBkb2MgPSBhbXBkb2M7XG5cbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpcy50cmFja2Vyc18gPSBtYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vdmlzaWJpbGl0eS1tYW5hZ2VyLlZpc2liaWxpdHlNYW5hZ2VyfSAqL1xuICAgIHRoaXMudmlzaWJpbGl0eU1hbmFnZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vc2Nyb2xsLW1hbmFnZXIuU2Nyb2xsTWFuYWdlcn0gKi9cbiAgICB0aGlzLnNjcm9sbE1hbmFnZXJfID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBmb3IgKGNvbnN0IGsgaW4gdGhpcy50cmFja2Vyc18pIHtcbiAgICAgIHRoaXMudHJhY2tlcnNfW2tdLmRpc3Bvc2UoKTtcbiAgICAgIGRlbGV0ZSB0aGlzLnRyYWNrZXJzX1trXTtcbiAgICB9XG4gICAgaWYgKHRoaXMudmlzaWJpbGl0eU1hbmFnZXJfKSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlNYW5hZ2VyXy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNjcm9sbE1hbmFnZXJfKSB7XG4gICAgICB0aGlzLnNjcm9sbE1hbmFnZXJfLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHlwZSBvZiB0aGUgdHJhY2tlci5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGdldFR5cGUoKSB7fVxuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBub2RlIHRoZSBhbmFseXRpY3MgaXMgc2NvcGVkIHRvLlxuICAgKlxuICAgKiBAcmV0dXJuIHshRG9jdW1lbnR8IVNoYWRvd1Jvb3R9XG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgZ2V0Um9vdCgpIHt9XG5cbiAgLyoqXG4gICAqIFRoZSB2aWV3ZXIgb2YgYW5hbHl0aWNzIHJvb3RcbiAgICogQHJldHVybiB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3ZpZXdlci1pbnRlcmZhY2UuVmlld2VySW50ZXJmYWNlfVxuICAgKi9cbiAgZ2V0Vmlld2VyKCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy52aWV3ZXJGb3JEb2ModGhpcy5hbXBkb2MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByb290IGVsZW1lbnQgd2l0aGluIHRoZSBhbmFseXRpY3Mgcm9vdC5cbiAgICpcbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqL1xuICBnZXRSb290RWxlbWVudCgpIHtcbiAgICBjb25zdCByb290ID0gdGhpcy5nZXRSb290KCk7XG4gICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSBzaGFkb3cgZG9jLCBpdHMgaG9zdCB3aWxsIGJlIHVzZWQgYXNcbiAgICAvLyBhIHJlZnJlbmNlIHBvaW50XG4gICAgcmV0dXJuIGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICByb290Lmhvc3QgfHwgcm9vdC5kb2N1bWVudEVsZW1lbnQgfHwgcm9vdC5ib2R5IHx8IHJvb3RcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGFuYWx5dGljcyByb290LlxuICAgKlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBnZXRIb3N0RWxlbWVudCgpIHt9XG5cbiAgLyoqXG4gICAqIFRoZSBzaWduYWxzIGZvciB0aGUgcm9vdC5cbiAgICpcbiAgICogQHJldHVybiB7IS4uLy4uLy4uL3NyYy91dGlscy9zaWduYWxzLlNpZ25hbHN9XG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgc2lnbmFscygpIHt9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBhbmFseXRpY3Mgcm9vdCBjb250YWlucyB0aGUgc3BlY2lmaWVkIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGNvbnRhaW5zKG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSb290KCkuY29udGFpbnMobm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaW4gdGhlIHNjb3BlIG9mIHRoaXMgcm9vdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVudXNlZElkXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIGdldEVsZW1lbnRCeUlkKHVudXNlZElkKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFja2VyIGZvciB0aGUgc3BlY2lmaWVkIG5hbWUgYW5kIGxpc3Qgb2YgYWxsb3dlZCB0eXBlcy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgdHlwZW9mIC4vZXZlbnRzLkV2ZW50VHJhY2tlcj59IGFsbG93bGlzdFxuICAgKiBAcmV0dXJuIHs/Li9ldmVudHMuRXZlbnRUcmFja2VyfVxuICAgKi9cbiAgZ2V0VHJhY2tlckZvckFsbG93bGlzdChuYW1lLCBhbGxvd2xpc3QpIHtcbiAgICBjb25zdCB0cmFja2VyUHJvZmlsZSA9IGFsbG93bGlzdFtuYW1lXTtcbiAgICBpZiAodHJhY2tlclByb2ZpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFRyYWNrZXIobmFtZSwgdHJhY2tlclByb2ZpbGUpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFja2VyIGZvciB0aGUgc3BlY2lmaWVkIG5hbWUgYW5kIHR5cGUuIElmIHRoZSB0cmFja2VyXG4gICAqIGhhcyBub3QgYmVlbiByZXF1ZXN0ZWQgYmVmb3JlLCBpdCB3aWxsIGJlIGNyZWF0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7dHlwZW9mIC4vZXZlbnRzLkN1c3RvbUV2ZW50VHJhY2tlcnx0eXBlb2YgLi9ldmVudHMuQ2xpY2tFdmVudFRyYWNrZXJ8dHlwZW9mIC4vZXZlbnRzLlNjcm9sbEV2ZW50VHJhY2tlcnx0eXBlb2YgLi9ldmVudHMuU2lnbmFsVHJhY2tlcnx0eXBlb2YgLi9ldmVudHMuSW5pTG9hZFRyYWNrZXJ8dHlwZW9mIC4vZXZlbnRzLlZpZGVvRXZlbnRUcmFja2VyfHR5cGVvZiAuL2V2ZW50cy5WaWRlb0V2ZW50VHJhY2tlcnx0eXBlb2YgLi9ldmVudHMuVmlzaWJpbGl0eVRyYWNrZXJ8dHlwZW9mIC4vZXZlbnRzLkFtcFN0b3J5RXZlbnRUcmFja2VyfSBrbGFzc1xuICAgKiBAcmV0dXJuIHshLi9ldmVudHMuRXZlbnRUcmFja2VyfVxuICAgKi9cbiAgZ2V0VHJhY2tlcihuYW1lLCBrbGFzcykge1xuICAgIGxldCB0cmFja2VyID0gdGhpcy50cmFja2Vyc19bbmFtZV07XG4gICAgaWYgKCF0cmFja2VyKSB7XG4gICAgICB0cmFja2VyID0gbmV3IGtsYXNzKHRoaXMpO1xuICAgICAgdGhpcy50cmFja2Vyc19bbmFtZV0gPSB0cmFja2VyO1xuICAgIH1cbiAgICByZXR1cm4gdHJhY2tlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFja2VyIGZvciB0aGUgc3BlY2lmaWVkIG5hbWUgb3IgYG51bGxgLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHs/Li9ldmVudHMuRXZlbnRUcmFja2VyfVxuICAgKi9cbiAgZ2V0VHJhY2tlck9wdGlvbmFsKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy50cmFja2Vyc19bbmFtZV0gfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyB0aGUgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlXG4gICAqIGFuYWx5dGljcyByb290IGluIHJlbGF0aW9uc2hpcCB0byB0aGUgc3BlY2lmaWVkIGNvbnRleHQgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gY29udGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgRE9NIHF1ZXJ5IHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBzZWxlY3Rpb25NZXRob2QgQWxsb3dlZCB2YWx1ZXMgYXJlIGBudWxsYCxcbiAgICogICBgJ2Nsb3Nlc3QnYCBhbmQgYCdzY29wZSdgLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTwhRWxlbWVudD59IEVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0b3IuXG4gICAqL1xuICBnZXRFbGVtZW50KGNvbnRleHQsIHNlbGVjdG9yLCBzZWxlY3Rpb25NZXRob2QgPSBudWxsKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIHNlbGVjdG9ycy4gVGhlIHNlbGVjdGlvbiBtZXRob2QgaXMgaXJyZWxhdmFudC5cbiAgICAvLyBBbmQgbm8gbmVlZCB0byB3YWl0IGZvciBkb2N1bWVudCByZWFkeS5cbiAgICBpZiAoc2VsZWN0b3IgPT0gJzpyb290Jykge1xuICAgICAgcmV0dXJuIHRyeVJlc29sdmUoKCkgPT4gdGhpcy5nZXRSb290RWxlbWVudCgpKTtcbiAgICB9XG4gICAgaWYgKHNlbGVjdG9yID09ICc6aG9zdCcpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICByZXNvbHZlKFxuICAgICAgICAgIHVzZXIoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgICAgICAgdGhpcy5nZXRIb3N0RWxlbWVudCgpLFxuICAgICAgICAgICAgYEVsZW1lbnQgXCIke3NlbGVjdG9yfVwiIG5vdCBmb3VuZGBcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciBkb2N1bWVudC1yZWFkeSB0byBhdm9pZCBmYWxzZSBtaXNzZWQgc2VhcmNoZXNcbiAgICByZXR1cm4gdGhpcy5hbXBkb2Mud2hlblJlYWR5KCkudGhlbigoKSA9PiB7XG4gICAgICBsZXQgZm91bmQ7XG4gICAgICBsZXQgcmVzdWx0ID0gbnVsbDtcbiAgICAgIC8vIFF1ZXJ5IHNlYXJjaCBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uIG1ldGhvZC5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzZWxlY3Rpb25NZXRob2QgPT0gJ3Njb3BlJykge1xuICAgICAgICAgIGZvdW5kID0gc2NvcGVkUXVlcnlTZWxlY3Rvcihjb250ZXh0LCBzZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uTWV0aG9kID09ICdjbG9zZXN0Jykge1xuICAgICAgICAgIGZvdW5kID0gY2xvc2VzdEFuY2VzdG9yRWxlbWVudEJ5U2VsZWN0b3IoY29udGV4dCwgc2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvdW5kID0gdGhpcy5nZXRSb290KCkucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdXNlckFzc2VydChmYWxzZSwgYEludmFsaWQgcXVlcnkgc2VsZWN0b3IgJHtzZWxlY3Rvcn1gKTtcbiAgICAgIH1cblxuICAgICAgLy8gRE9NIHNlYXJjaCBjYW4gXCJsb29rXCIgb3V0c2lkZSB0aGUgYm91bmRhcmllcyBvZiB0aGUgcm9vdCwgdGh1cyBtYWtlXG4gICAgICAvLyBzdXJlIHRoZSByZXN1bHQgaXMgY29udGFpbmVkLlxuICAgICAgaWYgKGZvdW5kICYmIHRoaXMuY29udGFpbnMoZm91bmQpKSB7XG4gICAgICAgIHJlc3VsdCA9IGZvdW5kO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVzZXIoKS5hc3NlcnRFbGVtZW50KHJlc3VsdCwgYEVsZW1lbnQgXCIke3NlbGVjdG9yfVwiIG5vdCBmb3VuZGApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFycmF5PHN0cmluZz59IHNlbGVjdG9ycyBBcnJheSBvZiBET00gcXVlcnkgc2VsZWN0b3JzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZURhdGFWYXJzIEluZGljYXRvciBpZiBEYXRhVmFycyByZXN0cmlzdGljdGlvbiBzaG91bGQgYmUgYXBwbGllZC5cbiAgICogRGVmYXVsdCBzZXQgdG8gdHJ1ZS5cbiAgICogQHJldHVybiB7IVByb21pc2U8IUFycmF5PCFFbGVtZW50Pj59IEVsZW1lbnQgY29ycmVzcG9uZGluZyB0byB0aGUgc2VsZWN0b3IuXG4gICAqL1xuICBnZXRFbGVtZW50c0J5UXVlcnlTZWxlY3RvckFsbF8oc2VsZWN0b3JzLCB1c2VEYXRhVmFycyA9IHRydWUpIHtcbiAgICAvLyBXYWl0IGZvciBkb2N1bWVudC1yZWFkeSB0byBhdm9pZCBmYWxzZSBtaXNzZWQgc2VhcmNoZXNcbiAgICByZXR1cm4gdGhpcy5hbXBkb2Mud2hlblJlYWR5KCkudGhlbigoKSA9PiB7XG4gICAgICBsZXQgZWxlbWVudHMgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBub2RlTGlzdDtcbiAgICAgICAgbGV0IGVsZW1lbnRBcnJheSA9IFtdO1xuICAgICAgICBjb25zdCBzZWxlY3RvciA9IHNlbGVjdG9yc1tpXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBub2RlTGlzdCA9IHRoaXMuZ2V0Um9vdCgpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdXNlckFzc2VydChmYWxzZSwgYEludmFsaWQgcXVlcnkgc2VsZWN0b3IgJHtzZWxlY3Rvcn1gKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGVMaXN0Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY29udGFpbnMobm9kZUxpc3Rbal0pKSB7XG4gICAgICAgICAgICBlbGVtZW50QXJyYXkucHVzaChub2RlTGlzdFtqXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRBcnJheSA9IHVzZURhdGFWYXJzXG4gICAgICAgICAgPyB0aGlzLmdldERhdGFWYXJzRWxlbWVudHNfKGVsZW1lbnRBcnJheSwgc2VsZWN0b3IpXG4gICAgICAgICAgOiBlbGVtZW50QXJyYXk7XG4gICAgICAgIHVzZXJBc3NlcnQoZWxlbWVudEFycmF5Lmxlbmd0aCwgYEVsZW1lbnQgXCIke3NlbGVjdG9yfVwiIG5vdCBmb3VuZGApO1xuICAgICAgICBlbGVtZW50cyA9IGVsZW1lbnRzLmNvbmNhdChlbGVtZW50QXJyYXkpO1xuICAgICAgfVxuICAgICAgLy8gUmV0dXJuIHVuaXF1ZVxuICAgICAgcmV0dXJuIGVsZW1lbnRzLmZpbHRlcihcbiAgICAgICAgKGVsZW1lbnQsIGluZGV4KSA9PiBlbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpID09PSBpbmRleFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYWxsIGVsZW1lbnRzIHRoYXQgaGF2ZSBhIGRhdGEtdmFycyBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSB7IUFycmF5PCFFbGVtZW50Pn0gZWxlbWVudEFycmF5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICAgKiBAcmV0dXJuIHshQXJyYXk8IUVsZW1lbnQ+fVxuICAgKi9cbiAgZ2V0RGF0YVZhcnNFbGVtZW50c18oZWxlbWVudEFycmF5LCBzZWxlY3Rvcikge1xuICAgIGxldCByZW1vdmVkQ291bnQgPSAwO1xuICAgIGNvbnN0IGRhdGFWYXJzQXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZGF0YVZhcktleXMgPSBPYmplY3Qua2V5cyhcbiAgICAgICAgZ2V0RGF0YVBhcmFtc0Zyb21BdHRyaWJ1dGVzKFxuICAgICAgICAgIGVsZW1lbnRBcnJheVtpXSxcbiAgICAgICAgICAvKiBjb21wdXRlUGFyYW1OYW1lRnVuYyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgVkFSSUFCTEVfREFUQV9BVFRSSUJVVEVfS0VZXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICBpZiAoZGF0YVZhcktleXMubGVuZ3RoKSB7XG4gICAgICAgIGRhdGFWYXJzQXJyYXkucHVzaChlbGVtZW50QXJyYXlbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtb3ZlZENvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZW1vdmVkQ291bnQpIHtcbiAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICBUQUcsXG4gICAgICAgICclcyBlbGVtZW50KHMpIG9tbWl0ZWQgZnJvbSBzZWxlY3RvciBcIiVzXCInICtcbiAgICAgICAgICAnIGJlY2F1c2Ugbm8gZGF0YS12YXJzLSogYXR0cmlidXRlIHdhcyBmb3VuZC4nLFxuICAgICAgICByZW1vdmVkQ291bnQsXG4gICAgICAgIHNlbGVjdG9yXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YVZhcnNBcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyB0aGUgQU1QIGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBzZWxlY3RvciB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoZVxuICAgKiBhbmFseXRpY3Mgcm9vdCBpbiByZWxhdGlvbnNoaXAgdG8gdGhlIHNwZWNpZmllZCBjb250ZXh0IG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGNvbnRleHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIERPTSBxdWVyeSBzZWxlY3Rvci5cbiAgICogQHBhcmFtIHs/c3RyaW5nPX0gc2VsZWN0aW9uTWV0aG9kIEFsbG93ZWQgdmFsdWVzIGFyZSBgbnVsbGAsXG4gICAqICAgYCdjbG9zZXN0J2AgYW5kIGAnc2NvcGUnYC5cbiAgICogQHJldHVybiB7IVByb21pc2U8IUFtcEVsZW1lbnQ+fSBBTVAgZWxlbWVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RvciBpZiBmb3VuZC5cbiAgICovXG4gIGdldEFtcEVsZW1lbnQoY29udGV4dCwgc2VsZWN0b3IsIHNlbGVjdGlvbk1ldGhvZCkge1xuICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnQoY29udGV4dCwgc2VsZWN0b3IsIHNlbGVjdGlvbk1ldGhvZCkudGhlbihcbiAgICAgIChlbGVtZW50KSA9PiB7XG4gICAgICAgIHRoaXMudmVyaWZ5QW1wRWxlbWVudHNfKFtlbGVtZW50XSwgc2VsZWN0b3IpO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGZvciB0aGUgZWxlbWVudChzKSB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yXG4gICAqIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIGFuYWx5dGljcyByb290IGluIHJlbGF0aW9uc2hpcCB0b1xuICAgKiB0aGUgc3BlY2lmaWVkIGNvbnRleHQgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudH0gY29udGV4dFxuICAgKiBAcGFyYW0geyFBcnJheTxzdHJpbmc+fHN0cmluZ30gc2VsZWN0b3JzIERPTSBxdWVyeSBzZWxlY3RvcihzKS5cbiAgICogQHBhcmFtIHs/c3RyaW5nPX0gc2VsZWN0aW9uTWV0aG9kIEFsbG93ZWQgdmFsdWVzIGFyZSBgbnVsbGAsXG4gICAqICAgYCdjbG9zZXN0J2AgYW5kIGAnc2NvcGUnYC5cbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VEYXRhVmFycyBJbmRpY2F0b3IgaWYgRGF0YVZhcnMgcmVzdHJpc3RpY3Rpb24gc2hvdWxkIGJlIGFwcGxpZWQuXG4gICAqIERlZmF1bHQgc2V0IHRvIHRydWUuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPCFBcnJheTwhRWxlbWVudD4+fSBBcnJheSBvZiBlbGVtZW50cyBjb3JyZXNwb25kaW5nIHRvIHRoZSBzZWxlY3RvciBpZiBmb3VuZC5cbiAgICovXG4gIGdldEVsZW1lbnRzKGNvbnRleHQsIHNlbGVjdG9ycywgc2VsZWN0aW9uTWV0aG9kLCB1c2VEYXRhVmFycyA9IHRydWUpIHtcbiAgICBpZiAoaXNBcnJheShzZWxlY3RvcnMpKSB7XG4gICAgICB1c2VyQXNzZXJ0KFxuICAgICAgICAhc2VsZWN0aW9uTWV0aG9kLFxuICAgICAgICAnQ2Fubm90IGhhdmUgc2VsZWN0aW9uTWV0aG9kICVzIGRlZmluZWQgd2l0aCBhbiBhcnJheSBzZWxlY3Rvci4nLFxuICAgICAgICBzZWxlY3Rpb25NZXRob2RcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50c0J5UXVlcnlTZWxlY3RvckFsbF8oXG4gICAgICAgIC8qKiBAdHlwZSB7IUFycmF5PHN0cmluZz59ICovIChzZWxlY3RvcnMpLFxuICAgICAgICB1c2VEYXRhVmFyc1xuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudChcbiAgICAgIGNvbnRleHQsXG4gICAgICAvKiogQHR5cGUge3N0cmluZ30gKi8gKHNlbGVjdG9ycyksXG4gICAgICBzZWxlY3Rpb25NZXRob2RcbiAgICApLnRoZW4oKGVsZW1lbnQpID0+IFtlbGVtZW50XSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshQXJyYXk8RWxlbWVudD59IGVsZW1lbnRzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICAgKi9cbiAgdmVyaWZ5QW1wRWxlbWVudHNfKGVsZW1lbnRzLCBzZWxlY3Rvcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHVzZXJBc3NlcnQoXG4gICAgICAgIGVsZW1lbnRzW2ldLmNsYXNzTGlzdC5jb250YWlucygnaS1hbXBodG1sLWVsZW1lbnQnKSxcbiAgICAgICAgJ0VsZW1lbnQgXCIlc1wiIGlzIHJlcXVpcmVkIHRvIGJlIGFuIEFNUCBlbGVtZW50JyxcbiAgICAgICAgc2VsZWN0b3JcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbGlzdGVuZXItZmlsdGVyIGZvciBET00gZXZlbnRzIHRvIGNoZWNrIGFnYWluc3QgdGhlIHNwZWNpZmllZFxuICAgKiBzZWxlY3Rvci4gSWYgdGhlIG5vZGUgKG9yIGl0cyBhbmNlc3RvcnMpIG1hdGNoIHRoZSBzZWxlY3RvciB0aGUgbGlzdGVuZXJcbiAgICogd2lsbCBiZSBjYWxsZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUVsZW1lbnQsICFFdmVudCl9IGxpc3RlbmVyIFRoZSBmaXJzdCBhcmd1bWVudCBpcyB0aGVcbiAgICogICBtYXRjaGVkIHRhcmdldCBub2RlIGFuZCB0aGUgc2Vjb25kIGlzIHRoZSBvcmlnaW5hbCBldmVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gY29udGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgRE9NIHF1ZXJ5IHNlbGVjdG9yLlxuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBzZWxlY3Rpb25NZXRob2QgQWxsb3dlZCB2YWx1ZXMgYXJlIGBudWxsYCxcbiAgICogICBgJ2Nsb3Nlc3QnYCBhbmQgYCdzY29wZSdgLlxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbighRXZlbnQpfVxuICAgKi9cbiAgY3JlYXRlU2VsZWN0aXZlTGlzdGVuZXIobGlzdGVuZXIsIGNvbnRleHQsIHNlbGVjdG9yLCBzZWxlY3Rpb25NZXRob2QgPSBudWxsKSB7XG4gICAgcmV0dXJuIChldmVudCkgPT4ge1xuICAgICAgaWYgKHNlbGVjdG9yID09ICc6aG9zdCcpIHtcbiAgICAgICAgLy8gYDpob3N0YCBpcyBub3QgcmVhY2hhYmxlIHZpYSBzZWxlY3RpdmUgbGlzdGVuZXIgYi9jIGV2ZW50IHBhdGhcbiAgICAgICAgLy8gY2Fubm90IGJlIHJldGFyZ2V0ZWQgYWNyb3NzIHRoZSBib3VuZGFyeSBvZiB0aGUgZW1iZWQuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTmF2aWdhdGUgdXAgdGhlIERPTSB0cmVlIHRvIGZpbmQgdGhlIGFjdHVhbCB0YXJnZXQuXG4gICAgICBjb25zdCByb290RWxlbWVudCA9IHRoaXMuZ2V0Um9vdEVsZW1lbnQoKTtcbiAgICAgIGNvbnN0IGlzU2VsZWN0QW55ID0gc2VsZWN0b3IgPT0gJyonO1xuICAgICAgY29uc3QgaXNTZWxlY3RSb290ID0gc2VsZWN0b3IgPT0gJzpyb290JztcbiAgICAgIGxldCB7dGFyZ2V0fSA9IGV2ZW50O1xuICAgICAgd2hpbGUgKHRhcmdldCkge1xuICAgICAgICAvLyBUYXJnZXQgbXVzdCBiZSBjb250YWluZWQgYnkgdGhpcyByb290LlxuICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModGFyZ2V0KSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIGA6c2NvcGVgIGNvbnRleHQgbXVzdCBjb250YWluIHRoZSB0YXJnZXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBzZWxlY3Rpb25NZXRob2QgPT0gJ3Njb3BlJyAmJlxuICAgICAgICAgICFpc1NlbGVjdFJvb3QgJiZcbiAgICAgICAgICAhY29udGV4dC5jb250YWlucyh0YXJnZXQpXG4gICAgICAgICkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIGBjbG9zZXN0KClgIHRhcmdldCBtdXN0IGNvbnRhaW4gdGhlIGNvbmV4dC5cbiAgICAgICAgaWYgKHNlbGVjdGlvbk1ldGhvZCA9PSAnY2xvc2VzdCcgJiYgIXRhcmdldC5jb250YWlucyhjb250ZXh0KSkge1xuICAgICAgICAgIC8vIEhvd2V2ZXIsIHRoZSBzZWFyY2ggbXVzdCBjb250aW51ZSFcbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSB0YXJnZXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3IuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBpc1NlbGVjdEFueSB8fFxuICAgICAgICAgIChpc1NlbGVjdFJvb3QgJiYgdGFyZ2V0ID09IHJvb3RFbGVtZW50KSB8fFxuICAgICAgICAgIHRyeU1hdGNoZXNfKHRhcmdldCwgc2VsZWN0b3IpXG4gICAgICAgICkge1xuICAgICAgICAgIGxpc3RlbmVyKHRhcmdldCwgZXZlbnQpO1xuICAgICAgICAgIC8vIERvbid0IGZpcmUgdGhlIGV2ZW50IG11bHRpcGxlIHRpbWVzIGV2ZW4gaWYgdGhlIG1vcmUgdGhhbiBvbmVcbiAgICAgICAgICAvLyBhbmNlc3RvciBtYXRjaGVzIHRoZSBzZWxlY3Rvci5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgYXMgc29vbiBhcyB0aGUgZWxlbWVudHMgd2l0aGluXG4gICAqIHRoZSByb290IGhhdmUgYmVlbiBsb2FkZWQgaW5zaWRlIHRoZSBmaXJzdCB2aWV3cG9ydCBvZiB0aGUgcm9vdC5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgd2hlbkluaUxvYWRlZCgpIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZpc2liaWxpdHkgcm9vdCBjb3JyZXNwb25kaW5nIHRvIHRoaXMgYW5hbHl0aWNzIHJvb3QgKGFtcGRvY1xuICAgKiBvciBlbWJlZCkuIFRoZSB2aXNpYmlsaXR5IHJvb3QgaXMgY3JlYXRlZCBsYXppbHkgYXMgbmVlZGVkIGFuZCB0YWtlc1xuICAgKiBjYXJlIG9mIGFsbCB2aXNpYmlsaXR5IHRyYWNraW5nIGZ1bmN0aW9ucy5cbiAgICogQHJldHVybiB7IS4vdmlzaWJpbGl0eS1tYW5hZ2VyLlZpc2liaWxpdHlNYW5hZ2VyfVxuICAgKi9cbiAgZ2V0VmlzaWJpbGl0eU1hbmFnZXIoKSB7XG4gICAgaWYgKCF0aGlzLnZpc2liaWxpdHlNYW5hZ2VyXykge1xuICAgICAgdGhpcy52aXNpYmlsaXR5TWFuYWdlcl8gPSBwcm92aWRlVmlzaWJpbGl0eU1hbmFnZXIodGhpcy5nZXRSb290KCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy52aXNpYmlsaXR5TWFuYWdlcl87XG4gIH1cblxuICAvKipcbiAgICogIFJldHVybnMgdGhlIFNjcm9sbCBNYW5hZ2V0IGNvcnJlc3BvbmRpbmcgdG8gdGhpcyBhbmFseXRpY3Mgcm9vdC5cbiAgICogVGhlIFNjcm9sbCBNYW5hZ2VyIGlzIGNyZWF0ZWQgbGF6aWx5IGFzIG5lZWRlZCwgYW5kIHdpbGwgaGFuZGxlXG4gICAqIGNhbGxpbmcgYWxsIGhhbmRsZXJzIGZvciBhIHNjcm9sbCBldmVudC5cbiAgICogQHJldHVybiB7IS4vc2Nyb2xsLW1hbmFnZXIuU2Nyb2xsTWFuYWdlcn1cbiAgICovXG4gIGdldFNjcm9sbE1hbmFnZXIoKSB7XG4gICAgLy8gVE9ETyAoemhvdXl4QCk6IERpc2FsbG93IHNjcm9sbCB0cmlnZ2VyIHdpdGggaG9zdCBBUElcbiAgICBpZiAoIXRoaXMuc2Nyb2xsTWFuYWdlcl8pIHtcbiAgICAgIHRoaXMuc2Nyb2xsTWFuYWdlcl8gPSBuZXcgU2Nyb2xsTWFuYWdlcih0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zY3JvbGxNYW5hZ2VyXztcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgYW5hbHl0aWNzIHJvb3QgZm9yIGFuIGFtcGRvYy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFtcGRvY0FuYWx5dGljc1Jvb3QgZXh0ZW5kcyBBbmFseXRpY3NSb290IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICBzdXBlcihhbXBkb2MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRUeXBlKCkge1xuICAgIHJldHVybiAnYW1wZG9jJztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0Um9vdCgpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2MuZ2V0Um9vdE5vZGUoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0SG9zdEVsZW1lbnQoKSB7XG4gICAgLy8gYW1wZG9jIGlzIGFsd2F5cyB0aGUgcm9vdCBvZiBldmVyeXRoaW5nIC0gbm8gaG9zdC5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc2lnbmFscygpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2Muc2lnbmFscygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRFbGVtZW50QnlJZChpZCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy5nZXRFbGVtZW50QnlJZChpZCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdoZW5JbmlMb2FkZWQoKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBTZXJ2aWNlcy52aWV3cG9ydEZvckRvYyh0aGlzLmFtcGRvYyk7XG4gICAgbGV0IHJlY3Q7XG4gICAgaWYgKGdldE1vZGUodGhpcy5hbXBkb2Mud2luKS5ydW50aW1lID09ICdpbmFib3gnKSB7XG4gICAgICAvLyBUT0RPKGR2b3l0ZW5rbywgIzc5NzEpOiBUaGlzIGlzIGN1cnJlbnRseSBhZGRyZXNzZXMgaW5jb3JyZWN0IHBvc2l0aW9uXG4gICAgICAvLyBjYWxjdWxhdGlvbnMgaW4gYSBpbi1hLWJveCB2aWV3cG9ydCB3aGVyZSBhbGwgZWxlbWVudHMgYXJlIG9mZnNldFxuICAgICAgLy8gdG8gdGhlIGJvdHRvbSBvZiB0aGUgZW1iZWQuIFRoZSBjdXJyZW50IGFwcHJvYWNoLCBldmVuIGlmIGZpeGVkLCBzdGlsbFxuICAgICAgLy8gY3JlYXRlcyBhIHNpZ25pZmljYW50IHByb2JhYmlsaXR5IG9mIHJpc2sgY29uZGl0aW9uLlxuICAgICAgLy8gT25jZSBhZGRyZXNzLCB3ZSBjYW4gc2ltcGx5IHN3aXRjaCB0byB0aGUgMC8wIGFwcHJvYWNoIGluIHRoZSBgZWxzZWBcbiAgICAgIC8vIGNsYXVzZS5cbiAgICAgIHJlY3QgPSB2aWV3cG9ydC5nZXRMYXlvdXRSZWN0KHRoaXMuZ2V0Um9vdEVsZW1lbnQoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNpemUgPSB2aWV3cG9ydC5nZXRTaXplKCk7XG4gICAgICByZWN0ID0gbGF5b3V0UmVjdEx0d2goMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuICAgIH1cbiAgICByZXR1cm4gd2hlbkNvbnRlbnRJbmlMb2FkKHRoaXMuYW1wZG9jLCB0aGlzLmFtcGRvYy53aW4sIHJlY3QpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBhbmFseXRpY3Mgcm9vdCBmb3IgRklFLlxuICogVE9ETygjMjI3MzMpOiBtZXJnZSBpbnRvIEFuYWx5dGljc1Jvb3Qgb25jZSBhbXBkb2MtZmllIGlzIGxhdW5jaGVkLlxuICovXG5leHBvcnQgY2xhc3MgRW1iZWRBbmFseXRpY3NSb290IGV4dGVuZHMgQW5hbHl0aWNzUm9vdCB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvZnJpZW5kbHktaWZyYW1lLWVtYmVkLkZyaWVuZGx5SWZyYW1lRW1iZWR9IGVtYmVkXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MsIGVtYmVkKSB7XG4gICAgc3VwZXIoYW1wZG9jKTtcbiAgICAvKiogQGNvbnN0ICovXG4gICAgdGhpcy5lbWJlZCA9IGVtYmVkO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRUeXBlKCkge1xuICAgIHJldHVybiAnZW1iZWQnO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSb290KCkge1xuICAgIHJldHVybiB0aGlzLmVtYmVkLndpbi5kb2N1bWVudDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0SG9zdEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1iZWQuaWZyYW1lO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzaWduYWxzKCkge1xuICAgIHJldHVybiB0aGlzLmVtYmVkLnNpZ25hbHMoKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0RWxlbWVudEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWJlZC53aW4uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICB3aGVuSW5pTG9hZGVkKCkge1xuICAgIHJldHVybiB0aGlzLmVtYmVkLndoZW5JbmlMb2FkZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSAgeyFFbGVtZW50fSBlbFxuICogQHBhcmFtICB7c3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gdHJ5TWF0Y2hlc18oZWwsIHNlbGVjdG9yKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIG1hdGNoZXMoZWwsIHNlbGVjdG9yKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHVzZXIoKS5lcnJvcihUQUcsICdCYWQgcXVlcnkgc2VsZWN0b3IuJywgc2VsZWN0b3IsIGUpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/analytics-root.js