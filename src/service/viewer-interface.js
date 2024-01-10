/**
 * @typedef {function(!JsonObject):(!Promise|undefined)}
 */
export let RequestResponderDef;

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @interface
 */
export class ViewerInterface {
  /**
   * @return {!./ampdoc-impl.AmpDoc}
   */
  getAmpDoc() {}

  /**
   * Returns the value of a viewer's startup parameter with the specified
   * name or "undefined" if the parameter wasn't defined at startup time.
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched. Be careful that it's
   * exported. Need to make sure it's not used externally.
   * @param {string} name
   * @return {?string}
   */
  getParam(name) {}

  /**
   * Viewers can communicate their "capabilities" and this method allows
   * checking them.
   * @param {string} name Of the capability.
   * @return {boolean}
   */
  hasCapability(name) {}

  /**
   * Whether the document is embedded in a viewer.
   * @return {boolean}
   */
  isEmbedded() {}

  /**
   * Whether the document is embedded in a webview.
   * @return {boolean}
   */
  isWebviewEmbedded() {}

  /**
   * Whether the document is embedded in a Chrome Custom Tab.
   * @return {boolean}
   */
  isCctEmbedded() {}

  /**
   * Whether the document was served by a proxy.
   * @return {boolean}
   */
  isProxyOrigin() {}

  /**
   * Update the URL fragment with data needed to support custom tabs. This will
   * not clear query string parameters, but will clear the fragment.
   */
  maybeUpdateFragmentForCct() {}

  /**
   * @return {boolean}
   */
  isRuntimeOn() {}

  /**
   */
  toggleRuntime() {}

  /**
   * @param {function(boolean)} handler
   * @return {!UnlistenDef}
   */
  onRuntimeState(handler) {}

  /**
   * Whether the viewer overtakes the history for AMP document. If yes,
   * the viewer must implement history messages "pushHistory" and "popHistory"
   * and emit message "historyPopped"
   * @return {boolean}
   */
  isOvertakeHistory() {}

  /**
   * Returns the resolved viewer URL value. It's by default the current page's
   * URL. The trusted viewers are allowed to override this value.
   * @return {string}
   */
  getResolvedViewerUrl() {}

  /**
   * Possibly return the messaging origin if set. This would be the origin
   * of the parent viewer.
   * @return {?string}
   */
  maybeGetMessagingOrigin() {}

  /**
   * Returns an unconfirmed "referrer" URL that can be optionally customized by
   * the viewer. Consider using `getReferrerUrl()` instead, which returns the
   * promise that will yield the confirmed "referrer" URL.
   * @return {string}
   */
  getUnconfirmedReferrerUrl() {}

  /**
   * Returns the promise that will yield the confirmed "referrer" URL. This
   * URL can be optionally customized by the viewer, but viewer is required
   * to be a trusted viewer.
   * @return {!Promise<string>}
   */
  getReferrerUrl() {}

  /**
   * Whether the viewer has been allowlisted for more sensitive operations
   * such as customizing referrer.
   * @return {!Promise<boolean>}
   */
  isTrustedViewer() {}

  /**
   * Returns the promise that resolves to URL representing the origin of the
   * viewer. If the document is not embedded or if a viewer origin can't be
   * found, empty string is returned.
   * @return {!Promise<string>}
   */
  getViewerOrigin() {}

  /**
   * Adds a eventType listener for viewer events.
   * @param {string} eventType
   * @param {function(!JsonObject)} handler
   * @return {!UnlistenDef}
   */
  onMessage(eventType, handler) {}

  /**
   * Adds a eventType listener for viewer events.
   * @param {string} eventType
   * @param {!RequestResponderDef} responder
   * @return {!UnlistenDef}
   */
  onMessageRespond(eventType, responder) {}

  /**
   * Requests AMP document to receive a message from Viewer.
   * @param {string} eventType
   * @param {!JsonObject} data
   * @param {boolean} unusedAwaitResponse
   * @return {(!Promise<*>|undefined)}
   */
  receiveMessage(eventType, data, unusedAwaitResponse) {}

  /**
   * Provides a message delivery mechanism by which AMP document can send
   * messages to the viewer.
   * @param {function(string, (?JsonObject|string|undefined), boolean):(!Promise<*>|undefined)} deliverer
   * @param {string} origin
   */
  setMessageDeliverer(deliverer, origin) {}

  /**
   * @return {?function(string, (?JsonObject|string|undefined), boolean):(!Promise<*>|undefined)}
   */
  maybeGetMessageDeliverer() {}

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
  sendMessage(eventType, data, cancelUnsent = false) {}

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
  sendMessageAwaitResponse(eventType, data, cancelUnsent = false) {}

  /**
   * Broadcasts a message to all other AMP documents under the same viewer. It
   * will attempt to deliver messages when the messaging channel has been
   * established, but it will not fail if the channel is timed out.
   *
   * @param {!JsonObject} message
   * @return {!Promise<boolean>} a Promise of success or not
   */
  broadcast(message) {}

  /**
   * Registers receiver for the broadcast events.
   * @param {function(!JsonObject)} handler
   * @return {!UnlistenDef}
   */
  onBroadcast(handler) {}

  /**
   * Resolves when there is a messaging channel established with the viewer.
   * Will be null if no messaging is needed like in an non-embedded document.
   * Deprecated: do not use. sendMessage and sendMessageAwaitResponse already
   *             wait for messaging channel ready.
   * @return {?Promise}
   */
  whenMessagingReady() {}

  /**
   * Replace the document url with the viewer provided new replaceUrl.
   * @param {?string} newUrl
   */
  replaceUrl(newUrl) {}
}
