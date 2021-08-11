import { resolvedPromise as _resolvedPromise4 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { VisibilityState } from "../core/constants/visibility-state";
import { Observable } from "../core/data-structures/observable";
import { Deferred, tryResolve } from "../core/data-structures/promise";
import { isIframed } from "../core/dom";
import { duplicateErrorIfNecessary } from "../core/error";
import { stripUserError } from "../core/error/message-helpers";
import { isEnumValue } from "../core/types";
import { findIndex } from "../core/types/array";
import { map } from "../core/types/object";
import { endsWith } from "../core/types/string";
import { parseQueryString } from "../core/types/string/url";
import { Services } from "./";
import { ViewerInterface } from "./viewer-interface";
import { urls } from "../config";
import { reportError } from "../error-reporting";
import { listen } from "../event-helper";
import { dev, devAssert } from "../log";
import { registerServiceBuilderForDoc } from "../service-helpers";
import { getSourceOrigin, isProxyOrigin, parseUrlDeprecated, removeFragment, serializeQueryString } from "../url";
var TAG_ = 'Viewer';

/** @enum {string} */
export var Capability = {
  VIEWER_RENDER_TEMPLATE: 'viewerRenderTemplate'
};

/**
 * Max length for each array of the received message queue.
 * @const @private {number}
 */
var RECEIVED_MESSAGE_QUEUE_MAX_LENGTH = 50;

/**
 * Duration in milliseconds to wait for viewerOrigin to be set before an empty
 * string is returned.
 * @const
 * @private {number}
 */
var VIEWER_ORIGIN_TIMEOUT_ = 1000;

/**
 * Prefixes to remove when trimming a hostname for comparison.
 * @const
 * @private {!RegExp}
 */
var TRIM_ORIGIN_PATTERN_ = /^(https?:\/\/)((www[0-9]*|web|ftp|wap|home|mobile|amp|m)\.)+/i;

/**
 * An AMP representation of the Viewer. This class doesn't do any work itself
 * but instead delegates everything to the actual viewer. This class and the
 * actual Viewer are connected via "AMP.viewer" using three methods:
 * {@link getParam}, {@link receiveMessage} and {@link setMessageDeliverer}.
 * @implements {ViewerInterface}
 * @package Visible for type.
 */
export var ViewerImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function ViewerImpl(ampdoc) {
    var _this = this;

    _classCallCheck(this, ViewerImpl);

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {boolean} */
    this.isIframed_ = isIframed(this.win);

    /** @private {boolean} */
    this.isRuntimeOn_ = true;

    /** @private {boolean} */
    this.overtakeHistory_ = false;

    /** @private {!Object<string, !Observable<!JsonObject>>} */
    this.messageObservables_ = map();

    /** @private {!Object<string, !./viewer-interface.RequestResponderDef>} */
    this.messageResponders_ = map();

    /** @private {!Observable<boolean>} */
    this.runtimeOnObservable_ = new Observable();

    /** @private {!Observable<!JsonObject>} */
    this.broadcastObservable_ = new Observable();

    /**
     * @private {?function(string, (?JsonObject|string|undefined), boolean):
     *     (Promise<*>|undefined)}
     */
    this.messageDeliverer_ = null;

    /** @private {?string} */
    this.messagingOrigin_ = null;

    /**
     * @private {!Array<!{
     *   eventType: string,
     *   data: (?JsonObject|string|undefined),
     *   awaitResponse: boolean,
     *   responsePromise: (Promise<*>|undefined),
     *   responseResolver: function(*)
     * }>}
     */
    this.messageQueue_ = [];

    /**
     * @private {!Object<string, !Array<!{
     *   data: !JsonObject,
     *   deferred: !Deferred
     * }>>}
     */
    this.receivedMessageQueue_ = map();

    /**
     * Subset of this.params_ that only contains parameters in the URL hash,
     * e.g. "#foo=bar".
     * @const @private {!Object<string, string>}
     */
    this.hashParams_ = map();

    if (ampdoc.isSingleDoc()) {
      Object.assign(this.hashParams_, parseQueryString(this.win.location.hash));
    }

    this.isRuntimeOn_ = !parseInt(ampdoc.getParam('off'), 10);
    dev().fine(TAG_, '- runtimeOn:', this.isRuntimeOn_);
    this.overtakeHistory_ = !!(parseInt(ampdoc.getParam('history'), 10) || this.overtakeHistory_);
    dev().fine(TAG_, '- history:', this.overtakeHistory_);
    dev().fine(TAG_, '- visibilityState:', this.ampdoc.getVisibilityState());

    /**
     * Whether the AMP document is embedded in a Chrome Custom Tab.
     * @private {?boolean}
     */
    this.isCctEmbedded_ = null;

    /**
     * Whether the AMP document was served by a proxy.
     * @private @const {boolean}
     */
    this.isProxyOrigin_ = isProxyOrigin(parseUrlDeprecated(this.ampdoc.win.location.href));
    var messagingDeferred = new Deferred();

    /** @const @private {!Function} */
    this.messagingReadyResolver_ = messagingDeferred.resolve;

    /** @const @private {?Promise} */
    this.messagingReadyPromise_ = this.initMessagingChannel_(messagingDeferred.promise);

    /** @private {?Promise<boolean>} */
    this.isTrustedViewer_ = null;

    /** @private {?Promise<string>} */
    this.viewerOrigin_ = null;
    var referrerParam = ampdoc.getParam('referrer');

    /** @private {string} */
    this.unconfirmedReferrerUrl_ = this.isEmbedded() && referrerParam != null && this.isTrustedAncestorOrigins_() !== false ? referrerParam : this.win.document.referrer;

    /** @const @private {!Promise<string>} */
    this.referrerUrl_ = new Promise(function (resolve) {
      if (_this.isEmbedded() && ampdoc.getParam('referrer') != null) {
        // Viewer override, but only for allowlisted viewers. Only allowed for
        // iframed documents.
        _this.isTrustedViewer().then(function (isTrusted) {
          if (isTrusted) {
            resolve(ampdoc.getParam('referrer'));
          } else {
            resolve(_this.win.document.referrer);

            if (_this.unconfirmedReferrerUrl_ != _this.win.document.referrer) {
              dev().expectedError(TAG_, 'Untrusted viewer referrer override: ' + _this.unconfirmedReferrerUrl_ + ' at ' + _this.messagingOrigin_);
              _this.unconfirmedReferrerUrl_ = _this.win.document.referrer;
            }
          }
        });
      } else {
        resolve(_this.win.document.referrer);
      }
    });

    /** @private {string} */
    this.resolvedViewerUrl_ = removeFragment(this.win.location.href || '');

    /** @const @private {!Promise<string>} */
    this.viewerUrl_ = new Promise(function (resolve) {
      /** @const {?string} */
      var viewerUrlOverride = ampdoc.getParam('viewerUrl');

      if (_this.isEmbedded() && viewerUrlOverride) {
        // Viewer override, but only for allowlisted viewers. Only allowed for
        // iframed documents.
        _this.isTrustedViewer().then(function (isTrusted) {
          if (isTrusted) {
            _this.resolvedViewerUrl_ = devAssert(viewerUrlOverride);
          } else {
            dev().expectedError(TAG_, 'Untrusted viewer url override: ' + viewerUrlOverride + ' at ' + _this.messagingOrigin_);
          }

          resolve(_this.resolvedViewerUrl_);
        });
      } else {
        resolve(_this.resolvedViewerUrl_);
      }
    });

    // Remove hash when we have an incoming click tracking string
    // (see impression.js).
    if (this.hashParams_['click']) {
      var newUrl = removeFragment(this.win.location.href);

      if (newUrl != this.win.location.href && this.win.history.replaceState) {
        // Persist the hash that we removed has location.originalHash.
        // This is currently used by mode.js to infer development mode.
        if (!this.win.location['originalHash']) {
          this.win.location['originalHash'] = this.win.location.hash;
        }

        this.win.history.replaceState({}, '', newUrl);
        delete this.hashParams_['click'];
        dev().fine(TAG_, 'replace fragment:' + this.win.location.href);
      }
    }

    // This fragment may get cleared by impression tracking. If so, it will be
    // restored afterward.
    this.ampdoc.whenFirstVisible().then(function () {
      _this.maybeUpdateFragmentForCct();
    });

    if (this.ampdoc.isSingleDoc()) {
      this.visibleOnUserAction_();
    }
  }

  /**
   * Initialize messaging channel with Viewer host.
   * This promise will resolve when communications channel has been
   * established or timeout in 20 seconds. The timeout is needed to avoid
   * this promise becoming a memory leak with accumulating undelivered
   * messages. The promise is only available when the document is embedded.
   *
   * @param {!Promise} messagingPromise
   * @return {?Promise}
   * @private
   */
  _createClass(ViewerImpl, [{
    key: "initMessagingChannel_",
    value: function initMessagingChannel_(messagingPromise) {
      var isEmbedded = !!(this.isIframed_ && !this.win.__AMP_TEST_IFRAME && ( // Checking param "origin", as we expect all viewers to provide it.
      // See https://github.com/ampproject/amphtml/issues/4183
      // There appears to be a bug under investigation where the
      // origin is sometimes failed to be detected. Since failure mode
      // if we fail to initialize communication is very bad, we also check
      // for visibilityState.
      // After https://github.com/ampproject/amphtml/issues/6070
      // is fixed we should probably only keep the amp_js_v check here.
      this.ampdoc.getParam('origin') || this.ampdoc.getParam('visibilityState') || // Parent asked for viewer JS. We must be embedded.
      this.win.location.search.indexOf('amp_js_v') != -1) || this.isWebviewEmbedded() || this.isCctEmbedded() || !this.ampdoc.isSingleDoc());

      if (!isEmbedded) {
        return null;
      }

      var timeoutMessage = 'initMessagingChannel timeout';
      return Services.timerFor(this.win).timeoutPromise(20000, messagingPromise, timeoutMessage).catch(function (reason) {
        var error = getChannelError(
        /** @type {!Error|string|undefined} */
        reason);

        if (error && endsWith(error.message, timeoutMessage)) {
          error = dev().createExpectedError(error);
        }

        reportError(error);
        throw error;
      });
    }
    /** @override */

  }, {
    key: "getAmpDoc",
    value: function getAmpDoc() {
      return this.ampdoc;
    }
    /** @override */

  }, {
    key: "getParam",
    value: function getParam(name) {
      return this.ampdoc.getParam(name);
    }
    /** @override */

  }, {
    key: "hasCapability",
    value: function hasCapability(name) {
      var capabilities = this.ampdoc.getParam('cap');

      if (!capabilities) {
        return false;
      }

      // TODO(@cramforce): Consider caching the split.
      return capabilities.split(',').indexOf(name) != -1;
    }
    /** @override */

  }, {
    key: "isEmbedded",
    value: function isEmbedded() {
      return !!this.messagingReadyPromise_;
    }
    /** @override */

  }, {
    key: "isWebviewEmbedded",
    value: function isWebviewEmbedded() {
      return !this.isIframed_ && this.ampdoc.getParam('webview') == '1';
    }
    /** @override */

  }, {
    key: "isCctEmbedded",
    value: function isCctEmbedded() {
      if (this.isCctEmbedded_ != null) {
        return this.isCctEmbedded_;
      }

      this.isCctEmbedded_ = false;

      if (!this.isIframed_) {
        var queryParams = parseQueryString(this.win.location.search);
        this.isCctEmbedded_ = queryParams['amp_gsa'] === '1' && (queryParams['amp_js_v'] || '').startsWith('a');
      }

      return this.isCctEmbedded_;
    }
    /** @override */

  }, {
    key: "isProxyOrigin",
    value: function isProxyOrigin() {
      return this.isProxyOrigin_;
    }
    /** @override */

  }, {
    key: "maybeUpdateFragmentForCct",
    value: function maybeUpdateFragmentForCct() {
      if (!this.isCctEmbedded()) {
        return;
      }

      // CCT only works with versions of Chrome that support the history API.
      if (!this.win.history.replaceState) {
        return;
      }

      var sourceOrigin = getSourceOrigin(this.win.location.href);

      var _Services$documentInf = Services.documentInfoForDoc(this.ampdoc),
          canonicalUrl = _Services$documentInf.canonicalUrl;

      var canonicalSourceOrigin = getSourceOrigin(canonicalUrl);

      if (this.hasRoughlySameOrigin_(sourceOrigin, canonicalSourceOrigin)) {
        this.hashParams_['ampshare'] = canonicalUrl;
        this.win.history.replaceState({}, '', '#' + serializeQueryString(
        /** @type {!JsonObject} */
        this.hashParams_));
      }
    }
    /**
     * Compares URLs to determine if they match once common subdomains are
     * removed. Everything else must match.
     * @param {string} first Origin to compare.
     * @param {string} second Origin to compare.
     * @return {boolean} Whether the origins match without subdomains.
     * @private
     */

  }, {
    key: "hasRoughlySameOrigin_",
    value: function hasRoughlySameOrigin_(first, second) {
      var trimOrigin = function trimOrigin(origin) {
        if (origin.split('.').length > 2) {
          return origin.replace(TRIM_ORIGIN_PATTERN_, '$1');
        }

        return origin;
      };

      return trimOrigin(first) == trimOrigin(second);
    }
    /** @override */

  }, {
    key: "isRuntimeOn",
    value: function isRuntimeOn() {
      return this.isRuntimeOn_;
    }
    /** @override */

  }, {
    key: "toggleRuntime",
    value: function toggleRuntime() {
      this.isRuntimeOn_ = !this.isRuntimeOn_;
      dev().fine(TAG_, 'Runtime state:', this.isRuntimeOn_);
      this.runtimeOnObservable_.fire(this.isRuntimeOn_);
    }
    /** @override */

  }, {
    key: "onRuntimeState",
    value: function onRuntimeState(handler) {
      return this.runtimeOnObservable_.add(handler);
    }
    /** @override */

  }, {
    key: "isOvertakeHistory",
    value: function isOvertakeHistory() {
      return this.overtakeHistory_;
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "getVisibilityState",
    value: function getVisibilityState() {
      return this.ampdoc.getVisibilityState();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "isVisible",
    value: function isVisible() {
      return this.ampdoc.isVisible();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "hasBeenVisible",
    value: function hasBeenVisible() {
      return this.ampdoc.hasBeenVisible();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "whenFirstVisible",
    value: function whenFirstVisible() {
      return this.ampdoc.whenFirstVisible();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "whenNextVisible",
    value: function whenNextVisible() {
      return this.ampdoc.whenNextVisible();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "getFirstVisibleTime",
    value: function getFirstVisibleTime() {
      return this.ampdoc.getFirstVisibleTime();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "getLastVisibleTime",
    value: function getLastVisibleTime() {
      return this.ampdoc.getLastVisibleTime();
    }
    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */

  }, {
    key: "onVisibilityChanged",
    value: function onVisibilityChanged(handler) {
      return this.ampdoc.onVisibilityChanged(handler);
    }
    /**
     * Sets the viewer defined visibility state.
     * @param {?string|undefined} state
     * @private
     */

  }, {
    key: "setVisibilityState_",
    value: function setVisibilityState_(state) {
      if (!state) {
        return;
      }

      devAssert(isEnumValue(VisibilityState, state));

      // The viewer is informing us we are not currently active because we are
      // being pre-rendered, or the user swiped to another doc (or closed the
      // viewer). Unfortunately, the viewer sends HIDDEN instead of PRERENDER or
      // INACTIVE, though we know better.
      if (state === VisibilityState.HIDDEN) {
        state = this.ampdoc.getLastVisibleTime() != null ? VisibilityState.INACTIVE : VisibilityState.PRERENDER;
      }

      this.ampdoc.overrideVisibilityState(state);
      dev().fine(TAG_, 'visibilitychange event:', this.ampdoc.getVisibilityState());
    }
    /** @override */

  }, {
    key: "getResolvedViewerUrl",
    value: function getResolvedViewerUrl() {
      return this.resolvedViewerUrl_;
    }
    /**
     * Returns the promise that will yield the viewer URL value. It's by default
     * the current page's URL. The trusted viewers are allowed to override this
     * value.
     * @return {!Promise<string>}
     * @visibleForTesting
     */

  }, {
    key: "getViewerUrl",
    value: function getViewerUrl() {
      return this.viewerUrl_;
    }
    /** @override */

  }, {
    key: "maybeGetMessagingOrigin",
    value: function maybeGetMessagingOrigin() {
      return this.messagingOrigin_;
    }
    /** @override */

  }, {
    key: "getUnconfirmedReferrerUrl",
    value: function getUnconfirmedReferrerUrl() {
      return this.unconfirmedReferrerUrl_;
    }
    /** @override */

  }, {
    key: "getReferrerUrl",
    value: function getReferrerUrl() {
      return this.referrerUrl_;
    }
    /** @override */

  }, {
    key: "isTrustedViewer",
    value: function isTrustedViewer() {
      var _this2 = this;

      if (!this.isTrustedViewer_) {
        var isTrustedAncestorOrigins = this.isTrustedAncestorOrigins_();
        this.isTrustedViewer_ = isTrustedAncestorOrigins !== undefined ? Promise.resolve(isTrustedAncestorOrigins) : this.messagingReadyPromise_.then(function (origin) {
          return origin ? _this2.isTrustedViewerOrigin_(origin) : false;
        });
      }

      return (
        /** @type {!Promise<boolean>} */
        this.isTrustedViewer_
      );
    }
    /**
     * Whether the viewer is has been allowlisted for more sensitive operations
     * by looking at the ancestorOrigins.
     * @return {boolean|undefined}
     */

  }, {
    key: "isTrustedAncestorOrigins_",
    value: function isTrustedAncestorOrigins_() {
      if (!this.isEmbedded()) {
        // Not embedded in IFrame - can't trust the viewer.
        return false;
      } else if (this.win.location.ancestorOrigins && !this.isWebviewEmbedded() && !this.isCctEmbedded()) {
        // Ancestors when available take precedence. This is the main API used
        // for this determination. Fallback is only done when this API is not
        // supported by the browser.
        return this.win.location.ancestorOrigins.length > 0 && this.isTrustedViewerOrigin_(this.win.location.ancestorOrigins[0]);
      }
    }
    /** @override */

  }, {
    key: "getViewerOrigin",
    value: function getViewerOrigin() {
      if (!this.viewerOrigin_) {
        var origin;

        if (!this.isEmbedded()) {
          // Viewer is only determined for iframed documents at this time.
          origin = '';
        } else if (this.win.location.ancestorOrigins && this.win.location.ancestorOrigins.length > 0) {
          origin = this.win.location.ancestorOrigins[0];
        }

        this.viewerOrigin_ = origin !== undefined ? Promise.resolve(origin) : Services.timerFor(this.win).timeoutPromise(VIEWER_ORIGIN_TIMEOUT_, this.messagingReadyPromise_).catch(function () {
          return '';
        });
      }

      return (
        /** @type {!Promise<string>} */
        this.viewerOrigin_
      );
    }
    /**
     * @param {string} urlString
     * @return {boolean}
     * @private
     */

  }, {
    key: "isTrustedViewerOrigin_",
    value: function isTrustedViewerOrigin_(urlString) {
      /** @const {!Location} */
      var url = parseUrlDeprecated(urlString);
      var protocol = url.protocol;

      // Mobile WebView x-thread is allowed.
      if (protocol == 'x-thread:') {
        return true;
      }

      if (protocol != 'https:') {
        // Non-https origins are never trusted.
        return false;
      }

      return urls.trustedViewerHosts.some(function (th) {
        return th.test(url.hostname);
      });
    }
    /** @override */

  }, {
    key: "onMessage",
    value: function onMessage(eventType, handler) {
      var observable = this.messageObservables_[eventType];

      if (!observable) {
        observable = new Observable();
        this.messageObservables_[eventType] = observable;
      }

      var unlistenFn = observable.add(handler);

      if (this.receivedMessageQueue_[eventType]) {
        this.receivedMessageQueue_[eventType].forEach(function (message) {
          observable.fire(message.data);
          message.deferred.resolve();
        });
        this.receivedMessageQueue_[eventType] = [];
      }

      return unlistenFn;
    }
    /** @override */

  }, {
    key: "onMessageRespond",
    value: function onMessageRespond(eventType, responder) {
      var _this3 = this;

      this.messageResponders_[eventType] = responder;

      if (this.receivedMessageQueue_[eventType]) {
        this.receivedMessageQueue_[eventType].forEach(function (message) {
          message.deferred.resolve(responder(message.data));
        });
        this.receivedMessageQueue_[eventType] = [];
      }

      return function () {
        if (_this3.messageResponders_[eventType] === responder) {
          delete _this3.messageResponders_[eventType];
        }
      };
    }
    /** @override */

  }, {
    key: "receiveMessage",
    value: function receiveMessage(eventType, data, unusedAwaitResponse) {
      if (eventType == 'visibilitychange') {
        this.setVisibilityState_(data['state']);
        return _resolvedPromise();
      }

      if (eventType == 'broadcast') {
        this.broadcastObservable_.fire(
        /** @type {!JsonObject|undefined} */
        data);
        return _resolvedPromise2();
      }

      var observable = this.messageObservables_[eventType];
      var responder = this.messageResponders_[eventType];

      // Queue the message if there are no handlers. Returns a pending promise to
      // be resolved once a handler/responder is registered.
      if (!observable && !responder) {
        this.receivedMessageQueue_[eventType] = this.receivedMessageQueue_[eventType] || [];

        if (this.receivedMessageQueue_[eventType].length >= RECEIVED_MESSAGE_QUEUE_MAX_LENGTH) {
          return undefined;
        }

        var deferred = new Deferred();
        this.receivedMessageQueue_[eventType].push({
          data: data,
          deferred: deferred
        });
        return deferred.promise;
      }

      if (observable) {
        observable.fire(data);
      }

      if (responder) {
        return responder(data);
      } else if (observable) {
        return _resolvedPromise3();
      }
    }
    /** @override */

  }, {
    key: "setMessageDeliverer",
    value: function setMessageDeliverer(deliverer, origin) {
      var _this4 = this;

      if (this.messageDeliverer_) {
        throw new Error('message channel can only be initialized once');
      }

      if (origin == null) {
        throw new Error('message channel must have an origin');
      }

      dev().fine(TAG_, 'message channel established with origin: ', origin);
      this.messageDeliverer_ = deliverer;
      this.messagingOrigin_ = origin;
      this.messagingReadyResolver_(origin);

      if (this.messageQueue_.length > 0) {
        var queue = this.messageQueue_.slice(0);
        this.messageQueue_ = [];
        queue.forEach(function (message) {
          var responsePromise = _this4.messageDeliverer_(message.eventType, message.data, message.awaitResponse);

          if (message.awaitResponse) {
            message.responseResolver(responsePromise);
          }
        });
      }
    }
    /** @override */

  }, {
    key: "sendMessage",
    value: function sendMessage(eventType, data, cancelUnsent) {
      if (cancelUnsent === void 0) {
        cancelUnsent = false;
      }

      this.sendMessageInternal_(eventType, data, cancelUnsent, false);
    }
    /** @override */

  }, {
    key: "sendMessageAwaitResponse",
    value: function sendMessageAwaitResponse(eventType, data, cancelUnsent) {
      if (cancelUnsent === void 0) {
        cancelUnsent = false;
      }

      return this.sendMessageInternal_(eventType, data, cancelUnsent, true);
    }
    /**
     * Sends the message to the viewer.
     *
     * @param {string} eventType
     * @param {?JsonObject|string|undefined} data
     * @param {boolean} cancelUnsent
     * @param {boolean} awaitResponse
     * @return {!Promise<(?JsonObject|string|undefined)>} the response promise
     */

  }, {
    key: "sendMessageInternal_",
    value: function sendMessageInternal_(eventType, data, cancelUnsent, awaitResponse) {
      var _this5 = this;

      if (this.messageDeliverer_) {
        // Certain message deliverers return fake "Promise" instances called
        // "Thenables". Convert from these values into trusted Promise instances,
        // assimilating with the resolved (or rejected) internal value.
        return (
          /** @type {!Promise<?JsonObject|string|undefined>} */
          tryResolve(function () {
            return _this5.messageDeliverer_(eventType,
            /** @type {?JsonObject|string|undefined} */
            data, awaitResponse);
          })
        );
      }

      if (!this.messagingReadyPromise_) {
        if (awaitResponse) {
          return Promise.reject(getChannelError());
        } else {
          return _resolvedPromise4();
        }
      }

      if (!cancelUnsent) {
        return this.messagingReadyPromise_.then(function () {
          return _this5.messageDeliverer_(eventType, data, awaitResponse);
        });
      }

      var found = findIndex(this.messageQueue_, function (m) {
        return m.eventType == eventType;
      });
      var message;

      if (found != -1) {
        message = this.messageQueue_.splice(found, 1)[0];
        message.data = data;
        message.awaitResponse = message.awaitResponse || awaitResponse;
      } else {
        var deferred = new Deferred();
        var responsePromise = deferred.promise,
            responseResolver = deferred.resolve;
        message = {
          eventType: eventType,
          data: data,
          awaitResponse: awaitResponse,
          responsePromise: responsePromise,
          responseResolver: responseResolver
        };
      }

      this.messageQueue_.push(message);
      return message.responsePromise;
    }
    /** @override */

  }, {
    key: "broadcast",
    value: function broadcast(message) {
      if (!this.messagingReadyPromise_) {
        // Messaging is not expected.
        return Promise.resolve(false);
      }

      return this.sendMessageInternal_('broadcast', message, false, false).then(function () {
        return true;
      }, function () {
        return false;
      });
    }
    /** @override */

  }, {
    key: "onBroadcast",
    value: function onBroadcast(handler) {
      return this.broadcastObservable_.add(handler);
    }
    /** @override */

  }, {
    key: "whenMessagingReady",
    value: function whenMessagingReady() {
      return this.messagingReadyPromise_;
    }
    /** @override */

  }, {
    key: "replaceUrl",
    value: function replaceUrl(newUrl) {
      if (!newUrl || !this.ampdoc.isSingleDoc() || !this.win.history.replaceState) {
        return;
      }

      try {
        // The origin and source origin must match.
        var url = parseUrlDeprecated(this.win.location.href);
        var replaceUrl = parseUrlDeprecated(removeFragment(newUrl) + this.win.location.hash);

        if (url.origin == replaceUrl.origin && getSourceOrigin(url) == getSourceOrigin(replaceUrl)) {
          this.win.history.replaceState({}, '', replaceUrl.href);
          this.win.location['originalHref'] = url.href;
          dev().fine(TAG_, 'replace url:' + replaceUrl.href);
        }
      } catch (e) {
        dev().error(TAG_, 'replaceUrl failed', e);
      }
    }
    /**
     * Defense in-depth against viewer communication issues: Will make the
     * document visible if it receives a user action without having been
     * made visible by the viewer.
     */

  }, {
    key: "visibleOnUserAction_",
    value: function visibleOnUserAction_() {
      var _this6 = this;

      if (this.ampdoc.getVisibilityState() == VisibilityState.VISIBLE) {
        return;
      }

      var unlisten = [];

      var doUnlisten = function doUnlisten() {
        return unlisten.forEach(function (fn) {
          return fn();
        });
      };

      var makeVisible = function makeVisible() {
        _this6.setVisibilityState_(VisibilityState.VISIBLE);

        doUnlisten();
        dev().expectedError(TAG_, 'Received user action in non-visible doc');
      };

      var options = {
        capture: true,
        passive: true
      };
      unlisten.push(listen(this.win, 'keydown', makeVisible, options), listen(this.win, 'touchstart', makeVisible, options), listen(this.win, 'mousedown', makeVisible, options));
      this.whenFirstVisible().then(doUnlisten);
    }
  }]);

  return ViewerImpl;
}();

/**
 * Creates a dev error for the case where a channel cannot be established.
 * @param {*=} opt_reason
 * @return {!Error}
 */
function getChannelError(opt_reason) {
  var channelError;

  if (opt_reason instanceof Error) {
    opt_reason = duplicateErrorIfNecessary(opt_reason);
    opt_reason.message = 'No messaging channel: ' + opt_reason.message;
    channelError = opt_reason;
  } else {
    channelError = new Error('No messaging channel: ' + opt_reason);
  }

  // Force convert user error to dev error
  channelError.message = stripUserError(channelError.message);
  return channelError;
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installViewerServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'viewer', ViewerImpl,
  /* opt_instantiate */
  true);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdlci1pbXBsLmpzIl0sIm5hbWVzIjpbIlZpc2liaWxpdHlTdGF0ZSIsIk9ic2VydmFibGUiLCJEZWZlcnJlZCIsInRyeVJlc29sdmUiLCJpc0lmcmFtZWQiLCJkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5Iiwic3RyaXBVc2VyRXJyb3IiLCJpc0VudW1WYWx1ZSIsImZpbmRJbmRleCIsIm1hcCIsImVuZHNXaXRoIiwicGFyc2VRdWVyeVN0cmluZyIsIlNlcnZpY2VzIiwiVmlld2VySW50ZXJmYWNlIiwidXJscyIsInJlcG9ydEVycm9yIiwibGlzdGVuIiwiZGV2IiwiZGV2QXNzZXJ0IiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsImdldFNvdXJjZU9yaWdpbiIsImlzUHJveHlPcmlnaW4iLCJwYXJzZVVybERlcHJlY2F0ZWQiLCJyZW1vdmVGcmFnbWVudCIsInNlcmlhbGl6ZVF1ZXJ5U3RyaW5nIiwiVEFHXyIsIkNhcGFiaWxpdHkiLCJWSUVXRVJfUkVOREVSX1RFTVBMQVRFIiwiUkVDRUlWRURfTUVTU0FHRV9RVUVVRV9NQVhfTEVOR1RIIiwiVklFV0VSX09SSUdJTl9USU1FT1VUXyIsIlRSSU1fT1JJR0lOX1BBVFRFUk5fIiwiVmlld2VySW1wbCIsImFtcGRvYyIsIndpbiIsImlzSWZyYW1lZF8iLCJpc1J1bnRpbWVPbl8iLCJvdmVydGFrZUhpc3RvcnlfIiwibWVzc2FnZU9ic2VydmFibGVzXyIsIm1lc3NhZ2VSZXNwb25kZXJzXyIsInJ1bnRpbWVPbk9ic2VydmFibGVfIiwiYnJvYWRjYXN0T2JzZXJ2YWJsZV8iLCJtZXNzYWdlRGVsaXZlcmVyXyIsIm1lc3NhZ2luZ09yaWdpbl8iLCJtZXNzYWdlUXVldWVfIiwicmVjZWl2ZWRNZXNzYWdlUXVldWVfIiwiaGFzaFBhcmFtc18iLCJpc1NpbmdsZURvYyIsIk9iamVjdCIsImFzc2lnbiIsImxvY2F0aW9uIiwiaGFzaCIsInBhcnNlSW50IiwiZ2V0UGFyYW0iLCJmaW5lIiwiZ2V0VmlzaWJpbGl0eVN0YXRlIiwiaXNDY3RFbWJlZGRlZF8iLCJpc1Byb3h5T3JpZ2luXyIsImhyZWYiLCJtZXNzYWdpbmdEZWZlcnJlZCIsIm1lc3NhZ2luZ1JlYWR5UmVzb2x2ZXJfIiwicmVzb2x2ZSIsIm1lc3NhZ2luZ1JlYWR5UHJvbWlzZV8iLCJpbml0TWVzc2FnaW5nQ2hhbm5lbF8iLCJwcm9taXNlIiwiaXNUcnVzdGVkVmlld2VyXyIsInZpZXdlck9yaWdpbl8iLCJyZWZlcnJlclBhcmFtIiwidW5jb25maXJtZWRSZWZlcnJlclVybF8iLCJpc0VtYmVkZGVkIiwiaXNUcnVzdGVkQW5jZXN0b3JPcmlnaW5zXyIsImRvY3VtZW50IiwicmVmZXJyZXIiLCJyZWZlcnJlclVybF8iLCJQcm9taXNlIiwiaXNUcnVzdGVkVmlld2VyIiwidGhlbiIsImlzVHJ1c3RlZCIsImV4cGVjdGVkRXJyb3IiLCJyZXNvbHZlZFZpZXdlclVybF8iLCJ2aWV3ZXJVcmxfIiwidmlld2VyVXJsT3ZlcnJpZGUiLCJuZXdVcmwiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwid2hlbkZpcnN0VmlzaWJsZSIsIm1heWJlVXBkYXRlRnJhZ21lbnRGb3JDY3QiLCJ2aXNpYmxlT25Vc2VyQWN0aW9uXyIsIm1lc3NhZ2luZ1Byb21pc2UiLCJfX0FNUF9URVNUX0lGUkFNRSIsInNlYXJjaCIsImluZGV4T2YiLCJpc1dlYnZpZXdFbWJlZGRlZCIsImlzQ2N0RW1iZWRkZWQiLCJ0aW1lb3V0TWVzc2FnZSIsInRpbWVyRm9yIiwidGltZW91dFByb21pc2UiLCJjYXRjaCIsInJlYXNvbiIsImVycm9yIiwiZ2V0Q2hhbm5lbEVycm9yIiwibWVzc2FnZSIsImNyZWF0ZUV4cGVjdGVkRXJyb3IiLCJuYW1lIiwiY2FwYWJpbGl0aWVzIiwic3BsaXQiLCJxdWVyeVBhcmFtcyIsInN0YXJ0c1dpdGgiLCJzb3VyY2VPcmlnaW4iLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJjYW5vbmljYWxVcmwiLCJjYW5vbmljYWxTb3VyY2VPcmlnaW4iLCJoYXNSb3VnaGx5U2FtZU9yaWdpbl8iLCJmaXJzdCIsInNlY29uZCIsInRyaW1PcmlnaW4iLCJvcmlnaW4iLCJsZW5ndGgiLCJyZXBsYWNlIiwiZmlyZSIsImhhbmRsZXIiLCJhZGQiLCJpc1Zpc2libGUiLCJoYXNCZWVuVmlzaWJsZSIsIndoZW5OZXh0VmlzaWJsZSIsImdldEZpcnN0VmlzaWJsZVRpbWUiLCJnZXRMYXN0VmlzaWJsZVRpbWUiLCJvblZpc2liaWxpdHlDaGFuZ2VkIiwic3RhdGUiLCJISURERU4iLCJJTkFDVElWRSIsIlBSRVJFTkRFUiIsIm92ZXJyaWRlVmlzaWJpbGl0eVN0YXRlIiwiaXNUcnVzdGVkQW5jZXN0b3JPcmlnaW5zIiwidW5kZWZpbmVkIiwiaXNUcnVzdGVkVmlld2VyT3JpZ2luXyIsImFuY2VzdG9yT3JpZ2lucyIsInVybFN0cmluZyIsInVybCIsInByb3RvY29sIiwidHJ1c3RlZFZpZXdlckhvc3RzIiwic29tZSIsInRoIiwidGVzdCIsImhvc3RuYW1lIiwiZXZlbnRUeXBlIiwib2JzZXJ2YWJsZSIsInVubGlzdGVuRm4iLCJmb3JFYWNoIiwiZGF0YSIsImRlZmVycmVkIiwicmVzcG9uZGVyIiwidW51c2VkQXdhaXRSZXNwb25zZSIsInNldFZpc2liaWxpdHlTdGF0ZV8iLCJwdXNoIiwiZGVsaXZlcmVyIiwiRXJyb3IiLCJxdWV1ZSIsInNsaWNlIiwicmVzcG9uc2VQcm9taXNlIiwiYXdhaXRSZXNwb25zZSIsInJlc3BvbnNlUmVzb2x2ZXIiLCJjYW5jZWxVbnNlbnQiLCJzZW5kTWVzc2FnZUludGVybmFsXyIsInJlamVjdCIsImZvdW5kIiwibSIsInNwbGljZSIsInJlcGxhY2VVcmwiLCJlIiwiVklTSUJMRSIsInVubGlzdGVuIiwiZG9Vbmxpc3RlbiIsImZuIiwibWFrZVZpc2libGUiLCJvcHRpb25zIiwiY2FwdHVyZSIsInBhc3NpdmUiLCJvcHRfcmVhc29uIiwiY2hhbm5lbEVycm9yIiwiaW5zdGFsbFZpZXdlclNlcnZpY2VGb3JEb2MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsZUFBUjtBQUNBLFNBQVFDLFVBQVI7QUFDQSxTQUFRQyxRQUFSLEVBQWtCQyxVQUFsQjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyx5QkFBUjtBQUNBLFNBQVFDLGNBQVI7QUFDQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLEdBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsZ0JBQVI7QUFFQSxTQUFRQyxRQUFSO0FBRUEsU0FBUUMsZUFBUjtBQUVBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxXQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLEdBQVIsRUFBYUMsU0FBYjtBQUNBLFNBQVFDLDRCQUFSO0FBQ0EsU0FDRUMsZUFERixFQUVFQyxhQUZGLEVBR0VDLGtCQUhGLEVBSUVDLGNBSkYsRUFLRUMsb0JBTEY7QUFRQSxJQUFNQyxJQUFJLEdBQUcsUUFBYjs7QUFFQTtBQUNBLE9BQU8sSUFBTUMsVUFBVSxHQUFHO0FBQ3hCQyxFQUFBQSxzQkFBc0IsRUFBRTtBQURBLENBQW5COztBQUlQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsaUNBQWlDLEdBQUcsRUFBMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsc0JBQXNCLEdBQUcsSUFBL0I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLG9CQUFvQixHQUN4QiwrREFERjs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsVUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLHNCQUFZQyxNQUFaLEVBQW9CO0FBQUE7O0FBQUE7O0FBQ2xCO0FBQ0EsU0FBS0EsTUFBTCxHQUFjQSxNQUFkOztBQUVBO0FBQ0EsU0FBS0MsR0FBTCxHQUFXRCxNQUFNLENBQUNDLEdBQWxCOztBQUVBO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQjlCLFNBQVMsQ0FBQyxLQUFLNkIsR0FBTixDQUEzQjs7QUFFQTtBQUNBLFNBQUtFLFlBQUwsR0FBb0IsSUFBcEI7O0FBRUE7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QixLQUF4Qjs7QUFFQTtBQUNBLFNBQUtDLG1CQUFMLEdBQTJCNUIsR0FBRyxFQUE5Qjs7QUFFQTtBQUNBLFNBQUs2QixrQkFBTCxHQUEwQjdCLEdBQUcsRUFBN0I7O0FBRUE7QUFDQSxTQUFLOEIsb0JBQUwsR0FBNEIsSUFBSXRDLFVBQUosRUFBNUI7O0FBRUE7QUFDQSxTQUFLdUMsb0JBQUwsR0FBNEIsSUFBSXZDLFVBQUosRUFBNUI7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxTQUFLd0MsaUJBQUwsR0FBeUIsSUFBekI7O0FBRUE7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QixJQUF4Qjs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFLQyxhQUFMLEdBQXFCLEVBQXJCOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJLFNBQUtDLHFCQUFMLEdBQTZCbkMsR0FBRyxFQUFoQzs7QUFFQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0ksU0FBS29DLFdBQUwsR0FBbUJwQyxHQUFHLEVBQXRCOztBQUVBLFFBQUl1QixNQUFNLENBQUNjLFdBQVAsRUFBSixFQUEwQjtBQUN4QkMsTUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWMsS0FBS0gsV0FBbkIsRUFBZ0NsQyxnQkFBZ0IsQ0FBQyxLQUFLc0IsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQkMsSUFBbkIsQ0FBaEQ7QUFDRDs7QUFFRCxTQUFLZixZQUFMLEdBQW9CLENBQUNnQixRQUFRLENBQUNuQixNQUFNLENBQUNvQixRQUFQLENBQWdCLEtBQWhCLENBQUQsRUFBeUIsRUFBekIsQ0FBN0I7QUFDQW5DLElBQUFBLEdBQUcsR0FBR29DLElBQU4sQ0FBVzVCLElBQVgsRUFBaUIsY0FBakIsRUFBaUMsS0FBS1UsWUFBdEM7QUFFQSxTQUFLQyxnQkFBTCxHQUF3QixDQUFDLEVBQ3ZCZSxRQUFRLENBQUNuQixNQUFNLENBQUNvQixRQUFQLENBQWdCLFNBQWhCLENBQUQsRUFBNkIsRUFBN0IsQ0FBUixJQUE0QyxLQUFLaEIsZ0JBRDFCLENBQXpCO0FBR0FuQixJQUFBQSxHQUFHLEdBQUdvQyxJQUFOLENBQVc1QixJQUFYLEVBQWlCLFlBQWpCLEVBQStCLEtBQUtXLGdCQUFwQztBQUVBbkIsSUFBQUEsR0FBRyxHQUFHb0MsSUFBTixDQUFXNUIsSUFBWCxFQUFpQixvQkFBakIsRUFBdUMsS0FBS08sTUFBTCxDQUFZc0Isa0JBQVosRUFBdkM7O0FBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDSSxTQUFLQyxjQUFMLEdBQXNCLElBQXRCOztBQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0ksU0FBS0MsY0FBTCxHQUFzQm5DLGFBQWEsQ0FDakNDLGtCQUFrQixDQUFDLEtBQUtVLE1BQUwsQ0FBWUMsR0FBWixDQUFnQmdCLFFBQWhCLENBQXlCUSxJQUExQixDQURlLENBQW5DO0FBSUEsUUFBTUMsaUJBQWlCLEdBQUcsSUFBSXhELFFBQUosRUFBMUI7O0FBQ0E7QUFDQSxTQUFLeUQsdUJBQUwsR0FBK0JELGlCQUFpQixDQUFDRSxPQUFqRDs7QUFDQTtBQUNBLFNBQUtDLHNCQUFMLEdBQThCLEtBQUtDLHFCQUFMLENBQzVCSixpQkFBaUIsQ0FBQ0ssT0FEVSxDQUE5Qjs7QUFJQTtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCLElBQXhCOztBQUVBO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixJQUFyQjtBQUVBLFFBQU1DLGFBQWEsR0FBR2xDLE1BQU0sQ0FBQ29CLFFBQVAsQ0FBZ0IsVUFBaEIsQ0FBdEI7O0FBQ0E7QUFDQSxTQUFLZSx1QkFBTCxHQUNFLEtBQUtDLFVBQUwsTUFDQUYsYUFBYSxJQUFJLElBRGpCLElBRUEsS0FBS0cseUJBQUwsT0FBcUMsS0FGckMsR0FHSUgsYUFISixHQUlJLEtBQUtqQyxHQUFMLENBQVNxQyxRQUFULENBQWtCQyxRQUx4Qjs7QUFPQTtBQUNBLFNBQUtDLFlBQUwsR0FBb0IsSUFBSUMsT0FBSixDQUFZLFVBQUNiLE9BQUQsRUFBYTtBQUMzQyxVQUFJLEtBQUksQ0FBQ1EsVUFBTCxNQUFxQnBDLE1BQU0sQ0FBQ29CLFFBQVAsQ0FBZ0IsVUFBaEIsS0FBK0IsSUFBeEQsRUFBOEQ7QUFDNUQ7QUFDQTtBQUNBLFFBQUEsS0FBSSxDQUFDc0IsZUFBTCxHQUF1QkMsSUFBdkIsQ0FBNEIsVUFBQ0MsU0FBRCxFQUFlO0FBQ3pDLGNBQUlBLFNBQUosRUFBZTtBQUNiaEIsWUFBQUEsT0FBTyxDQUFDNUIsTUFBTSxDQUFDb0IsUUFBUCxDQUFnQixVQUFoQixDQUFELENBQVA7QUFDRCxXQUZELE1BRU87QUFDTFEsWUFBQUEsT0FBTyxDQUFDLEtBQUksQ0FBQzNCLEdBQUwsQ0FBU3FDLFFBQVQsQ0FBa0JDLFFBQW5CLENBQVA7O0FBQ0EsZ0JBQUksS0FBSSxDQUFDSix1QkFBTCxJQUFnQyxLQUFJLENBQUNsQyxHQUFMLENBQVNxQyxRQUFULENBQWtCQyxRQUF0RCxFQUFnRTtBQUM5RHRELGNBQUFBLEdBQUcsR0FBRzRELGFBQU4sQ0FDRXBELElBREYsRUFFRSx5Q0FDRSxLQUFJLENBQUMwQyx1QkFEUCxHQUVFLE1BRkYsR0FHRSxLQUFJLENBQUN6QixnQkFMVDtBQU9BLGNBQUEsS0FBSSxDQUFDeUIsdUJBQUwsR0FBK0IsS0FBSSxDQUFDbEMsR0FBTCxDQUFTcUMsUUFBVCxDQUFrQkMsUUFBakQ7QUFDRDtBQUNGO0FBQ0YsU0FoQkQ7QUFpQkQsT0FwQkQsTUFvQk87QUFDTFgsUUFBQUEsT0FBTyxDQUFDLEtBQUksQ0FBQzNCLEdBQUwsQ0FBU3FDLFFBQVQsQ0FBa0JDLFFBQW5CLENBQVA7QUFDRDtBQUNGLEtBeEJtQixDQUFwQjs7QUEwQkE7QUFDQSxTQUFLTyxrQkFBTCxHQUEwQnZELGNBQWMsQ0FBQyxLQUFLVSxHQUFMLENBQVNnQixRQUFULENBQWtCUSxJQUFsQixJQUEwQixFQUEzQixDQUF4Qzs7QUFFQTtBQUNBLFNBQUtzQixVQUFMLEdBQWtCLElBQUlOLE9BQUosQ0FBWSxVQUFDYixPQUFELEVBQWE7QUFDekM7QUFDQSxVQUFNb0IsaUJBQWlCLEdBQUdoRCxNQUFNLENBQUNvQixRQUFQLENBQWdCLFdBQWhCLENBQTFCOztBQUNBLFVBQUksS0FBSSxDQUFDZ0IsVUFBTCxNQUFxQlksaUJBQXpCLEVBQTRDO0FBQzFDO0FBQ0E7QUFDQSxRQUFBLEtBQUksQ0FBQ04sZUFBTCxHQUF1QkMsSUFBdkIsQ0FBNEIsVUFBQ0MsU0FBRCxFQUFlO0FBQ3pDLGNBQUlBLFNBQUosRUFBZTtBQUNiLFlBQUEsS0FBSSxDQUFDRSxrQkFBTCxHQUEwQjVELFNBQVMsQ0FBQzhELGlCQUFELENBQW5DO0FBQ0QsV0FGRCxNQUVPO0FBQ0wvRCxZQUFBQSxHQUFHLEdBQUc0RCxhQUFOLENBQ0VwRCxJQURGLEVBRUUsb0NBQ0V1RCxpQkFERixHQUVFLE1BRkYsR0FHRSxLQUFJLENBQUN0QyxnQkFMVDtBQU9EOztBQUNEa0IsVUFBQUEsT0FBTyxDQUFDLEtBQUksQ0FBQ2tCLGtCQUFOLENBQVA7QUFDRCxTQWJEO0FBY0QsT0FqQkQsTUFpQk87QUFDTGxCLFFBQUFBLE9BQU8sQ0FBQyxLQUFJLENBQUNrQixrQkFBTixDQUFQO0FBQ0Q7QUFDRixLQXZCaUIsQ0FBbEI7O0FBeUJBO0FBQ0E7QUFDQSxRQUFJLEtBQUtqQyxXQUFMLENBQWlCLE9BQWpCLENBQUosRUFBK0I7QUFDN0IsVUFBTW9DLE1BQU0sR0FBRzFELGNBQWMsQ0FBQyxLQUFLVSxHQUFMLENBQVNnQixRQUFULENBQWtCUSxJQUFuQixDQUE3Qjs7QUFDQSxVQUFJd0IsTUFBTSxJQUFJLEtBQUtoRCxHQUFMLENBQVNnQixRQUFULENBQWtCUSxJQUE1QixJQUFvQyxLQUFLeEIsR0FBTCxDQUFTaUQsT0FBVCxDQUFpQkMsWUFBekQsRUFBdUU7QUFDckU7QUFDQTtBQUNBLFlBQUksQ0FBQyxLQUFLbEQsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQixjQUFsQixDQUFMLEVBQXdDO0FBQ3RDLGVBQUtoQixHQUFMLENBQVNnQixRQUFULENBQWtCLGNBQWxCLElBQW9DLEtBQUtoQixHQUFMLENBQVNnQixRQUFULENBQWtCQyxJQUF0RDtBQUNEOztBQUNELGFBQUtqQixHQUFMLENBQVNpRCxPQUFULENBQWlCQyxZQUFqQixDQUE4QixFQUE5QixFQUFrQyxFQUFsQyxFQUFzQ0YsTUFBdEM7QUFDQSxlQUFPLEtBQUtwQyxXQUFMLENBQWlCLE9BQWpCLENBQVA7QUFDQTVCLFFBQUFBLEdBQUcsR0FBR29DLElBQU4sQ0FBVzVCLElBQVgsRUFBaUIsc0JBQXNCLEtBQUtRLEdBQUwsQ0FBU2dCLFFBQVQsQ0FBa0JRLElBQXpEO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0EsU0FBS3pCLE1BQUwsQ0FBWW9ELGdCQUFaLEdBQStCVCxJQUEvQixDQUFvQyxZQUFNO0FBQ3hDLE1BQUEsS0FBSSxDQUFDVSx5QkFBTDtBQUNELEtBRkQ7O0FBSUEsUUFBSSxLQUFLckQsTUFBTCxDQUFZYyxXQUFaLEVBQUosRUFBK0I7QUFDN0IsV0FBS3dDLG9CQUFMO0FBQ0Q7QUFDRjs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbk5BO0FBQUE7QUFBQSxXQW9ORSwrQkFBc0JDLGdCQUF0QixFQUF3QztBQUN0QyxVQUFNbkIsVUFBVSxHQUFHLENBQUMsRUFDakIsS0FBS2xDLFVBQUwsSUFDQyxDQUFDLEtBQUtELEdBQUwsQ0FBU3VELGlCQURYLE1BRUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNDLFdBQUt4RCxNQUFMLENBQVlvQixRQUFaLENBQXFCLFFBQXJCLEtBQ0MsS0FBS3BCLE1BQUwsQ0FBWW9CLFFBQVosQ0FBcUIsaUJBQXJCLENBREQsSUFFQztBQUNBLFdBQUtuQixHQUFMLENBQVNnQixRQUFULENBQWtCd0MsTUFBbEIsQ0FBeUJDLE9BQXpCLENBQWlDLFVBQWpDLEtBQWdELENBQUMsQ0FicEQsQ0FBRCxJQWNBLEtBQUtDLGlCQUFMLEVBZEEsSUFlQSxLQUFLQyxhQUFMLEVBZkEsSUFnQkEsQ0FBQyxLQUFLNUQsTUFBTCxDQUFZYyxXQUFaLEVBakJpQixDQUFwQjs7QUFvQkEsVUFBSSxDQUFDc0IsVUFBTCxFQUFpQjtBQUNmLGVBQU8sSUFBUDtBQUNEOztBQUNELFVBQU15QixjQUFjLEdBQUcsOEJBQXZCO0FBQ0EsYUFBT2pGLFFBQVEsQ0FBQ2tGLFFBQVQsQ0FBa0IsS0FBSzdELEdBQXZCLEVBQ0o4RCxjQURJLENBQ1csS0FEWCxFQUNrQlIsZ0JBRGxCLEVBQ29DTSxjQURwQyxFQUVKRyxLQUZJLENBRUUsVUFBQ0MsTUFBRCxFQUFZO0FBQ2pCLFlBQUlDLEtBQUssR0FBR0MsZUFBZTtBQUN6QjtBQUF3Q0YsUUFBQUEsTUFEZixDQUEzQjs7QUFHQSxZQUFJQyxLQUFLLElBQUl4RixRQUFRLENBQUN3RixLQUFLLENBQUNFLE9BQVAsRUFBZ0JQLGNBQWhCLENBQXJCLEVBQXNEO0FBQ3BESyxVQUFBQSxLQUFLLEdBQUdqRixHQUFHLEdBQUdvRixtQkFBTixDQUEwQkgsS0FBMUIsQ0FBUjtBQUNEOztBQUNEbkYsUUFBQUEsV0FBVyxDQUFDbUYsS0FBRCxDQUFYO0FBQ0EsY0FBTUEsS0FBTjtBQUNELE9BWEksQ0FBUDtBQVlEO0FBRUQ7O0FBM1BGO0FBQUE7QUFBQSxXQTRQRSxxQkFBWTtBQUNWLGFBQU8sS0FBS2xFLE1BQVo7QUFDRDtBQUVEOztBQWhRRjtBQUFBO0FBQUEsV0FpUUUsa0JBQVNzRSxJQUFULEVBQWU7QUFDYixhQUFPLEtBQUt0RSxNQUFMLENBQVlvQixRQUFaLENBQXFCa0QsSUFBckIsQ0FBUDtBQUNEO0FBRUQ7O0FBclFGO0FBQUE7QUFBQSxXQXNRRSx1QkFBY0EsSUFBZCxFQUFvQjtBQUNsQixVQUFNQyxZQUFZLEdBQUcsS0FBS3ZFLE1BQUwsQ0FBWW9CLFFBQVosQ0FBcUIsS0FBckIsQ0FBckI7O0FBQ0EsVUFBSSxDQUFDbUQsWUFBTCxFQUFtQjtBQUNqQixlQUFPLEtBQVA7QUFDRDs7QUFDRDtBQUNBLGFBQU9BLFlBQVksQ0FBQ0MsS0FBYixDQUFtQixHQUFuQixFQUF3QmQsT0FBeEIsQ0FBZ0NZLElBQWhDLEtBQXlDLENBQUMsQ0FBakQ7QUFDRDtBQUVEOztBQS9RRjtBQUFBO0FBQUEsV0FnUkUsc0JBQWE7QUFDWCxhQUFPLENBQUMsQ0FBQyxLQUFLekMsc0JBQWQ7QUFDRDtBQUVEOztBQXBSRjtBQUFBO0FBQUEsV0FxUkUsNkJBQW9CO0FBQ2xCLGFBQU8sQ0FBQyxLQUFLM0IsVUFBTixJQUFvQixLQUFLRixNQUFMLENBQVlvQixRQUFaLENBQXFCLFNBQXJCLEtBQW1DLEdBQTlEO0FBQ0Q7QUFFRDs7QUF6UkY7QUFBQTtBQUFBLFdBMFJFLHlCQUFnQjtBQUNkLFVBQUksS0FBS0csY0FBTCxJQUF1QixJQUEzQixFQUFpQztBQUMvQixlQUFPLEtBQUtBLGNBQVo7QUFDRDs7QUFDRCxXQUFLQSxjQUFMLEdBQXNCLEtBQXRCOztBQUNBLFVBQUksQ0FBQyxLQUFLckIsVUFBVixFQUFzQjtBQUNwQixZQUFNdUUsV0FBVyxHQUFHOUYsZ0JBQWdCLENBQUMsS0FBS3NCLEdBQUwsQ0FBU2dCLFFBQVQsQ0FBa0J3QyxNQUFuQixDQUFwQztBQUNBLGFBQUtsQyxjQUFMLEdBQ0VrRCxXQUFXLENBQUMsU0FBRCxDQUFYLEtBQTJCLEdBQTNCLElBQ0EsQ0FBQ0EsV0FBVyxDQUFDLFVBQUQsQ0FBWCxJQUEyQixFQUE1QixFQUFnQ0MsVUFBaEMsQ0FBMkMsR0FBM0MsQ0FGRjtBQUdEOztBQUNELGFBQU8sS0FBS25ELGNBQVo7QUFDRDtBQUVEOztBQXhTRjtBQUFBO0FBQUEsV0F5U0UseUJBQWdCO0FBQ2QsYUFBTyxLQUFLQyxjQUFaO0FBQ0Q7QUFFRDs7QUE3U0Y7QUFBQTtBQUFBLFdBOFNFLHFDQUE0QjtBQUMxQixVQUFJLENBQUMsS0FBS29DLGFBQUwsRUFBTCxFQUEyQjtBQUN6QjtBQUNEOztBQUNEO0FBQ0EsVUFBSSxDQUFDLEtBQUszRCxHQUFMLENBQVNpRCxPQUFULENBQWlCQyxZQUF0QixFQUFvQztBQUNsQztBQUNEOztBQUNELFVBQU13QixZQUFZLEdBQUd2RixlQUFlLENBQUMsS0FBS2EsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQlEsSUFBbkIsQ0FBcEM7O0FBQ0Esa0NBQXVCN0MsUUFBUSxDQUFDZ0csa0JBQVQsQ0FBNEIsS0FBSzVFLE1BQWpDLENBQXZCO0FBQUEsVUFBTzZFLFlBQVAseUJBQU9BLFlBQVA7O0FBQ0EsVUFBTUMscUJBQXFCLEdBQUcxRixlQUFlLENBQUN5RixZQUFELENBQTdDOztBQUNBLFVBQUksS0FBS0UscUJBQUwsQ0FBMkJKLFlBQTNCLEVBQXlDRyxxQkFBekMsQ0FBSixFQUFxRTtBQUNuRSxhQUFLakUsV0FBTCxDQUFpQixVQUFqQixJQUErQmdFLFlBQS9CO0FBQ0EsYUFBSzVFLEdBQUwsQ0FBU2lELE9BQVQsQ0FBaUJDLFlBQWpCLENBQ0UsRUFERixFQUVFLEVBRkYsRUFHRSxNQUNFM0Qsb0JBQW9CO0FBQUM7QUFBNEIsYUFBS3FCLFdBQWxDLENBSnhCO0FBTUQ7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBM1VBO0FBQUE7QUFBQSxXQTRVRSwrQkFBc0JtRSxLQUF0QixFQUE2QkMsTUFBN0IsRUFBcUM7QUFDbkMsVUFBTUMsVUFBVSxHQUFHLFNBQWJBLFVBQWEsQ0FBQ0MsTUFBRCxFQUFZO0FBQzdCLFlBQUlBLE1BQU0sQ0FBQ1gsS0FBUCxDQUFhLEdBQWIsRUFBa0JZLE1BQWxCLEdBQTJCLENBQS9CLEVBQWtDO0FBQ2hDLGlCQUFPRCxNQUFNLENBQUNFLE9BQVAsQ0FBZXZGLG9CQUFmLEVBQXFDLElBQXJDLENBQVA7QUFDRDs7QUFDRCxlQUFPcUYsTUFBUDtBQUNELE9BTEQ7O0FBTUEsYUFBT0QsVUFBVSxDQUFDRixLQUFELENBQVYsSUFBcUJFLFVBQVUsQ0FBQ0QsTUFBRCxDQUF0QztBQUNEO0FBRUQ7O0FBdFZGO0FBQUE7QUFBQSxXQXVWRSx1QkFBYztBQUNaLGFBQU8sS0FBSzlFLFlBQVo7QUFDRDtBQUVEOztBQTNWRjtBQUFBO0FBQUEsV0E0VkUseUJBQWdCO0FBQ2QsV0FBS0EsWUFBTCxHQUFvQixDQUFDLEtBQUtBLFlBQTFCO0FBQ0FsQixNQUFBQSxHQUFHLEdBQUdvQyxJQUFOLENBQVc1QixJQUFYLEVBQWlCLGdCQUFqQixFQUFtQyxLQUFLVSxZQUF4QztBQUNBLFdBQUtJLG9CQUFMLENBQTBCK0UsSUFBMUIsQ0FBK0IsS0FBS25GLFlBQXBDO0FBQ0Q7QUFFRDs7QUFsV0Y7QUFBQTtBQUFBLFdBbVdFLHdCQUFlb0YsT0FBZixFQUF3QjtBQUN0QixhQUFPLEtBQUtoRixvQkFBTCxDQUEwQmlGLEdBQTFCLENBQThCRCxPQUE5QixDQUFQO0FBQ0Q7QUFFRDs7QUF2V0Y7QUFBQTtBQUFBLFdBd1dFLDZCQUFvQjtBQUNsQixhQUFPLEtBQUtuRixnQkFBWjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWpYQTtBQUFBO0FBQUEsV0FrWEUsOEJBQXFCO0FBQ25CLGFBQU8sS0FBS0osTUFBTCxDQUFZc0Isa0JBQVosRUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTNYQTtBQUFBO0FBQUEsV0E0WEUscUJBQVk7QUFDVixhQUFPLEtBQUt0QixNQUFMLENBQVl5RixTQUFaLEVBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyWUE7QUFBQTtBQUFBLFdBc1lFLDBCQUFpQjtBQUNmLGFBQU8sS0FBS3pGLE1BQUwsQ0FBWTBGLGNBQVosRUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9ZQTtBQUFBO0FBQUEsV0FnWkUsNEJBQW1CO0FBQ2pCLGFBQU8sS0FBSzFGLE1BQUwsQ0FBWW9ELGdCQUFaLEVBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF6WkE7QUFBQTtBQUFBLFdBMFpFLDJCQUFrQjtBQUNoQixhQUFPLEtBQUtwRCxNQUFMLENBQVkyRixlQUFaLEVBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFuYUE7QUFBQTtBQUFBLFdBb2FFLCtCQUFzQjtBQUNwQixhQUFPLEtBQUszRixNQUFMLENBQVk0RixtQkFBWixFQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBN2FBO0FBQUE7QUFBQSxXQThhRSw4QkFBcUI7QUFDbkIsYUFBTyxLQUFLNUYsTUFBTCxDQUFZNkYsa0JBQVosRUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXZiQTtBQUFBO0FBQUEsV0F3YkUsNkJBQW9CTixPQUFwQixFQUE2QjtBQUMzQixhQUFPLEtBQUt2RixNQUFMLENBQVk4RixtQkFBWixDQUFnQ1AsT0FBaEMsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFoY0E7QUFBQTtBQUFBLFdBaWNFLDZCQUFvQlEsS0FBcEIsRUFBMkI7QUFDekIsVUFBSSxDQUFDQSxLQUFMLEVBQVk7QUFDVjtBQUNEOztBQUVEN0csTUFBQUEsU0FBUyxDQUFDWCxXQUFXLENBQUNQLGVBQUQsRUFBa0IrSCxLQUFsQixDQUFaLENBQVQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFJQSxLQUFLLEtBQUsvSCxlQUFlLENBQUNnSSxNQUE5QixFQUFzQztBQUNwQ0QsUUFBQUEsS0FBSyxHQUNILEtBQUsvRixNQUFMLENBQVk2RixrQkFBWixNQUFvQyxJQUFwQyxHQUNJN0gsZUFBZSxDQUFDaUksUUFEcEIsR0FFSWpJLGVBQWUsQ0FBQ2tJLFNBSHRCO0FBSUQ7O0FBRUQsV0FBS2xHLE1BQUwsQ0FBWW1HLHVCQUFaLENBQW9DSixLQUFwQztBQUNBOUcsTUFBQUEsR0FBRyxHQUFHb0MsSUFBTixDQUNFNUIsSUFERixFQUVFLHlCQUZGLEVBR0UsS0FBS08sTUFBTCxDQUFZc0Isa0JBQVosRUFIRjtBQUtEO0FBRUQ7O0FBM2RGO0FBQUE7QUFBQSxXQTRkRSxnQ0FBdUI7QUFDckIsYUFBTyxLQUFLd0Isa0JBQVo7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXRlQTtBQUFBO0FBQUEsV0F1ZUUsd0JBQWU7QUFDYixhQUFPLEtBQUtDLFVBQVo7QUFDRDtBQUVEOztBQTNlRjtBQUFBO0FBQUEsV0E0ZUUsbUNBQTBCO0FBQ3hCLGFBQU8sS0FBS3JDLGdCQUFaO0FBQ0Q7QUFFRDs7QUFoZkY7QUFBQTtBQUFBLFdBaWZFLHFDQUE0QjtBQUMxQixhQUFPLEtBQUt5Qix1QkFBWjtBQUNEO0FBRUQ7O0FBcmZGO0FBQUE7QUFBQSxXQXNmRSwwQkFBaUI7QUFDZixhQUFPLEtBQUtLLFlBQVo7QUFDRDtBQUVEOztBQTFmRjtBQUFBO0FBQUEsV0EyZkUsMkJBQWtCO0FBQUE7O0FBQ2hCLFVBQUksQ0FBQyxLQUFLUixnQkFBVixFQUE0QjtBQUMxQixZQUFNb0Usd0JBQXdCLEdBQUcsS0FBSy9ELHlCQUFMLEVBQWpDO0FBQ0EsYUFBS0wsZ0JBQUwsR0FDRW9FLHdCQUF3QixLQUFLQyxTQUE3QixHQUNJNUQsT0FBTyxDQUFDYixPQUFSLENBQWdCd0Usd0JBQWhCLENBREosR0FFSSxLQUFLdkUsc0JBQUwsQ0FBNEJjLElBQTVCLENBQWlDLFVBQUN3QyxNQUFELEVBQVk7QUFDM0MsaUJBQU9BLE1BQU0sR0FBRyxNQUFJLENBQUNtQixzQkFBTCxDQUE0Qm5CLE1BQTVCLENBQUgsR0FBeUMsS0FBdEQ7QUFDRCxTQUZELENBSE47QUFNRDs7QUFDRDtBQUFPO0FBQWtDLGFBQUtuRDtBQUE5QztBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUE1Z0JBO0FBQUE7QUFBQSxXQTZnQkUscUNBQTRCO0FBQzFCLFVBQUksQ0FBQyxLQUFLSSxVQUFMLEVBQUwsRUFBd0I7QUFDdEI7QUFDQSxlQUFPLEtBQVA7QUFDRCxPQUhELE1BR08sSUFDTCxLQUFLbkMsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQnNGLGVBQWxCLElBQ0EsQ0FBQyxLQUFLNUMsaUJBQUwsRUFERCxJQUVBLENBQUMsS0FBS0MsYUFBTCxFQUhJLEVBSUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUNFLEtBQUszRCxHQUFMLENBQVNnQixRQUFULENBQWtCc0YsZUFBbEIsQ0FBa0NuQixNQUFsQyxHQUEyQyxDQUEzQyxJQUNBLEtBQUtrQixzQkFBTCxDQUE0QixLQUFLckcsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQnNGLGVBQWxCLENBQWtDLENBQWxDLENBQTVCLENBRkY7QUFJRDtBQUNGO0FBRUQ7O0FBaGlCRjtBQUFBO0FBQUEsV0FpaUJFLDJCQUFrQjtBQUNoQixVQUFJLENBQUMsS0FBS3RFLGFBQVYsRUFBeUI7QUFDdkIsWUFBSWtELE1BQUo7O0FBQ0EsWUFBSSxDQUFDLEtBQUsvQyxVQUFMLEVBQUwsRUFBd0I7QUFDdEI7QUFDQStDLFVBQUFBLE1BQU0sR0FBRyxFQUFUO0FBQ0QsU0FIRCxNQUdPLElBQ0wsS0FBS2xGLEdBQUwsQ0FBU2dCLFFBQVQsQ0FBa0JzRixlQUFsQixJQUNBLEtBQUt0RyxHQUFMLENBQVNnQixRQUFULENBQWtCc0YsZUFBbEIsQ0FBa0NuQixNQUFsQyxHQUEyQyxDQUZ0QyxFQUdMO0FBQ0FELFVBQUFBLE1BQU0sR0FBRyxLQUFLbEYsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQnNGLGVBQWxCLENBQWtDLENBQWxDLENBQVQ7QUFDRDs7QUFDRCxhQUFLdEUsYUFBTCxHQUNFa0QsTUFBTSxLQUFLa0IsU0FBWCxHQUNJNUQsT0FBTyxDQUFDYixPQUFSLENBQWdCdUQsTUFBaEIsQ0FESixHQUVJdkcsUUFBUSxDQUFDa0YsUUFBVCxDQUFrQixLQUFLN0QsR0FBdkIsRUFDRzhELGNBREgsQ0FFSWxFLHNCQUZKLEVBR0ksS0FBS2dDLHNCQUhULEVBS0dtQyxLQUxILENBS1M7QUFBQSxpQkFBTSxFQUFOO0FBQUEsU0FMVCxDQUhOO0FBU0Q7O0FBQ0Q7QUFBTztBQUFpQyxhQUFLL0I7QUFBN0M7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBOWpCQTtBQUFBO0FBQUEsV0ErakJFLGdDQUF1QnVFLFNBQXZCLEVBQWtDO0FBQ2hDO0FBQ0EsVUFBTUMsR0FBRyxHQUFHbkgsa0JBQWtCLENBQUNrSCxTQUFELENBQTlCO0FBQ0EsVUFBT0UsUUFBUCxHQUFtQkQsR0FBbkIsQ0FBT0MsUUFBUDs7QUFDQTtBQUNBLFVBQUlBLFFBQVEsSUFBSSxXQUFoQixFQUE2QjtBQUMzQixlQUFPLElBQVA7QUFDRDs7QUFDRCxVQUFJQSxRQUFRLElBQUksUUFBaEIsRUFBMEI7QUFDeEI7QUFDQSxlQUFPLEtBQVA7QUFDRDs7QUFDRCxhQUFPNUgsSUFBSSxDQUFDNkgsa0JBQUwsQ0FBd0JDLElBQXhCLENBQTZCLFVBQUNDLEVBQUQ7QUFBQSxlQUFRQSxFQUFFLENBQUNDLElBQUgsQ0FBUUwsR0FBRyxDQUFDTSxRQUFaLENBQVI7QUFBQSxPQUE3QixDQUFQO0FBQ0Q7QUFFRDs7QUE5a0JGO0FBQUE7QUFBQSxXQStrQkUsbUJBQVVDLFNBQVYsRUFBcUJ6QixPQUFyQixFQUE4QjtBQUM1QixVQUFJMEIsVUFBVSxHQUFHLEtBQUs1RyxtQkFBTCxDQUF5QjJHLFNBQXpCLENBQWpCOztBQUNBLFVBQUksQ0FBQ0MsVUFBTCxFQUFpQjtBQUNmQSxRQUFBQSxVQUFVLEdBQUcsSUFBSWhKLFVBQUosRUFBYjtBQUNBLGFBQUtvQyxtQkFBTCxDQUF5QjJHLFNBQXpCLElBQXNDQyxVQUF0QztBQUNEOztBQUNELFVBQU1DLFVBQVUsR0FBR0QsVUFBVSxDQUFDekIsR0FBWCxDQUFlRCxPQUFmLENBQW5COztBQUNBLFVBQUksS0FBSzNFLHFCQUFMLENBQTJCb0csU0FBM0IsQ0FBSixFQUEyQztBQUN6QyxhQUFLcEcscUJBQUwsQ0FBMkJvRyxTQUEzQixFQUFzQ0csT0FBdEMsQ0FBOEMsVUFBQy9DLE9BQUQsRUFBYTtBQUN6RDZDLFVBQUFBLFVBQVUsQ0FBQzNCLElBQVgsQ0FBZ0JsQixPQUFPLENBQUNnRCxJQUF4QjtBQUNBaEQsVUFBQUEsT0FBTyxDQUFDaUQsUUFBUixDQUFpQnpGLE9BQWpCO0FBQ0QsU0FIRDtBQUlBLGFBQUtoQixxQkFBTCxDQUEyQm9HLFNBQTNCLElBQXdDLEVBQXhDO0FBQ0Q7O0FBQ0QsYUFBT0UsVUFBUDtBQUNEO0FBRUQ7O0FBaG1CRjtBQUFBO0FBQUEsV0FpbUJFLDBCQUFpQkYsU0FBakIsRUFBNEJNLFNBQTVCLEVBQXVDO0FBQUE7O0FBQ3JDLFdBQUtoSCxrQkFBTCxDQUF3QjBHLFNBQXhCLElBQXFDTSxTQUFyQzs7QUFDQSxVQUFJLEtBQUsxRyxxQkFBTCxDQUEyQm9HLFNBQTNCLENBQUosRUFBMkM7QUFDekMsYUFBS3BHLHFCQUFMLENBQTJCb0csU0FBM0IsRUFBc0NHLE9BQXRDLENBQThDLFVBQUMvQyxPQUFELEVBQWE7QUFDekRBLFVBQUFBLE9BQU8sQ0FBQ2lELFFBQVIsQ0FBaUJ6RixPQUFqQixDQUF5QjBGLFNBQVMsQ0FBQ2xELE9BQU8sQ0FBQ2dELElBQVQsQ0FBbEM7QUFDRCxTQUZEO0FBR0EsYUFBS3hHLHFCQUFMLENBQTJCb0csU0FBM0IsSUFBd0MsRUFBeEM7QUFDRDs7QUFDRCxhQUFPLFlBQU07QUFDWCxZQUFJLE1BQUksQ0FBQzFHLGtCQUFMLENBQXdCMEcsU0FBeEIsTUFBdUNNLFNBQTNDLEVBQXNEO0FBQ3BELGlCQUFPLE1BQUksQ0FBQ2hILGtCQUFMLENBQXdCMEcsU0FBeEIsQ0FBUDtBQUNEO0FBQ0YsT0FKRDtBQUtEO0FBRUQ7O0FBaG5CRjtBQUFBO0FBQUEsV0FpbkJFLHdCQUFlQSxTQUFmLEVBQTBCSSxJQUExQixFQUFnQ0csbUJBQWhDLEVBQXFEO0FBQ25ELFVBQUlQLFNBQVMsSUFBSSxrQkFBakIsRUFBcUM7QUFDbkMsYUFBS1EsbUJBQUwsQ0FBeUJKLElBQUksQ0FBQyxPQUFELENBQTdCO0FBQ0EsZUFBTyxrQkFBUDtBQUNEOztBQUNELFVBQUlKLFNBQVMsSUFBSSxXQUFqQixFQUE4QjtBQUM1QixhQUFLeEcsb0JBQUwsQ0FBMEI4RSxJQUExQjtBQUNFO0FBQXNDOEIsUUFBQUEsSUFEeEM7QUFHQSxlQUFPLG1CQUFQO0FBQ0Q7O0FBQ0QsVUFBTUgsVUFBVSxHQUFHLEtBQUs1RyxtQkFBTCxDQUF5QjJHLFNBQXpCLENBQW5CO0FBQ0EsVUFBTU0sU0FBUyxHQUFHLEtBQUtoSCxrQkFBTCxDQUF3QjBHLFNBQXhCLENBQWxCOztBQUVBO0FBQ0E7QUFDQSxVQUFJLENBQUNDLFVBQUQsSUFBZSxDQUFDSyxTQUFwQixFQUErQjtBQUM3QixhQUFLMUcscUJBQUwsQ0FBMkJvRyxTQUEzQixJQUNFLEtBQUtwRyxxQkFBTCxDQUEyQm9HLFNBQTNCLEtBQXlDLEVBRDNDOztBQUVBLFlBQ0UsS0FBS3BHLHFCQUFMLENBQTJCb0csU0FBM0IsRUFBc0M1QixNQUF0QyxJQUNBeEYsaUNBRkYsRUFHRTtBQUNBLGlCQUFPeUcsU0FBUDtBQUNEOztBQUNELFlBQU1nQixRQUFRLEdBQUcsSUFBSW5KLFFBQUosRUFBakI7QUFDQSxhQUFLMEMscUJBQUwsQ0FBMkJvRyxTQUEzQixFQUFzQ1MsSUFBdEMsQ0FBMkM7QUFBQ0wsVUFBQUEsSUFBSSxFQUFKQSxJQUFEO0FBQU9DLFVBQUFBLFFBQVEsRUFBUkE7QUFBUCxTQUEzQztBQUNBLGVBQU9BLFFBQVEsQ0FBQ3RGLE9BQWhCO0FBQ0Q7O0FBQ0QsVUFBSWtGLFVBQUosRUFBZ0I7QUFDZEEsUUFBQUEsVUFBVSxDQUFDM0IsSUFBWCxDQUFnQjhCLElBQWhCO0FBQ0Q7O0FBQ0QsVUFBSUUsU0FBSixFQUFlO0FBQ2IsZUFBT0EsU0FBUyxDQUFDRixJQUFELENBQWhCO0FBQ0QsT0FGRCxNQUVPLElBQUlILFVBQUosRUFBZ0I7QUFDckIsZUFBTyxtQkFBUDtBQUNEO0FBQ0Y7QUFFRDs7QUF4cEJGO0FBQUE7QUFBQSxXQXlwQkUsNkJBQW9CUyxTQUFwQixFQUErQnZDLE1BQS9CLEVBQXVDO0FBQUE7O0FBQ3JDLFVBQUksS0FBSzFFLGlCQUFULEVBQTRCO0FBQzFCLGNBQU0sSUFBSWtILEtBQUosQ0FBVSw4Q0FBVixDQUFOO0FBQ0Q7O0FBQ0QsVUFBSXhDLE1BQU0sSUFBSSxJQUFkLEVBQW9CO0FBQ2xCLGNBQU0sSUFBSXdDLEtBQUosQ0FBVSxxQ0FBVixDQUFOO0FBQ0Q7O0FBQ0QxSSxNQUFBQSxHQUFHLEdBQUdvQyxJQUFOLENBQVc1QixJQUFYLEVBQWlCLDJDQUFqQixFQUE4RDBGLE1BQTlEO0FBQ0EsV0FBSzFFLGlCQUFMLEdBQXlCaUgsU0FBekI7QUFDQSxXQUFLaEgsZ0JBQUwsR0FBd0J5RSxNQUF4QjtBQUNBLFdBQUt4RCx1QkFBTCxDQUE2QndELE1BQTdCOztBQUVBLFVBQUksS0FBS3hFLGFBQUwsQ0FBbUJ5RSxNQUFuQixHQUE0QixDQUFoQyxFQUFtQztBQUNqQyxZQUFNd0MsS0FBSyxHQUFHLEtBQUtqSCxhQUFMLENBQW1Ca0gsS0FBbkIsQ0FBeUIsQ0FBekIsQ0FBZDtBQUNBLGFBQUtsSCxhQUFMLEdBQXFCLEVBQXJCO0FBQ0FpSCxRQUFBQSxLQUFLLENBQUNULE9BQU4sQ0FBYyxVQUFDL0MsT0FBRCxFQUFhO0FBQ3pCLGNBQU0wRCxlQUFlLEdBQUcsTUFBSSxDQUFDckgsaUJBQUwsQ0FDdEIyRCxPQUFPLENBQUM0QyxTQURjLEVBRXRCNUMsT0FBTyxDQUFDZ0QsSUFGYyxFQUd0QmhELE9BQU8sQ0FBQzJELGFBSGMsQ0FBeEI7O0FBTUEsY0FBSTNELE9BQU8sQ0FBQzJELGFBQVosRUFBMkI7QUFDekIzRCxZQUFBQSxPQUFPLENBQUM0RCxnQkFBUixDQUF5QkYsZUFBekI7QUFDRDtBQUNGLFNBVkQ7QUFXRDtBQUNGO0FBRUQ7O0FBdHJCRjtBQUFBO0FBQUEsV0F1ckJFLHFCQUFZZCxTQUFaLEVBQXVCSSxJQUF2QixFQUE2QmEsWUFBN0IsRUFBbUQ7QUFBQSxVQUF0QkEsWUFBc0I7QUFBdEJBLFFBQUFBLFlBQXNCLEdBQVAsS0FBTztBQUFBOztBQUNqRCxXQUFLQyxvQkFBTCxDQUEwQmxCLFNBQTFCLEVBQXFDSSxJQUFyQyxFQUEyQ2EsWUFBM0MsRUFBeUQsS0FBekQ7QUFDRDtBQUVEOztBQTNyQkY7QUFBQTtBQUFBLFdBNHJCRSxrQ0FBeUJqQixTQUF6QixFQUFvQ0ksSUFBcEMsRUFBMENhLFlBQTFDLEVBQWdFO0FBQUEsVUFBdEJBLFlBQXNCO0FBQXRCQSxRQUFBQSxZQUFzQixHQUFQLEtBQU87QUFBQTs7QUFDOUQsYUFBTyxLQUFLQyxvQkFBTCxDQUEwQmxCLFNBQTFCLEVBQXFDSSxJQUFyQyxFQUEyQ2EsWUFBM0MsRUFBeUQsSUFBekQsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhzQkE7QUFBQTtBQUFBLFdBeXNCRSw4QkFBcUJqQixTQUFyQixFQUFnQ0ksSUFBaEMsRUFBc0NhLFlBQXRDLEVBQW9ERixhQUFwRCxFQUFtRTtBQUFBOztBQUNqRSxVQUFJLEtBQUt0SCxpQkFBVCxFQUE0QjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUFPO0FBQ0x0QyxVQUFBQSxVQUFVLENBQUM7QUFBQSxtQkFDVCxNQUFJLENBQUNzQyxpQkFBTCxDQUNFdUcsU0FERjtBQUVFO0FBQTZDSSxZQUFBQSxJQUYvQyxFQUdFVyxhQUhGLENBRFM7QUFBQSxXQUFEO0FBRFo7QUFTRDs7QUFFRCxVQUFJLENBQUMsS0FBS2xHLHNCQUFWLEVBQWtDO0FBQ2hDLFlBQUlrRyxhQUFKLEVBQW1CO0FBQ2pCLGlCQUFPdEYsT0FBTyxDQUFDMEYsTUFBUixDQUFlaEUsZUFBZSxFQUE5QixDQUFQO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsaUJBQU8sbUJBQVA7QUFDRDtBQUNGOztBQUVELFVBQUksQ0FBQzhELFlBQUwsRUFBbUI7QUFDakIsZUFBTyxLQUFLcEcsc0JBQUwsQ0FBNEJjLElBQTVCLENBQWlDLFlBQU07QUFDNUMsaUJBQU8sTUFBSSxDQUFDbEMsaUJBQUwsQ0FBdUJ1RyxTQUF2QixFQUFrQ0ksSUFBbEMsRUFBd0NXLGFBQXhDLENBQVA7QUFDRCxTQUZNLENBQVA7QUFHRDs7QUFFRCxVQUFNSyxLQUFLLEdBQUc1SixTQUFTLENBQ3JCLEtBQUttQyxhQURnQixFQUVyQixVQUFDMEgsQ0FBRDtBQUFBLGVBQU9BLENBQUMsQ0FBQ3JCLFNBQUYsSUFBZUEsU0FBdEI7QUFBQSxPQUZxQixDQUF2QjtBQUtBLFVBQUk1QyxPQUFKOztBQUNBLFVBQUlnRSxLQUFLLElBQUksQ0FBQyxDQUFkLEVBQWlCO0FBQ2ZoRSxRQUFBQSxPQUFPLEdBQUcsS0FBS3pELGFBQUwsQ0FBbUIySCxNQUFuQixDQUEwQkYsS0FBMUIsRUFBaUMsQ0FBakMsRUFBb0MsQ0FBcEMsQ0FBVjtBQUNBaEUsUUFBQUEsT0FBTyxDQUFDZ0QsSUFBUixHQUFlQSxJQUFmO0FBQ0FoRCxRQUFBQSxPQUFPLENBQUMyRCxhQUFSLEdBQXdCM0QsT0FBTyxDQUFDMkQsYUFBUixJQUF5QkEsYUFBakQ7QUFDRCxPQUpELE1BSU87QUFDTCxZQUFNVixRQUFRLEdBQUcsSUFBSW5KLFFBQUosRUFBakI7QUFDQSxZQUFnQjRKLGVBQWhCLEdBQThEVCxRQUE5RCxDQUFPdEYsT0FBUDtBQUFBLFlBQTBDaUcsZ0JBQTFDLEdBQThEWCxRQUE5RCxDQUFpQ3pGLE9BQWpDO0FBRUF3QyxRQUFBQSxPQUFPLEdBQUc7QUFDUjRDLFVBQUFBLFNBQVMsRUFBVEEsU0FEUTtBQUVSSSxVQUFBQSxJQUFJLEVBQUpBLElBRlE7QUFHUlcsVUFBQUEsYUFBYSxFQUFiQSxhQUhRO0FBSVJELFVBQUFBLGVBQWUsRUFBZkEsZUFKUTtBQUtSRSxVQUFBQSxnQkFBZ0IsRUFBaEJBO0FBTFEsU0FBVjtBQU9EOztBQUNELFdBQUtySCxhQUFMLENBQW1COEcsSUFBbkIsQ0FBd0JyRCxPQUF4QjtBQUNBLGFBQU9BLE9BQU8sQ0FBQzBELGVBQWY7QUFDRDtBQUVEOztBQWp3QkY7QUFBQTtBQUFBLFdBa3dCRSxtQkFBVTFELE9BQVYsRUFBbUI7QUFDakIsVUFBSSxDQUFDLEtBQUt2QyxzQkFBVixFQUFrQztBQUNoQztBQUNBLGVBQU9ZLE9BQU8sQ0FBQ2IsT0FBUixDQUFnQixLQUFoQixDQUFQO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLc0csb0JBQUwsQ0FBMEIsV0FBMUIsRUFBdUM5RCxPQUF2QyxFQUFnRCxLQUFoRCxFQUF1RCxLQUF2RCxFQUE4RHpCLElBQTlELENBQ0w7QUFBQSxlQUFNLElBQU47QUFBQSxPQURLLEVBRUw7QUFBQSxlQUFNLEtBQU47QUFBQSxPQUZLLENBQVA7QUFJRDtBQUVEOztBQTl3QkY7QUFBQTtBQUFBLFdBK3dCRSxxQkFBWTRDLE9BQVosRUFBcUI7QUFDbkIsYUFBTyxLQUFLL0Usb0JBQUwsQ0FBMEJnRixHQUExQixDQUE4QkQsT0FBOUIsQ0FBUDtBQUNEO0FBRUQ7O0FBbnhCRjtBQUFBO0FBQUEsV0FveEJFLDhCQUFxQjtBQUNuQixhQUFPLEtBQUsxRCxzQkFBWjtBQUNEO0FBRUQ7O0FBeHhCRjtBQUFBO0FBQUEsV0F5eEJFLG9CQUFXb0IsTUFBWCxFQUFtQjtBQUNqQixVQUNFLENBQUNBLE1BQUQsSUFDQSxDQUFDLEtBQUtqRCxNQUFMLENBQVljLFdBQVosRUFERCxJQUVBLENBQUMsS0FBS2IsR0FBTCxDQUFTaUQsT0FBVCxDQUFpQkMsWUFIcEIsRUFJRTtBQUNBO0FBQ0Q7O0FBRUQsVUFBSTtBQUNGO0FBQ0EsWUFBTXNELEdBQUcsR0FBR25ILGtCQUFrQixDQUFDLEtBQUtXLEdBQUwsQ0FBU2dCLFFBQVQsQ0FBa0JRLElBQW5CLENBQTlCO0FBQ0EsWUFBTThHLFVBQVUsR0FBR2pKLGtCQUFrQixDQUNuQ0MsY0FBYyxDQUFDMEQsTUFBRCxDQUFkLEdBQXlCLEtBQUtoRCxHQUFMLENBQVNnQixRQUFULENBQWtCQyxJQURSLENBQXJDOztBQUdBLFlBQ0V1RixHQUFHLENBQUN0QixNQUFKLElBQWNvRCxVQUFVLENBQUNwRCxNQUF6QixJQUNBL0YsZUFBZSxDQUFDcUgsR0FBRCxDQUFmLElBQXdCckgsZUFBZSxDQUFDbUosVUFBRCxDQUZ6QyxFQUdFO0FBQ0EsZUFBS3RJLEdBQUwsQ0FBU2lELE9BQVQsQ0FBaUJDLFlBQWpCLENBQThCLEVBQTlCLEVBQWtDLEVBQWxDLEVBQXNDb0YsVUFBVSxDQUFDOUcsSUFBakQ7QUFDQSxlQUFLeEIsR0FBTCxDQUFTZ0IsUUFBVCxDQUFrQixjQUFsQixJQUFvQ3dGLEdBQUcsQ0FBQ2hGLElBQXhDO0FBQ0F4QyxVQUFBQSxHQUFHLEdBQUdvQyxJQUFOLENBQVc1QixJQUFYLEVBQWlCLGlCQUFpQjhJLFVBQVUsQ0FBQzlHLElBQTdDO0FBQ0Q7QUFDRixPQWRELENBY0UsT0FBTytHLENBQVAsRUFBVTtBQUNWdkosUUFBQUEsR0FBRyxHQUFHaUYsS0FBTixDQUFZekUsSUFBWixFQUFrQixtQkFBbEIsRUFBdUMrSSxDQUF2QztBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXp6QkE7QUFBQTtBQUFBLFdBMHpCRSxnQ0FBdUI7QUFBQTs7QUFDckIsVUFBSSxLQUFLeEksTUFBTCxDQUFZc0Isa0JBQVosTUFBb0N0RCxlQUFlLENBQUN5SyxPQUF4RCxFQUFpRTtBQUMvRDtBQUNEOztBQUNELFVBQU1DLFFBQVEsR0FBRyxFQUFqQjs7QUFDQSxVQUFNQyxVQUFVLEdBQUcsU0FBYkEsVUFBYTtBQUFBLGVBQU1ELFFBQVEsQ0FBQ3ZCLE9BQVQsQ0FBaUIsVUFBQ3lCLEVBQUQ7QUFBQSxpQkFBUUEsRUFBRSxFQUFWO0FBQUEsU0FBakIsQ0FBTjtBQUFBLE9BQW5COztBQUNBLFVBQU1DLFdBQVcsR0FBRyxTQUFkQSxXQUFjLEdBQU07QUFDeEIsUUFBQSxNQUFJLENBQUNyQixtQkFBTCxDQUF5QnhKLGVBQWUsQ0FBQ3lLLE9BQXpDOztBQUNBRSxRQUFBQSxVQUFVO0FBQ1YxSixRQUFBQSxHQUFHLEdBQUc0RCxhQUFOLENBQW9CcEQsSUFBcEIsRUFBMEIseUNBQTFCO0FBQ0QsT0FKRDs7QUFLQSxVQUFNcUosT0FBTyxHQUFHO0FBQ2RDLFFBQUFBLE9BQU8sRUFBRSxJQURLO0FBRWRDLFFBQUFBLE9BQU8sRUFBRTtBQUZLLE9BQWhCO0FBSUFOLE1BQUFBLFFBQVEsQ0FBQ2pCLElBQVQsQ0FDRXpJLE1BQU0sQ0FBQyxLQUFLaUIsR0FBTixFQUFXLFNBQVgsRUFBc0I0SSxXQUF0QixFQUFtQ0MsT0FBbkMsQ0FEUixFQUVFOUosTUFBTSxDQUFDLEtBQUtpQixHQUFOLEVBQVcsWUFBWCxFQUF5QjRJLFdBQXpCLEVBQXNDQyxPQUF0QyxDQUZSLEVBR0U5SixNQUFNLENBQUMsS0FBS2lCLEdBQU4sRUFBVyxXQUFYLEVBQXdCNEksV0FBeEIsRUFBcUNDLE9BQXJDLENBSFI7QUFLQSxXQUFLMUYsZ0JBQUwsR0FBd0JULElBQXhCLENBQTZCZ0csVUFBN0I7QUFDRDtBQS8wQkg7O0FBQUE7QUFBQTs7QUFrMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTeEUsZUFBVCxDQUF5QjhFLFVBQXpCLEVBQXFDO0FBQ25DLE1BQUlDLFlBQUo7O0FBQ0EsTUFBSUQsVUFBVSxZQUFZdEIsS0FBMUIsRUFBaUM7QUFDL0JzQixJQUFBQSxVQUFVLEdBQUc1Syx5QkFBeUIsQ0FBQzRLLFVBQUQsQ0FBdEM7QUFDQUEsSUFBQUEsVUFBVSxDQUFDN0UsT0FBWCxHQUFxQiwyQkFBMkI2RSxVQUFVLENBQUM3RSxPQUEzRDtBQUNBOEUsSUFBQUEsWUFBWSxHQUFHRCxVQUFmO0FBQ0QsR0FKRCxNQUlPO0FBQ0xDLElBQUFBLFlBQVksR0FBRyxJQUFJdkIsS0FBSixDQUFVLDJCQUEyQnNCLFVBQXJDLENBQWY7QUFDRDs7QUFDRDtBQUNBQyxFQUFBQSxZQUFZLENBQUM5RSxPQUFiLEdBQXVCOUYsY0FBYyxDQUFDNEssWUFBWSxDQUFDOUUsT0FBZCxDQUFyQztBQUNBLFNBQU84RSxZQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQywwQkFBVCxDQUFvQ25KLE1BQXBDLEVBQTRDO0FBQ2pEYixFQUFBQSw0QkFBNEIsQ0FDMUJhLE1BRDBCLEVBRTFCLFFBRjBCLEVBRzFCRCxVQUgwQjtBQUkxQjtBQUFzQixNQUpJLENBQTVCO0FBTUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtWaXNpYmlsaXR5U3RhdGV9IGZyb20gJyNjb3JlL2NvbnN0YW50cy92aXNpYmlsaXR5LXN0YXRlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL29ic2VydmFibGUnO1xuaW1wb3J0IHtEZWZlcnJlZCwgdHJ5UmVzb2x2ZX0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtpc0lmcmFtZWR9IGZyb20gJyNjb3JlL2RvbSc7XG5pbXBvcnQge2R1cGxpY2F0ZUVycm9ySWZOZWNlc3Nhcnl9IGZyb20gJyNjb3JlL2Vycm9yJztcbmltcG9ydCB7c3RyaXBVc2VyRXJyb3J9IGZyb20gJyNjb3JlL2Vycm9yL21lc3NhZ2UtaGVscGVycyc7XG5pbXBvcnQge2lzRW51bVZhbHVlfSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge2ZpbmRJbmRleH0gZnJvbSAnI2NvcmUvdHlwZXMvYXJyYXknO1xuaW1wb3J0IHttYXB9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge2VuZHNXaXRofSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcnO1xuaW1wb3J0IHtwYXJzZVF1ZXJ5U3RyaW5nfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcvdXJsJztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge1ZpZXdlckludGVyZmFjZX0gZnJvbSAnLi92aWV3ZXItaW50ZXJmYWNlJztcblxuaW1wb3J0IHt1cmxzfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtyZXBvcnRFcnJvcn0gZnJvbSAnLi4vZXJyb3ItcmVwb3J0aW5nJztcbmltcG9ydCB7bGlzdGVufSBmcm9tICcuLi9ldmVudC1oZWxwZXInO1xuaW1wb3J0IHtkZXYsIGRldkFzc2VydH0gZnJvbSAnLi4vbG9nJztcbmltcG9ydCB7cmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvY30gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7XG4gIGdldFNvdXJjZU9yaWdpbixcbiAgaXNQcm94eU9yaWdpbixcbiAgcGFyc2VVcmxEZXByZWNhdGVkLFxuICByZW1vdmVGcmFnbWVudCxcbiAgc2VyaWFsaXplUXVlcnlTdHJpbmcsXG59IGZyb20gJy4uL3VybCc7XG5cbmNvbnN0IFRBR18gPSAnVmlld2VyJztcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgQ2FwYWJpbGl0eSA9IHtcbiAgVklFV0VSX1JFTkRFUl9URU1QTEFURTogJ3ZpZXdlclJlbmRlclRlbXBsYXRlJyxcbn07XG5cbi8qKlxuICogTWF4IGxlbmd0aCBmb3IgZWFjaCBhcnJheSBvZiB0aGUgcmVjZWl2ZWQgbWVzc2FnZSBxdWV1ZS5cbiAqIEBjb25zdCBAcHJpdmF0ZSB7bnVtYmVyfVxuICovXG5jb25zdCBSRUNFSVZFRF9NRVNTQUdFX1FVRVVFX01BWF9MRU5HVEggPSA1MDtcblxuLyoqXG4gKiBEdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgdG8gd2FpdCBmb3Igdmlld2VyT3JpZ2luIHRvIGJlIHNldCBiZWZvcmUgYW4gZW1wdHlcbiAqIHN0cmluZyBpcyByZXR1cm5lZC5cbiAqIEBjb25zdFxuICogQHByaXZhdGUge251bWJlcn1cbiAqL1xuY29uc3QgVklFV0VSX09SSUdJTl9USU1FT1VUXyA9IDEwMDA7XG5cbi8qKlxuICogUHJlZml4ZXMgdG8gcmVtb3ZlIHdoZW4gdHJpbW1pbmcgYSBob3N0bmFtZSBmb3IgY29tcGFyaXNvbi5cbiAqIEBjb25zdFxuICogQHByaXZhdGUgeyFSZWdFeHB9XG4gKi9cbmNvbnN0IFRSSU1fT1JJR0lOX1BBVFRFUk5fID1cbiAgL14oaHR0cHM/OlxcL1xcLykoKHd3d1swLTldKnx3ZWJ8ZnRwfHdhcHxob21lfG1vYmlsZXxhbXB8bSlcXC4pKy9pO1xuXG4vKipcbiAqIEFuIEFNUCByZXByZXNlbnRhdGlvbiBvZiB0aGUgVmlld2VyLiBUaGlzIGNsYXNzIGRvZXNuJ3QgZG8gYW55IHdvcmsgaXRzZWxmXG4gKiBidXQgaW5zdGVhZCBkZWxlZ2F0ZXMgZXZlcnl0aGluZyB0byB0aGUgYWN0dWFsIHZpZXdlci4gVGhpcyBjbGFzcyBhbmQgdGhlXG4gKiBhY3R1YWwgVmlld2VyIGFyZSBjb25uZWN0ZWQgdmlhIFwiQU1QLnZpZXdlclwiIHVzaW5nIHRocmVlIG1ldGhvZHM6XG4gKiB7QGxpbmsgZ2V0UGFyYW19LCB7QGxpbmsgcmVjZWl2ZU1lc3NhZ2V9IGFuZCB7QGxpbmsgc2V0TWVzc2FnZURlbGl2ZXJlcn0uXG4gKiBAaW1wbGVtZW50cyB7Vmlld2VySW50ZXJmYWNlfVxuICogQHBhY2thZ2UgVmlzaWJsZSBmb3IgdHlwZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFZpZXdlckltcGwge1xuICAvKipcbiAgICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jKSB7XG4gICAgLyoqIEBjb25zdCB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jID0gYW1wZG9jO1xuXG4gICAgLyoqIEBjb25zdCB7IVdpbmRvd30gKi9cbiAgICB0aGlzLndpbiA9IGFtcGRvYy53aW47XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHtib29sZWFufSAqL1xuICAgIHRoaXMuaXNJZnJhbWVkXyA9IGlzSWZyYW1lZCh0aGlzLndpbik7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1J1bnRpbWVPbl8gPSB0cnVlO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMub3ZlcnRha2VIaXN0b3J5XyA9IGZhbHNlO1xuXG4gICAgLyoqIEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgIU9ic2VydmFibGU8IUpzb25PYmplY3Q+Pn0gKi9cbiAgICB0aGlzLm1lc3NhZ2VPYnNlcnZhYmxlc18gPSBtYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsICEuL3ZpZXdlci1pbnRlcmZhY2UuUmVxdWVzdFJlc3BvbmRlckRlZj59ICovXG4gICAgdGhpcy5tZXNzYWdlUmVzcG9uZGVyc18gPSBtYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9ic2VydmFibGU8Ym9vbGVhbj59ICovXG4gICAgdGhpcy5ydW50aW1lT25PYnNlcnZhYmxlXyA9IG5ldyBPYnNlcnZhYmxlKCk7XG5cbiAgICAvKiogQHByaXZhdGUgeyFPYnNlcnZhYmxlPCFKc29uT2JqZWN0Pn0gKi9cbiAgICB0aGlzLmJyb2FkY2FzdE9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHs/ZnVuY3Rpb24oc3RyaW5nLCAoP0pzb25PYmplY3R8c3RyaW5nfHVuZGVmaW5lZCksIGJvb2xlYW4pOlxuICAgICAqICAgICAoUHJvbWlzZTwqPnx1bmRlZmluZWQpfVxuICAgICAqL1xuICAgIHRoaXMubWVzc2FnZURlbGl2ZXJlcl8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXMubWVzc2FnaW5nT3JpZ2luXyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZSB7IUFycmF5PCF7XG4gICAgICogICBldmVudFR5cGU6IHN0cmluZyxcbiAgICAgKiAgIGRhdGE6ICg/SnNvbk9iamVjdHxzdHJpbmd8dW5kZWZpbmVkKSxcbiAgICAgKiAgIGF3YWl0UmVzcG9uc2U6IGJvb2xlYW4sXG4gICAgICogICByZXNwb25zZVByb21pc2U6IChQcm9taXNlPCo+fHVuZGVmaW5lZCksXG4gICAgICogICByZXNwb25zZVJlc29sdmVyOiBmdW5jdGlvbigqKVxuICAgICAqIH0+fVxuICAgICAqL1xuICAgIHRoaXMubWVzc2FnZVF1ZXVlXyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhQXJyYXk8IXtcbiAgICAgKiAgIGRhdGE6ICFKc29uT2JqZWN0LFxuICAgICAqICAgZGVmZXJyZWQ6ICFEZWZlcnJlZFxuICAgICAqIH0+Pn1cbiAgICAgKi9cbiAgICB0aGlzLnJlY2VpdmVkTWVzc2FnZVF1ZXVlXyA9IG1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogU3Vic2V0IG9mIHRoaXMucGFyYW1zXyB0aGF0IG9ubHkgY29udGFpbnMgcGFyYW1ldGVycyBpbiB0aGUgVVJMIGhhc2gsXG4gICAgICogZS5nLiBcIiNmb289YmFyXCIuXG4gICAgICogQGNvbnN0IEBwcml2YXRlIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAgICAgKi9cbiAgICB0aGlzLmhhc2hQYXJhbXNfID0gbWFwKCk7XG5cbiAgICBpZiAoYW1wZG9jLmlzU2luZ2xlRG9jKCkpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5oYXNoUGFyYW1zXywgcGFyc2VRdWVyeVN0cmluZyh0aGlzLndpbi5sb2NhdGlvbi5oYXNoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5pc1J1bnRpbWVPbl8gPSAhcGFyc2VJbnQoYW1wZG9jLmdldFBhcmFtKCdvZmYnKSwgMTApO1xuICAgIGRldigpLmZpbmUoVEFHXywgJy0gcnVudGltZU9uOicsIHRoaXMuaXNSdW50aW1lT25fKTtcblxuICAgIHRoaXMub3ZlcnRha2VIaXN0b3J5XyA9ICEhKFxuICAgICAgcGFyc2VJbnQoYW1wZG9jLmdldFBhcmFtKCdoaXN0b3J5JyksIDEwKSB8fCB0aGlzLm92ZXJ0YWtlSGlzdG9yeV9cbiAgICApO1xuICAgIGRldigpLmZpbmUoVEFHXywgJy0gaGlzdG9yeTonLCB0aGlzLm92ZXJ0YWtlSGlzdG9yeV8pO1xuXG4gICAgZGV2KCkuZmluZShUQUdfLCAnLSB2aXNpYmlsaXR5U3RhdGU6JywgdGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCkpO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgQU1QIGRvY3VtZW50IGlzIGVtYmVkZGVkIGluIGEgQ2hyb21lIEN1c3RvbSBUYWIuXG4gICAgICogQHByaXZhdGUgez9ib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuaXNDY3RFbWJlZGRlZF8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgQU1QIGRvY3VtZW50IHdhcyBzZXJ2ZWQgYnkgYSBwcm94eS5cbiAgICAgKiBAcHJpdmF0ZSBAY29uc3Qge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc1Byb3h5T3JpZ2luXyA9IGlzUHJveHlPcmlnaW4oXG4gICAgICBwYXJzZVVybERlcHJlY2F0ZWQodGhpcy5hbXBkb2Mud2luLmxvY2F0aW9uLmhyZWYpXG4gICAgKTtcblxuICAgIGNvbnN0IG1lc3NhZ2luZ0RlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IUZ1bmN0aW9ufSAqL1xuICAgIHRoaXMubWVzc2FnaW5nUmVhZHlSZXNvbHZlcl8gPSBtZXNzYWdpbmdEZWZlcnJlZC5yZXNvbHZlO1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgez9Qcm9taXNlfSAqL1xuICAgIHRoaXMubWVzc2FnaW5nUmVhZHlQcm9taXNlXyA9IHRoaXMuaW5pdE1lc3NhZ2luZ0NoYW5uZWxfKFxuICAgICAgbWVzc2FnaW5nRGVmZXJyZWQucHJvbWlzZVxuICAgICk7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPGJvb2xlYW4+fSAqL1xuICAgIHRoaXMuaXNUcnVzdGVkVmlld2VyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPHN0cmluZz59ICovXG4gICAgdGhpcy52aWV3ZXJPcmlnaW5fID0gbnVsbDtcblxuICAgIGNvbnN0IHJlZmVycmVyUGFyYW0gPSBhbXBkb2MuZ2V0UGFyYW0oJ3JlZmVycmVyJyk7XG4gICAgLyoqIEBwcml2YXRlIHtzdHJpbmd9ICovXG4gICAgdGhpcy51bmNvbmZpcm1lZFJlZmVycmVyVXJsXyA9XG4gICAgICB0aGlzLmlzRW1iZWRkZWQoKSAmJlxuICAgICAgcmVmZXJyZXJQYXJhbSAhPSBudWxsICYmXG4gICAgICB0aGlzLmlzVHJ1c3RlZEFuY2VzdG9yT3JpZ2luc18oKSAhPT0gZmFsc2VcbiAgICAgICAgPyByZWZlcnJlclBhcmFtXG4gICAgICAgIDogdGhpcy53aW4uZG9jdW1lbnQucmVmZXJyZXI7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshUHJvbWlzZTxzdHJpbmc+fSAqL1xuICAgIHRoaXMucmVmZXJyZXJVcmxfID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzRW1iZWRkZWQoKSAmJiBhbXBkb2MuZ2V0UGFyYW0oJ3JlZmVycmVyJykgIT0gbnVsbCkge1xuICAgICAgICAvLyBWaWV3ZXIgb3ZlcnJpZGUsIGJ1dCBvbmx5IGZvciBhbGxvd2xpc3RlZCB2aWV3ZXJzLiBPbmx5IGFsbG93ZWQgZm9yXG4gICAgICAgIC8vIGlmcmFtZWQgZG9jdW1lbnRzLlxuICAgICAgICB0aGlzLmlzVHJ1c3RlZFZpZXdlcigpLnRoZW4oKGlzVHJ1c3RlZCkgPT4ge1xuICAgICAgICAgIGlmIChpc1RydXN0ZWQpIHtcbiAgICAgICAgICAgIHJlc29sdmUoYW1wZG9jLmdldFBhcmFtKCdyZWZlcnJlcicpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLndpbi5kb2N1bWVudC5yZWZlcnJlcik7XG4gICAgICAgICAgICBpZiAodGhpcy51bmNvbmZpcm1lZFJlZmVycmVyVXJsXyAhPSB0aGlzLndpbi5kb2N1bWVudC5yZWZlcnJlcikge1xuICAgICAgICAgICAgICBkZXYoKS5leHBlY3RlZEVycm9yKFxuICAgICAgICAgICAgICAgIFRBR18sXG4gICAgICAgICAgICAgICAgJ1VudHJ1c3RlZCB2aWV3ZXIgcmVmZXJyZXIgb3ZlcnJpZGU6ICcgK1xuICAgICAgICAgICAgICAgICAgdGhpcy51bmNvbmZpcm1lZFJlZmVycmVyVXJsXyArXG4gICAgICAgICAgICAgICAgICAnIGF0ICcgK1xuICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmdPcmlnaW5fXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHRoaXMudW5jb25maXJtZWRSZWZlcnJlclVybF8gPSB0aGlzLndpbi5kb2N1bWVudC5yZWZlcnJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLndpbi5kb2N1bWVudC5yZWZlcnJlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiogQHByaXZhdGUge3N0cmluZ30gKi9cbiAgICB0aGlzLnJlc29sdmVkVmlld2VyVXJsXyA9IHJlbW92ZUZyYWdtZW50KHRoaXMud2luLmxvY2F0aW9uLmhyZWYgfHwgJycpO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IVByb21pc2U8c3RyaW5nPn0gKi9cbiAgICB0aGlzLnZpZXdlclVybF8gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgLyoqIEBjb25zdCB7P3N0cmluZ30gKi9cbiAgICAgIGNvbnN0IHZpZXdlclVybE92ZXJyaWRlID0gYW1wZG9jLmdldFBhcmFtKCd2aWV3ZXJVcmwnKTtcbiAgICAgIGlmICh0aGlzLmlzRW1iZWRkZWQoKSAmJiB2aWV3ZXJVcmxPdmVycmlkZSkge1xuICAgICAgICAvLyBWaWV3ZXIgb3ZlcnJpZGUsIGJ1dCBvbmx5IGZvciBhbGxvd2xpc3RlZCB2aWV3ZXJzLiBPbmx5IGFsbG93ZWQgZm9yXG4gICAgICAgIC8vIGlmcmFtZWQgZG9jdW1lbnRzLlxuICAgICAgICB0aGlzLmlzVHJ1c3RlZFZpZXdlcigpLnRoZW4oKGlzVHJ1c3RlZCkgPT4ge1xuICAgICAgICAgIGlmIChpc1RydXN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZWRWaWV3ZXJVcmxfID0gZGV2QXNzZXJ0KHZpZXdlclVybE92ZXJyaWRlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGV2KCkuZXhwZWN0ZWRFcnJvcihcbiAgICAgICAgICAgICAgVEFHXyxcbiAgICAgICAgICAgICAgJ1VudHJ1c3RlZCB2aWV3ZXIgdXJsIG92ZXJyaWRlOiAnICtcbiAgICAgICAgICAgICAgICB2aWV3ZXJVcmxPdmVycmlkZSArXG4gICAgICAgICAgICAgICAgJyBhdCAnICtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2luZ09yaWdpbl9cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNvbHZlZFZpZXdlclVybF8pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUodGhpcy5yZXNvbHZlZFZpZXdlclVybF8pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIGhhc2ggd2hlbiB3ZSBoYXZlIGFuIGluY29taW5nIGNsaWNrIHRyYWNraW5nIHN0cmluZ1xuICAgIC8vIChzZWUgaW1wcmVzc2lvbi5qcykuXG4gICAgaWYgKHRoaXMuaGFzaFBhcmFtc19bJ2NsaWNrJ10pIHtcbiAgICAgIGNvbnN0IG5ld1VybCA9IHJlbW92ZUZyYWdtZW50KHRoaXMud2luLmxvY2F0aW9uLmhyZWYpO1xuICAgICAgaWYgKG5ld1VybCAhPSB0aGlzLndpbi5sb2NhdGlvbi5ocmVmICYmIHRoaXMud2luLmhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICAgIC8vIFBlcnNpc3QgdGhlIGhhc2ggdGhhdCB3ZSByZW1vdmVkIGhhcyBsb2NhdGlvbi5vcmlnaW5hbEhhc2guXG4gICAgICAgIC8vIFRoaXMgaXMgY3VycmVudGx5IHVzZWQgYnkgbW9kZS5qcyB0byBpbmZlciBkZXZlbG9wbWVudCBtb2RlLlxuICAgICAgICBpZiAoIXRoaXMud2luLmxvY2F0aW9uWydvcmlnaW5hbEhhc2gnXSkge1xuICAgICAgICAgIHRoaXMud2luLmxvY2F0aW9uWydvcmlnaW5hbEhhc2gnXSA9IHRoaXMud2luLmxvY2F0aW9uLmhhc2g7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53aW4uaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBuZXdVcmwpO1xuICAgICAgICBkZWxldGUgdGhpcy5oYXNoUGFyYW1zX1snY2xpY2snXTtcbiAgICAgICAgZGV2KCkuZmluZShUQUdfLCAncmVwbGFjZSBmcmFnbWVudDonICsgdGhpcy53aW4ubG9jYXRpb24uaHJlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmcmFnbWVudCBtYXkgZ2V0IGNsZWFyZWQgYnkgaW1wcmVzc2lvbiB0cmFja2luZy4gSWYgc28sIGl0IHdpbGwgYmVcbiAgICAvLyByZXN0b3JlZCBhZnRlcndhcmQuXG4gICAgdGhpcy5hbXBkb2Mud2hlbkZpcnN0VmlzaWJsZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5tYXliZVVwZGF0ZUZyYWdtZW50Rm9yQ2N0KCk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5hbXBkb2MuaXNTaW5nbGVEb2MoKSkge1xuICAgICAgdGhpcy52aXNpYmxlT25Vc2VyQWN0aW9uXygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIG1lc3NhZ2luZyBjaGFubmVsIHdpdGggVmlld2VyIGhvc3QuXG4gICAqIFRoaXMgcHJvbWlzZSB3aWxsIHJlc29sdmUgd2hlbiBjb21tdW5pY2F0aW9ucyBjaGFubmVsIGhhcyBiZWVuXG4gICAqIGVzdGFibGlzaGVkIG9yIHRpbWVvdXQgaW4gMjAgc2Vjb25kcy4gVGhlIHRpbWVvdXQgaXMgbmVlZGVkIHRvIGF2b2lkXG4gICAqIHRoaXMgcHJvbWlzZSBiZWNvbWluZyBhIG1lbW9yeSBsZWFrIHdpdGggYWNjdW11bGF0aW5nIHVuZGVsaXZlcmVkXG4gICAqIG1lc3NhZ2VzLiBUaGUgcHJvbWlzZSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHRoZSBkb2N1bWVudCBpcyBlbWJlZGRlZC5cbiAgICpcbiAgICogQHBhcmFtIHshUHJvbWlzZX0gbWVzc2FnaW5nUHJvbWlzZVxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGluaXRNZXNzYWdpbmdDaGFubmVsXyhtZXNzYWdpbmdQcm9taXNlKSB7XG4gICAgY29uc3QgaXNFbWJlZGRlZCA9ICEhKFxuICAgICAgKHRoaXMuaXNJZnJhbWVkXyAmJlxuICAgICAgICAhdGhpcy53aW4uX19BTVBfVEVTVF9JRlJBTUUgJiZcbiAgICAgICAgLy8gQ2hlY2tpbmcgcGFyYW0gXCJvcmlnaW5cIiwgYXMgd2UgZXhwZWN0IGFsbCB2aWV3ZXJzIHRvIHByb3ZpZGUgaXQuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy80MTgzXG4gICAgICAgIC8vIFRoZXJlIGFwcGVhcnMgdG8gYmUgYSBidWcgdW5kZXIgaW52ZXN0aWdhdGlvbiB3aGVyZSB0aGVcbiAgICAgICAgLy8gb3JpZ2luIGlzIHNvbWV0aW1lcyBmYWlsZWQgdG8gYmUgZGV0ZWN0ZWQuIFNpbmNlIGZhaWx1cmUgbW9kZVxuICAgICAgICAvLyBpZiB3ZSBmYWlsIHRvIGluaXRpYWxpemUgY29tbXVuaWNhdGlvbiBpcyB2ZXJ5IGJhZCwgd2UgYWxzbyBjaGVja1xuICAgICAgICAvLyBmb3IgdmlzaWJpbGl0eVN0YXRlLlxuICAgICAgICAvLyBBZnRlciBodHRwczovL2dpdGh1Yi5jb20vYW1wcHJvamVjdC9hbXBodG1sL2lzc3Vlcy82MDcwXG4gICAgICAgIC8vIGlzIGZpeGVkIHdlIHNob3VsZCBwcm9iYWJseSBvbmx5IGtlZXAgdGhlIGFtcF9qc192IGNoZWNrIGhlcmUuXG4gICAgICAgICh0aGlzLmFtcGRvYy5nZXRQYXJhbSgnb3JpZ2luJykgfHxcbiAgICAgICAgICB0aGlzLmFtcGRvYy5nZXRQYXJhbSgndmlzaWJpbGl0eVN0YXRlJykgfHxcbiAgICAgICAgICAvLyBQYXJlbnQgYXNrZWQgZm9yIHZpZXdlciBKUy4gV2UgbXVzdCBiZSBlbWJlZGRlZC5cbiAgICAgICAgICB0aGlzLndpbi5sb2NhdGlvbi5zZWFyY2guaW5kZXhPZignYW1wX2pzX3YnKSAhPSAtMSkpIHx8XG4gICAgICB0aGlzLmlzV2Vidmlld0VtYmVkZGVkKCkgfHxcbiAgICAgIHRoaXMuaXNDY3RFbWJlZGRlZCgpIHx8XG4gICAgICAhdGhpcy5hbXBkb2MuaXNTaW5nbGVEb2MoKVxuICAgICk7XG5cbiAgICBpZiAoIWlzRW1iZWRkZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aW1lb3V0TWVzc2FnZSA9ICdpbml0TWVzc2FnaW5nQ2hhbm5lbCB0aW1lb3V0JztcbiAgICByZXR1cm4gU2VydmljZXMudGltZXJGb3IodGhpcy53aW4pXG4gICAgICAudGltZW91dFByb21pc2UoMjAwMDAsIG1lc3NhZ2luZ1Byb21pc2UsIHRpbWVvdXRNZXNzYWdlKVxuICAgICAgLmNhdGNoKChyZWFzb24pID0+IHtcbiAgICAgICAgbGV0IGVycm9yID0gZ2V0Q2hhbm5lbEVycm9yKFxuICAgICAgICAgIC8qKiBAdHlwZSB7IUVycm9yfHN0cmluZ3x1bmRlZmluZWR9ICovIChyZWFzb24pXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnJvciAmJiBlbmRzV2l0aChlcnJvci5tZXNzYWdlLCB0aW1lb3V0TWVzc2FnZSkpIHtcbiAgICAgICAgICBlcnJvciA9IGRldigpLmNyZWF0ZUV4cGVjdGVkRXJyb3IoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJlcG9ydEVycm9yKGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0QW1wRG9jKCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgZ2V0UGFyYW0obmFtZSkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy5nZXRQYXJhbShuYW1lKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaGFzQ2FwYWJpbGl0eShuYW1lKSB7XG4gICAgY29uc3QgY2FwYWJpbGl0aWVzID0gdGhpcy5hbXBkb2MuZ2V0UGFyYW0oJ2NhcCcpO1xuICAgIGlmICghY2FwYWJpbGl0aWVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIFRPRE8oQGNyYW1mb3JjZSk6IENvbnNpZGVyIGNhY2hpbmcgdGhlIHNwbGl0LlxuICAgIHJldHVybiBjYXBhYmlsaXRpZXMuc3BsaXQoJywnKS5pbmRleE9mKG5hbWUpICE9IC0xO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc0VtYmVkZGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMubWVzc2FnaW5nUmVhZHlQcm9taXNlXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNXZWJ2aWV3RW1iZWRkZWQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzSWZyYW1lZF8gJiYgdGhpcy5hbXBkb2MuZ2V0UGFyYW0oJ3dlYnZpZXcnKSA9PSAnMSc7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzQ2N0RW1iZWRkZWQoKSB7XG4gICAgaWYgKHRoaXMuaXNDY3RFbWJlZGRlZF8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuaXNDY3RFbWJlZGRlZF87XG4gICAgfVxuICAgIHRoaXMuaXNDY3RFbWJlZGRlZF8gPSBmYWxzZTtcbiAgICBpZiAoIXRoaXMuaXNJZnJhbWVkXykge1xuICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHRoaXMud2luLmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICB0aGlzLmlzQ2N0RW1iZWRkZWRfID1cbiAgICAgICAgcXVlcnlQYXJhbXNbJ2FtcF9nc2EnXSA9PT0gJzEnICYmXG4gICAgICAgIChxdWVyeVBhcmFtc1snYW1wX2pzX3YnXSB8fCAnJykuc3RhcnRzV2l0aCgnYScpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pc0NjdEVtYmVkZGVkXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNQcm94eU9yaWdpbigpIHtcbiAgICByZXR1cm4gdGhpcy5pc1Byb3h5T3JpZ2luXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgbWF5YmVVcGRhdGVGcmFnbWVudEZvckNjdCgpIHtcbiAgICBpZiAoIXRoaXMuaXNDY3RFbWJlZGRlZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIENDVCBvbmx5IHdvcmtzIHdpdGggdmVyc2lvbnMgb2YgQ2hyb21lIHRoYXQgc3VwcG9ydCB0aGUgaGlzdG9yeSBBUEkuXG4gICAgaWYgKCF0aGlzLndpbi5oaXN0b3J5LnJlcGxhY2VTdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzb3VyY2VPcmlnaW4gPSBnZXRTb3VyY2VPcmlnaW4odGhpcy53aW4ubG9jYXRpb24uaHJlZik7XG4gICAgY29uc3Qge2Nhbm9uaWNhbFVybH0gPSBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2ModGhpcy5hbXBkb2MpO1xuICAgIGNvbnN0IGNhbm9uaWNhbFNvdXJjZU9yaWdpbiA9IGdldFNvdXJjZU9yaWdpbihjYW5vbmljYWxVcmwpO1xuICAgIGlmICh0aGlzLmhhc1JvdWdobHlTYW1lT3JpZ2luXyhzb3VyY2VPcmlnaW4sIGNhbm9uaWNhbFNvdXJjZU9yaWdpbikpIHtcbiAgICAgIHRoaXMuaGFzaFBhcmFtc19bJ2FtcHNoYXJlJ10gPSBjYW5vbmljYWxVcmw7XG4gICAgICB0aGlzLndpbi5oaXN0b3J5LnJlcGxhY2VTdGF0ZShcbiAgICAgICAge30sXG4gICAgICAgICcnLFxuICAgICAgICAnIycgK1xuICAgICAgICAgIHNlcmlhbGl6ZVF1ZXJ5U3RyaW5nKC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovICh0aGlzLmhhc2hQYXJhbXNfKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmVzIFVSTHMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgbWF0Y2ggb25jZSBjb21tb24gc3ViZG9tYWlucyBhcmVcbiAgICogcmVtb3ZlZC4gRXZlcnl0aGluZyBlbHNlIG11c3QgbWF0Y2guXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaXJzdCBPcmlnaW4gdG8gY29tcGFyZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlY29uZCBPcmlnaW4gdG8gY29tcGFyZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgb3JpZ2lucyBtYXRjaCB3aXRob3V0IHN1YmRvbWFpbnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYXNSb3VnaGx5U2FtZU9yaWdpbl8oZmlyc3QsIHNlY29uZCkge1xuICAgIGNvbnN0IHRyaW1PcmlnaW4gPSAob3JpZ2luKSA9PiB7XG4gICAgICBpZiAob3JpZ2luLnNwbGl0KCcuJykubGVuZ3RoID4gMikge1xuICAgICAgICByZXR1cm4gb3JpZ2luLnJlcGxhY2UoVFJJTV9PUklHSU5fUEFUVEVSTl8sICckMScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9yaWdpbjtcbiAgICB9O1xuICAgIHJldHVybiB0cmltT3JpZ2luKGZpcnN0KSA9PSB0cmltT3JpZ2luKHNlY29uZCk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGlzUnVudGltZU9uKCkge1xuICAgIHJldHVybiB0aGlzLmlzUnVudGltZU9uXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgdG9nZ2xlUnVudGltZSgpIHtcbiAgICB0aGlzLmlzUnVudGltZU9uXyA9ICF0aGlzLmlzUnVudGltZU9uXztcbiAgICBkZXYoKS5maW5lKFRBR18sICdSdW50aW1lIHN0YXRlOicsIHRoaXMuaXNSdW50aW1lT25fKTtcbiAgICB0aGlzLnJ1bnRpbWVPbk9ic2VydmFibGVfLmZpcmUodGhpcy5pc1J1bnRpbWVPbl8pO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblJ1bnRpbWVTdGF0ZShoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMucnVudGltZU9uT2JzZXJ2YWJsZV8uYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc092ZXJ0YWtlSGlzdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5vdmVydGFrZUhpc3RvcnlfO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhc3N0aHJvdWdoIGZvciBhbXBkb2MgdmlzaWJpbGl0eSBzdGF0ZS4gT25seSB0byBiZSB1c2VkIGJ5IHZpZXdlclxuICAgKiBpbnRlZ3JhdGlvbi5cbiAgICogQHJlc3RyaWN0ZWRcbiAgICogVE9ETygjMjI3MzMpOiByZW1vdmUgaWYgbm8gbG9uZ2VyIHVzZWQgYnkgdGhlIHZpZXdlci5cbiAgICovXG4gIGdldFZpc2liaWxpdHlTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogUGFzc3Rocm91Z2ggZm9yIGFtcGRvYyB2aXNpYmlsaXR5IHN0YXRlLiBPbmx5IHRvIGJlIHVzZWQgYnkgdmlld2VyXG4gICAqIGludGVncmF0aW9uLlxuICAgKiBAcmVzdHJpY3RlZFxuICAgKiBUT0RPKCMyMjczMyk6IHJlbW92ZSBpZiBubyBsb25nZXIgdXNlZCBieSB0aGUgdmlld2VyLlxuICAgKi9cbiAgaXNWaXNpYmxlKCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy5pc1Zpc2libGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzdGhyb3VnaCBmb3IgYW1wZG9jIHZpc2liaWxpdHkgc3RhdGUuIE9ubHkgdG8gYmUgdXNlZCBieSB2aWV3ZXJcbiAgICogaW50ZWdyYXRpb24uXG4gICAqIEByZXN0cmljdGVkXG4gICAqIFRPRE8oIzIyNzMzKTogcmVtb3ZlIGlmIG5vIGxvbmdlciB1c2VkIGJ5IHRoZSB2aWV3ZXIuXG4gICAqL1xuICBoYXNCZWVuVmlzaWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2MuaGFzQmVlblZpc2libGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzdGhyb3VnaCBmb3IgYW1wZG9jIHZpc2liaWxpdHkgc3RhdGUuIE9ubHkgdG8gYmUgdXNlZCBieSB2aWV3ZXJcbiAgICogaW50ZWdyYXRpb24uXG4gICAqIEByZXN0cmljdGVkXG4gICAqIFRPRE8oIzIyNzMzKTogcmVtb3ZlIGlmIG5vIGxvbmdlciB1c2VkIGJ5IHRoZSB2aWV3ZXIuXG4gICAqL1xuICB3aGVuRmlyc3RWaXNpYmxlKCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy53aGVuRmlyc3RWaXNpYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogUGFzc3Rocm91Z2ggZm9yIGFtcGRvYyB2aXNpYmlsaXR5IHN0YXRlLiBPbmx5IHRvIGJlIHVzZWQgYnkgdmlld2VyXG4gICAqIGludGVncmF0aW9uLlxuICAgKiBAcmVzdHJpY3RlZFxuICAgKiBUT0RPKCMyMjczMyk6IHJlbW92ZSBpZiBubyBsb25nZXIgdXNlZCBieSB0aGUgdmlld2VyLlxuICAgKi9cbiAgd2hlbk5leHRWaXNpYmxlKCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy53aGVuTmV4dFZpc2libGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzdGhyb3VnaCBmb3IgYW1wZG9jIHZpc2liaWxpdHkgc3RhdGUuIE9ubHkgdG8gYmUgdXNlZCBieSB2aWV3ZXJcbiAgICogaW50ZWdyYXRpb24uXG4gICAqIEByZXN0cmljdGVkXG4gICAqIFRPRE8oIzIyNzMzKTogcmVtb3ZlIGlmIG5vIGxvbmdlciB1c2VkIGJ5IHRoZSB2aWV3ZXIuXG4gICAqL1xuICBnZXRGaXJzdFZpc2libGVUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy5nZXRGaXJzdFZpc2libGVUaW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogUGFzc3Rocm91Z2ggZm9yIGFtcGRvYyB2aXNpYmlsaXR5IHN0YXRlLiBPbmx5IHRvIGJlIHVzZWQgYnkgdmlld2VyXG4gICAqIGludGVncmF0aW9uLlxuICAgKiBAcmVzdHJpY3RlZFxuICAgKiBUT0RPKCMyMjczMyk6IHJlbW92ZSBpZiBubyBsb25nZXIgdXNlZCBieSB0aGUgdmlld2VyLlxuICAgKi9cbiAgZ2V0TGFzdFZpc2libGVUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLmFtcGRvYy5nZXRMYXN0VmlzaWJsZVRpbWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzdGhyb3VnaCBmb3IgYW1wZG9jIHZpc2liaWxpdHkgc3RhdGUuIE9ubHkgdG8gYmUgdXNlZCBieSB2aWV3ZXJcbiAgICogaW50ZWdyYXRpb24uXG4gICAqIEByZXN0cmljdGVkXG4gICAqIFRPRE8oIzIyNzMzKTogcmVtb3ZlIGlmIG5vIGxvbmdlciB1c2VkIGJ5IHRoZSB2aWV3ZXIuXG4gICAqL1xuICBvblZpc2liaWxpdHlDaGFuZ2VkKGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5hbXBkb2Mub25WaXNpYmlsaXR5Q2hhbmdlZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2aWV3ZXIgZGVmaW5lZCB2aXNpYmlsaXR5IHN0YXRlLlxuICAgKiBAcGFyYW0gez9zdHJpbmd8dW5kZWZpbmVkfSBzdGF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0VmlzaWJpbGl0eVN0YXRlXyhzdGF0ZSkge1xuICAgIGlmICghc3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZXZBc3NlcnQoaXNFbnVtVmFsdWUoVmlzaWJpbGl0eVN0YXRlLCBzdGF0ZSkpO1xuXG4gICAgLy8gVGhlIHZpZXdlciBpcyBpbmZvcm1pbmcgdXMgd2UgYXJlIG5vdCBjdXJyZW50bHkgYWN0aXZlIGJlY2F1c2Ugd2UgYXJlXG4gICAgLy8gYmVpbmcgcHJlLXJlbmRlcmVkLCBvciB0aGUgdXNlciBzd2lwZWQgdG8gYW5vdGhlciBkb2MgKG9yIGNsb3NlZCB0aGVcbiAgICAvLyB2aWV3ZXIpLiBVbmZvcnR1bmF0ZWx5LCB0aGUgdmlld2VyIHNlbmRzIEhJRERFTiBpbnN0ZWFkIG9mIFBSRVJFTkRFUiBvclxuICAgIC8vIElOQUNUSVZFLCB0aG91Z2ggd2Uga25vdyBiZXR0ZXIuXG4gICAgaWYgKHN0YXRlID09PSBWaXNpYmlsaXR5U3RhdGUuSElEREVOKSB7XG4gICAgICBzdGF0ZSA9XG4gICAgICAgIHRoaXMuYW1wZG9jLmdldExhc3RWaXNpYmxlVGltZSgpICE9IG51bGxcbiAgICAgICAgICA/IFZpc2liaWxpdHlTdGF0ZS5JTkFDVElWRVxuICAgICAgICAgIDogVmlzaWJpbGl0eVN0YXRlLlBSRVJFTkRFUjtcbiAgICB9XG5cbiAgICB0aGlzLmFtcGRvYy5vdmVycmlkZVZpc2liaWxpdHlTdGF0ZShzdGF0ZSk7XG4gICAgZGV2KCkuZmluZShcbiAgICAgIFRBR18sXG4gICAgICAndmlzaWJpbGl0eWNoYW5nZSBldmVudDonLFxuICAgICAgdGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKClcbiAgICApO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBnZXRSZXNvbHZlZFZpZXdlclVybCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlZFZpZXdlclVybF87XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgeWllbGQgdGhlIHZpZXdlciBVUkwgdmFsdWUuIEl0J3MgYnkgZGVmYXVsdFxuICAgKiB0aGUgY3VycmVudCBwYWdlJ3MgVVJMLiBUaGUgdHJ1c3RlZCB2aWV3ZXJzIGFyZSBhbGxvd2VkIHRvIG92ZXJyaWRlIHRoaXNcbiAgICogdmFsdWUuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gICAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICAgKi9cbiAgZ2V0Vmlld2VyVXJsKCkge1xuICAgIHJldHVybiB0aGlzLnZpZXdlclVybF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG1heWJlR2V0TWVzc2FnaW5nT3JpZ2luKCkge1xuICAgIHJldHVybiB0aGlzLm1lc3NhZ2luZ09yaWdpbl87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFVuY29uZmlybWVkUmVmZXJyZXJVcmwoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5jb25maXJtZWRSZWZlcnJlclVybF87XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFJlZmVycmVyVXJsKCkge1xuICAgIHJldHVybiB0aGlzLnJlZmVycmVyVXJsXztcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaXNUcnVzdGVkVmlld2VyKCkge1xuICAgIGlmICghdGhpcy5pc1RydXN0ZWRWaWV3ZXJfKSB7XG4gICAgICBjb25zdCBpc1RydXN0ZWRBbmNlc3Rvck9yaWdpbnMgPSB0aGlzLmlzVHJ1c3RlZEFuY2VzdG9yT3JpZ2luc18oKTtcbiAgICAgIHRoaXMuaXNUcnVzdGVkVmlld2VyXyA9XG4gICAgICAgIGlzVHJ1c3RlZEFuY2VzdG9yT3JpZ2lucyAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUoaXNUcnVzdGVkQW5jZXN0b3JPcmlnaW5zKVxuICAgICAgICAgIDogdGhpcy5tZXNzYWdpbmdSZWFkeVByb21pc2VfLnRoZW4oKG9yaWdpbikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luID8gdGhpcy5pc1RydXN0ZWRWaWV3ZXJPcmlnaW5fKG9yaWdpbikgOiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTxib29sZWFuPn0gKi8gKHRoaXMuaXNUcnVzdGVkVmlld2VyXyk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdmlld2VyIGlzIGhhcyBiZWVuIGFsbG93bGlzdGVkIGZvciBtb3JlIHNlbnNpdGl2ZSBvcGVyYXRpb25zXG4gICAqIGJ5IGxvb2tpbmcgYXQgdGhlIGFuY2VzdG9yT3JpZ2lucy5cbiAgICogQHJldHVybiB7Ym9vbGVhbnx1bmRlZmluZWR9XG4gICAqL1xuICBpc1RydXN0ZWRBbmNlc3Rvck9yaWdpbnNfKCkge1xuICAgIGlmICghdGhpcy5pc0VtYmVkZGVkKCkpIHtcbiAgICAgIC8vIE5vdCBlbWJlZGRlZCBpbiBJRnJhbWUgLSBjYW4ndCB0cnVzdCB0aGUgdmlld2VyLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0aGlzLndpbi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnMgJiZcbiAgICAgICF0aGlzLmlzV2Vidmlld0VtYmVkZGVkKCkgJiZcbiAgICAgICF0aGlzLmlzQ2N0RW1iZWRkZWQoKVxuICAgICkge1xuICAgICAgLy8gQW5jZXN0b3JzIHdoZW4gYXZhaWxhYmxlIHRha2UgcHJlY2VkZW5jZS4gVGhpcyBpcyB0aGUgbWFpbiBBUEkgdXNlZFxuICAgICAgLy8gZm9yIHRoaXMgZGV0ZXJtaW5hdGlvbi4gRmFsbGJhY2sgaXMgb25seSBkb25lIHdoZW4gdGhpcyBBUEkgaXMgbm90XG4gICAgICAvLyBzdXBwb3J0ZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLndpbi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnMubGVuZ3RoID4gMCAmJlxuICAgICAgICB0aGlzLmlzVHJ1c3RlZFZpZXdlck9yaWdpbl8odGhpcy53aW4ubG9jYXRpb24uYW5jZXN0b3JPcmlnaW5zWzBdKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIGdldFZpZXdlck9yaWdpbigpIHtcbiAgICBpZiAoIXRoaXMudmlld2VyT3JpZ2luXykge1xuICAgICAgbGV0IG9yaWdpbjtcbiAgICAgIGlmICghdGhpcy5pc0VtYmVkZGVkKCkpIHtcbiAgICAgICAgLy8gVmlld2VyIGlzIG9ubHkgZGV0ZXJtaW5lZCBmb3IgaWZyYW1lZCBkb2N1bWVudHMgYXQgdGhpcyB0aW1lLlxuICAgICAgICBvcmlnaW4gPSAnJztcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHRoaXMud2luLmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2lucyAmJlxuICAgICAgICB0aGlzLndpbi5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnMubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIG9yaWdpbiA9IHRoaXMud2luLmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2luc1swXTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmlld2VyT3JpZ2luXyA9XG4gICAgICAgIG9yaWdpbiAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyBQcm9taXNlLnJlc29sdmUob3JpZ2luKVxuICAgICAgICAgIDogU2VydmljZXMudGltZXJGb3IodGhpcy53aW4pXG4gICAgICAgICAgICAgIC50aW1lb3V0UHJvbWlzZShcbiAgICAgICAgICAgICAgICBWSUVXRVJfT1JJR0lOX1RJTUVPVVRfLFxuICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nUmVhZHlQcm9taXNlX1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiAnJyk7XG4gICAgfVxuICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPHN0cmluZz59ICovICh0aGlzLnZpZXdlck9yaWdpbl8pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxTdHJpbmdcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGlzVHJ1c3RlZFZpZXdlck9yaWdpbl8odXJsU3RyaW5nKSB7XG4gICAgLyoqIEBjb25zdCB7IUxvY2F0aW9ufSAqL1xuICAgIGNvbnN0IHVybCA9IHBhcnNlVXJsRGVwcmVjYXRlZCh1cmxTdHJpbmcpO1xuICAgIGNvbnN0IHtwcm90b2NvbH0gPSB1cmw7XG4gICAgLy8gTW9iaWxlIFdlYlZpZXcgeC10aHJlYWQgaXMgYWxsb3dlZC5cbiAgICBpZiAocHJvdG9jb2wgPT0gJ3gtdGhyZWFkOicpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAocHJvdG9jb2wgIT0gJ2h0dHBzOicpIHtcbiAgICAgIC8vIE5vbi1odHRwcyBvcmlnaW5zIGFyZSBuZXZlciB0cnVzdGVkLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdXJscy50cnVzdGVkVmlld2VySG9zdHMuc29tZSgodGgpID0+IHRoLnRlc3QodXJsLmhvc3RuYW1lKSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uTWVzc2FnZShldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICBsZXQgb2JzZXJ2YWJsZSA9IHRoaXMubWVzc2FnZU9ic2VydmFibGVzX1tldmVudFR5cGVdO1xuICAgIGlmICghb2JzZXJ2YWJsZSkge1xuICAgICAgb2JzZXJ2YWJsZSA9IG5ldyBPYnNlcnZhYmxlKCk7XG4gICAgICB0aGlzLm1lc3NhZ2VPYnNlcnZhYmxlc19bZXZlbnRUeXBlXSA9IG9ic2VydmFibGU7XG4gICAgfVxuICAgIGNvbnN0IHVubGlzdGVuRm4gPSBvYnNlcnZhYmxlLmFkZChoYW5kbGVyKTtcbiAgICBpZiAodGhpcy5yZWNlaXZlZE1lc3NhZ2VRdWV1ZV9bZXZlbnRUeXBlXSkge1xuICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VRdWV1ZV9bZXZlbnRUeXBlXS5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICAgIG9ic2VydmFibGUuZmlyZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICBtZXNzYWdlLmRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VRdWV1ZV9bZXZlbnRUeXBlXSA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gdW5saXN0ZW5GbjtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25NZXNzYWdlUmVzcG9uZChldmVudFR5cGUsIHJlc3BvbmRlcikge1xuICAgIHRoaXMubWVzc2FnZVJlc3BvbmRlcnNfW2V2ZW50VHlwZV0gPSByZXNwb25kZXI7XG4gICAgaWYgKHRoaXMucmVjZWl2ZWRNZXNzYWdlUXVldWVfW2V2ZW50VHlwZV0pIHtcbiAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlUXVldWVfW2V2ZW50VHlwZV0uZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgICBtZXNzYWdlLmRlZmVycmVkLnJlc29sdmUocmVzcG9uZGVyKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlY2VpdmVkTWVzc2FnZVF1ZXVlX1tldmVudFR5cGVdID0gW107XG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5tZXNzYWdlUmVzcG9uZGVyc19bZXZlbnRUeXBlXSA9PT0gcmVzcG9uZGVyKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm1lc3NhZ2VSZXNwb25kZXJzX1tldmVudFR5cGVdO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHJlY2VpdmVNZXNzYWdlKGV2ZW50VHlwZSwgZGF0YSwgdW51c2VkQXdhaXRSZXNwb25zZSkge1xuICAgIGlmIChldmVudFR5cGUgPT0gJ3Zpc2liaWxpdHljaGFuZ2UnKSB7XG4gICAgICB0aGlzLnNldFZpc2liaWxpdHlTdGF0ZV8oZGF0YVsnc3RhdGUnXSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIGlmIChldmVudFR5cGUgPT0gJ2Jyb2FkY2FzdCcpIHtcbiAgICAgIHRoaXMuYnJvYWRjYXN0T2JzZXJ2YWJsZV8uZmlyZShcbiAgICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdHx1bmRlZmluZWR9ICovIChkYXRhKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gICAgY29uc3Qgb2JzZXJ2YWJsZSA9IHRoaXMubWVzc2FnZU9ic2VydmFibGVzX1tldmVudFR5cGVdO1xuICAgIGNvbnN0IHJlc3BvbmRlciA9IHRoaXMubWVzc2FnZVJlc3BvbmRlcnNfW2V2ZW50VHlwZV07XG5cbiAgICAvLyBRdWV1ZSB0aGUgbWVzc2FnZSBpZiB0aGVyZSBhcmUgbm8gaGFuZGxlcnMuIFJldHVybnMgYSBwZW5kaW5nIHByb21pc2UgdG9cbiAgICAvLyBiZSByZXNvbHZlZCBvbmNlIGEgaGFuZGxlci9yZXNwb25kZXIgaXMgcmVnaXN0ZXJlZC5cbiAgICBpZiAoIW9ic2VydmFibGUgJiYgIXJlc3BvbmRlcikge1xuICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VRdWV1ZV9bZXZlbnRUeXBlXSA9XG4gICAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlUXVldWVfW2V2ZW50VHlwZV0gfHwgW107XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlUXVldWVfW2V2ZW50VHlwZV0ubGVuZ3RoID49XG4gICAgICAgIFJFQ0VJVkVEX01FU1NBR0VfUVVFVUVfTUFYX0xFTkdUSFxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgICAgdGhpcy5yZWNlaXZlZE1lc3NhZ2VRdWV1ZV9bZXZlbnRUeXBlXS5wdXNoKHtkYXRhLCBkZWZlcnJlZH0pO1xuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICAgIGlmIChvYnNlcnZhYmxlKSB7XG4gICAgICBvYnNlcnZhYmxlLmZpcmUoZGF0YSk7XG4gICAgfVxuICAgIGlmIChyZXNwb25kZXIpIHtcbiAgICAgIHJldHVybiByZXNwb25kZXIoZGF0YSk7XG4gICAgfSBlbHNlIGlmIChvYnNlcnZhYmxlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRNZXNzYWdlRGVsaXZlcmVyKGRlbGl2ZXJlciwgb3JpZ2luKSB7XG4gICAgaWYgKHRoaXMubWVzc2FnZURlbGl2ZXJlcl8pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWVzc2FnZSBjaGFubmVsIGNhbiBvbmx5IGJlIGluaXRpYWxpemVkIG9uY2UnKTtcbiAgICB9XG4gICAgaWYgKG9yaWdpbiA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21lc3NhZ2UgY2hhbm5lbCBtdXN0IGhhdmUgYW4gb3JpZ2luJyk7XG4gICAgfVxuICAgIGRldigpLmZpbmUoVEFHXywgJ21lc3NhZ2UgY2hhbm5lbCBlc3RhYmxpc2hlZCB3aXRoIG9yaWdpbjogJywgb3JpZ2luKTtcbiAgICB0aGlzLm1lc3NhZ2VEZWxpdmVyZXJfID0gZGVsaXZlcmVyO1xuICAgIHRoaXMubWVzc2FnaW5nT3JpZ2luXyA9IG9yaWdpbjtcbiAgICB0aGlzLm1lc3NhZ2luZ1JlYWR5UmVzb2x2ZXJfKG9yaWdpbik7XG5cbiAgICBpZiAodGhpcy5tZXNzYWdlUXVldWVfLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHF1ZXVlID0gdGhpcy5tZXNzYWdlUXVldWVfLnNsaWNlKDApO1xuICAgICAgdGhpcy5tZXNzYWdlUXVldWVfID0gW107XG4gICAgICBxdWV1ZS5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlUHJvbWlzZSA9IHRoaXMubWVzc2FnZURlbGl2ZXJlcl8oXG4gICAgICAgICAgbWVzc2FnZS5ldmVudFR5cGUsXG4gICAgICAgICAgbWVzc2FnZS5kYXRhLFxuICAgICAgICAgIG1lc3NhZ2UuYXdhaXRSZXNwb25zZVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChtZXNzYWdlLmF3YWl0UmVzcG9uc2UpIHtcbiAgICAgICAgICBtZXNzYWdlLnJlc3BvbnNlUmVzb2x2ZXIocmVzcG9uc2VQcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZW5kTWVzc2FnZShldmVudFR5cGUsIGRhdGEsIGNhbmNlbFVuc2VudCA9IGZhbHNlKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZUludGVybmFsXyhldmVudFR5cGUsIGRhdGEsIGNhbmNlbFVuc2VudCwgZmFsc2UpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZW5kTWVzc2FnZUF3YWl0UmVzcG9uc2UoZXZlbnRUeXBlLCBkYXRhLCBjYW5jZWxVbnNlbnQgPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLnNlbmRNZXNzYWdlSW50ZXJuYWxfKGV2ZW50VHlwZSwgZGF0YSwgY2FuY2VsVW5zZW50LCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyB0aGUgbWVzc2FnZSB0byB0aGUgdmlld2VyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3R8c3RyaW5nfHVuZGVmaW5lZH0gZGF0YVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNhbmNlbFVuc2VudFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGF3YWl0UmVzcG9uc2VcbiAgICogQHJldHVybiB7IVByb21pc2U8KD9Kc29uT2JqZWN0fHN0cmluZ3x1bmRlZmluZWQpPn0gdGhlIHJlc3BvbnNlIHByb21pc2VcbiAgICovXG4gIHNlbmRNZXNzYWdlSW50ZXJuYWxfKGV2ZW50VHlwZSwgZGF0YSwgY2FuY2VsVW5zZW50LCBhd2FpdFJlc3BvbnNlKSB7XG4gICAgaWYgKHRoaXMubWVzc2FnZURlbGl2ZXJlcl8pIHtcbiAgICAgIC8vIENlcnRhaW4gbWVzc2FnZSBkZWxpdmVyZXJzIHJldHVybiBmYWtlIFwiUHJvbWlzZVwiIGluc3RhbmNlcyBjYWxsZWRcbiAgICAgIC8vIFwiVGhlbmFibGVzXCIuIENvbnZlcnQgZnJvbSB0aGVzZSB2YWx1ZXMgaW50byB0cnVzdGVkIFByb21pc2UgaW5zdGFuY2VzLFxuICAgICAgLy8gYXNzaW1pbGF0aW5nIHdpdGggdGhlIHJlc29sdmVkIChvciByZWplY3RlZCkgaW50ZXJuYWwgdmFsdWUuXG4gICAgICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTw/SnNvbk9iamVjdHxzdHJpbmd8dW5kZWZpbmVkPn0gKi8gKFxuICAgICAgICB0cnlSZXNvbHZlKCgpID0+XG4gICAgICAgICAgdGhpcy5tZXNzYWdlRGVsaXZlcmVyXyhcbiAgICAgICAgICAgIGV2ZW50VHlwZSxcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7P0pzb25PYmplY3R8c3RyaW5nfHVuZGVmaW5lZH0gKi8gKGRhdGEpLFxuICAgICAgICAgICAgYXdhaXRSZXNwb25zZVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubWVzc2FnaW5nUmVhZHlQcm9taXNlXykge1xuICAgICAgaWYgKGF3YWl0UmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGdldENoYW5uZWxFcnJvcigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNhbmNlbFVuc2VudCkge1xuICAgICAgcmV0dXJuIHRoaXMubWVzc2FnaW5nUmVhZHlQcm9taXNlXy50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZURlbGl2ZXJlcl8oZXZlbnRUeXBlLCBkYXRhLCBhd2FpdFJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kID0gZmluZEluZGV4KFxuICAgICAgdGhpcy5tZXNzYWdlUXVldWVfLFxuICAgICAgKG0pID0+IG0uZXZlbnRUeXBlID09IGV2ZW50VHlwZVxuICAgICk7XG5cbiAgICBsZXQgbWVzc2FnZTtcbiAgICBpZiAoZm91bmQgIT0gLTEpIHtcbiAgICAgIG1lc3NhZ2UgPSB0aGlzLm1lc3NhZ2VRdWV1ZV8uc3BsaWNlKGZvdW5kLCAxKVswXTtcbiAgICAgIG1lc3NhZ2UuZGF0YSA9IGRhdGE7XG4gICAgICBtZXNzYWdlLmF3YWl0UmVzcG9uc2UgPSBtZXNzYWdlLmF3YWl0UmVzcG9uc2UgfHwgYXdhaXRSZXNwb25zZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcbiAgICAgIGNvbnN0IHtwcm9taXNlOiByZXNwb25zZVByb21pc2UsIHJlc29sdmU6IHJlc3BvbnNlUmVzb2x2ZXJ9ID0gZGVmZXJyZWQ7XG5cbiAgICAgIG1lc3NhZ2UgPSB7XG4gICAgICAgIGV2ZW50VHlwZSxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgYXdhaXRSZXNwb25zZSxcbiAgICAgICAgcmVzcG9uc2VQcm9taXNlLFxuICAgICAgICByZXNwb25zZVJlc29sdmVyLFxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlUXVldWVfLnB1c2gobWVzc2FnZSk7XG4gICAgcmV0dXJuIG1lc3NhZ2UucmVzcG9uc2VQcm9taXNlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBicm9hZGNhc3QobWVzc2FnZSkge1xuICAgIGlmICghdGhpcy5tZXNzYWdpbmdSZWFkeVByb21pc2VfKSB7XG4gICAgICAvLyBNZXNzYWdpbmcgaXMgbm90IGV4cGVjdGVkLlxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2VuZE1lc3NhZ2VJbnRlcm5hbF8oJ2Jyb2FkY2FzdCcsIG1lc3NhZ2UsIGZhbHNlLCBmYWxzZSkudGhlbihcbiAgICAgICgpID0+IHRydWUsXG4gICAgICAoKSA9PiBmYWxzZVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIG9uQnJvYWRjYXN0KGhhbmRsZXIpIHtcbiAgICByZXR1cm4gdGhpcy5icm9hZGNhc3RPYnNlcnZhYmxlXy5hZGQoaGFuZGxlcik7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHdoZW5NZXNzYWdpbmdSZWFkeSgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXNzYWdpbmdSZWFkeVByb21pc2VfO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICByZXBsYWNlVXJsKG5ld1VybCkge1xuICAgIGlmIChcbiAgICAgICFuZXdVcmwgfHxcbiAgICAgICF0aGlzLmFtcGRvYy5pc1NpbmdsZURvYygpIHx8XG4gICAgICAhdGhpcy53aW4uaGlzdG9yeS5yZXBsYWNlU3RhdGVcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgLy8gVGhlIG9yaWdpbiBhbmQgc291cmNlIG9yaWdpbiBtdXN0IG1hdGNoLlxuICAgICAgY29uc3QgdXJsID0gcGFyc2VVcmxEZXByZWNhdGVkKHRoaXMud2luLmxvY2F0aW9uLmhyZWYpO1xuICAgICAgY29uc3QgcmVwbGFjZVVybCA9IHBhcnNlVXJsRGVwcmVjYXRlZChcbiAgICAgICAgcmVtb3ZlRnJhZ21lbnQobmV3VXJsKSArIHRoaXMud2luLmxvY2F0aW9uLmhhc2hcbiAgICAgICk7XG4gICAgICBpZiAoXG4gICAgICAgIHVybC5vcmlnaW4gPT0gcmVwbGFjZVVybC5vcmlnaW4gJiZcbiAgICAgICAgZ2V0U291cmNlT3JpZ2luKHVybCkgPT0gZ2V0U291cmNlT3JpZ2luKHJlcGxhY2VVcmwpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy53aW4uaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCByZXBsYWNlVXJsLmhyZWYpO1xuICAgICAgICB0aGlzLndpbi5sb2NhdGlvblsnb3JpZ2luYWxIcmVmJ10gPSB1cmwuaHJlZjtcbiAgICAgICAgZGV2KCkuZmluZShUQUdfLCAncmVwbGFjZSB1cmw6JyArIHJlcGxhY2VVcmwuaHJlZik7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZGV2KCkuZXJyb3IoVEFHXywgJ3JlcGxhY2VVcmwgZmFpbGVkJywgZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlZmVuc2UgaW4tZGVwdGggYWdhaW5zdCB2aWV3ZXIgY29tbXVuaWNhdGlvbiBpc3N1ZXM6IFdpbGwgbWFrZSB0aGVcbiAgICogZG9jdW1lbnQgdmlzaWJsZSBpZiBpdCByZWNlaXZlcyBhIHVzZXIgYWN0aW9uIHdpdGhvdXQgaGF2aW5nIGJlZW5cbiAgICogbWFkZSB2aXNpYmxlIGJ5IHRoZSB2aWV3ZXIuXG4gICAqL1xuICB2aXNpYmxlT25Vc2VyQWN0aW9uXygpIHtcbiAgICBpZiAodGhpcy5hbXBkb2MuZ2V0VmlzaWJpbGl0eVN0YXRlKCkgPT0gVmlzaWJpbGl0eVN0YXRlLlZJU0lCTEUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdW5saXN0ZW4gPSBbXTtcbiAgICBjb25zdCBkb1VubGlzdGVuID0gKCkgPT4gdW5saXN0ZW4uZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgIGNvbnN0IG1ha2VWaXNpYmxlID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRWaXNpYmlsaXR5U3RhdGVfKFZpc2liaWxpdHlTdGF0ZS5WSVNJQkxFKTtcbiAgICAgIGRvVW5saXN0ZW4oKTtcbiAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHXywgJ1JlY2VpdmVkIHVzZXIgYWN0aW9uIGluIG5vbi12aXNpYmxlIGRvYycpO1xuICAgIH07XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICBwYXNzaXZlOiB0cnVlLFxuICAgIH07XG4gICAgdW5saXN0ZW4ucHVzaChcbiAgICAgIGxpc3Rlbih0aGlzLndpbiwgJ2tleWRvd24nLCBtYWtlVmlzaWJsZSwgb3B0aW9ucyksXG4gICAgICBsaXN0ZW4odGhpcy53aW4sICd0b3VjaHN0YXJ0JywgbWFrZVZpc2libGUsIG9wdGlvbnMpLFxuICAgICAgbGlzdGVuKHRoaXMud2luLCAnbW91c2Vkb3duJywgbWFrZVZpc2libGUsIG9wdGlvbnMpXG4gICAgKTtcbiAgICB0aGlzLndoZW5GaXJzdFZpc2libGUoKS50aGVuKGRvVW5saXN0ZW4pO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGRldiBlcnJvciBmb3IgdGhlIGNhc2Ugd2hlcmUgYSBjaGFubmVsIGNhbm5vdCBiZSBlc3RhYmxpc2hlZC5cbiAqIEBwYXJhbSB7Kj19IG9wdF9yZWFzb25cbiAqIEByZXR1cm4geyFFcnJvcn1cbiAqL1xuZnVuY3Rpb24gZ2V0Q2hhbm5lbEVycm9yKG9wdF9yZWFzb24pIHtcbiAgbGV0IGNoYW5uZWxFcnJvcjtcbiAgaWYgKG9wdF9yZWFzb24gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIG9wdF9yZWFzb24gPSBkdXBsaWNhdGVFcnJvcklmTmVjZXNzYXJ5KG9wdF9yZWFzb24pO1xuICAgIG9wdF9yZWFzb24ubWVzc2FnZSA9ICdObyBtZXNzYWdpbmcgY2hhbm5lbDogJyArIG9wdF9yZWFzb24ubWVzc2FnZTtcbiAgICBjaGFubmVsRXJyb3IgPSBvcHRfcmVhc29uO1xuICB9IGVsc2Uge1xuICAgIGNoYW5uZWxFcnJvciA9IG5ldyBFcnJvcignTm8gbWVzc2FnaW5nIGNoYW5uZWw6ICcgKyBvcHRfcmVhc29uKTtcbiAgfVxuICAvLyBGb3JjZSBjb252ZXJ0IHVzZXIgZXJyb3IgdG8gZGV2IGVycm9yXG4gIGNoYW5uZWxFcnJvci5tZXNzYWdlID0gc3RyaXBVc2VyRXJyb3IoY2hhbm5lbEVycm9yLm1lc3NhZ2UpO1xuICByZXR1cm4gY2hhbm5lbEVycm9yO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxWaWV3ZXJTZXJ2aWNlRm9yRG9jKGFtcGRvYykge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jKFxuICAgIGFtcGRvYyxcbiAgICAndmlld2VyJyxcbiAgICBWaWV3ZXJJbXBsLFxuICAgIC8qIG9wdF9pbnN0YW50aWF0ZSAqLyB0cnVlXG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/viewer-impl.js