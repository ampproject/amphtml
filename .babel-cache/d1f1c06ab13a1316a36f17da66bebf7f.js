function _typeof(obj) {"@babel/helpers - typeof";if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;}function _get(target, property, receiver) {if (typeof Reflect !== "undefined" && Reflect.get) {_get = Reflect.get;} else {_get = function _get(target, property, receiver) {var base = _superPropBase(target, property);if (!base) return;var desc = Object.getOwnPropertyDescriptor(base, property);if (desc.get) {return desc.get.call(receiver);}return desc.value;};}return _get(target, property, receiver || target);}function _superPropBase(object, property) {while (!Object.prototype.hasOwnProperty.call(object, property)) {object = _getPrototypeOf(object);if (object === null) break;}return object;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function");}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });if (superClass) _setPrototypeOf(subClass, superClass);}function _setPrototypeOf(o, p) {_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {o.__proto__ = p;return o;};return _setPrototypeOf(o, p);}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _possibleConstructorReturn(self, call) {if (call && (_typeof(call) === "object" || typeof call === "function")) {return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self) {if (self === void 0) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}function _getPrototypeOf(o) {_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {return o.__proto__ || Object.getPrototypeOf(o);};return _getPrototypeOf(o);} /**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import { Activity } from "./activity-impl";
import { AnalyticsConfig, mergeObjects } from "./config";
import { AnalyticsEventType } from "./events";
import { ChunkPriority, chunk } from "../../../src/chunk";
import { CookieWriter } from "./cookie-writer";
import { Deferred } from "../../../src/core/data-structures/promise";
import {
ExpansionOptions,
VariableService,
stringToBool,
variableServicePromiseForDoc } from "./variables";

import {
InstrumentationService,
instrumentationServicePromiseForDoc } from "./instrumentation";

import { LayoutPriority } from "../../../src/core/dom/layout";
import { LinkerManager } from "./linker-manager";
import { RequestHandler, expandPostMessage } from "./requests";
import { Services } from "../../../src/service";
import { SessionManager, sessionServicePromiseForDoc } from "./session-manager";
import { Transport } from "./transport";
import { dev, devAssert, user } from "../../../src/log";
import { dict, hasOwn } from "../../../src/core/types/object";
import { expandTemplate } from "../../../src/core/types/string";
import { getMode } from "../../../src/mode";
import { installLinkerReaderService } from "./linker-reader";
import { isArray, isEnumValue } from "../../../src/core/types";
import { rethrowAsync } from "../../../src/core/error";

import { isIframed } from "../../../src/core/dom";
import { isInFie } from "../../../src/iframe-helper";

var TAG = 'amp-analytics';

var MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

var ALLOWLIST_EVENT_IN_SANDBOX = [
AnalyticsEventType.VISIBLE,
AnalyticsEventType.HIDDEN,
AnalyticsEventType.INI_LOAD,
AnalyticsEventType.RENDER_START];

export var AmpAnalytics = /*#__PURE__*/function (_AMP$BaseElement) {_inherits(AmpAnalytics, _AMP$BaseElement);var _super = _createSuper(AmpAnalytics);
  /** @param {!AmpElement} element */
  function AmpAnalytics(element) {var _this;_classCallCheck(this, AmpAnalytics);
    _this = _super.call(this, element);

    /** @private {!Promise} */
    _this.consentPromise_ = _resolvedPromise();

    /**
     * The html id of the `amp-user-notification` element.
     * @private {?string}
     */
    _this.consentNotificationId_ = null;

    /** @private {boolean} */
    _this.isSandbox_ = false;

    /**
     * @private {Object<string, RequestHandler>} A map of request handler with requests
     */
    _this.requests_ = {};

    /**
     * @private {!JsonObject}
     */
    _this.config_ = dict();

    /** @private {?./instrumentation.InstrumentationService} */
    _this.instrumentation_ = null;

    /** @private {?./analytics-group.AnalyticsGroup} */
    _this.analyticsGroup_ = null;

    /** @private {?./variables.VariableService} */
    _this.variableService_ = null;

    /** @private {!../../../src/service/crypto-impl.Crypto} */
    _this.cryptoService_ = Services.cryptoFor(_this.win);

    /** @private {?Promise} */
    _this.iniPromise_ = null;

    /** @private {./transport.Transport} */
    _this.transport_ = null;

    /** @private {string} */
    _this.type_ = _this.element.getAttribute('type');

    /** @private {boolean} */
    _this.isInabox_ = getMode(_this.win).runtime == 'inabox';

    /** @private {?./linker-manager.LinkerManager} */
    _this.linkerManager_ = null;

    /** @private {?./session-manager.SessionManager} */
    _this.sessionManager_ = null;

    /** @private {?boolean} */
    _this.isInFie_ = null;return _this;
  }

  /** @override */_createClass(AmpAnalytics, [{ key: "getLayoutPriority", value:
    function getLayoutPriority() {
      // Load immediately if inabox, otherwise after other content.
      return this.isInabox_ ? LayoutPriority.CONTENT : LayoutPriority.METADATA;
    }

    /** @override */ }, { key: "isAlwaysFixed", value:
    function isAlwaysFixed() {
      return !isInFie(this.element);
    }

    /** @override */ }, { key: "isLayoutSupported", value:
    function isLayoutSupported(unusedLayout) {
      return true;
    }

    /** @override */ }, { key: "buildCallback", value:
    function buildCallback() {var _this2 = this;
      this.isSandbox_ = this.element.hasAttribute('sandbox');

      this.element.setAttribute('aria-hidden', 'true');

      this.consentNotificationId_ = this.element.getAttribute(
      'data-consent-notification-id');


      if (this.consentNotificationId_ != null) {
        this.consentPromise_ = Services.userNotificationManagerForDoc(
        this.element).
        then(function (service) {return (
            service.get( /** @type {string} */(_this2.consentNotificationId_)));});

      }

      if (this.element.getAttribute('trigger') == 'immediate') {
        this.ensureInitialized_();
      }
    }

    /** @override */ }, { key: "layoutCallback", value:
    function layoutCallback() {
      // Now that we are rendered, stop rendering the element to reduce
      // resource consumption.
      return this.ensureInitialized_();
    }

    /** @override */ }, { key: "detachedCallback", value:
    function detachedCallback() {
      if (this.analyticsGroup_) {
        this.analyticsGroup_.dispose();
        this.analyticsGroup_ = null;
      }

      if (this.linkerManager_) {
        this.linkerManager_.dispose();
        this.linkerManager_ = null;
      }

      for (var request in this.requests_) {
        this.requests_[request].dispose();
        delete this.requests_[request];
      }
    }

    /** @override */ }, { key: "resumeCallback", value:
    function resumeCallback() {var _this3 = this;
      if (this.iniPromise_) {
        this.iniPromise_.then(function () {
          _this3.transport_.maybeInitIframeTransport(_this3.element);
        });
      }
    }

    /** @override */ }, { key: "unlayoutCallback", value:
    function unlayoutCallback() {var _this4 = this;
      if (this.getAmpDoc().isVisible()) {
        // amp-analytics tag was just set to display:none. Page is still loaded.
        return false;
      }

      if (this.iniPromise_) {
        this.iniPromise_.then(function () {
          // Page was unloaded - free up owned resources.
          _this4.transport_.deleteIframeTransport();
        });
      }

      return _get(_getPrototypeOf(AmpAnalytics.prototype), "unlayoutCallback", this).call(this);
    }

    /**
     * @return {!Promise}
     * @private
     */ }, { key: "ensureInitialized_", value:
    function ensureInitialized_() {var _this5 = this;
      if (this.iniPromise_) {
        return this.iniPromise_;
      }

      var ampdoc = this.getAmpDoc();
      this.iniPromise_ = ampdoc.
      whenFirstVisible()
      // Rudimentary "idle" signal.
      .then(function () {return Services.timerFor(_this5.win).promise(1);}).
      then(function () {return _this5.consentPromise_;}).
      then(function () {return (
          Promise.all([
          instrumentationServicePromiseForDoc(ampdoc),
          variableServicePromiseForDoc(ampdoc)]));}).


      then(function (services) {
        _this5.instrumentation_ = services[0];
        _this5.variableService_ = services[1];
        var loadConfigDeferred = new Deferred();
        var loadConfigTask = function loadConfigTask() {
          var configPromise = new AnalyticsConfig(_this5.element).loadConfig();
          loadConfigDeferred.resolve(configPromise);
        };
        if (_this5.isInabox_) {
          // Chunk in inabox ad leads to activeview regression, handle seperately
          loadConfigTask();
        } else {
          chunk(_this5.element, loadConfigTask, ChunkPriority.HIGH);
        }
        return loadConfigDeferred.promise;
      }).
      then(function (config) {
        _this5.config_ = /** @type {!JsonObject} */(config);
        // CookieWriter not enabled on proxy origin, do not chunk
        return new CookieWriter(_this5.win, _this5.element, _this5.config_).write();
      }).
      then(function () {
        _this5.transport_ = new Transport(
        _this5.getAmpDoc(),
        _this5.config_['transport'] || {});

      }).
      then(this.maybeInitializeSessionManager_.bind(this)).
      then(this.registerTriggers_.bind(this)).
      then(this.initializeLinker_.bind(this));
      this.iniPromise_.then(function () {
        _this5. /*OK*/collapse();
      });
      return this.iniPromise_;
    }

    /**
     * @return {boolean} whether parent post messages are allowed.
     *
     * <p>Parent post messages are only allowed for ads.
     *
     * @private
     */ }, { key: "allowParentPostMessage_", value:
    function allowParentPostMessage_() {
      if (this.isInabox_) {
        return true;
      }
      if (this.isInFie_ == null) {
        this.isInFie_ = isInFie(this.element);
      }
      return this.isInFie_;
    }

    /**
     * Maybe initializes Session Manager.
     * @return {!Promise}
     */ }, { key: "maybeInitializeSessionManager_", value:
    function maybeInitializeSessionManager_() {var _this6 = this;
      if (!this.config_['triggers']) {
        return _resolvedPromise2();
      }
      var shouldInitialize = Object.values(this.config_['triggers']).some(
      function (trigger) {var _trigger$session;return (trigger === null || trigger === void 0) ? (void 0) : ((_trigger$session = trigger['session']) === null || _trigger$session === void 0) ? (void 0) : _trigger$session['persistEvent'];});

      if (shouldInitialize && this.type_) {
        var ampdoc = this.getAmpDoc();
        return sessionServicePromiseForDoc(ampdoc).then(function (manager) {
          _this6.sessionManager_ = manager;
        });
      }
      return _resolvedPromise3();
    }

    /**
     * Registers triggers.
     * @return {!Promise|undefined}
     * @private
     */ }, { key: "registerTriggers_", value:
    function registerTriggers_() {var _this7 = this;
      if (this.hasOptedOut_()) {
        // Nothing to do when the user has opted out.
        var _TAG = this.getName_();
        user().fine(_TAG, 'User has opted out. No hits will be sent.');
        return _resolvedPromise4();
      }

      this.generateRequests_();

      if (!this.config_['triggers']) {
        var _TAG2 = this.getName_();
        this.user().warn(
        _TAG2,
        'No triggers were found in the ' +
        'config. No analytics data will be sent.');

        return _resolvedPromise5();
      }

      this.processExtraUrlParams_(
      this.config_['extraUrlParams'],
      this.config_['extraUrlParamsReplaceMap']);


      this.analyticsGroup_ = this.instrumentation_.createAnalyticsGroup(
      this.element);


      this.transport_.maybeInitIframeTransport(this.element);

      var promises = [];
      // Trigger callback can be synchronous. Do the registration at the end.
      for (var k in this.config_['triggers']) {
        if (hasOwn(this.config_['triggers'], k)) {var _ret = function () {
            var trigger = _this7.config_['triggers'][k];
            var expansionOptions = _this7.expansionOptions_(
            dict({}),
            trigger,
            undefined /* opt_iterations */,
            true /* opt_noEncode */);

            var TAG = _this7.getName_();
            if (!trigger) {
              _this7.user().error(TAG, 'Trigger should be an object: ', k);
              return "continue";
            }
            var hasRequestOrPostMessage =
            trigger['request'] || (
            trigger['parentPostMessage'] && _this7.allowParentPostMessage_());
            if (!trigger['on'] || !hasRequestOrPostMessage) {
              var errorMsgSeg = _this7.allowParentPostMessage_() ?
              '/"parentPostMessage"' :
              '';
              _this7.user().error(
              TAG,
              '"on" and "request"' +
              errorMsgSeg +
              ' attributes are required for data to be collected.');

              return "continue";
            }
            // Check for not supported trigger for sandboxed analytics
            if (_this7.isSandbox_) {
              var eventType = trigger['on'];
              if (
              isEnumValue(AnalyticsEventType, eventType) &&
              !ALLOWLIST_EVENT_IN_SANDBOX.includes(eventType))
              {
                _this7.user().error(
                TAG,
                eventType + ' is not supported for amp-analytics in scope');

                return "continue";
              }
            }

            _this7.processExtraUrlParams_(
            trigger['extraUrlParams'],
            _this7.config_['extraUrlParamsReplaceMap']);

            promises.push(
            _this7.isSampledIn_(trigger).then(function (result) {
              if (!result) {
                return;
              }
              // replace selector and selectionMethod
              if (_this7.isSandbox_) {
                // Only support selection of parent element for analytics in scope
                if (!_this7.element.parentElement) {
                  // In case parent element has been removed from DOM, do nothing
                  return;
                }
                trigger['selector'] = _this7.element.parentElement.tagName;
                trigger['selectionMethod'] = 'closest';
                return _this7.addTrigger_(trigger);
              } else if (trigger['selector'] && !isArray(trigger['selector'])) {
                // Expand the selector using variable expansion.
                return _this7.variableService_.
                expandTemplate(
                trigger['selector'],
                expansionOptions,
                _this7.element).

                then(function (selector) {
                  trigger['selector'] = selector;
                  return _this7.addTrigger_(trigger);
                });
              } else {
                return _this7.addTrigger_(trigger);
              }
            }));}();if (_ret === "continue") continue;

        }
      }
      return Promise.all(promises);
    }

    /**
     * Asks the browser to preload a URL. Always also does a preconnect
     * because browser support for that is better.
     *
     * @param {string} url
     * @param {string=} opt_preloadAs
     * @visibleForTesting
     */ }, { key: "preload", value:
    function preload(url, opt_preloadAs) {
      Services.preconnectFor(this.win).preload(
      this.getAmpDoc(),
      url,
      opt_preloadAs);

    }

    /**
     * Calls `AnalyticsGroup.addTrigger` and reports any errors.
     * @param {!JsonObject} config
     * @private
     * @return {!Promise}
     */ }, { key: "addTrigger_", value:
    function addTrigger_(config) {
      if (!this.analyticsGroup_) {
        // No need to handle trigger for component that has already been detached
        // from DOM
        return _resolvedPromise6();
      }
      try {
        return this.analyticsGroup_.addTrigger(
        config,
        this.handleEvent_.bind(this, config));

      } catch (e) {
        var _TAG3 = this.getName_();
        var eventType = config['on'];
        rethrowAsync(_TAG3, 'Failed to process trigger "' + eventType + '"', e);
        return _resolvedPromise7();
      }
    }

    /**
     * Replace the names of keys in params object with the values in replace map.
     *
     * @param {!Object<string, string>} params The params that need to be renamed.
     * @param {!Object<string, string>} replaceMap A map of pattern and replacement
     *    value.
     * @private
     */ }, { key: "processExtraUrlParams_", value:
    function processExtraUrlParams_(params, replaceMap) {
      if (params && replaceMap) {
        // If the config includes a extraUrlParamsReplaceMap, apply it as a set
        // of params to String.replace to allow aliasing of the keys in
        // extraUrlParams.
        var count = 0;
        for (var replaceMapKey in replaceMap) {
          if (++count > MAX_REPLACES) {
            var _TAG4 = this.getName_();
            this.user().error(
            _TAG4,
            'More than ' +
            MAX_REPLACES +
            ' extraUrlParamsReplaceMap rules ' +
            "aren't allowed; Skipping the rest");

            break;
          }

          for (var extraUrlParamsKey in params) {
            var newkey = extraUrlParamsKey.replace(
            replaceMapKey,
            replaceMap[replaceMapKey]);

            if (extraUrlParamsKey != newkey) {
              var value = params[extraUrlParamsKey];
              delete params[extraUrlParamsKey];
              params[newkey] = value;
            }
          }
        }
      }
    }

    /**
     * @return {boolean} true if the user has opted out.
     */ }, { key: "hasOptedOut_", value:
    function hasOptedOut_() {
      var elementId = this.config_['optoutElementId'];
      if (elementId && this.win.document.getElementById(elementId)) {
        return true;
      }

      if (!this.config_['optout']) {
        return false;
      }

      var props = this.config_['optout'].split('.');
      var k = this.win;
      for (var i = 0; i < props.length; i++) {
        if (!k) {
          return false;
        }
        k = k[props[i]];
      }
      // The actual property being called is controlled by vendor configs only
      // that are approved in code reviews. User customization of the `optout`
      // property is not allowed.
      return k();
    }

    /**
     * Goes through all the requests in predefined vendor config and tag's config
     * and creates a map of request name to request template. These requests can
     * then be used while sending a request to a server.
     *
     * @private
     */ }, { key: "generateRequests_", value:
    function generateRequests_() {var _this8 = this;
      if (!this.config_['requests']) {
        if (!this.allowParentPostMessage_()) {
          var _TAG5 = this.getName_();
          this.user().warn(
          _TAG5,
          'No request strings defined. Analytics ' +
          'data will not be sent from this page.');

        }
        return;
      }

      if (this.config_['requests']) {
        for (var k in this.config_['requests']) {
          if (hasOwn(this.config_['requests'], k)) {
            var request = this.config_['requests'][k];
            if (!request['baseUrl']) {
              this.user().error(TAG, 'request must have a baseUrl');
              delete this.config_['requests'][k];
            }
          }
        }

        // Expand any placeholders. For requests, we expand each string up to 5
        // times to support nested requests. Leave any unresolved placeholders.
        // Expand any requests placeholder.
        for (var _k in this.config_['requests']) {
          this.config_['requests'][_k]['baseUrl'] = expandTemplate(
          this.config_['requests'][_k]['baseUrl'],
          function (key) {
            var request = _this8.config_['requests'][key];
            return (request && request['baseUrl']) || '${' + key + '}';
          },
          5);

        }

        var requests = {};
        for (var _k2 in this.config_['requests']) {
          if (hasOwn(this.config_['requests'], _k2)) {
            var _request = this.config_['requests'][_k2];
            requests[_k2] = new RequestHandler(
            this.element,
            _request,
            Services.preconnectFor(this.win),
            this.transport_,
            this.isSandbox_);

          }
        }
        this.requests_ = requests;
      }
    }

    /**
     * Create the linker-manager that will append linker params as necessary.
     * The initialization is asynchronous and non blocking
     * @private
     */ }, { key: "initializeLinker_", value:
    function initializeLinker_() {var _this9 = this;
      this.linkerManager_ = new LinkerManager(
      this.getAmpDoc(),
      this.config_,
      this.type_,
      this.element);

      var linkerTask = function linkerTask() {
        _this9.linkerManager_.init();
      };
      if (this.isInabox_) {
        // Chunk in inabox ad leads to activeview regression, handle seperately
        linkerTask();
      } else {
        chunk(this.element, linkerTask, ChunkPriority.LOW);
      }
    }

    /**
     * Callback for events that are registered by the config's triggers. This
     * method generates requests and sends them out.
     *
     * @param {!JsonObject} trigger JSON config block that resulted in this event.
     * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
     * @private
     */ }, { key: "handleEvent_", value:
    function handleEvent_(trigger, event) {var _trigger$session2;
      var persistEvent = !!(((_trigger$session2 = trigger.session) !== null && _trigger$session2 !== void 0) && _trigger$session2['persistEvent']);
      if (persistEvent) {var _this$sessionManager_;
        ((_this$sessionManager_ = this.sessionManager_) === null || _this$sessionManager_ === void 0) ? (void 0) : _this$sessionManager_.updateEvent(this.type_);
      }
      var requests = isArray(trigger['request']) ?
      trigger['request'] :
      [trigger['request']];
      for (var r = 0; r < requests.length; r++) {
        var requestName = requests[r];
        this.handleRequestForEvent_(requestName, trigger, event);
      }
    }

    /**
     * Processes a request for an event callback and sends it out.
     *
     * @param {string} requestName The requestName to process.
     * @param {!JsonObject} trigger JSON config block that resulted in this event.
     * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
     * @private
     */ }, { key: "handleRequestForEvent_", value:
    function handleRequestForEvent_(requestName, trigger, event) {var _this10 = this;
      if (!this.element.ownerDocument.defaultView) {
        var _TAG6 = this.getName_();
        dev().warn(_TAG6, 'request against destroyed embed: ', trigger['on']);
      }

      var request = this.requests_[requestName];
      var hasPostMessage =
      this.allowParentPostMessage_() && trigger['parentPostMessage'];

      if (requestName != undefined && !request) {
        var _TAG7 = this.getName_();
        this.user().error(
        _TAG7,
        'Ignoring request for event. Request string not found: ',
        trigger['request']);

        if (!hasPostMessage) {
          return;
        }
      }
      this.checkTriggerEnabled_(trigger, event).then(function (enabled) {
        var isConnected =
        _this10.element.ownerDocument && _this10.element.ownerDocument.defaultView;
        if (!enabled || !isConnected) {
          return;
        }
        _this10.expandAndSendRequest_(request, trigger, event);

        var shouldSendToAmpAd =
        trigger['parentPostMessage'] &&
        _this10.allowParentPostMessage_() &&
        isIframed(_this10.win);
        if (shouldSendToAmpAd) {
          _this10.expandAndPostMessage_(trigger, event);
        }
      });
    }

    /**
     * @param {RequestHandler} request The request to process.
     * @param {!JsonObject} trigger JSON config block that resulted in this event.
     * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
     * @private
     */ }, { key: "expandAndSendRequest_", value:
    function expandAndSendRequest_(request, trigger, event) {
      if (!request) {
        return;
      }
      this.config_['vars']['requestCount']++;
      var expansionOptions = this.expansionOptions_(event, trigger);
      request.send(this.config_['extraUrlParams'], trigger, expansionOptions);
    }

    /**
     * Expand and post message to parent window if applicable.
     * @param {!JsonObject} trigger JSON config block that resulted in this event.
     * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
     * @private
     */ }, { key: "expandAndPostMessage_", value:
    function expandAndPostMessage_(trigger, event) {var _this11 = this;
      var msg = trigger['parentPostMessage'];
      var expansionOptions = this.expansionOptions_(event, trigger);
      expandPostMessage(
      this.getAmpDoc(),
      msg,
      this.config_['extraUrlParams'],
      trigger,
      expansionOptions,
      this.element).
      then(function (message) {
        _this11.win.parent. /*OK*/postMessage(message, '*');
      });
    }

    /**
     * @param {!JsonObject} trigger The config to use to determine sampling.
     * @return {!Promise<boolean>} Whether the request should be sampled in or
     * not based on sampleSpec.
     * @private
     */ }, { key: "isSampledIn_", value:
    function isSampledIn_(trigger) {var _this12 = this;
      /** @const {!JsonObject} */
      var spec = trigger['sampleSpec'];
      var TAG = this.getName_();
      if (!spec) {
        return Promise.resolve(true);
      }
      var sampleOn = spec['sampleOn'];
      if (!sampleOn) {
        this.user().error(TAG, 'Invalid sampleOn value.');
        return Promise.resolve(true);
      }
      var threshold = parseFloat(spec['threshold']);
      if (threshold >= 0 && threshold <= 100) {
        var sampleDeferred = new Deferred();
        var sampleInTask = function sampleInTask() {
          var expansionOptions = _this12.expansionOptions_(dict({}), trigger);
          var samplePromise = _this12.expandTemplateWithUrlParams_(
          sampleOn,
          expansionOptions).

          then(function (key) {return _this12.cryptoService_.uniform(key);}).
          then(function (digest) {return digest * 100 < threshold;});
          sampleDeferred.resolve(samplePromise);
        };
        if (this.isInabox_) {
          // Chunk in inabox ad leads to activeview regression, handle seperately
          sampleInTask();
        } else {
          chunk(this.element, sampleInTask, ChunkPriority.LOW);
        }
        return sampleDeferred.promise;
      }
      user(). /*OK*/error(TAG, 'Invalid threshold for sampling.');
      return Promise.resolve(true);
    }

    /**
     * Checks if request for a trigger is enabled.
     * @param {!JsonObject} trigger The config to use to determine if trigger is
     * enabled.
     * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
     * @return {!Promise<boolean>} Whether trigger must be called.
     * @private
     */ }, { key: "checkTriggerEnabled_", value:
    function checkTriggerEnabled_(trigger, event) {
      var expansionOptions = this.expansionOptions_(event, trigger);
      var enabledOnTagLevel = this.checkSpecEnabled_(
      this.config_['enabled'],
      expansionOptions);

      var enabledOnTriggerLevel = this.checkSpecEnabled_(
      trigger['enabled'],
      expansionOptions);


      return Promise.all([enabledOnTagLevel, enabledOnTriggerLevel]).then(
      function (enabled) {
        devAssert(enabled.length === 2);
        return enabled[0] && enabled[1];
      });

    }

    /**
     * Checks result of 'enabled' spec evaluation. Returns false if spec is
     * provided and value resolves to a falsey value (empty string, 0, false,
     * null, NaN or undefined).
     * @param {string|boolean} spec Expression that will be evaluated.
     * @param {!ExpansionOptions} expansionOptions Expansion options.
     * @return {!Promise<boolean>} False only if spec is provided and value is
     * falsey.
     * @private
     */ }, { key: "checkSpecEnabled_", value:
    function checkSpecEnabled_(spec, expansionOptions) {
      // Spec absence always resolves to true.
      if (spec === undefined) {
        return Promise.resolve(true);
      }

      if (typeof spec === 'boolean') {
        return Promise.resolve(spec);
      }

      return this.expandTemplateWithUrlParams_(spec, expansionOptions).then(
      function (val) {return stringToBool(val);});

    }

    /**
     * Expands spec using provided expansion options and applies url replacement
     * if necessary.
     * @param {string} spec Expression that needs to be expanded.
     * @param {!ExpansionOptions} expansionOptions Expansion options.
     * @return {!Promise<string>} expanded spec.
     * @private
     */ }, { key: "expandTemplateWithUrlParams_", value:
    function expandTemplateWithUrlParams_(spec, expansionOptions) {var _this13 = this;
      return this.variableService_.
      expandTemplate(spec, expansionOptions, this.element).
      then(function (key) {return (
          Services.urlReplacementsForDoc(_this13.element).expandUrlAsync(
          key,
          _this13.variableService_.getMacros(_this13.element)));});


    }

    /**
     * @return {string} Returns a string to identify this tag. May not be unique
     * if the element id is not unique.
     * @private
     */ }, { key: "getName_", value:
    function getName_() {
      return (
      'AmpAnalytics ' + (this.element.getAttribute('id') || '<unknown id>'));

    }

    /**
     * @param {!JsonObject|!./events.AnalyticsEvent} source1
     * @param {!JsonObject} source2
     * @param {number=} opt_iterations
     * @param {boolean=} opt_noEncode
     * @return {!ExpansionOptions}
     */ }, { key: "expansionOptions_", value:
    function expansionOptions_(source1, source2, opt_iterations, opt_noEncode) {
      var vars = dict();
      mergeObjects(this.config_['vars'], vars);
      mergeObjects(source2['vars'], vars);
      mergeObjects(source1['vars'], vars);
      return new ExpansionOptions(vars, opt_iterations, opt_noEncode);
    } }]);return AmpAnalytics;}(AMP.BaseElement);


AMP.extension(TAG, '0.1', function (AMP) {
  // Register doc-service factory.
  AMP.registerServiceForDoc(
  'amp-analytics-instrumentation',
  InstrumentationService);

  AMP.registerServiceForDoc('activity', Activity);
  installLinkerReaderService(AMP.win);
  AMP.registerServiceForDoc('amp-analytics-session', SessionManager);
  AMP.registerServiceForDoc('amp-analytics-variables', VariableService);
  // Register the element.
  AMP.registerElement(TAG, AmpAnalytics);
});
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/amp-analytics.js