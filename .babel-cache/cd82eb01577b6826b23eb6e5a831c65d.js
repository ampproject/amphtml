import { resolvedPromise as _resolvedPromise7 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise6 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise5 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
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
import { ExpansionOptions, VariableService, stringToBool, variableServicePromiseForDoc } from "./variables";
import { InstrumentationService, instrumentationServicePromiseForDoc } from "./instrumentation";
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
var MAX_REPLACES = 16;
// The maximum number of entries in a extraUrlParamsReplaceMap
var ALLOWLIST_EVENT_IN_SANDBOX = [AnalyticsEventType.VISIBLE, AnalyticsEventType.HIDDEN, AnalyticsEventType.INI_LOAD, AnalyticsEventType.RENDER_START];
export var AmpAnalytics = /*#__PURE__*/function (_AMP$BaseElement) {
  _inherits(AmpAnalytics, _AMP$BaseElement);

  var _super = _createSuper(AmpAnalytics);

  /** @param {!AmpElement} element */
  function AmpAnalytics(element) {
    var _this;

    _classCallCheck(this, AmpAnalytics);

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
    _this.isInFie_ = null;
    return _this;
  }

  /** @override */
  _createClass(AmpAnalytics, [{
    key: "getLayoutPriority",
    value: function getLayoutPriority() {
      // Load immediately if inabox, otherwise after other content.
      return this.isInabox_ ? LayoutPriority.CONTENT : LayoutPriority.METADATA;
    }
    /** @override */

  }, {
    key: "isAlwaysFixed",
    value: function isAlwaysFixed() {
      return !isInFie(this.element);
    }
    /** @override */

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(unusedLayout) {
      return true;
    }
    /** @override */

  }, {
    key: "buildCallback",
    value: function buildCallback() {
      var _this2 = this;

      this.isSandbox_ = this.element.hasAttribute('sandbox');
      this.element.setAttribute('aria-hidden', 'true');
      this.consentNotificationId_ = this.element.getAttribute('data-consent-notification-id');

      if (this.consentNotificationId_ != null) {
        this.consentPromise_ = Services.userNotificationManagerForDoc(this.element).then(function (service) {
          return service.get(dev().assertString(_this2.consentNotificationId_));
        });
      }

      if (this.element.getAttribute('trigger') == 'immediate') {
        this.ensureInitialized_();
      }
    }
    /** @override */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      // Now that we are rendered, stop rendering the element to reduce
      // resource consumption.
      return this.ensureInitialized_();
    }
    /** @override */

  }, {
    key: "detachedCallback",
    value: function detachedCallback() {
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
    /** @override */

  }, {
    key: "resumeCallback",
    value: function resumeCallback() {
      var _this3 = this;

      if (this.iniPromise_) {
        this.iniPromise_.then(function () {
          _this3.transport_.maybeInitIframeTransport(_this3.element);
        });
      }
    }
    /** @override */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      var _this4 = this;

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
     */

  }, {
    key: "ensureInitialized_",
    value: function ensureInitialized_() {
      var _this5 = this;

      if (this.iniPromise_) {
        return this.iniPromise_;
      }

      var ampdoc = this.getAmpDoc();
      this.iniPromise_ = ampdoc.whenFirstVisible() // Rudimentary "idle" signal.
      .then(function () {
        return Services.timerFor(_this5.win).promise(1);
      }).then(function () {
        return _this5.consentPromise_;
      }).then(function () {
        return Promise.all([instrumentationServicePromiseForDoc(ampdoc), variableServicePromiseForDoc(ampdoc)]);
      }).then(function (services) {
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
      }).then(function (config) {
        _this5.config_ =
        /** @type {!JsonObject} */
        config;
        // CookieWriter not enabled on proxy origin, do not chunk
        return new CookieWriter(_this5.win, _this5.element, _this5.config_).write();
      }).then(function () {
        _this5.transport_ = new Transport(_this5.getAmpDoc(), _this5.config_['transport'] || {});
      }).then(this.maybeInitializeSessionManager_.bind(this)).then(this.registerTriggers_.bind(this)).then(this.initializeLinker_.bind(this));
      this.iniPromise_.then(function () {
        _this5.
        /*OK*/
        collapse();
      });
      return this.iniPromise_;
    }
    /**
     * @return {boolean} whether parent post messages are allowed.
     *
     * <p>Parent post messages are only allowed for ads.
     *
     * @private
     */

  }, {
    key: "allowParentPostMessage_",
    value: function allowParentPostMessage_() {
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
     */

  }, {
    key: "maybeInitializeSessionManager_",
    value: function maybeInitializeSessionManager_() {
      var _this6 = this;

      if (!this.config_['triggers']) {
        return _resolvedPromise2();
      }

      var shouldInitialize = Object.values(this.config_['triggers']).some(function (trigger) {
        var _trigger$session;

        return trigger == null ? void 0 : (_trigger$session = trigger['session']) == null ? void 0 : _trigger$session['persistEvent'];
      });

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
     */

  }, {
    key: "registerTriggers_",
    value: function registerTriggers_() {
      var _this7 = this;

      if (this.hasOptedOut_()) {
        // Nothing to do when the user has opted out.
        var _TAG = this.getName_();

        user().fine(_TAG, 'User has opted out. No hits will be sent.');
        return _resolvedPromise4();
      }

      this.generateRequests_();

      if (!this.config_['triggers']) {
        var _TAG2 = this.getName_();

        this.user().warn(_TAG2, 'No triggers were found in the ' + 'config. No analytics data will be sent.');
        return _resolvedPromise5();
      }

      this.processExtraUrlParams_(this.config_['extraUrlParams'], this.config_['extraUrlParamsReplaceMap']);
      this.analyticsGroup_ = this.instrumentation_.createAnalyticsGroup(this.element);
      this.transport_.maybeInitIframeTransport(this.element);
      var promises = [];

      // Trigger callback can be synchronous. Do the registration at the end.
      for (var k in this.config_['triggers']) {
        if (hasOwn(this.config_['triggers'], k)) {
          var _ret = function () {
            var trigger = _this7.config_['triggers'][k];

            var expansionOptions = _this7.expansionOptions_(dict({}), trigger, undefined
            /* opt_iterations */
            , true
            /* opt_noEncode */
            );

            var TAG = _this7.getName_();

            if (!trigger) {
              _this7.user().error(TAG, 'Trigger should be an object: ', k);

              return "continue";
            }

            var hasRequestOrPostMessage = trigger['request'] || trigger['parentPostMessage'] && _this7.allowParentPostMessage_();

            if (!trigger['on'] || !hasRequestOrPostMessage) {
              var errorMsgSeg = _this7.allowParentPostMessage_() ? '/"parentPostMessage"' : '';

              _this7.user().error(TAG, '"on" and "request"' + errorMsgSeg + ' attributes are required for data to be collected.');

              return "continue";
            }

            // Check for not supported trigger for sandboxed analytics
            if (_this7.isSandbox_) {
              var eventType = trigger['on'];

              if (isEnumValue(AnalyticsEventType, eventType) && !ALLOWLIST_EVENT_IN_SANDBOX.includes(eventType)) {
                _this7.user().error(TAG, eventType + ' is not supported for amp-analytics in scope');

                return "continue";
              }
            }

            _this7.processExtraUrlParams_(trigger['extraUrlParams'], _this7.config_['extraUrlParamsReplaceMap']);

            promises.push(_this7.isSampledIn_(trigger).then(function (result) {
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
                return _this7.variableService_.expandTemplate(trigger['selector'], expansionOptions, _this7.element).then(function (selector) {
                  trigger['selector'] = selector;
                  return _this7.addTrigger_(trigger);
                });
              } else {
                return _this7.addTrigger_(trigger);
              }
            }));
          }();

          if (_ret === "continue") continue;
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
     */

  }, {
    key: "preload",
    value: function preload(url, opt_preloadAs) {
      Services.preconnectFor(this.win).preload(this.getAmpDoc(), url, opt_preloadAs);
    }
    /**
     * Calls `AnalyticsGroup.addTrigger` and reports any errors.
     * @param {!JsonObject} config
     * @private
     * @return {!Promise}
     */

  }, {
    key: "addTrigger_",
    value: function addTrigger_(config) {
      if (!this.analyticsGroup_) {
        // No need to handle trigger for component that has already been detached
        // from DOM
        return _resolvedPromise6();
      }

      try {
        return this.analyticsGroup_.addTrigger(config, this.handleEvent_.bind(this, config));
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
     */

  }, {
    key: "processExtraUrlParams_",
    value: function processExtraUrlParams_(params, replaceMap) {
      if (params && replaceMap) {
        // If the config includes a extraUrlParamsReplaceMap, apply it as a set
        // of params to String.replace to allow aliasing of the keys in
        // extraUrlParams.
        var count = 0;

        for (var replaceMapKey in replaceMap) {
          if (++count > MAX_REPLACES) {
            var _TAG4 = this.getName_();

            this.user().error(_TAG4, 'More than ' + MAX_REPLACES + ' extraUrlParamsReplaceMap rules ' + "aren't allowed; Skipping the rest");
            break;
          }

          for (var extraUrlParamsKey in params) {
            var newkey = extraUrlParamsKey.replace(replaceMapKey, replaceMap[replaceMapKey]);

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
     */

  }, {
    key: "hasOptedOut_",
    value: function hasOptedOut_() {
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
     */

  }, {
    key: "generateRequests_",
    value: function generateRequests_() {
      var _this8 = this;

      if (!this.config_['requests']) {
        if (!this.allowParentPostMessage_()) {
          var _TAG5 = this.getName_();

          this.user().warn(_TAG5, 'No request strings defined. Analytics ' + 'data will not be sent from this page.');
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
          this.config_['requests'][_k]['baseUrl'] = expandTemplate(this.config_['requests'][_k]['baseUrl'], function (key) {
            var request = _this8.config_['requests'][key];
            return request && request['baseUrl'] || '${' + key + '}';
          }, 5);
        }

        var requests = {};

        for (var _k2 in this.config_['requests']) {
          if (hasOwn(this.config_['requests'], _k2)) {
            var _request = this.config_['requests'][_k2];
            requests[_k2] = new RequestHandler(this.element, _request, Services.preconnectFor(this.win), this.transport_, this.isSandbox_);
          }
        }

        this.requests_ = requests;
      }
    }
    /**
     * Create the linker-manager that will append linker params as necessary.
     * The initialization is asynchronous and non blocking
     * @private
     */

  }, {
    key: "initializeLinker_",
    value: function initializeLinker_() {
      var _this9 = this;

      this.linkerManager_ = new LinkerManager(this.getAmpDoc(), this.config_, this.type_, this.element);

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
     */

  }, {
    key: "handleEvent_",
    value: function handleEvent_(trigger, event) {
      var _trigger$session2;

      var persistEvent = !!((_trigger$session2 = trigger.session) != null && _trigger$session2['persistEvent']);

      if (persistEvent) {
        var _this$sessionManager_;

        (_this$sessionManager_ = this.sessionManager_) == null ? void 0 : _this$sessionManager_.updateEvent(this.type_);
      }

      var requests = isArray(trigger['request']) ? trigger['request'] : [trigger['request']];

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
     */

  }, {
    key: "handleRequestForEvent_",
    value: function handleRequestForEvent_(requestName, trigger, event) {
      var _this10 = this;

      if (!this.element.ownerDocument.defaultView) {
        var _TAG6 = this.getName_();

        dev().warn(_TAG6, 'request against destroyed embed: ', trigger['on']);
      }

      var request = this.requests_[requestName];
      var hasPostMessage = this.allowParentPostMessage_() && trigger['parentPostMessage'];

      if (requestName != undefined && !request) {
        var _TAG7 = this.getName_();

        this.user().error(_TAG7, 'Ignoring request for event. Request string not found: ', trigger['request']);

        if (!hasPostMessage) {
          return;
        }
      }

      this.checkTriggerEnabled_(trigger, event).then(function (enabled) {
        var isConnected = _this10.element.ownerDocument && _this10.element.ownerDocument.defaultView;

        if (!enabled || !isConnected) {
          return;
        }

        _this10.expandAndSendRequest_(request, trigger, event);

        var shouldSendToAmpAd = trigger['parentPostMessage'] && _this10.allowParentPostMessage_() && isIframed(_this10.win);

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
     */

  }, {
    key: "expandAndSendRequest_",
    value: function expandAndSendRequest_(request, trigger, event) {
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
     */

  }, {
    key: "expandAndPostMessage_",
    value: function expandAndPostMessage_(trigger, event) {
      var _this11 = this;

      var msg = trigger['parentPostMessage'];
      var expansionOptions = this.expansionOptions_(event, trigger);
      expandPostMessage(this.getAmpDoc(), msg, this.config_['extraUrlParams'], trigger, expansionOptions, this.element).then(function (message) {
        _this11.win.parent.
        /*OK*/
        postMessage(message, '*');
      });
    }
    /**
     * @param {!JsonObject} trigger The config to use to determine sampling.
     * @return {!Promise<boolean>} Whether the request should be sampled in or
     * not based on sampleSpec.
     * @private
     */

  }, {
    key: "isSampledIn_",
    value: function isSampledIn_(trigger) {
      var _this12 = this;

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

          var samplePromise = _this12.expandTemplateWithUrlParams_(sampleOn, expansionOptions).then(function (key) {
            return _this12.cryptoService_.uniform(key);
          }).then(function (digest) {
            return digest * 100 < threshold;
          });

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

      user().
      /*OK*/
      error(TAG, 'Invalid threshold for sampling.');
      return Promise.resolve(true);
    }
    /**
     * Checks if request for a trigger is enabled.
     * @param {!JsonObject} trigger The config to use to determine if trigger is
     * enabled.
     * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
     * @return {!Promise<boolean>} Whether trigger must be called.
     * @private
     */

  }, {
    key: "checkTriggerEnabled_",
    value: function checkTriggerEnabled_(trigger, event) {
      var expansionOptions = this.expansionOptions_(event, trigger);
      var enabledOnTagLevel = this.checkSpecEnabled_(this.config_['enabled'], expansionOptions);
      var enabledOnTriggerLevel = this.checkSpecEnabled_(trigger['enabled'], expansionOptions);
      return Promise.all([enabledOnTagLevel, enabledOnTriggerLevel]).then(function (enabled) {
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
     */

  }, {
    key: "checkSpecEnabled_",
    value: function checkSpecEnabled_(spec, expansionOptions) {
      // Spec absence always resolves to true.
      if (spec === undefined) {
        return Promise.resolve(true);
      }

      if (typeof spec === 'boolean') {
        return Promise.resolve(spec);
      }

      return this.expandTemplateWithUrlParams_(spec, expansionOptions).then(function (val) {
        return stringToBool(val);
      });
    }
    /**
     * Expands spec using provided expansion options and applies url replacement
     * if necessary.
     * @param {string} spec Expression that needs to be expanded.
     * @param {!ExpansionOptions} expansionOptions Expansion options.
     * @return {!Promise<string>} expanded spec.
     * @private
     */

  }, {
    key: "expandTemplateWithUrlParams_",
    value: function expandTemplateWithUrlParams_(spec, expansionOptions) {
      var _this13 = this;

      return this.variableService_.expandTemplate(spec, expansionOptions, this.element).then(function (key) {
        return Services.urlReplacementsForDoc(_this13.element).expandUrlAsync(key, _this13.variableService_.getMacros(_this13.element));
      });
    }
    /**
     * @return {string} Returns a string to identify this tag. May not be unique
     * if the element id is not unique.
     * @private
     */

  }, {
    key: "getName_",
    value: function getName_() {
      return 'AmpAnalytics ' + (this.element.getAttribute('id') || '<unknown id>');
    }
    /**
     * @param {!JsonObject|!./events.AnalyticsEvent} source1
     * @param {!JsonObject} source2
     * @param {number=} opt_iterations
     * @param {boolean=} opt_noEncode
     * @return {!ExpansionOptions}
     */

  }, {
    key: "expansionOptions_",
    value: function expansionOptions_(source1, source2, opt_iterations, opt_noEncode) {
      var vars = dict();
      mergeObjects(this.config_['vars'], vars);
      mergeObjects(source2['vars'], vars);
      mergeObjects(source1['vars'], vars);
      return new ExpansionOptions(vars, opt_iterations, opt_noEncode);
    }
  }]);

  return AmpAnalytics;
}(AMP.BaseElement);
AMP.extension(TAG, '0.1', function (AMP) {
  // Register doc-service factory.
  AMP.registerServiceForDoc('amp-analytics-instrumentation', InstrumentationService);
  AMP.registerServiceForDoc('activity', Activity);
  installLinkerReaderService(AMP.win);
  AMP.registerServiceForDoc('amp-analytics-session', SessionManager);
  AMP.registerServiceForDoc('amp-analytics-variables', VariableService);
  // Register the element.
  AMP.registerElement(TAG, AmpAnalytics);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1hbmFseXRpY3MuanMiXSwibmFtZXMiOlsiQWN0aXZpdHkiLCJBbmFseXRpY3NDb25maWciLCJtZXJnZU9iamVjdHMiLCJBbmFseXRpY3NFdmVudFR5cGUiLCJDaHVua1ByaW9yaXR5IiwiY2h1bmsiLCJDb29raWVXcml0ZXIiLCJEZWZlcnJlZCIsIkV4cGFuc2lvbk9wdGlvbnMiLCJWYXJpYWJsZVNlcnZpY2UiLCJzdHJpbmdUb0Jvb2wiLCJ2YXJpYWJsZVNlcnZpY2VQcm9taXNlRm9yRG9jIiwiSW5zdHJ1bWVudGF0aW9uU2VydmljZSIsImluc3RydW1lbnRhdGlvblNlcnZpY2VQcm9taXNlRm9yRG9jIiwiTGF5b3V0UHJpb3JpdHkiLCJMaW5rZXJNYW5hZ2VyIiwiUmVxdWVzdEhhbmRsZXIiLCJleHBhbmRQb3N0TWVzc2FnZSIsIlNlcnZpY2VzIiwiU2Vzc2lvbk1hbmFnZXIiLCJzZXNzaW9uU2VydmljZVByb21pc2VGb3JEb2MiLCJUcmFuc3BvcnQiLCJkZXYiLCJkZXZBc3NlcnQiLCJ1c2VyIiwiZGljdCIsImhhc093biIsImV4cGFuZFRlbXBsYXRlIiwiZ2V0TW9kZSIsImluc3RhbGxMaW5rZXJSZWFkZXJTZXJ2aWNlIiwiaXNBcnJheSIsImlzRW51bVZhbHVlIiwicmV0aHJvd0FzeW5jIiwiaXNJZnJhbWVkIiwiaXNJbkZpZSIsIlRBRyIsIk1BWF9SRVBMQUNFUyIsIkFMTE9XTElTVF9FVkVOVF9JTl9TQU5EQk9YIiwiVklTSUJMRSIsIkhJRERFTiIsIklOSV9MT0FEIiwiUkVOREVSX1NUQVJUIiwiQW1wQW5hbHl0aWNzIiwiZWxlbWVudCIsImNvbnNlbnRQcm9taXNlXyIsImNvbnNlbnROb3RpZmljYXRpb25JZF8iLCJpc1NhbmRib3hfIiwicmVxdWVzdHNfIiwiY29uZmlnXyIsImluc3RydW1lbnRhdGlvbl8iLCJhbmFseXRpY3NHcm91cF8iLCJ2YXJpYWJsZVNlcnZpY2VfIiwiY3J5cHRvU2VydmljZV8iLCJjcnlwdG9Gb3IiLCJ3aW4iLCJpbmlQcm9taXNlXyIsInRyYW5zcG9ydF8iLCJ0eXBlXyIsImdldEF0dHJpYnV0ZSIsImlzSW5hYm94XyIsInJ1bnRpbWUiLCJsaW5rZXJNYW5hZ2VyXyIsInNlc3Npb25NYW5hZ2VyXyIsImlzSW5GaWVfIiwiQ09OVEVOVCIsIk1FVEFEQVRBIiwidW51c2VkTGF5b3V0IiwiaGFzQXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwidXNlck5vdGlmaWNhdGlvbk1hbmFnZXJGb3JEb2MiLCJ0aGVuIiwic2VydmljZSIsImdldCIsImFzc2VydFN0cmluZyIsImVuc3VyZUluaXRpYWxpemVkXyIsImRpc3Bvc2UiLCJyZXF1ZXN0IiwibWF5YmVJbml0SWZyYW1lVHJhbnNwb3J0IiwiZ2V0QW1wRG9jIiwiaXNWaXNpYmxlIiwiZGVsZXRlSWZyYW1lVHJhbnNwb3J0IiwiYW1wZG9jIiwid2hlbkZpcnN0VmlzaWJsZSIsInRpbWVyRm9yIiwicHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJzZXJ2aWNlcyIsImxvYWRDb25maWdEZWZlcnJlZCIsImxvYWRDb25maWdUYXNrIiwiY29uZmlnUHJvbWlzZSIsImxvYWRDb25maWciLCJyZXNvbHZlIiwiSElHSCIsImNvbmZpZyIsIndyaXRlIiwibWF5YmVJbml0aWFsaXplU2Vzc2lvbk1hbmFnZXJfIiwiYmluZCIsInJlZ2lzdGVyVHJpZ2dlcnNfIiwiaW5pdGlhbGl6ZUxpbmtlcl8iLCJjb2xsYXBzZSIsInNob3VsZEluaXRpYWxpemUiLCJPYmplY3QiLCJ2YWx1ZXMiLCJzb21lIiwidHJpZ2dlciIsIm1hbmFnZXIiLCJoYXNPcHRlZE91dF8iLCJnZXROYW1lXyIsImZpbmUiLCJnZW5lcmF0ZVJlcXVlc3RzXyIsIndhcm4iLCJwcm9jZXNzRXh0cmFVcmxQYXJhbXNfIiwiY3JlYXRlQW5hbHl0aWNzR3JvdXAiLCJwcm9taXNlcyIsImsiLCJleHBhbnNpb25PcHRpb25zIiwiZXhwYW5zaW9uT3B0aW9uc18iLCJ1bmRlZmluZWQiLCJlcnJvciIsImhhc1JlcXVlc3RPclBvc3RNZXNzYWdlIiwiYWxsb3dQYXJlbnRQb3N0TWVzc2FnZV8iLCJlcnJvck1zZ1NlZyIsImV2ZW50VHlwZSIsImluY2x1ZGVzIiwicHVzaCIsImlzU2FtcGxlZEluXyIsInJlc3VsdCIsInBhcmVudEVsZW1lbnQiLCJ0YWdOYW1lIiwiYWRkVHJpZ2dlcl8iLCJzZWxlY3RvciIsInVybCIsIm9wdF9wcmVsb2FkQXMiLCJwcmVjb25uZWN0Rm9yIiwicHJlbG9hZCIsImFkZFRyaWdnZXIiLCJoYW5kbGVFdmVudF8iLCJlIiwicGFyYW1zIiwicmVwbGFjZU1hcCIsImNvdW50IiwicmVwbGFjZU1hcEtleSIsImV4dHJhVXJsUGFyYW1zS2V5IiwibmV3a2V5IiwicmVwbGFjZSIsInZhbHVlIiwiZWxlbWVudElkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInByb3BzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwia2V5IiwicmVxdWVzdHMiLCJsaW5rZXJUYXNrIiwiaW5pdCIsIkxPVyIsImV2ZW50IiwicGVyc2lzdEV2ZW50Iiwic2Vzc2lvbiIsInVwZGF0ZUV2ZW50IiwiciIsInJlcXVlc3ROYW1lIiwiaGFuZGxlUmVxdWVzdEZvckV2ZW50XyIsIm93bmVyRG9jdW1lbnQiLCJkZWZhdWx0VmlldyIsImhhc1Bvc3RNZXNzYWdlIiwiY2hlY2tUcmlnZ2VyRW5hYmxlZF8iLCJlbmFibGVkIiwiaXNDb25uZWN0ZWQiLCJleHBhbmRBbmRTZW5kUmVxdWVzdF8iLCJzaG91bGRTZW5kVG9BbXBBZCIsImV4cGFuZEFuZFBvc3RNZXNzYWdlXyIsInNlbmQiLCJtc2ciLCJtZXNzYWdlIiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJzcGVjIiwic2FtcGxlT24iLCJ0aHJlc2hvbGQiLCJwYXJzZUZsb2F0Iiwic2FtcGxlRGVmZXJyZWQiLCJzYW1wbGVJblRhc2siLCJzYW1wbGVQcm9taXNlIiwiZXhwYW5kVGVtcGxhdGVXaXRoVXJsUGFyYW1zXyIsInVuaWZvcm0iLCJkaWdlc3QiLCJlbmFibGVkT25UYWdMZXZlbCIsImNoZWNrU3BlY0VuYWJsZWRfIiwiZW5hYmxlZE9uVHJpZ2dlckxldmVsIiwidmFsIiwidXJsUmVwbGFjZW1lbnRzRm9yRG9jIiwiZXhwYW5kVXJsQXN5bmMiLCJnZXRNYWNyb3MiLCJzb3VyY2UxIiwic291cmNlMiIsIm9wdF9pdGVyYXRpb25zIiwib3B0X25vRW5jb2RlIiwidmFycyIsIkFNUCIsIkJhc2VFbGVtZW50IiwiZXh0ZW5zaW9uIiwicmVnaXN0ZXJTZXJ2aWNlRm9yRG9jIiwicmVnaXN0ZXJFbGVtZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7QUFDQSxTQUFRQyxlQUFSLEVBQXlCQyxZQUF6QjtBQUNBLFNBQVFDLGtCQUFSO0FBQ0EsU0FBUUMsYUFBUixFQUF1QkMsS0FBdkI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQ0VDLGdCQURGLEVBRUVDLGVBRkYsRUFHRUMsWUFIRixFQUlFQyw0QkFKRjtBQU1BLFNBQ0VDLHNCQURGLEVBRUVDLG1DQUZGO0FBSUEsU0FBUUMsY0FBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxjQUFSLEVBQXdCQyxpQkFBeEI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsY0FBUixFQUF3QkMsMkJBQXhCO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYixFQUF3QkMsSUFBeEI7QUFDQSxTQUFRQyxJQUFSLEVBQWNDLE1BQWQ7QUFDQSxTQUFRQyxjQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLDBCQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsV0FBakI7QUFDQSxTQUFRQyxZQUFSO0FBRUEsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLE9BQVI7QUFFQSxJQUFNQyxHQUFHLEdBQUcsZUFB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QUF5eUJBRCxHQUFHLENBQUNFLFNBQUosQ0FBY3pLLEdBQWQsRUFBbUIsS0FBbkIsRUFBMEIsVUFBQ3VLLEdBQUQsRUFBUztBQUNqQztBQUNBQSxFQUFBQSxHQUFHLENBQUNHLHFCQUFKLENBQ0UsK0JBREYsRUFFRWpNLHNCQUZGO0FBSUE4TCxFQUFBQSxHQUFHLENBQUNHLHFCQUFKLENBQTBCLFVBQTFCLEVBQXNDN00sUUFBdEM7QUFDQTZCLEVBQUFBLDBCQUEwQixDQUFDNkssR0FBRyxDQUFDcEosR0FBTCxDQUExQjtBQUNBb0osRUFBQUEsR0FBRyxDQUFDRyxxQkFBSixDQUEwQix1QkFBMUIsRUFBbUQxTCxjQUFuRDtBQUNBdUwsRUFBQUEsR0FBRyxDQUFDRyxxQkFBSixDQUEwQix5QkFBMUIsRUFBcURwTSxlQUFyRDtBQUNBO0FBQ0FpTSxFQUFBQSxHQUFHLENBQUNJLGVBQUosQ0FBb0IzSyxHQUFwQixFQUF5Qk8sWUFBekI7QUFDRCxDQVpEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7QWN0aXZpdHl9IGZyb20gJy4vYWN0aXZpdHktaW1wbCc7XG5pbXBvcnQge0FuYWx5dGljc0NvbmZpZywgbWVyZ2VPYmplY3RzfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0FuYWx5dGljc0V2ZW50VHlwZX0gZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHtDaHVua1ByaW9yaXR5LCBjaHVua30gZnJvbSAnLi4vLi4vLi4vc3JjL2NodW5rJztcbmltcG9ydCB7Q29va2llV3JpdGVyfSBmcm9tICcuL2Nvb2tpZS13cml0ZXInO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtcbiAgRXhwYW5zaW9uT3B0aW9ucyxcbiAgVmFyaWFibGVTZXJ2aWNlLFxuICBzdHJpbmdUb0Jvb2wsXG4gIHZhcmlhYmxlU2VydmljZVByb21pc2VGb3JEb2MsXG59IGZyb20gJy4vdmFyaWFibGVzJztcbmltcG9ydCB7XG4gIEluc3RydW1lbnRhdGlvblNlcnZpY2UsXG4gIGluc3RydW1lbnRhdGlvblNlcnZpY2VQcm9taXNlRm9yRG9jLFxufSBmcm9tICcuL2luc3RydW1lbnRhdGlvbic7XG5pbXBvcnQge0xheW91dFByaW9yaXR5fSBmcm9tICcjY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7TGlua2VyTWFuYWdlcn0gZnJvbSAnLi9saW5rZXItbWFuYWdlcic7XG5pbXBvcnQge1JlcXVlc3RIYW5kbGVyLCBleHBhbmRQb3N0TWVzc2FnZX0gZnJvbSAnLi9yZXF1ZXN0cyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge1Nlc3Npb25NYW5hZ2VyLCBzZXNzaW9uU2VydmljZVByb21pc2VGb3JEb2N9IGZyb20gJy4vc2Vzc2lvbi1tYW5hZ2VyJztcbmltcG9ydCB7VHJhbnNwb3J0fSBmcm9tICcuL3RyYW5zcG9ydCc7XG5pbXBvcnQge2RldiwgZGV2QXNzZXJ0LCB1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7ZGljdCwgaGFzT3dufSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtleHBhbmRUZW1wbGF0ZX0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL21vZGUnO1xuaW1wb3J0IHtpbnN0YWxsTGlua2VyUmVhZGVyU2VydmljZX0gZnJvbSAnLi9saW5rZXItcmVhZGVyJztcbmltcG9ydCB7aXNBcnJheSwgaXNFbnVtVmFsdWV9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7cmV0aHJvd0FzeW5jfSBmcm9tICcjY29yZS9lcnJvcic7XG5cbmltcG9ydCB7aXNJZnJhbWVkfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtpc0luRmllfSBmcm9tICcuLi8uLi8uLi9zcmMvaWZyYW1lLWhlbHBlcic7XG5cbmNvbnN0IFRBRyA9ICdhbXAtYW5hbHl0aWNzJztcblxuY29uc3QgTUFYX1JFUExBQ0VTID0gMTY7IC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBlbnRyaWVzIGluIGEgZXh0cmFVcmxQYXJhbXNSZXBsYWNlTWFwXG5cbmNvbnN0IEFMTE9XTElTVF9FVkVOVF9JTl9TQU5EQk9YID0gW1xuICBBbmFseXRpY3NFdmVudFR5cGUuVklTSUJMRSxcbiAgQW5hbHl0aWNzRXZlbnRUeXBlLkhJRERFTixcbiAgQW5hbHl0aWNzRXZlbnRUeXBlLklOSV9MT0FELFxuICBBbmFseXRpY3NFdmVudFR5cGUuUkVOREVSX1NUQVJULFxuXTtcbmV4cG9ydCBjbGFzcyBBbXBBbmFseXRpY3MgZXh0ZW5kcyBBTVAuQmFzZUVsZW1lbnQge1xuICAvKiogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudCAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgc3VwZXIoZWxlbWVudCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFQcm9taXNlfSAqL1xuICAgIHRoaXMuY29uc2VudFByb21pc2VfID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaHRtbCBpZCBvZiB0aGUgYGFtcC11c2VyLW5vdGlmaWNhdGlvbmAgZWxlbWVudC5cbiAgICAgKiBAcHJpdmF0ZSB7P3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLmNvbnNlbnROb3RpZmljYXRpb25JZF8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNTYW5kYm94XyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUge09iamVjdDxzdHJpbmcsIFJlcXVlc3RIYW5kbGVyPn0gQSBtYXAgb2YgcmVxdWVzdCBoYW5kbGVyIHdpdGggcmVxdWVzdHNcbiAgICAgKi9cbiAgICB0aGlzLnJlcXVlc3RzXyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyFKc29uT2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMuY29uZmlnXyA9IGRpY3QoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vaW5zdHJ1bWVudGF0aW9uLkluc3RydW1lbnRhdGlvblNlcnZpY2V9ICovXG4gICAgdGhpcy5pbnN0cnVtZW50YXRpb25fID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vYW5hbHl0aWNzLWdyb3VwLkFuYWx5dGljc0dyb3VwfSAqL1xuICAgIHRoaXMuYW5hbHl0aWNzR3JvdXBfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vdmFyaWFibGVzLlZhcmlhYmxlU2VydmljZX0gKi9cbiAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vLi4vc3JjL3NlcnZpY2UvY3J5cHRvLWltcGwuQ3J5cHRvfSAqL1xuICAgIHRoaXMuY3J5cHRvU2VydmljZV8gPSBTZXJ2aWNlcy5jcnlwdG9Gb3IodGhpcy53aW4pO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/UHJvbWlzZX0gKi9cbiAgICB0aGlzLmluaVByb21pc2VfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Li90cmFuc3BvcnQuVHJhbnNwb3J0fSAqL1xuICAgIHRoaXMudHJhbnNwb3J0XyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLnR5cGVfID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgndHlwZScpO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNJbmFib3hfID0gZ2V0TW9kZSh0aGlzLndpbikucnVudGltZSA9PSAnaW5hYm94JztcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vbGlua2VyLW1hbmFnZXIuTGlua2VyTWFuYWdlcn0gKi9cbiAgICB0aGlzLmxpbmtlck1hbmFnZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Py4vc2Vzc2lvbi1tYW5hZ2VyLlNlc3Npb25NYW5hZ2VyfSAqL1xuICAgIHRoaXMuc2Vzc2lvbk1hbmFnZXJfID0gbnVsbDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc0luRmllXyA9IG51bGw7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldExheW91dFByaW9yaXR5KCkge1xuICAgIC8vIExvYWQgaW1tZWRpYXRlbHkgaWYgaW5hYm94LCBvdGhlcndpc2UgYWZ0ZXIgb3RoZXIgY29udGVudC5cbiAgICByZXR1cm4gdGhpcy5pc0luYWJveF8gPyBMYXlvdXRQcmlvcml0eS5DT05URU5UIDogTGF5b3V0UHJpb3JpdHkuTUVUQURBVEE7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzQWx3YXlzRml4ZWQoKSB7XG4gICAgcmV0dXJuICFpc0luRmllKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKHVudXNlZExheW91dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIHRoaXMuaXNTYW5kYm94XyA9IHRoaXMuZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3NhbmRib3gnKTtcblxuICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuICAgIHRoaXMuY29uc2VudE5vdGlmaWNhdGlvbklkXyA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoXG4gICAgICAnZGF0YS1jb25zZW50LW5vdGlmaWNhdGlvbi1pZCdcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuY29uc2VudE5vdGlmaWNhdGlvbklkXyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmNvbnNlbnRQcm9taXNlXyA9IFNlcnZpY2VzLnVzZXJOb3RpZmljYXRpb25NYW5hZ2VyRm9yRG9jKFxuICAgICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICkudGhlbigoc2VydmljZSkgPT5cbiAgICAgICAgc2VydmljZS5nZXQoZGV2KCkuYXNzZXJ0U3RyaW5nKHRoaXMuY29uc2VudE5vdGlmaWNhdGlvbklkXykpXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0cmlnZ2VyJykgPT0gJ2ltbWVkaWF0ZScpIHtcbiAgICAgIHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWRfKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBsYXlvdXRDYWxsYmFjaygpIHtcbiAgICAvLyBOb3cgdGhhdCB3ZSBhcmUgcmVuZGVyZWQsIHN0b3AgcmVuZGVyaW5nIHRoZSBlbGVtZW50IHRvIHJlZHVjZVxuICAgIC8vIHJlc291cmNlIGNvbnN1bXB0aW9uLlxuICAgIHJldHVybiB0aGlzLmVuc3VyZUluaXRpYWxpemVkXygpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBkZXRhY2hlZENhbGxiYWNrKCkge1xuICAgIGlmICh0aGlzLmFuYWx5dGljc0dyb3VwXykge1xuICAgICAgdGhpcy5hbmFseXRpY3NHcm91cF8uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5hbmFseXRpY3NHcm91cF8gPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxpbmtlck1hbmFnZXJfKSB7XG4gICAgICB0aGlzLmxpbmtlck1hbmFnZXJfLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMubGlua2VyTWFuYWdlcl8gPSBudWxsO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcmVxdWVzdCBpbiB0aGlzLnJlcXVlc3RzXykge1xuICAgICAgdGhpcy5yZXF1ZXN0c19bcmVxdWVzdF0uZGlzcG9zZSgpO1xuICAgICAgZGVsZXRlIHRoaXMucmVxdWVzdHNfW3JlcXVlc3RdO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVzdW1lQ2FsbGJhY2soKSB7XG4gICAgaWYgKHRoaXMuaW5pUHJvbWlzZV8pIHtcbiAgICAgIHRoaXMuaW5pUHJvbWlzZV8udGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0Xy5tYXliZUluaXRJZnJhbWVUcmFuc3BvcnQodGhpcy5lbGVtZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdW5sYXlvdXRDYWxsYmFjaygpIHtcbiAgICBpZiAodGhpcy5nZXRBbXBEb2MoKS5pc1Zpc2libGUoKSkge1xuICAgICAgLy8gYW1wLWFuYWx5dGljcyB0YWcgd2FzIGp1c3Qgc2V0IHRvIGRpc3BsYXk6bm9uZS4gUGFnZSBpcyBzdGlsbCBsb2FkZWQuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5pUHJvbWlzZV8pIHtcbiAgICAgIHRoaXMuaW5pUHJvbWlzZV8udGhlbigoKSA9PiB7XG4gICAgICAgIC8vIFBhZ2Ugd2FzIHVubG9hZGVkIC0gZnJlZSB1cCBvd25lZCByZXNvdXJjZXMuXG4gICAgICAgIHRoaXMudHJhbnNwb3J0Xy5kZWxldGVJZnJhbWVUcmFuc3BvcnQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci51bmxheW91dENhbGxiYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbnN1cmVJbml0aWFsaXplZF8oKSB7XG4gICAgaWYgKHRoaXMuaW5pUHJvbWlzZV8pIHtcbiAgICAgIHJldHVybiB0aGlzLmluaVByb21pc2VfO1xuICAgIH1cblxuICAgIGNvbnN0IGFtcGRvYyA9IHRoaXMuZ2V0QW1wRG9jKCk7XG4gICAgdGhpcy5pbmlQcm9taXNlXyA9IGFtcGRvY1xuICAgICAgLndoZW5GaXJzdFZpc2libGUoKVxuICAgICAgLy8gUnVkaW1lbnRhcnkgXCJpZGxlXCIgc2lnbmFsLlxuICAgICAgLnRoZW4oKCkgPT4gU2VydmljZXMudGltZXJGb3IodGhpcy53aW4pLnByb21pc2UoMSkpXG4gICAgICAudGhlbigoKSA9PiB0aGlzLmNvbnNlbnRQcm9taXNlXylcbiAgICAgIC50aGVuKCgpID0+XG4gICAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgICBpbnN0cnVtZW50YXRpb25TZXJ2aWNlUHJvbWlzZUZvckRvYyhhbXBkb2MpLFxuICAgICAgICAgIHZhcmlhYmxlU2VydmljZVByb21pc2VGb3JEb2MoYW1wZG9jKSxcbiAgICAgICAgXSlcbiAgICAgIClcbiAgICAgIC50aGVuKChzZXJ2aWNlcykgPT4ge1xuICAgICAgICB0aGlzLmluc3RydW1lbnRhdGlvbl8gPSBzZXJ2aWNlc1swXTtcbiAgICAgICAgdGhpcy52YXJpYWJsZVNlcnZpY2VfID0gc2VydmljZXNbMV07XG4gICAgICAgIGNvbnN0IGxvYWRDb25maWdEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgICAgICBjb25zdCBsb2FkQ29uZmlnVGFzayA9ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBjb25maWdQcm9taXNlID0gbmV3IEFuYWx5dGljc0NvbmZpZyh0aGlzLmVsZW1lbnQpLmxvYWRDb25maWcoKTtcbiAgICAgICAgICBsb2FkQ29uZmlnRGVmZXJyZWQucmVzb2x2ZShjb25maWdQcm9taXNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuaXNJbmFib3hfKSB7XG4gICAgICAgICAgLy8gQ2h1bmsgaW4gaW5hYm94IGFkIGxlYWRzIHRvIGFjdGl2ZXZpZXcgcmVncmVzc2lvbiwgaGFuZGxlIHNlcGVyYXRlbHlcbiAgICAgICAgICBsb2FkQ29uZmlnVGFzaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNodW5rKHRoaXMuZWxlbWVudCwgbG9hZENvbmZpZ1Rhc2ssIENodW5rUHJpb3JpdHkuSElHSCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvYWRDb25maWdEZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChjb25maWcpID0+IHtcbiAgICAgICAgdGhpcy5jb25maWdfID0gLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKGNvbmZpZyk7XG4gICAgICAgIC8vIENvb2tpZVdyaXRlciBub3QgZW5hYmxlZCBvbiBwcm94eSBvcmlnaW4sIGRvIG5vdCBjaHVua1xuICAgICAgICByZXR1cm4gbmV3IENvb2tpZVdyaXRlcih0aGlzLndpbiwgdGhpcy5lbGVtZW50LCB0aGlzLmNvbmZpZ18pLndyaXRlKCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLnRyYW5zcG9ydF8gPSBuZXcgVHJhbnNwb3J0KFxuICAgICAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICAgICAgdGhpcy5jb25maWdfWyd0cmFuc3BvcnQnXSB8fCB7fVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC50aGVuKHRoaXMubWF5YmVJbml0aWFsaXplU2Vzc2lvbk1hbmFnZXJfLmJpbmQodGhpcykpXG4gICAgICAudGhlbih0aGlzLnJlZ2lzdGVyVHJpZ2dlcnNfLmJpbmQodGhpcykpXG4gICAgICAudGhlbih0aGlzLmluaXRpYWxpemVMaW5rZXJfLmJpbmQodGhpcykpO1xuICAgIHRoaXMuaW5pUHJvbWlzZV8udGhlbigoKSA9PiB7XG4gICAgICB0aGlzLi8qT0sqLyBjb2xsYXBzZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmluaVByb21pc2VfO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgcGFyZW50IHBvc3QgbWVzc2FnZXMgYXJlIGFsbG93ZWQuXG4gICAqXG4gICAqIDxwPlBhcmVudCBwb3N0IG1lc3NhZ2VzIGFyZSBvbmx5IGFsbG93ZWQgZm9yIGFkcy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFsbG93UGFyZW50UG9zdE1lc3NhZ2VfKCkge1xuICAgIGlmICh0aGlzLmlzSW5hYm94Xykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzSW5GaWVfID09IG51bGwpIHtcbiAgICAgIHRoaXMuaXNJbkZpZV8gPSBpc0luRmllKHRoaXMuZWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmlzSW5GaWVfO1xuICB9XG5cbiAgLyoqXG4gICAqIE1heWJlIGluaXRpYWxpemVzIFNlc3Npb24gTWFuYWdlci5cbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBtYXliZUluaXRpYWxpemVTZXNzaW9uTWFuYWdlcl8oKSB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZ19bJ3RyaWdnZXJzJ10pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3Qgc2hvdWxkSW5pdGlhbGl6ZSA9IE9iamVjdC52YWx1ZXModGhpcy5jb25maWdfWyd0cmlnZ2VycyddKS5zb21lKFxuICAgICAgKHRyaWdnZXIpID0+IHRyaWdnZXI/Llsnc2Vzc2lvbiddPy5bJ3BlcnNpc3RFdmVudCddXG4gICAgKTtcbiAgICBpZiAoc2hvdWxkSW5pdGlhbGl6ZSAmJiB0aGlzLnR5cGVfKSB7XG4gICAgICBjb25zdCBhbXBkb2MgPSB0aGlzLmdldEFtcERvYygpO1xuICAgICAgcmV0dXJuIHNlc3Npb25TZXJ2aWNlUHJvbWlzZUZvckRvYyhhbXBkb2MpLnRoZW4oKG1hbmFnZXIpID0+IHtcbiAgICAgICAgdGhpcy5zZXNzaW9uTWFuYWdlcl8gPSBtYW5hZ2VyO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdHJpZ2dlcnMuXG4gICAqIEByZXR1cm4geyFQcm9taXNlfHVuZGVmaW5lZH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlZ2lzdGVyVHJpZ2dlcnNfKCkge1xuICAgIGlmICh0aGlzLmhhc09wdGVkT3V0XygpKSB7XG4gICAgICAvLyBOb3RoaW5nIHRvIGRvIHdoZW4gdGhlIHVzZXIgaGFzIG9wdGVkIG91dC5cbiAgICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICAgIHVzZXIoKS5maW5lKFRBRywgJ1VzZXIgaGFzIG9wdGVkIG91dC4gTm8gaGl0cyB3aWxsIGJlIHNlbnQuJyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5nZW5lcmF0ZVJlcXVlc3RzXygpO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZ19bJ3RyaWdnZXJzJ10pIHtcbiAgICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICAgIHRoaXMudXNlcigpLndhcm4oXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ05vIHRyaWdnZXJzIHdlcmUgZm91bmQgaW4gdGhlICcgK1xuICAgICAgICAgICdjb25maWcuIE5vIGFuYWx5dGljcyBkYXRhIHdpbGwgYmUgc2VudC4nXG4gICAgICApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHRoaXMucHJvY2Vzc0V4dHJhVXJsUGFyYW1zXyhcbiAgICAgIHRoaXMuY29uZmlnX1snZXh0cmFVcmxQYXJhbXMnXSxcbiAgICAgIHRoaXMuY29uZmlnX1snZXh0cmFVcmxQYXJhbXNSZXBsYWNlTWFwJ11cbiAgICApO1xuXG4gICAgdGhpcy5hbmFseXRpY3NHcm91cF8gPSB0aGlzLmluc3RydW1lbnRhdGlvbl8uY3JlYXRlQW5hbHl0aWNzR3JvdXAoXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApO1xuXG4gICAgdGhpcy50cmFuc3BvcnRfLm1heWJlSW5pdElmcmFtZVRyYW5zcG9ydCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICAvLyBUcmlnZ2VyIGNhbGxiYWNrIGNhbiBiZSBzeW5jaHJvbm91cy4gRG8gdGhlIHJlZ2lzdHJhdGlvbiBhdCB0aGUgZW5kLlxuICAgIGZvciAoY29uc3QgayBpbiB0aGlzLmNvbmZpZ19bJ3RyaWdnZXJzJ10pIHtcbiAgICAgIGlmIChoYXNPd24odGhpcy5jb25maWdfWyd0cmlnZ2VycyddLCBrKSkge1xuICAgICAgICBjb25zdCB0cmlnZ2VyID0gdGhpcy5jb25maWdfWyd0cmlnZ2VycyddW2tdO1xuICAgICAgICBjb25zdCBleHBhbnNpb25PcHRpb25zID0gdGhpcy5leHBhbnNpb25PcHRpb25zXyhcbiAgICAgICAgICBkaWN0KHt9KSxcbiAgICAgICAgICB0cmlnZ2VyLFxuICAgICAgICAgIHVuZGVmaW5lZCAvKiBvcHRfaXRlcmF0aW9ucyAqLyxcbiAgICAgICAgICB0cnVlIC8qIG9wdF9ub0VuY29kZSAqL1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBUQUcgPSB0aGlzLmdldE5hbWVfKCk7XG4gICAgICAgIGlmICghdHJpZ2dlcikge1xuICAgICAgICAgIHRoaXMudXNlcigpLmVycm9yKFRBRywgJ1RyaWdnZXIgc2hvdWxkIGJlIGFuIG9iamVjdDogJywgayk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGFzUmVxdWVzdE9yUG9zdE1lc3NhZ2UgPVxuICAgICAgICAgIHRyaWdnZXJbJ3JlcXVlc3QnXSB8fFxuICAgICAgICAgICh0cmlnZ2VyWydwYXJlbnRQb3N0TWVzc2FnZSddICYmIHRoaXMuYWxsb3dQYXJlbnRQb3N0TWVzc2FnZV8oKSk7XG4gICAgICAgIGlmICghdHJpZ2dlclsnb24nXSB8fCAhaGFzUmVxdWVzdE9yUG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgICBjb25zdCBlcnJvck1zZ1NlZyA9IHRoaXMuYWxsb3dQYXJlbnRQb3N0TWVzc2FnZV8oKVxuICAgICAgICAgICAgPyAnL1wicGFyZW50UG9zdE1lc3NhZ2VcIidcbiAgICAgICAgICAgIDogJyc7XG4gICAgICAgICAgdGhpcy51c2VyKCkuZXJyb3IoXG4gICAgICAgICAgICBUQUcsXG4gICAgICAgICAgICAnXCJvblwiIGFuZCBcInJlcXVlc3RcIicgK1xuICAgICAgICAgICAgICBlcnJvck1zZ1NlZyArXG4gICAgICAgICAgICAgICcgYXR0cmlidXRlcyBhcmUgcmVxdWlyZWQgZm9yIGRhdGEgdG8gYmUgY29sbGVjdGVkLidcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGZvciBub3Qgc3VwcG9ydGVkIHRyaWdnZXIgZm9yIHNhbmRib3hlZCBhbmFseXRpY3NcbiAgICAgICAgaWYgKHRoaXMuaXNTYW5kYm94Xykge1xuICAgICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IHRyaWdnZXJbJ29uJ107XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaXNFbnVtVmFsdWUoQW5hbHl0aWNzRXZlbnRUeXBlLCBldmVudFR5cGUpICYmXG4gICAgICAgICAgICAhQUxMT1dMSVNUX0VWRU5UX0lOX1NBTkRCT1guaW5jbHVkZXMoZXZlbnRUeXBlKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy51c2VyKCkuZXJyb3IoXG4gICAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICAgZXZlbnRUeXBlICsgJyBpcyBub3Qgc3VwcG9ydGVkIGZvciBhbXAtYW5hbHl0aWNzIGluIHNjb3BlJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJvY2Vzc0V4dHJhVXJsUGFyYW1zXyhcbiAgICAgICAgICB0cmlnZ2VyWydleHRyYVVybFBhcmFtcyddLFxuICAgICAgICAgIHRoaXMuY29uZmlnX1snZXh0cmFVcmxQYXJhbXNSZXBsYWNlTWFwJ11cbiAgICAgICAgKTtcbiAgICAgICAgcHJvbWlzZXMucHVzaChcbiAgICAgICAgICB0aGlzLmlzU2FtcGxlZEluXyh0cmlnZ2VyKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlcGxhY2Ugc2VsZWN0b3IgYW5kIHNlbGVjdGlvbk1ldGhvZFxuICAgICAgICAgICAgaWYgKHRoaXMuaXNTYW5kYm94Xykge1xuICAgICAgICAgICAgICAvLyBPbmx5IHN1cHBvcnQgc2VsZWN0aW9uIG9mIHBhcmVudCBlbGVtZW50IGZvciBhbmFseXRpY3MgaW4gc2NvcGVcbiAgICAgICAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIC8vIEluIGNhc2UgcGFyZW50IGVsZW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIERPTSwgZG8gbm90aGluZ1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0cmlnZ2VyWydzZWxlY3RvciddID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQudGFnTmFtZTtcbiAgICAgICAgICAgICAgdHJpZ2dlclsnc2VsZWN0aW9uTWV0aG9kJ10gPSAnY2xvc2VzdCc7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZFRyaWdnZXJfKHRyaWdnZXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyWydzZWxlY3RvciddICYmICFpc0FycmF5KHRyaWdnZXJbJ3NlbGVjdG9yJ10pKSB7XG4gICAgICAgICAgICAgIC8vIEV4cGFuZCB0aGUgc2VsZWN0b3IgdXNpbmcgdmFyaWFibGUgZXhwYW5zaW9uLlxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YXJpYWJsZVNlcnZpY2VfXG4gICAgICAgICAgICAgICAgLmV4cGFuZFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgdHJpZ2dlclsnc2VsZWN0b3InXSxcbiAgICAgICAgICAgICAgICAgIGV4cGFuc2lvbk9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnRoZW4oKHNlbGVjdG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0cmlnZ2VyWydzZWxlY3RvciddID0gc2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRUcmlnZ2VyXyh0cmlnZ2VyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZFRyaWdnZXJfKHRyaWdnZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gIH1cblxuICAvKipcbiAgICogQXNrcyB0aGUgYnJvd3NlciB0byBwcmVsb2FkIGEgVVJMLiBBbHdheXMgYWxzbyBkb2VzIGEgcHJlY29ubmVjdFxuICAgKiBiZWNhdXNlIGJyb3dzZXIgc3VwcG9ydCBmb3IgdGhhdCBpcyBiZXR0ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfcHJlbG9hZEFzXG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgcHJlbG9hZCh1cmwsIG9wdF9wcmVsb2FkQXMpIHtcbiAgICBTZXJ2aWNlcy5wcmVjb25uZWN0Rm9yKHRoaXMud2luKS5wcmVsb2FkKFxuICAgICAgdGhpcy5nZXRBbXBEb2MoKSxcbiAgICAgIHVybCxcbiAgICAgIG9wdF9wcmVsb2FkQXNcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGBBbmFseXRpY3NHcm91cC5hZGRUcmlnZ2VyYCBhbmQgcmVwb3J0cyBhbnkgZXJyb3JzLlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBjb25maWdcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBhZGRUcmlnZ2VyXyhjb25maWcpIHtcbiAgICBpZiAoIXRoaXMuYW5hbHl0aWNzR3JvdXBfKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIGhhbmRsZSB0cmlnZ2VyIGZvciBjb21wb25lbnQgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGRldGFjaGVkXG4gICAgICAvLyBmcm9tIERPTVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5hbHl0aWNzR3JvdXBfLmFkZFRyaWdnZXIoXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdGhpcy5oYW5kbGVFdmVudF8uYmluZCh0aGlzLCBjb25maWcpXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGNvbmZpZ1snb24nXTtcbiAgICAgIHJldGhyb3dBc3luYyhUQUcsICdGYWlsZWQgdG8gcHJvY2VzcyB0cmlnZ2VyIFwiJyArIGV2ZW50VHlwZSArICdcIicsIGUpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIHRoZSBuYW1lcyBvZiBrZXlzIGluIHBhcmFtcyBvYmplY3Qgd2l0aCB0aGUgdmFsdWVzIGluIHJlcGxhY2UgbWFwLlxuICAgKlxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBzdHJpbmc+fSBwYXJhbXMgVGhlIHBhcmFtcyB0aGF0IG5lZWQgdG8gYmUgcmVuYW1lZC5cbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn0gcmVwbGFjZU1hcCBBIG1hcCBvZiBwYXR0ZXJuIGFuZCByZXBsYWNlbWVudFxuICAgKiAgICB2YWx1ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb2Nlc3NFeHRyYVVybFBhcmFtc18ocGFyYW1zLCByZXBsYWNlTWFwKSB7XG4gICAgaWYgKHBhcmFtcyAmJiByZXBsYWNlTWFwKSB7XG4gICAgICAvLyBJZiB0aGUgY29uZmlnIGluY2x1ZGVzIGEgZXh0cmFVcmxQYXJhbXNSZXBsYWNlTWFwLCBhcHBseSBpdCBhcyBhIHNldFxuICAgICAgLy8gb2YgcGFyYW1zIHRvIFN0cmluZy5yZXBsYWNlIHRvIGFsbG93IGFsaWFzaW5nIG9mIHRoZSBrZXlzIGluXG4gICAgICAvLyBleHRyYVVybFBhcmFtcy5cbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IHJlcGxhY2VNYXBLZXkgaW4gcmVwbGFjZU1hcCkge1xuICAgICAgICBpZiAoKytjb3VudCA+IE1BWF9SRVBMQUNFUykge1xuICAgICAgICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICAgICAgICB0aGlzLnVzZXIoKS5lcnJvcihcbiAgICAgICAgICAgIFRBRyxcbiAgICAgICAgICAgICdNb3JlIHRoYW4gJyArXG4gICAgICAgICAgICAgIE1BWF9SRVBMQUNFUyArXG4gICAgICAgICAgICAgICcgZXh0cmFVcmxQYXJhbXNSZXBsYWNlTWFwIHJ1bGVzICcgK1xuICAgICAgICAgICAgICBcImFyZW4ndCBhbGxvd2VkOyBTa2lwcGluZyB0aGUgcmVzdFwiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgZXh0cmFVcmxQYXJhbXNLZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgY29uc3QgbmV3a2V5ID0gZXh0cmFVcmxQYXJhbXNLZXkucmVwbGFjZShcbiAgICAgICAgICAgIHJlcGxhY2VNYXBLZXksXG4gICAgICAgICAgICByZXBsYWNlTWFwW3JlcGxhY2VNYXBLZXldXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZXh0cmFVcmxQYXJhbXNLZXkgIT0gbmV3a2V5KSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtc1tleHRyYVVybFBhcmFtc0tleV07XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1zW2V4dHJhVXJsUGFyYW1zS2V5XTtcbiAgICAgICAgICAgIHBhcmFtc1tuZXdrZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHVzZXIgaGFzIG9wdGVkIG91dC5cbiAgICovXG4gIGhhc09wdGVkT3V0XygpIHtcbiAgICBjb25zdCBlbGVtZW50SWQgPSB0aGlzLmNvbmZpZ19bJ29wdG91dEVsZW1lbnRJZCddO1xuICAgIGlmIChlbGVtZW50SWQgJiYgdGhpcy53aW4uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmNvbmZpZ19bJ29wdG91dCddKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLmNvbmZpZ19bJ29wdG91dCddLnNwbGl0KCcuJyk7XG4gICAgbGV0IGsgPSB0aGlzLndpbjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWspIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgayA9IGtbcHJvcHNbaV1dO1xuICAgIH1cbiAgICAvLyBUaGUgYWN0dWFsIHByb3BlcnR5IGJlaW5nIGNhbGxlZCBpcyBjb250cm9sbGVkIGJ5IHZlbmRvciBjb25maWdzIG9ubHlcbiAgICAvLyB0aGF0IGFyZSBhcHByb3ZlZCBpbiBjb2RlIHJldmlld3MuIFVzZXIgY3VzdG9taXphdGlvbiBvZiB0aGUgYG9wdG91dGBcbiAgICAvLyBwcm9wZXJ0eSBpcyBub3QgYWxsb3dlZC5cbiAgICByZXR1cm4gaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdGhyb3VnaCBhbGwgdGhlIHJlcXVlc3RzIGluIHByZWRlZmluZWQgdmVuZG9yIGNvbmZpZyBhbmQgdGFnJ3MgY29uZmlnXG4gICAqIGFuZCBjcmVhdGVzIGEgbWFwIG9mIHJlcXVlc3QgbmFtZSB0byByZXF1ZXN0IHRlbXBsYXRlLiBUaGVzZSByZXF1ZXN0cyBjYW5cbiAgICogdGhlbiBiZSB1c2VkIHdoaWxlIHNlbmRpbmcgYSByZXF1ZXN0IHRvIGEgc2VydmVyLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2VuZXJhdGVSZXF1ZXN0c18oKSB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZ19bJ3JlcXVlc3RzJ10pIHtcbiAgICAgIGlmICghdGhpcy5hbGxvd1BhcmVudFBvc3RNZXNzYWdlXygpKSB7XG4gICAgICAgIGNvbnN0IFRBRyA9IHRoaXMuZ2V0TmFtZV8oKTtcbiAgICAgICAgdGhpcy51c2VyKCkud2FybihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ05vIHJlcXVlc3Qgc3RyaW5ncyBkZWZpbmVkLiBBbmFseXRpY3MgJyArXG4gICAgICAgICAgICAnZGF0YSB3aWxsIG5vdCBiZSBzZW50IGZyb20gdGhpcyBwYWdlLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb25maWdfWydyZXF1ZXN0cyddKSB7XG4gICAgICBmb3IgKGNvbnN0IGsgaW4gdGhpcy5jb25maWdfWydyZXF1ZXN0cyddKSB7XG4gICAgICAgIGlmIChoYXNPd24odGhpcy5jb25maWdfWydyZXF1ZXN0cyddLCBrKSkge1xuICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmNvbmZpZ19bJ3JlcXVlc3RzJ11ba107XG4gICAgICAgICAgaWYgKCFyZXF1ZXN0WydiYXNlVXJsJ10pIHtcbiAgICAgICAgICAgIHRoaXMudXNlcigpLmVycm9yKFRBRywgJ3JlcXVlc3QgbXVzdCBoYXZlIGEgYmFzZVVybCcpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29uZmlnX1sncmVxdWVzdHMnXVtrXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRXhwYW5kIGFueSBwbGFjZWhvbGRlcnMuIEZvciByZXF1ZXN0cywgd2UgZXhwYW5kIGVhY2ggc3RyaW5nIHVwIHRvIDVcbiAgICAgIC8vIHRpbWVzIHRvIHN1cHBvcnQgbmVzdGVkIHJlcXVlc3RzLiBMZWF2ZSBhbnkgdW5yZXNvbHZlZCBwbGFjZWhvbGRlcnMuXG4gICAgICAvLyBFeHBhbmQgYW55IHJlcXVlc3RzIHBsYWNlaG9sZGVyLlxuICAgICAgZm9yIChjb25zdCBrIGluIHRoaXMuY29uZmlnX1sncmVxdWVzdHMnXSkge1xuICAgICAgICB0aGlzLmNvbmZpZ19bJ3JlcXVlc3RzJ11ba11bJ2Jhc2VVcmwnXSA9IGV4cGFuZFRlbXBsYXRlKFxuICAgICAgICAgIHRoaXMuY29uZmlnX1sncmVxdWVzdHMnXVtrXVsnYmFzZVVybCddLFxuICAgICAgICAgIChrZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmNvbmZpZ19bJ3JlcXVlc3RzJ11ba2V5XTtcbiAgICAgICAgICAgIHJldHVybiAocmVxdWVzdCAmJiByZXF1ZXN0WydiYXNlVXJsJ10pIHx8ICckeycgKyBrZXkgKyAnfSc7XG4gICAgICAgICAgfSxcbiAgICAgICAgICA1XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlcXVlc3RzID0ge307XG4gICAgICBmb3IgKGNvbnN0IGsgaW4gdGhpcy5jb25maWdfWydyZXF1ZXN0cyddKSB7XG4gICAgICAgIGlmIChoYXNPd24odGhpcy5jb25maWdfWydyZXF1ZXN0cyddLCBrKSkge1xuICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmNvbmZpZ19bJ3JlcXVlc3RzJ11ba107XG4gICAgICAgICAgcmVxdWVzdHNba10gPSBuZXcgUmVxdWVzdEhhbmRsZXIoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAgU2VydmljZXMucHJlY29ubmVjdEZvcih0aGlzLndpbiksXG4gICAgICAgICAgICB0aGlzLnRyYW5zcG9ydF8sXG4gICAgICAgICAgICB0aGlzLmlzU2FuZGJveF9cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnJlcXVlc3RzXyA9IHJlcXVlc3RzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdGhlIGxpbmtlci1tYW5hZ2VyIHRoYXQgd2lsbCBhcHBlbmQgbGlua2VyIHBhcmFtcyBhcyBuZWNlc3NhcnkuXG4gICAqIFRoZSBpbml0aWFsaXphdGlvbiBpcyBhc3luY2hyb25vdXMgYW5kIG5vbiBibG9ja2luZ1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5pdGlhbGl6ZUxpbmtlcl8oKSB7XG4gICAgdGhpcy5saW5rZXJNYW5hZ2VyXyA9IG5ldyBMaW5rZXJNYW5hZ2VyKFxuICAgICAgdGhpcy5nZXRBbXBEb2MoKSxcbiAgICAgIHRoaXMuY29uZmlnXyxcbiAgICAgIHRoaXMudHlwZV8sXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICApO1xuICAgIGNvbnN0IGxpbmtlclRhc2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLmxpbmtlck1hbmFnZXJfLmluaXQoKTtcbiAgICB9O1xuICAgIGlmICh0aGlzLmlzSW5hYm94Xykge1xuICAgICAgLy8gQ2h1bmsgaW4gaW5hYm94IGFkIGxlYWRzIHRvIGFjdGl2ZXZpZXcgcmVncmVzc2lvbiwgaGFuZGxlIHNlcGVyYXRlbHlcbiAgICAgIGxpbmtlclRhc2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2h1bmsodGhpcy5lbGVtZW50LCBsaW5rZXJUYXNrLCBDaHVua1ByaW9yaXR5LkxPVyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBldmVudHMgdGhhdCBhcmUgcmVnaXN0ZXJlZCBieSB0aGUgY29uZmlnJ3MgdHJpZ2dlcnMuIFRoaXNcbiAgICogbWV0aG9kIGdlbmVyYXRlcyByZXF1ZXN0cyBhbmQgc2VuZHMgdGhlbSBvdXQuXG4gICAqXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHRyaWdnZXIgSlNPTiBjb25maWcgYmxvY2sgdGhhdCByZXN1bHRlZCBpbiB0aGlzIGV2ZW50LlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fCEuL2V2ZW50cy5BbmFseXRpY3NFdmVudH0gZXZlbnQgT2JqZWN0IHdpdGggZGV0YWlscyBhYm91dCB0aGUgZXZlbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYW5kbGVFdmVudF8odHJpZ2dlciwgZXZlbnQpIHtcbiAgICBjb25zdCBwZXJzaXN0RXZlbnQgPSAhIXRyaWdnZXIuc2Vzc2lvbj8uWydwZXJzaXN0RXZlbnQnXTtcbiAgICBpZiAocGVyc2lzdEV2ZW50KSB7XG4gICAgICB0aGlzLnNlc3Npb25NYW5hZ2VyXz8udXBkYXRlRXZlbnQodGhpcy50eXBlXyk7XG4gICAgfVxuICAgIGNvbnN0IHJlcXVlc3RzID0gaXNBcnJheSh0cmlnZ2VyWydyZXF1ZXN0J10pXG4gICAgICA/IHRyaWdnZXJbJ3JlcXVlc3QnXVxuICAgICAgOiBbdHJpZ2dlclsncmVxdWVzdCddXTtcbiAgICBmb3IgKGxldCByID0gMDsgciA8IHJlcXVlc3RzLmxlbmd0aDsgcisrKSB7XG4gICAgICBjb25zdCByZXF1ZXN0TmFtZSA9IHJlcXVlc3RzW3JdO1xuICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0Rm9yRXZlbnRfKHJlcXVlc3ROYW1lLCB0cmlnZ2VyLCBldmVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyBhIHJlcXVlc3QgZm9yIGFuIGV2ZW50IGNhbGxiYWNrIGFuZCBzZW5kcyBpdCBvdXQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0TmFtZSBUaGUgcmVxdWVzdE5hbWUgdG8gcHJvY2Vzcy5cbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gdHJpZ2dlciBKU09OIGNvbmZpZyBibG9jayB0aGF0IHJlc3VsdGVkIGluIHRoaXMgZXZlbnQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R8IS4vZXZlbnRzLkFuYWx5dGljc0V2ZW50fSBldmVudCBPYmplY3Qgd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGhhbmRsZVJlcXVlc3RGb3JFdmVudF8ocmVxdWVzdE5hbWUsIHRyaWdnZXIsIGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldykge1xuICAgICAgY29uc3QgVEFHID0gdGhpcy5nZXROYW1lXygpO1xuICAgICAgZGV2KCkud2FybihUQUcsICdyZXF1ZXN0IGFnYWluc3QgZGVzdHJveWVkIGVtYmVkOiAnLCB0cmlnZ2VyWydvbiddKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0c19bcmVxdWVzdE5hbWVdO1xuICAgIGNvbnN0IGhhc1Bvc3RNZXNzYWdlID1cbiAgICAgIHRoaXMuYWxsb3dQYXJlbnRQb3N0TWVzc2FnZV8oKSAmJiB0cmlnZ2VyWydwYXJlbnRQb3N0TWVzc2FnZSddO1xuXG4gICAgaWYgKHJlcXVlc3ROYW1lICE9IHVuZGVmaW5lZCAmJiAhcmVxdWVzdCkge1xuICAgICAgY29uc3QgVEFHID0gdGhpcy5nZXROYW1lXygpO1xuICAgICAgdGhpcy51c2VyKCkuZXJyb3IoXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ0lnbm9yaW5nIHJlcXVlc3QgZm9yIGV2ZW50LiBSZXF1ZXN0IHN0cmluZyBub3QgZm91bmQ6ICcsXG4gICAgICAgIHRyaWdnZXJbJ3JlcXVlc3QnXVxuICAgICAgKTtcbiAgICAgIGlmICghaGFzUG9zdE1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNoZWNrVHJpZ2dlckVuYWJsZWRfKHRyaWdnZXIsIGV2ZW50KS50aGVuKChlbmFibGVkKSA9PiB7XG4gICAgICBjb25zdCBpc0Nvbm5lY3RlZCA9XG4gICAgICAgIHRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50ICYmIHRoaXMuZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O1xuICAgICAgaWYgKCFlbmFibGVkIHx8ICFpc0Nvbm5lY3RlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmV4cGFuZEFuZFNlbmRSZXF1ZXN0XyhyZXF1ZXN0LCB0cmlnZ2VyLCBldmVudCk7XG5cbiAgICAgIGNvbnN0IHNob3VsZFNlbmRUb0FtcEFkID1cbiAgICAgICAgdHJpZ2dlclsncGFyZW50UG9zdE1lc3NhZ2UnXSAmJlxuICAgICAgICB0aGlzLmFsbG93UGFyZW50UG9zdE1lc3NhZ2VfKCkgJiZcbiAgICAgICAgaXNJZnJhbWVkKHRoaXMud2luKTtcbiAgICAgIGlmIChzaG91bGRTZW5kVG9BbXBBZCkge1xuICAgICAgICB0aGlzLmV4cGFuZEFuZFBvc3RNZXNzYWdlXyh0cmlnZ2VyLCBldmVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtSZXF1ZXN0SGFuZGxlcn0gcmVxdWVzdCBUaGUgcmVxdWVzdCB0byBwcm9jZXNzLlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSB0cmlnZ2VyIEpTT04gY29uZmlnIGJsb2NrIHRoYXQgcmVzdWx0ZWQgaW4gdGhpcyBldmVudC5cbiAgICogQHBhcmFtIHshSnNvbk9iamVjdHwhLi9ldmVudHMuQW5hbHl0aWNzRXZlbnR9IGV2ZW50IE9iamVjdCB3aXRoIGRldGFpbHMgYWJvdXQgdGhlIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXhwYW5kQW5kU2VuZFJlcXVlc3RfKHJlcXVlc3QsIHRyaWdnZXIsIGV2ZW50KSB7XG4gICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY29uZmlnX1sndmFycyddWydyZXF1ZXN0Q291bnQnXSsrO1xuICAgIGNvbnN0IGV4cGFuc2lvbk9wdGlvbnMgPSB0aGlzLmV4cGFuc2lvbk9wdGlvbnNfKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICByZXF1ZXN0LnNlbmQodGhpcy5jb25maWdfWydleHRyYVVybFBhcmFtcyddLCB0cmlnZ2VyLCBleHBhbnNpb25PcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmQgYW5kIHBvc3QgbWVzc2FnZSB0byBwYXJlbnQgd2luZG93IGlmIGFwcGxpY2FibGUuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHRyaWdnZXIgSlNPTiBjb25maWcgYmxvY2sgdGhhdCByZXN1bHRlZCBpbiB0aGlzIGV2ZW50LlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fCEuL2V2ZW50cy5BbmFseXRpY3NFdmVudH0gZXZlbnQgT2JqZWN0IHdpdGggZGV0YWlscyBhYm91dCB0aGUgZXZlbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBleHBhbmRBbmRQb3N0TWVzc2FnZV8odHJpZ2dlciwgZXZlbnQpIHtcbiAgICBjb25zdCBtc2cgPSB0cmlnZ2VyWydwYXJlbnRQb3N0TWVzc2FnZSddO1xuICAgIGNvbnN0IGV4cGFuc2lvbk9wdGlvbnMgPSB0aGlzLmV4cGFuc2lvbk9wdGlvbnNfKGV2ZW50LCB0cmlnZ2VyKTtcbiAgICBleHBhbmRQb3N0TWVzc2FnZShcbiAgICAgIHRoaXMuZ2V0QW1wRG9jKCksXG4gICAgICBtc2csXG4gICAgICB0aGlzLmNvbmZpZ19bJ2V4dHJhVXJsUGFyYW1zJ10sXG4gICAgICB0cmlnZ2VyLFxuICAgICAgZXhwYW5zaW9uT3B0aW9ucyxcbiAgICAgIHRoaXMuZWxlbWVudFxuICAgICkudGhlbigobWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy53aW4ucGFyZW50Li8qT0sqLyBwb3N0TWVzc2FnZShtZXNzYWdlLCAnKicpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IHRyaWdnZXIgVGhlIGNvbmZpZyB0byB1c2UgdG8gZGV0ZXJtaW5lIHNhbXBsaW5nLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxib29sZWFuPn0gV2hldGhlciB0aGUgcmVxdWVzdCBzaG91bGQgYmUgc2FtcGxlZCBpbiBvclxuICAgKiBub3QgYmFzZWQgb24gc2FtcGxlU3BlYy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzU2FtcGxlZEluXyh0cmlnZ2VyKSB7XG4gICAgLyoqIEBjb25zdCB7IUpzb25PYmplY3R9ICovXG4gICAgY29uc3Qgc3BlYyA9IHRyaWdnZXJbJ3NhbXBsZVNwZWMnXTtcbiAgICBjb25zdCBUQUcgPSB0aGlzLmdldE5hbWVfKCk7XG4gICAgaWYgKCFzcGVjKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgIH1cbiAgICBjb25zdCBzYW1wbGVPbiA9IHNwZWNbJ3NhbXBsZU9uJ107XG4gICAgaWYgKCFzYW1wbGVPbikge1xuICAgICAgdGhpcy51c2VyKCkuZXJyb3IoVEFHLCAnSW52YWxpZCBzYW1wbGVPbiB2YWx1ZS4nKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgfVxuICAgIGNvbnN0IHRocmVzaG9sZCA9IHBhcnNlRmxvYXQoc3BlY1sndGhyZXNob2xkJ10pO1xuICAgIGlmICh0aHJlc2hvbGQgPj0gMCAmJiB0aHJlc2hvbGQgPD0gMTAwKSB7XG4gICAgICBjb25zdCBzYW1wbGVEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgICAgY29uc3Qgc2FtcGxlSW5UYXNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBleHBhbnNpb25PcHRpb25zID0gdGhpcy5leHBhbnNpb25PcHRpb25zXyhkaWN0KHt9KSwgdHJpZ2dlcik7XG4gICAgICAgIGNvbnN0IHNhbXBsZVByb21pc2UgPSB0aGlzLmV4cGFuZFRlbXBsYXRlV2l0aFVybFBhcmFtc18oXG4gICAgICAgICAgc2FtcGxlT24sXG4gICAgICAgICAgZXhwYW5zaW9uT3B0aW9uc1xuICAgICAgICApXG4gICAgICAgICAgLnRoZW4oKGtleSkgPT4gdGhpcy5jcnlwdG9TZXJ2aWNlXy51bmlmb3JtKGtleSkpXG4gICAgICAgICAgLnRoZW4oKGRpZ2VzdCkgPT4gZGlnZXN0ICogMTAwIDwgdGhyZXNob2xkKTtcbiAgICAgICAgc2FtcGxlRGVmZXJyZWQucmVzb2x2ZShzYW1wbGVQcm9taXNlKTtcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5pc0luYWJveF8pIHtcbiAgICAgICAgLy8gQ2h1bmsgaW4gaW5hYm94IGFkIGxlYWRzIHRvIGFjdGl2ZXZpZXcgcmVncmVzc2lvbiwgaGFuZGxlIHNlcGVyYXRlbHlcbiAgICAgICAgc2FtcGxlSW5UYXNrKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaHVuayh0aGlzLmVsZW1lbnQsIHNhbXBsZUluVGFzaywgQ2h1bmtQcmlvcml0eS5MT1cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNhbXBsZURlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIHVzZXIoKS4vKk9LKi8gZXJyb3IoVEFHLCAnSW52YWxpZCB0aHJlc2hvbGQgZm9yIHNhbXBsaW5nLicpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHJlcXVlc3QgZm9yIGEgdHJpZ2dlciBpcyBlbmFibGVkLlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSB0cmlnZ2VyIFRoZSBjb25maWcgdG8gdXNlIHRvIGRldGVybWluZSBpZiB0cmlnZ2VyIGlzXG4gICAqIGVuYWJsZWQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R8IS4vZXZlbnRzLkFuYWx5dGljc0V2ZW50fSBldmVudCBPYmplY3Qgd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBldmVudC5cbiAgICogQHJldHVybiB7IVByb21pc2U8Ym9vbGVhbj59IFdoZXRoZXIgdHJpZ2dlciBtdXN0IGJlIGNhbGxlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNoZWNrVHJpZ2dlckVuYWJsZWRfKHRyaWdnZXIsIGV2ZW50KSB7XG4gICAgY29uc3QgZXhwYW5zaW9uT3B0aW9ucyA9IHRoaXMuZXhwYW5zaW9uT3B0aW9uc18oZXZlbnQsIHRyaWdnZXIpO1xuICAgIGNvbnN0IGVuYWJsZWRPblRhZ0xldmVsID0gdGhpcy5jaGVja1NwZWNFbmFibGVkXyhcbiAgICAgIHRoaXMuY29uZmlnX1snZW5hYmxlZCddLFxuICAgICAgZXhwYW5zaW9uT3B0aW9uc1xuICAgICk7XG4gICAgY29uc3QgZW5hYmxlZE9uVHJpZ2dlckxldmVsID0gdGhpcy5jaGVja1NwZWNFbmFibGVkXyhcbiAgICAgIHRyaWdnZXJbJ2VuYWJsZWQnXSxcbiAgICAgIGV4cGFuc2lvbk9wdGlvbnNcbiAgICApO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFtlbmFibGVkT25UYWdMZXZlbCwgZW5hYmxlZE9uVHJpZ2dlckxldmVsXSkudGhlbihcbiAgICAgIChlbmFibGVkKSA9PiB7XG4gICAgICAgIGRldkFzc2VydChlbmFibGVkLmxlbmd0aCA9PT0gMik7XG4gICAgICAgIHJldHVybiBlbmFibGVkWzBdICYmIGVuYWJsZWRbMV07XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgcmVzdWx0IG9mICdlbmFibGVkJyBzcGVjIGV2YWx1YXRpb24uIFJldHVybnMgZmFsc2UgaWYgc3BlYyBpc1xuICAgKiBwcm92aWRlZCBhbmQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBmYWxzZXkgdmFsdWUgKGVtcHR5IHN0cmluZywgMCwgZmFsc2UsXG4gICAqIG51bGwsIE5hTiBvciB1bmRlZmluZWQpLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xib29sZWFufSBzcGVjIEV4cHJlc3Npb24gdGhhdCB3aWxsIGJlIGV2YWx1YXRlZC5cbiAgICogQHBhcmFtIHshRXhwYW5zaW9uT3B0aW9uc30gZXhwYW5zaW9uT3B0aW9ucyBFeHBhbnNpb24gb3B0aW9ucy5cbiAgICogQHJldHVybiB7IVByb21pc2U8Ym9vbGVhbj59IEZhbHNlIG9ubHkgaWYgc3BlYyBpcyBwcm92aWRlZCBhbmQgdmFsdWUgaXNcbiAgICogZmFsc2V5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY2hlY2tTcGVjRW5hYmxlZF8oc3BlYywgZXhwYW5zaW9uT3B0aW9ucykge1xuICAgIC8vIFNwZWMgYWJzZW5jZSBhbHdheXMgcmVzb2x2ZXMgdG8gdHJ1ZS5cbiAgICBpZiAoc3BlYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygc3BlYyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNwZWMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4cGFuZFRlbXBsYXRlV2l0aFVybFBhcmFtc18oc3BlYywgZXhwYW5zaW9uT3B0aW9ucykudGhlbihcbiAgICAgICh2YWwpID0+IHN0cmluZ1RvQm9vbCh2YWwpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHNwZWMgdXNpbmcgcHJvdmlkZWQgZXhwYW5zaW9uIG9wdGlvbnMgYW5kIGFwcGxpZXMgdXJsIHJlcGxhY2VtZW50XG4gICAqIGlmIG5lY2Vzc2FyeS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNwZWMgRXhwcmVzc2lvbiB0aGF0IG5lZWRzIHRvIGJlIGV4cGFuZGVkLlxuICAgKiBAcGFyYW0geyFFeHBhbnNpb25PcHRpb25zfSBleHBhbnNpb25PcHRpb25zIEV4cGFuc2lvbiBvcHRpb25zLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fSBleHBhbmRlZCBzcGVjLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXhwYW5kVGVtcGxhdGVXaXRoVXJsUGFyYW1zXyhzcGVjLCBleHBhbnNpb25PcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudmFyaWFibGVTZXJ2aWNlX1xuICAgICAgLmV4cGFuZFRlbXBsYXRlKHNwZWMsIGV4cGFuc2lvbk9wdGlvbnMsIHRoaXMuZWxlbWVudClcbiAgICAgIC50aGVuKChrZXkpID0+XG4gICAgICAgIFNlcnZpY2VzLnVybFJlcGxhY2VtZW50c0ZvckRvYyh0aGlzLmVsZW1lbnQpLmV4cGFuZFVybEFzeW5jKFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB0aGlzLnZhcmlhYmxlU2VydmljZV8uZ2V0TWFjcm9zKHRoaXMuZWxlbWVudClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFJldHVybnMgYSBzdHJpbmcgdG8gaWRlbnRpZnkgdGhpcyB0YWcuIE1heSBub3QgYmUgdW5pcXVlXG4gICAqIGlmIHRoZSBlbGVtZW50IGlkIGlzIG5vdCB1bmlxdWUuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXROYW1lXygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgJ0FtcEFuYWx5dGljcyAnICsgKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2lkJykgfHwgJzx1bmtub3duIGlkPicpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fCEuL2V2ZW50cy5BbmFseXRpY3NFdmVudH0gc291cmNlMVxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSBzb3VyY2UyXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2l0ZXJhdGlvbnNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X25vRW5jb2RlXG4gICAqIEByZXR1cm4geyFFeHBhbnNpb25PcHRpb25zfVxuICAgKi9cbiAgZXhwYW5zaW9uT3B0aW9uc18oc291cmNlMSwgc291cmNlMiwgb3B0X2l0ZXJhdGlvbnMsIG9wdF9ub0VuY29kZSkge1xuICAgIGNvbnN0IHZhcnMgPSBkaWN0KCk7XG4gICAgbWVyZ2VPYmplY3RzKHRoaXMuY29uZmlnX1sndmFycyddLCB2YXJzKTtcbiAgICBtZXJnZU9iamVjdHMoc291cmNlMlsndmFycyddLCB2YXJzKTtcbiAgICBtZXJnZU9iamVjdHMoc291cmNlMVsndmFycyddLCB2YXJzKTtcbiAgICByZXR1cm4gbmV3IEV4cGFuc2lvbk9wdGlvbnModmFycywgb3B0X2l0ZXJhdGlvbnMsIG9wdF9ub0VuY29kZSk7XG4gIH1cbn1cblxuQU1QLmV4dGVuc2lvbihUQUcsICcwLjEnLCAoQU1QKSA9PiB7XG4gIC8vIFJlZ2lzdGVyIGRvYy1zZXJ2aWNlIGZhY3RvcnkuXG4gIEFNUC5yZWdpc3RlclNlcnZpY2VGb3JEb2MoXG4gICAgJ2FtcC1hbmFseXRpY3MtaW5zdHJ1bWVudGF0aW9uJyxcbiAgICBJbnN0cnVtZW50YXRpb25TZXJ2aWNlXG4gICk7XG4gIEFNUC5yZWdpc3RlclNlcnZpY2VGb3JEb2MoJ2FjdGl2aXR5JywgQWN0aXZpdHkpO1xuICBpbnN0YWxsTGlua2VyUmVhZGVyU2VydmljZShBTVAud2luKTtcbiAgQU1QLnJlZ2lzdGVyU2VydmljZUZvckRvYygnYW1wLWFuYWx5dGljcy1zZXNzaW9uJywgU2Vzc2lvbk1hbmFnZXIpO1xuICBBTVAucmVnaXN0ZXJTZXJ2aWNlRm9yRG9jKCdhbXAtYW5hbHl0aWNzLXZhcmlhYmxlcycsIFZhcmlhYmxlU2VydmljZSk7XG4gIC8vIFJlZ2lzdGVyIHRoZSBlbGVtZW50LlxuICBBTVAucmVnaXN0ZXJFbGVtZW50KFRBRywgQW1wQW5hbHl0aWNzKTtcbn0pO1xuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/amp-analytics.js