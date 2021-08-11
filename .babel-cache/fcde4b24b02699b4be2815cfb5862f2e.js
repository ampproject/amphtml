function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
export var ViewerInterface = /*#__PURE__*/function () {
  function ViewerInterface() {
    _classCallCheck(this, ViewerInterface);
  }

  _createClass(ViewerInterface, [{
    key: "getAmpDoc",
    value:
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
     */

  }, {
    key: "getParam",
    value: function getParam(name) {}
    /**
     * Viewers can communicate their "capabilities" and this method allows
     * checking them.
     * @param {string} name Of the capability.
     * @return {boolean}
     */

  }, {
    key: "hasCapability",
    value: function hasCapability(name) {}
    /**
     * Whether the document is embedded in a viewer.
     * @return {boolean}
     */

  }, {
    key: "isEmbedded",
    value: function isEmbedded() {}
    /**
     * Whether the document is embedded in a webview.
     * @return {boolean}
     */

  }, {
    key: "isWebviewEmbedded",
    value: function isWebviewEmbedded() {}
    /**
     * Whether the document is embedded in a Chrome Custom Tab.
     * @return {boolean}
     */

  }, {
    key: "isCctEmbedded",
    value: function isCctEmbedded() {}
    /**
     * Whether the document was served by a proxy.
     * @return {boolean}
     */

  }, {
    key: "isProxyOrigin",
    value: function isProxyOrigin() {}
    /**
     * Update the URL fragment with data needed to support custom tabs. This will
     * not clear query string parameters, but will clear the fragment.
     */

  }, {
    key: "maybeUpdateFragmentForCct",
    value: function maybeUpdateFragmentForCct() {}
    /**
     * @return {boolean}
     */

  }, {
    key: "isRuntimeOn",
    value: function isRuntimeOn() {}
    /**
     */

  }, {
    key: "toggleRuntime",
    value: function toggleRuntime() {}
    /**
     * @param {function(boolean)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onRuntimeState",
    value: function onRuntimeState(handler) {}
    /**
     * Whether the viewer overtakes the history for AMP document. If yes,
     * the viewer must implement history messages "pushHistory" and "popHistory"
     * and emit message "historyPopped"
     * @return {boolean}
     */

  }, {
    key: "isOvertakeHistory",
    value: function isOvertakeHistory() {}
    /**
     * Returns the resolved viewer URL value. It's by default the current page's
     * URL. The trusted viewers are allowed to override this value.
     * @return {string}
     */

  }, {
    key: "getResolvedViewerUrl",
    value: function getResolvedViewerUrl() {}
    /**
     * Possibly return the messaging origin if set. This would be the origin
     * of the parent viewer.
     * @return {?string}
     */

  }, {
    key: "maybeGetMessagingOrigin",
    value: function maybeGetMessagingOrigin() {}
    /**
     * Returns an unconfirmed "referrer" URL that can be optionally customized by
     * the viewer. Consider using `getReferrerUrl()` instead, which returns the
     * promise that will yield the confirmed "referrer" URL.
     * @return {string}
     */

  }, {
    key: "getUnconfirmedReferrerUrl",
    value: function getUnconfirmedReferrerUrl() {}
    /**
     * Returns the promise that will yield the confirmed "referrer" URL. This
     * URL can be optionally customized by the viewer, but viewer is required
     * to be a trusted viewer.
     * @return {!Promise<string>}
     */

  }, {
    key: "getReferrerUrl",
    value: function getReferrerUrl() {}
    /**
     * Whether the viewer has been allowlisted for more sensitive operations
     * such as customizing referrer.
     * @return {!Promise<boolean>}
     */

  }, {
    key: "isTrustedViewer",
    value: function isTrustedViewer() {}
    /**
     * Returns the promise that resolves to URL representing the origin of the
     * viewer. If the document is not embedded or if a viewer origin can't be
     * found, empty string is returned.
     * @return {!Promise<string>}
     */

  }, {
    key: "getViewerOrigin",
    value: function getViewerOrigin() {}
    /**
     * Adds a eventType listener for viewer events.
     * @param {string} eventType
     * @param {function(!JsonObject)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onMessage",
    value: function onMessage(eventType, handler) {}
    /**
     * Adds a eventType listener for viewer events.
     * @param {string} eventType
     * @param {!RequestResponderDef} responder
     * @return {!UnlistenDef}
     */

  }, {
    key: "onMessageRespond",
    value: function onMessageRespond(eventType, responder) {}
    /**
     * Requests AMP document to receive a message from Viewer.
     * @param {string} eventType
     * @param {!JsonObject} data
     * @param {boolean} unusedAwaitResponse
     * @return {(!Promise<*>|undefined)}
     */

  }, {
    key: "receiveMessage",
    value: function receiveMessage(eventType, data, unusedAwaitResponse) {}
    /**
     * Provides a message delivery mechanism by which AMP document can send
     * messages to the viewer.
     * @param {function(string, (?JsonObject|string|undefined), boolean):(!Promise<*>|undefined)} deliverer
     * @param {string} origin
     */

  }, {
    key: "setMessageDeliverer",
    value: function setMessageDeliverer(deliverer, origin) {}
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
     */

  }, {
    key: "sendMessage",
    value: function sendMessage(eventType, data, cancelUnsent) {
      if (cancelUnsent === void 0) {
        cancelUnsent = false;
      }
    }
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
     */

  }, {
    key: "sendMessageAwaitResponse",
    value: function sendMessageAwaitResponse(eventType, data, cancelUnsent) {
      if (cancelUnsent === void 0) {
        cancelUnsent = false;
      }
    }
    /**
     * Broadcasts a message to all other AMP documents under the same viewer. It
     * will attempt to deliver messages when the messaging channel has been
     * established, but it will not fail if the channel is timed out.
     *
     * @param {!JsonObject} message
     * @return {!Promise<boolean>} a Promise of success or not
     */

  }, {
    key: "broadcast",
    value: function broadcast(message) {}
    /**
     * Registers receiver for the broadcast events.
     * @param {function(!JsonObject)} handler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onBroadcast",
    value: function onBroadcast(handler) {}
    /**
     * Resolves when there is a messaging channel established with the viewer.
     * Will be null if no messaging is needed like in an non-embedded document.
     * Deprecated: do not use. sendMessage and sendMessageAwaitResponse already
     *             wait for messaging channel ready.
     * @return {?Promise}
     */

  }, {
    key: "whenMessagingReady",
    value: function whenMessagingReady() {}
    /**
     * Replace the document url with the viewer provided new replaceUrl.
     * @param {?string} newUrl
     */

  }, {
    key: "replaceUrl",
    value: function replaceUrl(newUrl) {}
  }]);

  return ViewerInterface;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdlci1pbnRlcmZhY2UuanMiXSwibmFtZXMiOlsiUmVxdWVzdFJlc3BvbmRlckRlZiIsIlZpZXdlckludGVyZmFjZSIsIm5hbWUiLCJoYW5kbGVyIiwiZXZlbnRUeXBlIiwicmVzcG9uZGVyIiwiZGF0YSIsInVudXNlZEF3YWl0UmVzcG9uc2UiLCJkZWxpdmVyZXIiLCJvcmlnaW4iLCJjYW5jZWxVbnNlbnQiLCJtZXNzYWdlIiwibmV3VXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQSxtQkFBSjs7QUFFUDs7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxlQUFiO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUNFO0FBQ0Y7QUFDQTtBQUNFLHlCQUFZLENBQUU7QUFFZDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWJBO0FBQUE7QUFBQSxXQWNFLGtCQUFTQyxJQUFULEVBQWUsQ0FBRTtBQUVqQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBckJBO0FBQUE7QUFBQSxXQXNCRSx1QkFBY0EsSUFBZCxFQUFvQixDQUFFO0FBRXRCO0FBQ0Y7QUFDQTtBQUNBOztBQTNCQTtBQUFBO0FBQUEsV0E0QkUsc0JBQWEsQ0FBRTtBQUVmO0FBQ0Y7QUFDQTtBQUNBOztBQWpDQTtBQUFBO0FBQUEsV0FrQ0UsNkJBQW9CLENBQUU7QUFFdEI7QUFDRjtBQUNBO0FBQ0E7O0FBdkNBO0FBQUE7QUFBQSxXQXdDRSx5QkFBZ0IsQ0FBRTtBQUVsQjtBQUNGO0FBQ0E7QUFDQTs7QUE3Q0E7QUFBQTtBQUFBLFdBOENFLHlCQUFnQixDQUFFO0FBRWxCO0FBQ0Y7QUFDQTtBQUNBOztBQW5EQTtBQUFBO0FBQUEsV0FvREUscUNBQTRCLENBQUU7QUFFOUI7QUFDRjtBQUNBOztBQXhEQTtBQUFBO0FBQUEsV0F5REUsdUJBQWMsQ0FBRTtBQUVoQjtBQUNGOztBQTVEQTtBQUFBO0FBQUEsV0E2REUseUJBQWdCLENBQUU7QUFFbEI7QUFDRjtBQUNBO0FBQ0E7O0FBbEVBO0FBQUE7QUFBQSxXQW1FRSx3QkFBZUMsT0FBZixFQUF3QixDQUFFO0FBRTFCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUExRUE7QUFBQTtBQUFBLFdBMkVFLDZCQUFvQixDQUFFO0FBRXRCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBakZBO0FBQUE7QUFBQSxXQWtGRSxnQ0FBdUIsQ0FBRTtBQUV6QjtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXhGQTtBQUFBO0FBQUEsV0F5RkUsbUNBQTBCLENBQUU7QUFFNUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWhHQTtBQUFBO0FBQUEsV0FpR0UscUNBQTRCLENBQUU7QUFFOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhHQTtBQUFBO0FBQUEsV0F5R0UsMEJBQWlCLENBQUU7QUFFbkI7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUEvR0E7QUFBQTtBQUFBLFdBZ0hFLDJCQUFrQixDQUFFO0FBRXBCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2SEE7QUFBQTtBQUFBLFdBd0hFLDJCQUFrQixDQUFFO0FBRXBCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEvSEE7QUFBQTtBQUFBLFdBZ0lFLG1CQUFVQyxTQUFWLEVBQXFCRCxPQUFyQixFQUE4QixDQUFFO0FBRWhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2SUE7QUFBQTtBQUFBLFdBd0lFLDBCQUFpQkMsU0FBakIsRUFBNEJDLFNBQTVCLEVBQXVDLENBQUU7QUFFekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaEpBO0FBQUE7QUFBQSxXQWlKRSx3QkFBZUQsU0FBZixFQUEwQkUsSUFBMUIsRUFBZ0NDLG1CQUFoQyxFQUFxRCxDQUFFO0FBRXZEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4SkE7QUFBQTtBQUFBLFdBeUpFLDZCQUFvQkMsU0FBcEIsRUFBK0JDLE1BQS9CLEVBQXVDLENBQUU7QUFFekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyS0E7QUFBQTtBQUFBLFdBc0tFLHFCQUFZTCxTQUFaLEVBQXVCRSxJQUF2QixFQUE2QkksWUFBN0IsRUFBbUQ7QUFBQSxVQUF0QkEsWUFBc0I7QUFBdEJBLFFBQUFBLFlBQXNCLEdBQVAsS0FBTztBQUFBO0FBQUU7QUFFckQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW5MQTtBQUFBO0FBQUEsV0FvTEUsa0NBQXlCTixTQUF6QixFQUFvQ0UsSUFBcEMsRUFBMENJLFlBQTFDLEVBQWdFO0FBQUEsVUFBdEJBLFlBQXNCO0FBQXRCQSxRQUFBQSxZQUFzQixHQUFQLEtBQU87QUFBQTtBQUFFO0FBRWxFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBN0xBO0FBQUE7QUFBQSxXQThMRSxtQkFBVUMsT0FBVixFQUFtQixDQUFFO0FBRXJCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBcE1BO0FBQUE7QUFBQSxXQXFNRSxxQkFBWVIsT0FBWixFQUFxQixDQUFFO0FBRXZCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTdNQTtBQUFBO0FBQUEsV0E4TUUsOEJBQXFCLENBQUU7QUFFdkI7QUFDRjtBQUNBO0FBQ0E7O0FBbk5BO0FBQUE7QUFBQSxXQW9ORSxvQkFBV1MsTUFBWCxFQUFtQixDQUFFO0FBcE52Qjs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Z1bmN0aW9uKCFKc29uT2JqZWN0KTooIVByb21pc2V8dW5kZWZpbmVkKX1cbiAqL1xuZXhwb3J0IGxldCBSZXF1ZXN0UmVzcG9uZGVyRGVmO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuLyoqXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBWaWV3ZXJJbnRlcmZhY2Uge1xuICAvKipcbiAgICogQHJldHVybiB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfVxuICAgKi9cbiAgZ2V0QW1wRG9jKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSB2aWV3ZXIncyBzdGFydHVwIHBhcmFtZXRlciB3aXRoIHRoZSBzcGVjaWZpZWRcbiAgICogbmFtZSBvciBcInVuZGVmaW5lZFwiIGlmIHRoZSBwYXJhbWV0ZXIgd2Fzbid0IGRlZmluZWQgYXQgc3RhcnR1cCB0aW1lLlxuICAgKiBUT0RPKCMyMjczMyk6IGRlcHJlY2F0ZS9yZW1vdmUgd2hlbiBhbXBkb2MtZmllIGlzIGxhdW5jaGVkLiBCZSBjYXJlZnVsIHRoYXQgaXQnc1xuICAgKiBleHBvcnRlZC4gTmVlZCB0byBtYWtlIHN1cmUgaXQncyBub3QgdXNlZCBleHRlcm5hbGx5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKi9cbiAgZ2V0UGFyYW0obmFtZSkge31cblxuICAvKipcbiAgICogVmlld2VycyBjYW4gY29tbXVuaWNhdGUgdGhlaXIgXCJjYXBhYmlsaXRpZXNcIiBhbmQgdGhpcyBtZXRob2QgYWxsb3dzXG4gICAqIGNoZWNraW5nIHRoZW0uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIE9mIHRoZSBjYXBhYmlsaXR5LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzQ2FwYWJpbGl0eShuYW1lKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBkb2N1bWVudCBpcyBlbWJlZGRlZCBpbiBhIHZpZXdlci5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRW1iZWRkZWQoKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBkb2N1bWVudCBpcyBlbWJlZGRlZCBpbiBhIHdlYnZpZXcuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1dlYnZpZXdFbWJlZGRlZCgpIHt9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGRvY3VtZW50IGlzIGVtYmVkZGVkIGluIGEgQ2hyb21lIEN1c3RvbSBUYWIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0NjdEVtYmVkZGVkKCkge31cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZG9jdW1lbnQgd2FzIHNlcnZlZCBieSBhIHByb3h5LlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNQcm94eU9yaWdpbigpIHt9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgVVJMIGZyYWdtZW50IHdpdGggZGF0YSBuZWVkZWQgdG8gc3VwcG9ydCBjdXN0b20gdGFicy4gVGhpcyB3aWxsXG4gICAqIG5vdCBjbGVhciBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycywgYnV0IHdpbGwgY2xlYXIgdGhlIGZyYWdtZW50LlxuICAgKi9cbiAgbWF5YmVVcGRhdGVGcmFnbWVudEZvckNjdCgpIHt9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1J1bnRpbWVPbigpIHt9XG5cbiAgLyoqXG4gICAqL1xuICB0b2dnbGVSdW50aW1lKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihib29sZWFuKX0gaGFuZGxlclxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBvblJ1bnRpbWVTdGF0ZShoYW5kbGVyKSB7fVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSB2aWV3ZXIgb3ZlcnRha2VzIHRoZSBoaXN0b3J5IGZvciBBTVAgZG9jdW1lbnQuIElmIHllcyxcbiAgICogdGhlIHZpZXdlciBtdXN0IGltcGxlbWVudCBoaXN0b3J5IG1lc3NhZ2VzIFwicHVzaEhpc3RvcnlcIiBhbmQgXCJwb3BIaXN0b3J5XCJcbiAgICogYW5kIGVtaXQgbWVzc2FnZSBcImhpc3RvcnlQb3BwZWRcIlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNPdmVydGFrZUhpc3RvcnkoKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXNvbHZlZCB2aWV3ZXIgVVJMIHZhbHVlLiBJdCdzIGJ5IGRlZmF1bHQgdGhlIGN1cnJlbnQgcGFnZSdzXG4gICAqIFVSTC4gVGhlIHRydXN0ZWQgdmlld2VycyBhcmUgYWxsb3dlZCB0byBvdmVycmlkZSB0aGlzIHZhbHVlLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvbHZlZFZpZXdlclVybCgpIHt9XG5cbiAgLyoqXG4gICAqIFBvc3NpYmx5IHJldHVybiB0aGUgbWVzc2FnaW5nIG9yaWdpbiBpZiBzZXQuIFRoaXMgd291bGQgYmUgdGhlIG9yaWdpblxuICAgKiBvZiB0aGUgcGFyZW50IHZpZXdlci5cbiAgICogQHJldHVybiB7P3N0cmluZ31cbiAgICovXG4gIG1heWJlR2V0TWVzc2FnaW5nT3JpZ2luKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyBhbiB1bmNvbmZpcm1lZCBcInJlZmVycmVyXCIgVVJMIHRoYXQgY2FuIGJlIG9wdGlvbmFsbHkgY3VzdG9taXplZCBieVxuICAgKiB0aGUgdmlld2VyLiBDb25zaWRlciB1c2luZyBgZ2V0UmVmZXJyZXJVcmwoKWAgaW5zdGVhZCwgd2hpY2ggcmV0dXJucyB0aGVcbiAgICogcHJvbWlzZSB0aGF0IHdpbGwgeWllbGQgdGhlIGNvbmZpcm1lZCBcInJlZmVycmVyXCIgVVJMLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRVbmNvbmZpcm1lZFJlZmVycmVyVXJsKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHdpbGwgeWllbGQgdGhlIGNvbmZpcm1lZCBcInJlZmVycmVyXCIgVVJMLiBUaGlzXG4gICAqIFVSTCBjYW4gYmUgb3B0aW9uYWxseSBjdXN0b21pemVkIGJ5IHRoZSB2aWV3ZXIsIGJ1dCB2aWV3ZXIgaXMgcmVxdWlyZWRcbiAgICogdG8gYmUgYSB0cnVzdGVkIHZpZXdlci5cbiAgICogQHJldHVybiB7IVByb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGdldFJlZmVycmVyVXJsKCkge31cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdmlld2VyIGhhcyBiZWVuIGFsbG93bGlzdGVkIGZvciBtb3JlIHNlbnNpdGl2ZSBvcGVyYXRpb25zXG4gICAqIHN1Y2ggYXMgY3VzdG9taXppbmcgcmVmZXJyZXIuXG4gICAqIEByZXR1cm4geyFQcm9taXNlPGJvb2xlYW4+fVxuICAgKi9cbiAgaXNUcnVzdGVkVmlld2VyKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIFVSTCByZXByZXNlbnRpbmcgdGhlIG9yaWdpbiBvZiB0aGVcbiAgICogdmlld2VyLiBJZiB0aGUgZG9jdW1lbnQgaXMgbm90IGVtYmVkZGVkIG9yIGlmIGEgdmlld2VyIG9yaWdpbiBjYW4ndCBiZVxuICAgKiBmb3VuZCwgZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZ2V0Vmlld2VyT3JpZ2luKCkge31cblxuICAvKipcbiAgICogQWRkcyBhIGV2ZW50VHlwZSBsaXN0ZW5lciBmb3Igdmlld2VyIGV2ZW50cy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFKc29uT2JqZWN0KX0gaGFuZGxlclxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBvbk1lc3NhZ2UoZXZlbnRUeXBlLCBoYW5kbGVyKSB7fVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZXZlbnRUeXBlIGxpc3RlbmVyIGZvciB2aWV3ZXIgZXZlbnRzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7IVJlcXVlc3RSZXNwb25kZXJEZWZ9IHJlc3BvbmRlclxuICAgKiBAcmV0dXJuIHshVW5saXN0ZW5EZWZ9XG4gICAqL1xuICBvbk1lc3NhZ2VSZXNwb25kKGV2ZW50VHlwZSwgcmVzcG9uZGVyKSB7fVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyBBTVAgZG9jdW1lbnQgdG8gcmVjZWl2ZSBhIG1lc3NhZ2UgZnJvbSBWaWV3ZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdH0gZGF0YVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVudXNlZEF3YWl0UmVzcG9uc2VcbiAgICogQHJldHVybiB7KCFQcm9taXNlPCo+fHVuZGVmaW5lZCl9XG4gICAqL1xuICByZWNlaXZlTWVzc2FnZShldmVudFR5cGUsIGRhdGEsIHVudXNlZEF3YWl0UmVzcG9uc2UpIHt9XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIGEgbWVzc2FnZSBkZWxpdmVyeSBtZWNoYW5pc20gYnkgd2hpY2ggQU1QIGRvY3VtZW50IGNhbiBzZW5kXG4gICAqIG1lc3NhZ2VzIHRvIHRoZSB2aWV3ZXIuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLCAoP0pzb25PYmplY3R8c3RyaW5nfHVuZGVmaW5lZCksIGJvb2xlYW4pOighUHJvbWlzZTwqPnx1bmRlZmluZWQpfSBkZWxpdmVyZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpblxuICAgKi9cbiAgc2V0TWVzc2FnZURlbGl2ZXJlcihkZWxpdmVyZXIsIG9yaWdpbikge31cblxuICAvKipcbiAgICogU2VuZHMgdGhlIG1lc3NhZ2UgdG8gdGhlIHZpZXdlciB3aXRob3V0IHdhaXRpbmcgZm9yIGFueSByZXNwb25zZS5cbiAgICogSWYgY2FuY2VsVW5zZW50IGlzIHRydWUsIHRoZSBwcmV2aW91cyBtZXNzYWdlIG9mIHRoZSBzYW1lIG1lc3NhZ2UgdHlwZSB3aWxsXG4gICAqIGJlIGNhbmNlbGVkLlxuICAgKlxuICAgKiBUaGlzIGlzIGEgcmVzdHJpY3RlZCBBUEkuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGVcbiAgICogQHBhcmFtIHs/SnNvbk9iamVjdHxzdHJpbmd8dW5kZWZpbmVkfSBkYXRhXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGNhbmNlbFVuc2VudFxuICAgKi9cbiAgc2VuZE1lc3NhZ2UoZXZlbnRUeXBlLCBkYXRhLCBjYW5jZWxVbnNlbnQgPSBmYWxzZSkge31cblxuICAvKipcbiAgICogU2VuZHMgdGhlIG1lc3NhZ2UgdG8gdGhlIHZpZXdlciBhbmQgd2FpdCBmb3IgcmVzcG9uc2UuXG4gICAqIElmIGNhbmNlbFVuc2VudCBpcyB0cnVlLCB0aGUgcHJldmlvdXMgbWVzc2FnZSBvZiB0aGUgc2FtZSBtZXNzYWdlIHR5cGUgd2lsbFxuICAgKiBiZSBjYW5jZWxlZC5cbiAgICpcbiAgICogVGhpcyBpcyBhIHJlc3RyaWN0ZWQgQVBJLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gICAqIEBwYXJhbSB7P0pzb25PYmplY3R8c3RyaW5nfHVuZGVmaW5lZH0gZGF0YVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBjYW5jZWxVbnNlbnRcbiAgICogQHJldHVybiB7IVByb21pc2U8KD9Kc29uT2JqZWN0fHN0cmluZ3x1bmRlZmluZWQpPn0gdGhlIHJlc3BvbnNlIHByb21pc2VcbiAgICovXG4gIHNlbmRNZXNzYWdlQXdhaXRSZXNwb25zZShldmVudFR5cGUsIGRhdGEsIGNhbmNlbFVuc2VudCA9IGZhbHNlKSB7fVxuXG4gIC8qKlxuICAgKiBCcm9hZGNhc3RzIGEgbWVzc2FnZSB0byBhbGwgb3RoZXIgQU1QIGRvY3VtZW50cyB1bmRlciB0aGUgc2FtZSB2aWV3ZXIuIEl0XG4gICAqIHdpbGwgYXR0ZW1wdCB0byBkZWxpdmVyIG1lc3NhZ2VzIHdoZW4gdGhlIG1lc3NhZ2luZyBjaGFubmVsIGhhcyBiZWVuXG4gICAqIGVzdGFibGlzaGVkLCBidXQgaXQgd2lsbCBub3QgZmFpbCBpZiB0aGUgY2hhbm5lbCBpcyB0aW1lZCBvdXQuXG4gICAqXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IG1lc3NhZ2VcbiAgICogQHJldHVybiB7IVByb21pc2U8Ym9vbGVhbj59IGEgUHJvbWlzZSBvZiBzdWNjZXNzIG9yIG5vdFxuICAgKi9cbiAgYnJvYWRjYXN0KG1lc3NhZ2UpIHt9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyByZWNlaXZlciBmb3IgdGhlIGJyb2FkY2FzdCBldmVudHMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIUpzb25PYmplY3QpfSBoYW5kbGVyXG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIG9uQnJvYWRjYXN0KGhhbmRsZXIpIHt9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHdoZW4gdGhlcmUgaXMgYSBtZXNzYWdpbmcgY2hhbm5lbCBlc3RhYmxpc2hlZCB3aXRoIHRoZSB2aWV3ZXIuXG4gICAqIFdpbGwgYmUgbnVsbCBpZiBubyBtZXNzYWdpbmcgaXMgbmVlZGVkIGxpa2UgaW4gYW4gbm9uLWVtYmVkZGVkIGRvY3VtZW50LlxuICAgKiBEZXByZWNhdGVkOiBkbyBub3QgdXNlLiBzZW5kTWVzc2FnZSBhbmQgc2VuZE1lc3NhZ2VBd2FpdFJlc3BvbnNlIGFscmVhZHlcbiAgICogICAgICAgICAgICAgd2FpdCBmb3IgbWVzc2FnaW5nIGNoYW5uZWwgcmVhZHkuXG4gICAqIEByZXR1cm4gez9Qcm9taXNlfVxuICAgKi9cbiAgd2hlbk1lc3NhZ2luZ1JlYWR5KCkge31cblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgZG9jdW1lbnQgdXJsIHdpdGggdGhlIHZpZXdlciBwcm92aWRlZCBuZXcgcmVwbGFjZVVybC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBuZXdVcmxcbiAgICovXG4gIHJlcGxhY2VVcmwobmV3VXJsKSB7fVxufVxuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuIl19
// /Users/mszylkowski/src/amphtml/src/service/viewer-interface.js