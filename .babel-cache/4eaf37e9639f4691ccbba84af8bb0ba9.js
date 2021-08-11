import { resolvedPromise as _resolvedPromise4 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import { dev, devAssert, stripUserError } from "../log";
import { registerServiceBuilderForDoc } from "../service-helpers";
import {
getSourceOrigin,
isProxyOrigin,
parseUrlDeprecated,
removeFragment,
serializeQueryString } from "../url";


var TAG_ = 'Viewer';

/** @enum {string} */
export var Capability = {
  VIEWER_RENDER_TEMPLATE: 'viewerRenderTemplate' };


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
var TRIM_ORIGIN_PATTERN_ =
/^(https?:\/\/)((www[0-9]*|web|ftp|wap|home|mobile|amp|m)\.)+/i;

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
  function ViewerImpl(ampdoc) {var _this = this;_classCallCheck(this, ViewerImpl);
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

    this.overtakeHistory_ = !!(
    parseInt(ampdoc.getParam('history'), 10) || this.overtakeHistory_);

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
    this.isProxyOrigin_ = isProxyOrigin(
    parseUrlDeprecated(this.ampdoc.win.location.href));


    var messagingDeferred = new Deferred();
    /** @const @private {!Function} */
    this.messagingReadyResolver_ = messagingDeferred.resolve;
    /** @const @private {?Promise} */
    this.messagingReadyPromise_ = this.initMessagingChannel_(
    messagingDeferred.promise);


    /** @private {?Promise<boolean>} */
    this.isTrustedViewer_ = null;

    /** @private {?Promise<string>} */
    this.viewerOrigin_ = null;

    var referrerParam = ampdoc.getParam('referrer');
    /** @private {string} */
    this.unconfirmedReferrerUrl_ =
    this.isEmbedded() &&
    referrerParam != null &&
    this.isTrustedAncestorOrigins_() !== false ?
    referrerParam :
    this.win.document.referrer;

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
              dev().expectedError(
              TAG_,
              'Untrusted viewer referrer override: ' +
              _this.unconfirmedReferrerUrl_ +
              ' at ' +
              _this.messagingOrigin_);

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
            dev().expectedError(
            TAG_,
            'Untrusted viewer url override: ' +
            viewerUrlOverride +
            ' at ' +
            _this.messagingOrigin_);

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
   */_createClass(ViewerImpl, [{ key: "initMessagingChannel_", value:
    function initMessagingChannel_(messagingPromise) {
      var isEmbedded = !!(
      (this.isIframed_ &&
      !this.win.__AMP_TEST_IFRAME &&
      // Checking param "origin", as we expect all viewers to provide it.
      // See https://github.com/ampproject/amphtml/issues/4183
      // There appears to be a bug under investigation where the
      // origin is sometimes failed to be detected. Since failure mode
      // if we fail to initialize communication is very bad, we also check
      // for visibilityState.
      // After https://github.com/ampproject/amphtml/issues/6070
      // is fixed we should probably only keep the amp_js_v check here.
      (this.ampdoc.getParam('origin') ||
      this.ampdoc.getParam('visibilityState') ||
      // Parent asked for viewer JS. We must be embedded.
      this.win.location.search.indexOf('amp_js_v') != -1)) ||
      this.isWebviewEmbedded() ||
      this.isCctEmbedded() ||
      !this.ampdoc.isSingleDoc());


      if (!isEmbedded) {
        return null;
      }
      var timeoutMessage = 'initMessagingChannel timeout';
      return Services.timerFor(this.win).
      timeoutPromise(20000, messagingPromise, timeoutMessage).
      catch(function (reason) {
        var error = getChannelError(
        /** @type {!Error|string|undefined} */(reason));

        if (error && endsWith(error.message, timeoutMessage)) {
          error = dev().createExpectedError(error);
        }
        reportError(error);
        throw error;
      });
    }

    /** @override */ }, { key: "getAmpDoc", value:
    function getAmpDoc() {
      return this.ampdoc;
    }

    /** @override */ }, { key: "getParam", value:
    function getParam(name) {
      return this.ampdoc.getParam(name);
    }

    /** @override */ }, { key: "hasCapability", value:
    function hasCapability(name) {
      var capabilities = this.ampdoc.getParam('cap');
      if (!capabilities) {
        return false;
      }
      // TODO(@cramforce): Consider caching the split.
      return capabilities.split(',').indexOf(name) != -1;
    }

    /** @override */ }, { key: "isEmbedded", value:
    function isEmbedded() {
      return !!this.messagingReadyPromise_;
    }

    /** @override */ }, { key: "isWebviewEmbedded", value:
    function isWebviewEmbedded() {
      return !this.isIframed_ && this.ampdoc.getParam('webview') == '1';
    }

    /** @override */ }, { key: "isCctEmbedded", value:
    function isCctEmbedded() {
      if (this.isCctEmbedded_ != null) {
        return this.isCctEmbedded_;
      }
      this.isCctEmbedded_ = false;
      if (!this.isIframed_) {
        var queryParams = parseQueryString(this.win.location.search);
        this.isCctEmbedded_ =
        queryParams['amp_gsa'] === '1' &&
        (queryParams['amp_js_v'] || '').startsWith('a');
      }
      return this.isCctEmbedded_;
    }

    /** @override */ }, { key: "isProxyOrigin", value:
    function isProxyOrigin() {
      return this.isProxyOrigin_;
    }

    /** @override */ }, { key: "maybeUpdateFragmentForCct", value:
    function maybeUpdateFragmentForCct() {
      if (!this.isCctEmbedded()) {
        return;
      }
      // CCT only works with versions of Chrome that support the history API.
      if (!this.win.history.replaceState) {
        return;
      }
      var sourceOrigin = getSourceOrigin(this.win.location.href);
      var _Services$documentInf = Services.documentInfoForDoc(this.ampdoc),canonicalUrl = _Services$documentInf.canonicalUrl;
      var canonicalSourceOrigin = getSourceOrigin(canonicalUrl);
      if (this.hasRoughlySameOrigin_(sourceOrigin, canonicalSourceOrigin)) {
        this.hashParams_['ampshare'] = canonicalUrl;
        this.win.history.replaceState(
        {},
        '',
        '#' +
        serializeQueryString( /** @type {!JsonObject} */(this.hashParams_)));

      }
    }

    /**
     * Compares URLs to determine if they match once common subdomains are
     * removed. Everything else must match.
     * @param {string} first Origin to compare.
     * @param {string} second Origin to compare.
     * @return {boolean} Whether the origins match without subdomains.
     * @private
     */ }, { key: "hasRoughlySameOrigin_", value:
    function hasRoughlySameOrigin_(first, second) {
      var trimOrigin = function trimOrigin(origin) {
        if (origin.split('.').length > 2) {
          return origin.replace(TRIM_ORIGIN_PATTERN_, '$1');
        }
        return origin;
      };
      return trimOrigin(first) == trimOrigin(second);
    }

    /** @override */ }, { key: "isRuntimeOn", value:
    function isRuntimeOn() {
      return this.isRuntimeOn_;
    }

    /** @override */ }, { key: "toggleRuntime", value:
    function toggleRuntime() {
      this.isRuntimeOn_ = !this.isRuntimeOn_;
      dev().fine(TAG_, 'Runtime state:', this.isRuntimeOn_);
      this.runtimeOnObservable_.fire(this.isRuntimeOn_);
    }

    /** @override */ }, { key: "onRuntimeState", value:
    function onRuntimeState(handler) {
      return this.runtimeOnObservable_.add(handler);
    }

    /** @override */ }, { key: "isOvertakeHistory", value:
    function isOvertakeHistory() {
      return this.overtakeHistory_;
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "getVisibilityState", value:
    function getVisibilityState() {
      return this.ampdoc.getVisibilityState();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "isVisible", value:
    function isVisible() {
      return this.ampdoc.isVisible();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "hasBeenVisible", value:
    function hasBeenVisible() {
      return this.ampdoc.hasBeenVisible();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "whenFirstVisible", value:
    function whenFirstVisible() {
      return this.ampdoc.whenFirstVisible();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "whenNextVisible", value:
    function whenNextVisible() {
      return this.ampdoc.whenNextVisible();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "getFirstVisibleTime", value:
    function getFirstVisibleTime() {
      return this.ampdoc.getFirstVisibleTime();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "getLastVisibleTime", value:
    function getLastVisibleTime() {
      return this.ampdoc.getLastVisibleTime();
    }

    /**
     * Passthrough for ampdoc visibility state. Only to be used by viewer
     * integration.
     * @restricted
     * TODO(#22733): remove if no longer used by the viewer.
     */ }, { key: "onVisibilityChanged", value:
    function onVisibilityChanged(handler) {
      return this.ampdoc.onVisibilityChanged(handler);
    }

    /**
     * Sets the viewer defined visibility state.
     * @param {?string|undefined} state
     * @private
     */ }, { key: "setVisibilityState_", value:
    function setVisibilityState_(state) {
      if (!state) {
        return;
      }

      devAssert(isEnumValue(VisibilityState, state));

      // The viewer is informing us we are not currently active because we are
      // being pre-rendered, or the user swiped to another doc (or closed the
      // viewer). Unfortunately, the viewer sends HIDDEN instead of PRERENDER or
      // INACTIVE, though we know better.
      if (state === VisibilityState.HIDDEN) {
        state =
        this.ampdoc.getLastVisibleTime() != null ?
        VisibilityState.INACTIVE :
        VisibilityState.PRERENDER;
      }

      this.ampdoc.overrideVisibilityState(state);
      dev().fine(
      TAG_,
      'visibilitychange event:',
      this.ampdoc.getVisibilityState());

    }

    /** @override */ }, { key: "getResolvedViewerUrl", value:
    function getResolvedViewerUrl() {
      return this.resolvedViewerUrl_;
    }

    /**
     * Returns the promise that will yield the viewer URL value. It's by default
     * the current page's URL. The trusted viewers are allowed to override this
     * value.
     * @return {!Promise<string>}
     * @visibleForTesting
     */ }, { key: "getViewerUrl", value:
    function getViewerUrl() {
      return this.viewerUrl_;
    }

    /** @override */ }, { key: "maybeGetMessagingOrigin", value:
    function maybeGetMessagingOrigin() {
      return this.messagingOrigin_;
    }

    /** @override */ }, { key: "getUnconfirmedReferrerUrl", value:
    function getUnconfirmedReferrerUrl() {
      return this.unconfirmedReferrerUrl_;
    }

    /** @override */ }, { key: "getReferrerUrl", value:
    function getReferrerUrl() {
      return this.referrerUrl_;
    }

    /** @override */ }, { key: "isTrustedViewer", value:
    function isTrustedViewer() {var _this2 = this;
      if (!this.isTrustedViewer_) {
        var isTrustedAncestorOrigins = this.isTrustedAncestorOrigins_();
        this.isTrustedViewer_ =
        isTrustedAncestorOrigins !== undefined ?
        Promise.resolve(isTrustedAncestorOrigins) :
        this.messagingReadyPromise_.then(function (origin) {
          return origin ? _this2.isTrustedViewerOrigin_(origin) : false;
        });
      }
      return (/** @type {!Promise<boolean>} */(this.isTrustedViewer_));
    }

    /**
     * Whether the viewer is has been allowlisted for more sensitive operations
     * by looking at the ancestorOrigins.
     * @return {boolean|undefined}
     */ }, { key: "isTrustedAncestorOrigins_", value:
    function isTrustedAncestorOrigins_() {
      if (!this.isEmbedded()) {
        // Not embedded in IFrame - can't trust the viewer.
        return false;
      } else if (
      this.win.location.ancestorOrigins &&
      !this.isWebviewEmbedded() &&
      !this.isCctEmbedded())
      {
        // Ancestors when available take precedence. This is the main API used
        // for this determination. Fallback is only done when this API is not
        // supported by the browser.
        return (
        this.win.location.ancestorOrigins.length > 0 &&
        this.isTrustedViewerOrigin_(this.win.location.ancestorOrigins[0]));

      }
    }

    /** @override */ }, { key: "getViewerOrigin", value:
    function getViewerOrigin() {
      if (!this.viewerOrigin_) {
        var origin;
        if (!this.isEmbedded()) {
          // Viewer is only determined for iframed documents at this time.
          origin = '';
        } else if (
        this.win.location.ancestorOrigins &&
        this.win.location.ancestorOrigins.length > 0)
        {
          origin = this.win.location.ancestorOrigins[0];
        }
        this.viewerOrigin_ =
        origin !== undefined ?
        Promise.resolve(origin) :
        Services.timerFor(this.win).
        timeoutPromise(
        VIEWER_ORIGIN_TIMEOUT_,
        this.messagingReadyPromise_).

        catch(function () {return '';});
      }
      return (/** @type {!Promise<string>} */(this.viewerOrigin_));
    }

    /**
     * @param {string} urlString
     * @return {boolean}
     * @private
     */ }, { key: "isTrustedViewerOrigin_", value:
    function isTrustedViewerOrigin_(urlString) {
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
      return urls.trustedViewerHosts.some(function (th) {return th.test(url.hostname);});
    }

    /** @override */ }, { key: "onMessage", value:
    function onMessage(eventType, handler) {
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

    /** @override */ }, { key: "onMessageRespond", value:
    function onMessageRespond(eventType, responder) {var _this3 = this;
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

    /** @override */ }, { key: "receiveMessage", value:
    function receiveMessage(eventType, data, unusedAwaitResponse) {
      if (eventType == 'visibilitychange') {
        this.setVisibilityState_(data['state']);
        return _resolvedPromise();
      }
      if (eventType == 'broadcast') {
        this.broadcastObservable_.fire(
        /** @type {!JsonObject|undefined} */(data));

        return _resolvedPromise2();
      }
      var observable = this.messageObservables_[eventType];
      var responder = this.messageResponders_[eventType];

      // Queue the message if there are no handlers. Returns a pending promise to
      // be resolved once a handler/responder is registered.
      if (!observable && !responder) {
        this.receivedMessageQueue_[eventType] =
        this.receivedMessageQueue_[eventType] || [];
        if (
        this.receivedMessageQueue_[eventType].length >=
        RECEIVED_MESSAGE_QUEUE_MAX_LENGTH)
        {
          return undefined;
        }
        var deferred = new Deferred();
        this.receivedMessageQueue_[eventType].push({ data: data, deferred: deferred });
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

    /** @override */ }, { key: "setMessageDeliverer", value:
    function setMessageDeliverer(deliverer, origin) {var _this4 = this;
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
          var responsePromise = _this4.messageDeliverer_(
          message.eventType,
          message.data,
          message.awaitResponse);


          if (message.awaitResponse) {
            message.responseResolver(responsePromise);
          }
        });
      }
    }

    /** @override */ }, { key: "sendMessage", value:
    function sendMessage(eventType, data) {var cancelUnsent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.sendMessageInternal_(eventType, data, cancelUnsent, false);
    }

    /** @override */ }, { key: "sendMessageAwaitResponse", value:
    function sendMessageAwaitResponse(eventType, data) {var cancelUnsent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
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
     */ }, { key: "sendMessageInternal_", value:
    function sendMessageInternal_(eventType, data, cancelUnsent, awaitResponse) {var _this5 = this;
      if (this.messageDeliverer_) {
        // Certain message deliverers return fake "Promise" instances called
        // "Thenables". Convert from these values into trusted Promise instances,
        // assimilating with the resolved (or rejected) internal value.
        return (/** @type {!Promise<?JsonObject|string|undefined>} */(
          tryResolve(function () {return (
              _this5.messageDeliverer_(
              eventType,
              /** @type {?JsonObject|string|undefined} */(data),
              awaitResponse));})));



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

      var found = findIndex(
      this.messageQueue_,
      function (m) {return m.eventType == eventType;});


      var message;
      if (found != -1) {
        message = this.messageQueue_.splice(found, 1)[0];
        message.data = data;
        message.awaitResponse = message.awaitResponse || awaitResponse;
      } else {
        var deferred = new Deferred();
        var responsePromise = deferred.promise,responseResolver = deferred.resolve;

        message = {
          eventType: eventType,
          data: data,
          awaitResponse: awaitResponse,
          responsePromise: responsePromise,
          responseResolver: responseResolver };

      }
      this.messageQueue_.push(message);
      return message.responsePromise;
    }

    /** @override */ }, { key: "broadcast", value:
    function broadcast(message) {
      if (!this.messagingReadyPromise_) {
        // Messaging is not expected.
        return Promise.resolve(false);
      }

      return this.sendMessageInternal_('broadcast', message, false, false).then(
      function () {return true;},
      function () {return false;});

    }

    /** @override */ }, { key: "onBroadcast", value:
    function onBroadcast(handler) {
      return this.broadcastObservable_.add(handler);
    }

    /** @override */ }, { key: "whenMessagingReady", value:
    function whenMessagingReady() {
      return this.messagingReadyPromise_;
    }

    /** @override */ }, { key: "replaceUrl", value:
    function replaceUrl(newUrl) {
      if (
      !newUrl ||
      !this.ampdoc.isSingleDoc() ||
      !this.win.history.replaceState)
      {
        return;
      }

      try {
        // The origin and source origin must match.
        var url = parseUrlDeprecated(this.win.location.href);
        var replaceUrl = parseUrlDeprecated(
        removeFragment(newUrl) + this.win.location.hash);

        if (
        url.origin == replaceUrl.origin &&
        getSourceOrigin(url) == getSourceOrigin(replaceUrl))
        {
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
     */ }, { key: "visibleOnUserAction_", value:
    function visibleOnUserAction_() {var _this6 = this;
      if (this.ampdoc.getVisibilityState() == VisibilityState.VISIBLE) {
        return;
      }
      var unlisten = [];
      var doUnlisten = function doUnlisten() {return unlisten.forEach(function (fn) {return fn();});};
      var makeVisible = function makeVisible() {
        _this6.setVisibilityState_(VisibilityState.VISIBLE);
        doUnlisten();
        dev().expectedError(TAG_, 'Received user action in non-visible doc');
      };
      var options = {
        capture: true,
        passive: true };

      unlisten.push(
      listen(this.win, 'keydown', makeVisible, options),
      listen(this.win, 'touchstart', makeVisible, options),
      listen(this.win, 'mousedown', makeVisible, options));

      this.whenFirstVisible().then(doUnlisten);
    } }]);return ViewerImpl;}();


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
  registerServiceBuilderForDoc(
  ampdoc,
  'viewer',
  ViewerImpl,
  /* opt_instantiate */true);

}
// /Users/mszylkowski/src/amphtml/src/service/viewer-impl.js