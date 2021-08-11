var _templateObject, _templateObject2;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { Action, StateProperty, getStoreService } from "./amp-story-store-service";
import { Layout } from "../../../src/core/dom/layout";
import { closest } from "../../../src/core/dom/query";
import { copyChildren, removeChildren } from "../../../src/core/dom";
import { dev, user } from "../../../src/log";
import { getStoryAttributeSrc } from "./utils";
import { htmlFor } from "../../../src/core/dom/static-template";
import { isArray, isObject } from "../../../src/core/types";
import { parseJson } from "../../../src/core/types/object/json";
import { setImportantStyles } from "../../../src/core/dom/style";

/** @const {string} */
var TAG = 'amp-story-access';

/**
 * @enum {string}
 */
export var Type = {
  BLOCKING: 'blocking',
  NOTIFICATION: 'notification'
};

/**
 * Story access blocking type template.
 * @param {!Element} element
 * @return {!Element}
 */
var getBlockingTemplate = function getBlockingTemplate(element) {
  return htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-access-overflow\">\n        <div class=\"i-amphtml-story-access-container\">\n          <div class=\"i-amphtml-story-access-header\">\n            <div class=\"i-amphtml-story-access-logo\"></div>\n          </div>\n          <div class=\"i-amphtml-story-access-content\"></div>\n        </div>\n      </div>"])));
};

/**
 * Story access notification type template.
 * @param {!Element} element
 * @return {!Element}
 */
var getNotificationTemplate = function getNotificationTemplate(element) {
  return htmlFor(element)(_templateObject2 || (_templateObject2 = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-story-access-overflow\">\n        <div class=\"i-amphtml-story-access-container\">\n          <div class=\"i-amphtml-story-access-content\">\n            <span class=\"i-amphtml-story-access-close-button\" role=\"button\">\n              &times;\n            </span>\n          </div>\n        </div>\n      </div>"])));
};

/**
 * The <amp-story-access> custom element.
 */
