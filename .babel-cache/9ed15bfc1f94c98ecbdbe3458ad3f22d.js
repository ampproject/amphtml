function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}var _template = ["<div class=i-amphtml-story-access-overflow><div class=i-amphtml-story-access-container><div class=i-amphtml-story-access-header><div class=i-amphtml-story-access-logo></div></div><div class=i-amphtml-story-access-content></div></div></div>"],_template2 = ["<div class=i-amphtml-story-access-overflow><div class=i-amphtml-story-access-container><div class=i-amphtml-story-access-content><span class=i-amphtml-story-access-close-button role=button>&times;</span></div></div></div>"];function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
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

import {
Action,
StateProperty,
getStoreService } from "./amp-story-store-service";

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
  NOTIFICATION: 'notification' };


/**
 * Story access blocking type template.
 * @param {!Element} element
 * @return {!Element}
 */
var getBlockingTemplate = function getBlockingTemplate(element) {
  return htmlFor(element)(_template);








};

/**
 * Story access notification type template.
 * @param {!Element} element
 * @return {!Element}
 */
var getNotificationTemplate = function getNotificationTemplate(element) {
  return htmlFor(element)(_template2);









};

/**
 * The <amp-story-access> custom element.
 */
export var AmpStoryAccess = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(AmpStoryAccess, _AMP$BaseElement);var _super = _createSuper(AmpStoryAccess);
  /** @param {!AmpElement} element */
  function AmpStoryAccess(element) {var _this;_classCallCheck(this, AmpStoryAccess);
    _this = _super.call(this, element);

    /** @private {?Element} */
    _this.containerEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    _this.storeService_ = getStoreService(_this.win);return _this;
  }

  /** @override */_createClass(AmpStoryAccess, [{ key: "buildCallback", value:
    function buildCallback() {
      // Defaults to blocking paywall.
      if (!this.element.hasAttribute('type')) {
        this.element.setAttribute('type', Type.BLOCKING);
      }

      var drawerEl = this.renderDrawerEl_();

      this.containerEl_ = /** @type {!Element} */(
      drawerEl.querySelector('.i-amphtml-story-access-container'));

      var contentEl = /** @type {!Element} */(
      drawerEl.querySelector('.i-amphtml-story-access-content'));


      copyChildren(this.element, contentEl);
      removeChildren(this.element);

      this.element.appendChild(drawerEl);

      this.allowlistActions_();

      this.initializeListeners_();
    }

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(layout) {
      return layout == Layout.CONTAINER;
    }

    /**
     * @private
     */ }, { key: "initializeListeners_", value:
    function initializeListeners_() {var _this2 = this;
      this.storeService_.subscribe(StateProperty.ACCESS_STATE, function (isAccess) {
        _this2.onAccessStateChange_(isAccess);
      });

      this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      function (currentPageIndex) {
        _this2.onCurrentPageIndexChange_(currentPageIndex);
      },
      true /** callToInitialize */);


      this.element.addEventListener('click', function (event) {return _this2.onClick_(event);});
    }

    /**
     * Reacts to access state updates, and shows/hides the UI accordingly.
     * @param {boolean} isAccess
     * @private
     */ }, { key: "onAccessStateChange_", value:
    function onAccessStateChange_(isAccess) {
      if (this.getType_() === Type.BLOCKING) {
        this.toggle_(isAccess);
      }
    }

    /**
     * Reacts to story active page index update, and maybe display the
     * "notification" story-access.
     * @param {number} currentPageIndex
     */ }, { key: "onCurrentPageIndexChange_", value:
    function onCurrentPageIndexChange_(currentPageIndex) {
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
     */ }, { key: "onClick_", value:
    function onClick_(event) {var _this3 = this;
      var el = /** @type {!Element} */(event.target);

      if (el.classList.contains('i-amphtml-story-access-close-button')) {
        return this.toggle_(false);
      }

      // Closes the menu if click happened outside of the main container.
      if (!closest(el, function (el) {return el === _this3.containerEl_;}, this.element)) {
        this.storeService_.dispatch(Action.TOGGLE_ACCESS, false);
      }
    }

    /**
     * @param {boolean} show
     * @private
     */ }, { key: "toggle_", value:
    function toggle_(show) {var _this4 = this;
      this.mutateElement(function () {
        _this4.element.classList.toggle('i-amphtml-story-access-visible', show);
      });
    }

    /**
     * Returns the element's type.
     * @return {string}
     * @private
     */ }, { key: "getType_", value:
    function getType_() {
      return this.element.getAttribute('type').toLowerCase();
    }

    /**
     * Renders and returns an empty drawer element element that will contain the
     * publisher provided DOM, depending on the type of <amp-story-access>.
     * Blocking template gets a header containing the publisher's logo, and
     * notification template gets a "dismiss" button.
     * @return {!Element|undefined}
     * @private
     */ }, { key: "renderDrawerEl_", value:
    function renderDrawerEl_() {
      switch (this.getType_()) {
        case Type.BLOCKING:
          var drawerEl = getBlockingTemplate(this.element);

          var logoSrc = getStoryAttributeSrc(
          this.element,
          'publisher-logo-src',
          /* warn */true);


          if (logoSrc) {
            var logoEl = /** @type {!Element} */(
            drawerEl.querySelector('.i-amphtml-story-access-logo'));

            setImportantStyles(logoEl, { 'background-image': "url(".concat(logoSrc, ")") });
          }

          return drawerEl;
          break;
        case Type.NOTIFICATION:
          return getNotificationTemplate(this.element);
          break;
        default:
          user().error(
          TAG,
          'Unknown "type" attribute, expected one of: ' +
          'blocking, notification.');}


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
     */ }, { key: "allowlistActions_", value:
    function allowlistActions_() {var _this5 = this;
      var accessEl = /** @type {!Element} */(
      this.win.document.getElementById('amp-access'));



      // Configuration validation is handled by the amp-access extension.
      var accessConfig = /** @type {!Array|!Object} */(
      parseJson(accessEl.textContent));


      if (!isArray(accessConfig)) {
        accessConfig = [accessConfig];

        // If there is only one configuration and the publisher provided a
        // namespace, we want to allow actions with or without namespace.
        if (accessConfig[0].namespace) {
          accessConfig.push(_objectSpread(_objectSpread({}, accessConfig[0]), {}, { namespace: undefined }));
        }
      }

      var actions = [];

      /** @type {!Array} */(accessConfig).forEach(function (config) {
        var login = /** @type {{login, namespace}} */(config).login,namespace = /** @type {{login, namespace}} */(config).namespace;

        if (isObject(login)) {
          var types = Object.keys(login);
          types.forEach(function (type) {return (
              actions.push(_this5.getActionObject_(namespace, type)));});

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
     */ }, { key: "getActionObject_", value:
    function getActionObject_() {var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var method = ['login', namespace, type].filter(Boolean).join('-');
      return { tagOrTarget: 'SCRIPT', method: method };
    } }]);return AmpStoryAccess;}(AMP.BaseElement);
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-access.js