function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @typedef {function(!JsonObject):(!Promise|undefined)}
 */
export var RequestResponderDef;

/* eslint-disable no-unused-vars */
/**
 * @interface
 */
export var ViewerInterface = /*#__PURE__*/function () {function ViewerInterface() {_classCallCheck(this, ViewerInterface);}_createClass(ViewerInterface, [{ key: "getAmpDoc", value:
    /**
     * @return {!./ampdoc-impl.AmpDoc}
     */
    function getAmpDoc() {}

    /**
     * Returns the value of a viewer's startup parameter with the specified
     * name or "undefined" if the parameter wasn't defined at startup time.
     * TODO(#22733): deprecate/remove when ampdoc-fie is launched. Be careful that it's
     * exported. Need to make sure it's not used externally.
     * @param {string} name
     * @return {?string}
     */ }, { key: "getParam", value:
    function getParam(name) {}

    /**
     * Viewers can communicate their "capabilities" and this method allows
     * checking them.
     * @param {string} name Of the capability.
     * @return {boolean}
     */ }, { key: "hasCapability", value:
    function hasCapability(name) {}

    /**
     * Whether the document is embedded in a viewer.
     * @return {boolean}
     */ }, { key: "isEmbedded", value:
    function isEmbedded() {}

    /**
     * Whether the document is embedded in a webview.
     * @return {boolean}
     */ }, { key: "isWebviewEmbedded", value:
    function isWebviewEmbedded() {}

    /**
     * Whether the document is embedded in a Chrome Custom Tab.
     * @return {boolean}
     */ }, { key: "isCctEmbedded", value:
    function isCctEmbedded() {}

    /**
     * Whether the document was served by a proxy.
     * @return {boolean}
     */ }, { key: "isProxyOrigin", value:
    function isProxyOrigin() {}

    /**
     * Update the URL fragment with data needed to support custom tabs. This will
     * not clear query string parameters, but will clear the fragment.
     */ }, { key: "maybeUpdateFragmentForCct", value:
    function maybeUpdateFragmentForCct() {}

    /**
     * @return {boolean}
     */ }, { key: "isRuntimeOn", value:
    function isRuntimeOn() {}

    /**
     */ }, { key: "toggleRuntime", value:
    function toggleRuntime() {}

    /**
     * @param {function(boolean)} handler
     * @return {!UnlistenDef}
     */ }, { key: "onRuntimeState", value:
    function onRuntimeState(handler) {}

    /**
     * Whether the viewer overtakes the history for AMP document. If yes,
     * the viewer must implement history messages "pushHistory" and "popHistory"
     * and emit message "historyPopped"
     * @return {boolean}
     */ }, { key: "isOvertakeHistory", value:
    function isOvertakeHistory() {}

    /**
     * Returns the resolved viewer URL value. It's by default the current page's
     * URL. The trusted viewers are allowed to override this value.
     * @return {string}
     */ }, { key: "getResolvedViewerUrl", value:
    function getResolvedViewerUrl() {}

    /**
     * Possibly return the messaging origin if set. This would be the origin
     * of the parent viewer.
     * @return {?string}
     */ }, { key: "maybeGetMessagingOrigin", value:
    function maybeGetMessagingOrigin() {}

    /**
     * Returns an unconfirmed "referrer" URL that can be optionally customized by
     * the viewer. Consider using `getReferrerUrl()` instead, which returns the
     * promise that will yield the confirmed "referrer" URL.
     * @return {string}
     */ }, { key: "getUnconfirmedReferrerUrl", value:
    function getUnconfirmedReferrerUrl() {}

    /**
     * Returns the promise that will yield the confirmed "referrer" URL. This
     * URL can be optionally customized by the viewer, but viewer is required
     * to be a trusted viewer.
     * @return {!Promise<string>}
     */ }, { key: "getReferrerUrl", value:
    function getReferrerUrl() {}

    /**
     * Whether the viewer has been allowlisted for more sensitive operations
     * such as customizing referrer.
     * @return {!Promise<boolean>}
     */ }, { key: "isTrustedViewer", value:
    function isTrustedViewer() {}

    /**
     * Returns the promise that resolves to URL representing the origin of the
     * viewer. If the document is not embedded or if a viewer origin can't be
     * found, empty string is returned.
     * @return {!Promise<string>}
     */ }, { key: "getViewerOrigin", value:
    function getViewerOrigin() {}

    /**
     * Adds a eventType listener for viewer events.
     * @param {string} eventType
     * @param {function(!JsonObject)} handler
     * @return {!UnlistenDef}
     */ }, { key: "onMessage", value:
    function onMessage(eventType, handler) {}

    /**
     * Adds a eventType listener for viewer events.
     * @param {string} eventType
     * @param {!RequestResponderDef} responder
     * @return {!UnlistenDef}
     */ }, { key: "onMessageRespond", value:
    function onMessageRespond(eventType, responder) {}

    /**
     * Requests AMP document to receive a message from Viewer.
     * @param {string} eventType
     * @param {!JsonObject} data
     * @param {boolean} unusedAwaitResponse
     * @return {(!Promise<*>|undefined)}
     */ }, { key: "receiveMessage", value:
    function receiveMessage(eventType, data, unusedAwaitResponse) {}

    /**
     * Provides a message delivery mechanism by which AMP document can send
     * messages to the viewer.
     * @param {function(string, (?JsonObject|string|undefined), boolean):(!Promise<*>|undefined)} deliverer
     * @param {string} origin
     */ }, { key: "setMessageDeliverer", value:
    function setMessageDeliverer(deliverer, origin) {}

    /**
     * Sends the message to the viewer without waiting for any response.
     * If cancelUnsent is true, the previous message of the same message type will
     * be canceled.
     *
     * This is a restricted API.
     *
     * @param {string} eventType
     * @param {?JsonObject|string|undefined} data
     * @param {boolean=} cancelUnsent
     */ }, { key: "sendMessage", value:
    function sendMessage(eventType, data) {var cancelUnsent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;}

    /**
     * Sends the message to the viewer and wait for response.
     * If cancelUnsent is true, the previous message of the same message type will
     * be canceled.
     *
     * This is a restricted API.
     *
     * @param {string} eventType
     * @param {?JsonObject|string|undefined} data
     * @param {boolean=} cancelUnsent
     * @return {!Promise<(?JsonObject|string|undefined)>} the response promise
     */ }, { key: "sendMessageAwaitResponse", value:
    function sendMessageAwaitResponse(eventType, data) {var cancelUnsent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;}

    /**
     * Broadcasts a message to all other AMP documents under the same viewer. It
     * will attempt to deliver messages when the messaging channel has been
     * established, but it will not fail if the channel is timed out.
     *
     * @param {!JsonObject} message
     * @return {!Promise<boolean>} a Promise of success or not
     */ }, { key: "broadcast", value:
    function broadcast(message) {}

    /**
     * Registers receiver for the broadcast events.
     * @param {function(!JsonObject)} handler
     * @return {!UnlistenDef}
     */ }, { key: "onBroadcast", value:
    function onBroadcast(handler) {}

    /**
     * Resolves when there is a messaging channel established with the viewer.
     * Will be null if no messaging is needed like in an non-embedded document.
     * Deprecated: do not use. sendMessage and sendMessageAwaitResponse already
     *             wait for messaging channel ready.
     * @return {?Promise}
     */ }, { key: "whenMessagingReady", value:
    function whenMessagingReady() {}

    /**
     * Replace the document url with the viewer provided new replaceUrl.
     * @param {?string} newUrl
     */ }, { key: "replaceUrl", value:
    function replaceUrl(newUrl) {} }]);return ViewerInterface;}();
// /Users/mszylkowski/src/amphtml/src/service/viewer-interface.js