export var AmpStoryAccess = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpStoryAccess, _AMP$BaseElement);

  var _super = _createSuper(AmpStoryAccess);

  /** @param {!AmpElement} element */
  function AmpStoryAccess(element) {
    var _this;

    _classCallCheck(this, AmpStoryAccess);

    _this = _super.call(this, element);

    /** @private {?Element} */
    _this.containerEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = getStoreService(_this.win);
    return _this;
  }

  /** @override */
  _createClass(AmpStoryAccess, [{
    key: "buildCallback",
    value: function buildCallback() {
      // Defaults to blocking paywall.
      if (!this.element.hasAttribute('type')) {
        this.element.setAttribute('type', Type.BLOCKING);
      }

      var drawerEl = this.renderDrawerEl_();
      this.containerEl_ = dev().assertElement(drawerEl.querySelector('.i-amphtml-story-access-container'));
      var contentEl = dev().assertElement(drawerEl.querySelector('.i-amphtml-story-access-content'));
      copyChildren(this.element, contentEl);
      removeChildren(this.element);
      this.element.appendChild(drawerEl);
      this.allowlistActions_();
      this.initializeListeners_();
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }
    /**
     * @private
     */

  }, {
    key: "initializeListeners_",
    value: function initializeListeners_() {
      var _this2 = this;

      this.storeService_.subscribe(StateProperty.ACCESS_STATE, function (isAccess) {
        _this2.onAccessStateChange_(isAccess);
      });
      this.storeService_.subscribe(StateProperty.CURRENT_PAGE_INDEX, function (currentPageIndex) {
        _this2.onCurrentPageIndexChange_(currentPageIndex);
      }, true
      /** callToInitialize */
      );
      this.element.addEventListener('click', function (event) {
        return _this2.onClick_(event);
      });
    }
    /**
     * Reacts to access state updates, and shows/hides the UI accordingly.
     * @param {boolean} isAccess
     * @private
     */

  }, {
    key: "onAccessStateChange_",
    value: function onAccessStateChange_(isAccess) {
      if (this.getType_() === Type.BLOCKING) {
        this.toggle_(isAccess);
      }
    }
    /**
     * Reacts to story active page index update, and maybe display the
     * "notification" story-access.
     * @param {number} currentPageIndex
     */

  }, {
    key: "onCurrentPageIndexChange_",
    value: function onCurrentPageIndexChange_(currentPageIndex) {
      if (this.getType_() === Type.NOTIFICATION) {
        // Only show the notification if on the first page of the story.
        // Note: this can be overriden by an amp-access attribute that might
        // show/hide the notification based on the user's authorizations.
        this.toggle_(currentPageIndex === 0);
      }
    }
    /**
     * Handles click events and maybe closes the paywall.
     * @param {!Event} event
     * @return {*} TODO(#23582): Specify return type
     * @private
     */

  }, {
    key: "onClick_",
    value: function onClick_(event) {
      var _this3 = this;

      var el = dev().assertElement(event.target);

      if (el.classList.contains('i-amphtml-story-access-close-button')) {
        return this.toggle_(false);
      }

      // Closes the menu if click happened outside of the main container.
      if (!closest(el, function (el) {
        return el === _this3.containerEl_;
      }, this.element)) {
        this.storeService_.dispatch(Action.TOGGLE_ACCESS, false);
      }
    }
    /**
     * @param {boolean} show
     * @private
     */

  }, {
    key: "toggle_",
    value: function toggle_(show) {
      var _this4 = this;

      this.mutateElement(function () {
        _this4.element.classList.toggle('i-amphtml-story-access-visible', show);
      });
    }
    /**
     * Returns the element's type.
     * @return {string}
     * @private
     */

  }, {
    key: "getType_",
    value: function getType_() {
      return this.element.getAttribute('type').toLowerCase();
    }
    /**
     * Renders and returns an empty drawer element element that will contain the
     * publisher provided DOM, depending on the type of <amp-story-access>.
     * Blocking template gets a header containing the publisher's logo, and
     * notification template gets a "dismiss" button.
     * @return {!Element|undefined}
     * @private
     */

  }, {
    key: "renderDrawerEl_",
    value: function renderDrawerEl_() {
      switch (this.getType_()) {
        case Type.BLOCKING:
          var drawerEl = getBlockingTemplate(this.element);
          var logoSrc = getStoryAttributeSrc(this.element, 'publisher-logo-src',
          /* warn */
          true);

          if (logoSrc) {
            var logoEl = dev().assertElement(drawerEl.querySelector('.i-amphtml-story-access-logo'));
            setImportantStyles(logoEl, {
              'background-image': "url(" + logoSrc + ")"
            });
          }

          return drawerEl;
          break;

        case Type.NOTIFICATION:
          return getNotificationTemplate(this.element);
          break;

        default:
          user().error(TAG, 'Unknown "type" attribute, expected one of: ' + 'blocking, notification.');
      }
    }
    /**
     * Allowlists the <amp-access> actions.
     * Depending on the publisher configuration, actions can be:
     *   - login
     *   - login-<namespace>
     *   - login-<namespace>-<type>
     *
     * Publishers can provide one (object) or multiple (array) configurations,
     * identified by their "namespace" property.
     * Each configuration can have one or multiple login URLs, called "type".
     * All the namespace/type pairs have to be allowlisted.
     * @private
     */

  }, {
    key: "allowlistActions_",
    value: function allowlistActions_() {
      var _this5 = this;

      var accessEl = dev().assertElement(this.win.document.getElementById('amp-access'), 'Cannot find the amp-access configuration');
      // Configuration validation is handled by the amp-access extension.
      var accessConfig =
      /** @type {!Array|!Object} */
      parseJson(accessEl.textContent);

      if (!isArray(accessConfig)) {
        accessConfig = [accessConfig];

        // If there is only one configuration and the publisher provided a
        // namespace, we want to allow actions with or without namespace.
        if (accessConfig[0].namespace) {
          accessConfig.push(_extends({}, accessConfig[0], {
            namespace: undefined
          }));
        }
      }

      var actions = [];

      /** @type {!Array} */
      accessConfig.forEach(function (config) {
        var login =
        /** @type {{login, namespace}} */
        config.login,
            namespace =
        /** @type {{login, namespace}} */
        config.namespace;

        if (isObject(login)) {
          var types = Object.keys(login);
          types.forEach(function (type) {
            return actions.push(_this5.getActionObject_(namespace, type));
          });
        } else {
          actions.push(_this5.getActionObject_(namespace));
        }
      });
      this.storeService_.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, actions);
    }
    /**
     * Allowlists an action for the given namespace / type pair.
     * @param {string=} namespace
     * @param {string=} type
     * @return {*} TODO(#23582): Specify return type
     * @private
     */

  }, {
    key: "getActionObject_",
    value: function getActionObject_(namespace, type) {
      if (namespace === void 0) {
        namespace = undefined;
      }

      if (type === void 0) {
        type = undefined;
      }

      var method = ['login', namespace, type].filter(Boolean).join('-');
      return {
        tagOrTarget: 'SCRIPT',
        method: method
      };
    }
  }]);

  return AmpStoryAccess;
}(AMP.BaseElement);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1hY2Nlc3MuanMiXSwibmFtZXMiOlsiQWN0aW9uIiwiU3RhdGVQcm9wZXJ0eSIsImdldFN0b3JlU2VydmljZSIsIkxheW91dCIsImNsb3Nlc3QiLCJjb3B5Q2hpbGRyZW4iLCJyZW1vdmVDaGlsZHJlbiIsImRldiIsInVzZXIiLCJnZXRTdG9yeUF0dHJpYnV0ZVNyYyIsImh0bWxGb3IiLCJpc0FycmF5IiwiaXNPYmplY3QiLCJwYXJzZUpzb24iLCJzZXRJbXBvcnRhbnRTdHlsZXMiLCJUQUciLCJUeXBlIiwiQkxPQ0tJTkciLCJOT1RJRklDQVRJT04iLCJnZXRCbG9ja2luZ1RlbXBsYXRlIiwiZWxlbWVudCIsImdldE5vdGlmaWNhdGlvblRlbXBsYXRlIiwiQW1wU3RvcnlBY2Nlc3MiLCJjb250YWluZXJFbF8iLCJzdG9yZVNlcnZpY2VfIiwid2luIiwiaGFzQXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiZHJhd2VyRWwiLCJyZW5kZXJEcmF3ZXJFbF8iLCJhc3NlcnRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsImNvbnRlbnRFbCIsImFwcGVuZENoaWxkIiwiYWxsb3dsaXN0QWN0aW9uc18iLCJpbml0aWFsaXplTGlzdGVuZXJzXyIsImxheW91dCIsIkNPTlRBSU5FUiIsInN1YnNjcmliZSIsIkFDQ0VTU19TVEFURSIsImlzQWNjZXNzIiwib25BY2Nlc3NTdGF0ZUNoYW5nZV8iLCJDVVJSRU5UX1BBR0VfSU5ERVgiLCJjdXJyZW50UGFnZUluZGV4Iiwib25DdXJyZW50UGFnZUluZGV4Q2hhbmdlXyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIm9uQ2xpY2tfIiwiZ2V0VHlwZV8iLCJ0b2dnbGVfIiwiZWwiLCJ0YXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImRpc3BhdGNoIiwiVE9HR0xFX0FDQ0VTUyIsInNob3ciLCJtdXRhdGVFbGVtZW50IiwidG9nZ2xlIiwiZ2V0QXR0cmlidXRlIiwidG9Mb3dlckNhc2UiLCJsb2dvU3JjIiwibG9nb0VsIiwiZXJyb3IiLCJhY2Nlc3NFbCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJhY2Nlc3NDb25maWciLCJ0ZXh0Q29udGVudCIsIm5hbWVzcGFjZSIsInB1c2giLCJ1bmRlZmluZWQiLCJhY3Rpb25zIiwiZm9yRWFjaCIsImNvbmZpZyIsImxvZ2luIiwidHlwZXMiLCJPYmplY3QiLCJrZXlzIiwidHlwZSIsImdldEFjdGlvbk9iamVjdF8iLCJBRERfVE9fQUNUSU9OU19BTExPV0xJU1QiLCJtZXRob2QiLCJmaWx0ZXIiLCJCb29sZWFuIiwiam9pbiIsInRhZ09yVGFyZ2V0IiwiQU1QIiwiQmFzZUVsZW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsTUFERixFQUVFQyxhQUZGLEVBR0VDLGVBSEY7QUFLQSxTQUFRQyxNQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLFlBQVIsRUFBc0JDLGNBQXRCO0FBQ0EsU0FBUUMsR0FBUixFQUFhQyxJQUFiO0FBQ0EsU0FBUUMsb0JBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsUUFBakI7QUFDQSxTQUFRQyxTQUFSO0FBQ0EsU0FBUUMsa0JBQVI7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsa0JBQVo7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxJQUFJLEdBQUc7QUFDbEJDLEVBQUFBLFFBQVEsRUFBRSxVQURRO0FBRWxCQyxFQUFBQSxZQUFZLEVBQUU7QUFGSSxDQUFiOztBQUtQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxtQkFBbUIsR0FBRyxTQUF0QkEsbUJBQXNCLENBQUNDLE9BQUQsRUFBYTtBQUN2QyxTQUFPVixPQUFPLENBQUNVLE9BQUQsQ0FBZDtBQVNELENBVkQ7O0FB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RCxVQUFNVyxNQUFNLEdBQUcsQ0FBQyxPQUFELEVBQVViLFNBQVYsRUFBcUJVLElBQXJCLEVBQTJCSSxNQUEzQixDQUFrQ0MsT0FBbEMsRUFBMkNDLElBQTNDLENBQWdELEdBQWhELENBQWY7QUFDQSxhQUFPO0FBQUNDLFFBQUFBLFdBQVcsRUFBRSxRQUFkO0FBQXdCSixRQUFBQSxNQUFNLEVBQU5BO0FBQXhCLE9BQVA7QUFDRDtBQW5PSDs7QUFBQTtBQUFBLEVBQW9DSyxHQUFHLENBQUNDLFdBQXhDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7XG4gIEFjdGlvbixcbiAgU3RhdGVQcm9wZXJ0eSxcbiAgZ2V0U3RvcmVTZXJ2aWNlLFxufSBmcm9tICcuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7TGF5b3V0fSBmcm9tICcjY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnI2NvcmUvZG9tL3F1ZXJ5JztcbmltcG9ydCB7Y29weUNoaWxkcmVuLCByZW1vdmVDaGlsZHJlbn0gZnJvbSAnI2NvcmUvZG9tJztcbmltcG9ydCB7ZGV2LCB1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7Z2V0U3RvcnlBdHRyaWJ1dGVTcmN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtodG1sRm9yfSBmcm9tICcjY29yZS9kb20vc3RhdGljLXRlbXBsYXRlJztcbmltcG9ydCB7aXNBcnJheSwgaXNPYmplY3R9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7cGFyc2VKc29ufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QvanNvbic7XG5pbXBvcnQge3NldEltcG9ydGFudFN0eWxlc30gZnJvbSAnI2NvcmUvZG9tL3N0eWxlJztcblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuY29uc3QgVEFHID0gJ2FtcC1zdG9yeS1hY2Nlc3MnO1xuXG4vKipcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUeXBlID0ge1xuICBCTE9DS0lORzogJ2Jsb2NraW5nJyxcbiAgTk9USUZJQ0FUSU9OOiAnbm90aWZpY2F0aW9uJyxcbn07XG5cbi8qKlxuICogU3RvcnkgYWNjZXNzIGJsb2NraW5nIHR5cGUgdGVtcGxhdGUuXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJuIHshRWxlbWVudH1cbiAqL1xuY29uc3QgZ2V0QmxvY2tpbmdUZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBodG1sRm9yKGVsZW1lbnQpYFxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3Mtb3ZlcmZsb3dcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3MtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3MtaGVhZGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaS1hbXBodG1sLXN0b3J5LWFjY2Vzcy1sb2dvXCI+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3MtY29udGVudFwiPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PmA7XG59O1xuXG4vKipcbiAqIFN0b3J5IGFjY2VzcyBub3RpZmljYXRpb24gdHlwZSB0ZW1wbGF0ZS5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5jb25zdCBnZXROb3RpZmljYXRpb25UZW1wbGF0ZSA9IChlbGVtZW50KSA9PiB7XG4gIHJldHVybiBodG1sRm9yKGVsZW1lbnQpYFxuICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3Mtb3ZlcmZsb3dcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3MtY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImktYW1waHRtbC1zdG9yeS1hY2Nlc3MtY29udGVudFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpLWFtcGh0bWwtc3RvcnktYWNjZXNzLWNsb3NlLWJ1dHRvblwiIHJvbGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgICAgJnRpbWVzO1xuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PmA7XG59O1xuXG4vKipcbiAqIFRoZSA8YW1wLXN0b3J5LWFjY2Vzcz4gY3VzdG9tIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBTdG9yeUFjY2VzcyBleHRlbmRzIEFNUC5CYXNlRWxlbWVudCB7XG4gIC8qKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50ICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihlbGVtZW50KTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P0VsZW1lbnR9ICovXG4gICAgdGhpcy5jb250YWluZXJFbF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7IS4vYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UuQW1wU3RvcnlTdG9yZVNlcnZpY2V9ICovXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfID0gZ2V0U3RvcmVTZXJ2aWNlKHRoaXMud2luKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgYnVpbGRDYWxsYmFjaygpIHtcbiAgICAvLyBEZWZhdWx0cyB0byBibG9ja2luZyBwYXl3YWxsLlxuICAgIGlmICghdGhpcy5lbGVtZW50Lmhhc0F0dHJpYnV0ZSgndHlwZScpKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgVHlwZS5CTE9DS0lORyk7XG4gICAgfVxuXG4gICAgY29uc3QgZHJhd2VyRWwgPSB0aGlzLnJlbmRlckRyYXdlckVsXygpO1xuXG4gICAgdGhpcy5jb250YWluZXJFbF8gPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgZHJhd2VyRWwucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1hY2Nlc3MtY29udGFpbmVyJylcbiAgICApO1xuICAgIGNvbnN0IGNvbnRlbnRFbCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICBkcmF3ZXJFbC5xdWVyeVNlbGVjdG9yKCcuaS1hbXBodG1sLXN0b3J5LWFjY2Vzcy1jb250ZW50JylcbiAgICApO1xuXG4gICAgY29weUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgY29udGVudEVsKTtcbiAgICByZW1vdmVDaGlsZHJlbih0aGlzLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGRyYXdlckVsKTtcblxuICAgIHRoaXMuYWxsb3dsaXN0QWN0aW9uc18oKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUxpc3RlbmVyc18oKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNMYXlvdXRTdXBwb3J0ZWQobGF5b3V0KSB7XG4gICAgcmV0dXJuIGxheW91dCA9PSBMYXlvdXQuQ09OVEFJTkVSO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBpbml0aWFsaXplTGlzdGVuZXJzXygpIHtcbiAgICB0aGlzLnN0b3JlU2VydmljZV8uc3Vic2NyaWJlKFN0YXRlUHJvcGVydHkuQUNDRVNTX1NUQVRFLCAoaXNBY2Nlc3MpID0+IHtcbiAgICAgIHRoaXMub25BY2Nlc3NTdGF0ZUNoYW5nZV8oaXNBY2Nlc3MpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLnN1YnNjcmliZShcbiAgICAgIFN0YXRlUHJvcGVydHkuQ1VSUkVOVF9QQUdFX0lOREVYLFxuICAgICAgKGN1cnJlbnRQYWdlSW5kZXgpID0+IHtcbiAgICAgICAgdGhpcy5vbkN1cnJlbnRQYWdlSW5kZXhDaGFuZ2VfKGN1cnJlbnRQYWdlSW5kZXgpO1xuICAgICAgfSxcbiAgICAgIHRydWUgLyoqIGNhbGxUb0luaXRpYWxpemUgKi9cbiAgICApO1xuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB0aGlzLm9uQ2xpY2tfKGV2ZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogUmVhY3RzIHRvIGFjY2VzcyBzdGF0ZSB1cGRhdGVzLCBhbmQgc2hvd3MvaGlkZXMgdGhlIFVJIGFjY29yZGluZ2x5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQWNjZXNzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkFjY2Vzc1N0YXRlQ2hhbmdlXyhpc0FjY2Vzcykge1xuICAgIGlmICh0aGlzLmdldFR5cGVfKCkgPT09IFR5cGUuQkxPQ0tJTkcpIHtcbiAgICAgIHRoaXMudG9nZ2xlXyhpc0FjY2Vzcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWN0cyB0byBzdG9yeSBhY3RpdmUgcGFnZSBpbmRleCB1cGRhdGUsIGFuZCBtYXliZSBkaXNwbGF5IHRoZVxuICAgKiBcIm5vdGlmaWNhdGlvblwiIHN0b3J5LWFjY2Vzcy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGN1cnJlbnRQYWdlSW5kZXhcbiAgICovXG4gIG9uQ3VycmVudFBhZ2VJbmRleENoYW5nZV8oY3VycmVudFBhZ2VJbmRleCkge1xuICAgIGlmICh0aGlzLmdldFR5cGVfKCkgPT09IFR5cGUuTk9USUZJQ0FUSU9OKSB7XG4gICAgICAvLyBPbmx5IHNob3cgdGhlIG5vdGlmaWNhdGlvbiBpZiBvbiB0aGUgZmlyc3QgcGFnZSBvZiB0aGUgc3RvcnkuXG4gICAgICAvLyBOb3RlOiB0aGlzIGNhbiBiZSBvdmVycmlkZW4gYnkgYW4gYW1wLWFjY2VzcyBhdHRyaWJ1dGUgdGhhdCBtaWdodFxuICAgICAgLy8gc2hvdy9oaWRlIHRoZSBub3RpZmljYXRpb24gYmFzZWQgb24gdGhlIHVzZXIncyBhdXRob3JpemF0aW9ucy5cbiAgICAgIHRoaXMudG9nZ2xlXyhjdXJyZW50UGFnZUluZGV4ID09PSAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBjbGljayBldmVudHMgYW5kIG1heWJlIGNsb3NlcyB0aGUgcGF5d2FsbC5cbiAgICogQHBhcmFtIHshRXZlbnR9IGV2ZW50XG4gICAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25DbGlja18oZXZlbnQpIHtcbiAgICBjb25zdCBlbCA9IGRldigpLmFzc2VydEVsZW1lbnQoZXZlbnQudGFyZ2V0KTtcblxuICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1zdG9yeS1hY2Nlc3MtY2xvc2UtYnV0dG9uJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZV8oZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIENsb3NlcyB0aGUgbWVudSBpZiBjbGljayBoYXBwZW5lZCBvdXRzaWRlIG9mIHRoZSBtYWluIGNvbnRhaW5lci5cbiAgICBpZiAoIWNsb3Nlc3QoZWwsIChlbCkgPT4gZWwgPT09IHRoaXMuY29udGFpbmVyRWxfLCB0aGlzLmVsZW1lbnQpKSB7XG4gICAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlRPR0dMRV9BQ0NFU1MsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG93XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0b2dnbGVfKHNob3cpIHtcbiAgICB0aGlzLm11dGF0ZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2ktYW1waHRtbC1zdG9yeS1hY2Nlc3MtdmlzaWJsZScsIHNob3cpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVsZW1lbnQncyB0eXBlLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRUeXBlXygpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyBhbmQgcmV0dXJucyBhbiBlbXB0eSBkcmF3ZXIgZWxlbWVudCBlbGVtZW50IHRoYXQgd2lsbCBjb250YWluIHRoZVxuICAgKiBwdWJsaXNoZXIgcHJvdmlkZWQgRE9NLCBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgPGFtcC1zdG9yeS1hY2Nlc3M+LlxuICAgKiBCbG9ja2luZyB0ZW1wbGF0ZSBnZXRzIGEgaGVhZGVyIGNvbnRhaW5pbmcgdGhlIHB1Ymxpc2hlcidzIGxvZ28sIGFuZFxuICAgKiBub3RpZmljYXRpb24gdGVtcGxhdGUgZ2V0cyBhIFwiZGlzbWlzc1wiIGJ1dHRvbi5cbiAgICogQHJldHVybiB7IUVsZW1lbnR8dW5kZWZpbmVkfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVuZGVyRHJhd2VyRWxfKCkge1xuICAgIHN3aXRjaCAodGhpcy5nZXRUeXBlXygpKSB7XG4gICAgICBjYXNlIFR5cGUuQkxPQ0tJTkc6XG4gICAgICAgIGNvbnN0IGRyYXdlckVsID0gZ2V0QmxvY2tpbmdUZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuXG4gICAgICAgIGNvbnN0IGxvZ29TcmMgPSBnZXRTdG9yeUF0dHJpYnV0ZVNyYyhcbiAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgJ3B1Ymxpc2hlci1sb2dvLXNyYycsXG4gICAgICAgICAgLyogd2FybiAqLyB0cnVlXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGxvZ29TcmMpIHtcbiAgICAgICAgICBjb25zdCBsb2dvRWwgPSBkZXYoKS5hc3NlcnRFbGVtZW50KFxuICAgICAgICAgICAgZHJhd2VyRWwucXVlcnlTZWxlY3RvcignLmktYW1waHRtbC1zdG9yeS1hY2Nlc3MtbG9nbycpXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzZXRJbXBvcnRhbnRTdHlsZXMobG9nb0VsLCB7J2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCR7bG9nb1NyY30pYH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRyYXdlckVsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVHlwZS5OT1RJRklDQVRJT046XG4gICAgICAgIHJldHVybiBnZXROb3RpZmljYXRpb25UZW1wbGF0ZSh0aGlzLmVsZW1lbnQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ1Vua25vd24gXCJ0eXBlXCIgYXR0cmlidXRlLCBleHBlY3RlZCBvbmUgb2Y6ICcgK1xuICAgICAgICAgICAgJ2Jsb2NraW5nLCBub3RpZmljYXRpb24uJ1xuICAgICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd2xpc3RzIHRoZSA8YW1wLWFjY2Vzcz4gYWN0aW9ucy5cbiAgICogRGVwZW5kaW5nIG9uIHRoZSBwdWJsaXNoZXIgY29uZmlndXJhdGlvbiwgYWN0aW9ucyBjYW4gYmU6XG4gICAqICAgLSBsb2dpblxuICAgKiAgIC0gbG9naW4tPG5hbWVzcGFjZT5cbiAgICogICAtIGxvZ2luLTxuYW1lc3BhY2U+LTx0eXBlPlxuICAgKlxuICAgKiBQdWJsaXNoZXJzIGNhbiBwcm92aWRlIG9uZSAob2JqZWN0KSBvciBtdWx0aXBsZSAoYXJyYXkpIGNvbmZpZ3VyYXRpb25zLFxuICAgKiBpZGVudGlmaWVkIGJ5IHRoZWlyIFwibmFtZXNwYWNlXCIgcHJvcGVydHkuXG4gICAqIEVhY2ggY29uZmlndXJhdGlvbiBjYW4gaGF2ZSBvbmUgb3IgbXVsdGlwbGUgbG9naW4gVVJMcywgY2FsbGVkIFwidHlwZVwiLlxuICAgKiBBbGwgdGhlIG5hbWVzcGFjZS90eXBlIHBhaXJzIGhhdmUgdG8gYmUgYWxsb3dsaXN0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhbGxvd2xpc3RBY3Rpb25zXygpIHtcbiAgICBjb25zdCBhY2Nlc3NFbCA9IGRldigpLmFzc2VydEVsZW1lbnQoXG4gICAgICB0aGlzLndpbi5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW1wLWFjY2VzcycpLFxuICAgICAgJ0Nhbm5vdCBmaW5kIHRoZSBhbXAtYWNjZXNzIGNvbmZpZ3VyYXRpb24nXG4gICAgKTtcblxuICAgIC8vIENvbmZpZ3VyYXRpb24gdmFsaWRhdGlvbiBpcyBoYW5kbGVkIGJ5IHRoZSBhbXAtYWNjZXNzIGV4dGVuc2lvbi5cbiAgICBsZXQgYWNjZXNzQ29uZmlnID0gLyoqIEB0eXBlIHshQXJyYXl8IU9iamVjdH0gKi8gKFxuICAgICAgcGFyc2VKc29uKGFjY2Vzc0VsLnRleHRDb250ZW50KVxuICAgICk7XG5cbiAgICBpZiAoIWlzQXJyYXkoYWNjZXNzQ29uZmlnKSkge1xuICAgICAgYWNjZXNzQ29uZmlnID0gW2FjY2Vzc0NvbmZpZ107XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIG9ubHkgb25lIGNvbmZpZ3VyYXRpb24gYW5kIHRoZSBwdWJsaXNoZXIgcHJvdmlkZWQgYVxuICAgICAgLy8gbmFtZXNwYWNlLCB3ZSB3YW50IHRvIGFsbG93IGFjdGlvbnMgd2l0aCBvciB3aXRob3V0IG5hbWVzcGFjZS5cbiAgICAgIGlmIChhY2Nlc3NDb25maWdbMF0ubmFtZXNwYWNlKSB7XG4gICAgICAgIGFjY2Vzc0NvbmZpZy5wdXNoKHsuLi5hY2Nlc3NDb25maWdbMF0sIG5hbWVzcGFjZTogdW5kZWZpbmVkfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aW9ucyA9IFtdO1xuXG4gICAgLyoqIEB0eXBlIHshQXJyYXl9ICovIChhY2Nlc3NDb25maWcpLmZvckVhY2goKGNvbmZpZykgPT4ge1xuICAgICAgY29uc3Qge2xvZ2luLCBuYW1lc3BhY2V9ID0gLyoqIEB0eXBlIHt7bG9naW4sIG5hbWVzcGFjZX19ICovIChjb25maWcpO1xuXG4gICAgICBpZiAoaXNPYmplY3QobG9naW4pKSB7XG4gICAgICAgIGNvbnN0IHR5cGVzID0gT2JqZWN0LmtleXMobG9naW4pO1xuICAgICAgICB0eXBlcy5mb3JFYWNoKCh0eXBlKSA9PlxuICAgICAgICAgIGFjdGlvbnMucHVzaCh0aGlzLmdldEFjdGlvbk9iamVjdF8obmFtZXNwYWNlLCB0eXBlKSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdGlvbnMucHVzaCh0aGlzLmdldEFjdGlvbk9iamVjdF8obmFtZXNwYWNlKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLkFERF9UT19BQ1RJT05TX0FMTE9XTElTVCwgYWN0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dsaXN0cyBhbiBhY3Rpb24gZm9yIHRoZSBnaXZlbiBuYW1lc3BhY2UgLyB0eXBlIHBhaXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gbmFtZXNwYWNlXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gdHlwZVxuICAgKiBAcmV0dXJuIHsqfSBUT0RPKCMyMzU4Mik6IFNwZWNpZnkgcmV0dXJuIHR5cGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEFjdGlvbk9iamVjdF8obmFtZXNwYWNlID0gdW5kZWZpbmVkLCB0eXBlID0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgbWV0aG9kID0gWydsb2dpbicsIG5hbWVzcGFjZSwgdHlwZV0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKTtcbiAgICByZXR1cm4ge3RhZ09yVGFyZ2V0OiAnU0NSSVBUJywgbWV0aG9kfTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-access.js