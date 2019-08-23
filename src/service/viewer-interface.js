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
export let RequestResponderDef;

/* eslint-disable no-unused-vars */
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
   * @param {string} name
   * @return {?string}
   * @export
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
   * Returns visibility state configured by the viewer.
   * See {@link isVisible}.
   * @return {!../visibility-state.VisibilityState}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  getVisibilityState() {}

  /**
   * Whether the AMP document currently visible. The reasons why it might not
   * be visible include user switching to another tab, browser running the
   * document in the prerender mode or viewer running the document in the
   * prerender mode.
   * @return {boolean}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  isVisible() {}

  /**
   * Whether the AMP document has been ever visible before. Since the visiblity
   * state of a document can be flipped back and forth we sometimes want to know
   * if a document has ever been visible.
   * @return {boolean}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  hasBeenVisible() {}

  /**
   * Returns a Promise that only ever resolved when the current
   * AMP document first becomes visible.
   * @return {!Promise}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  whenFirstVisible() {}

  /**
   * Returns a Promise that resolve when current doc becomes visible.
   * The promise resolves immediately if doc is already visible.
   * @return {!Promise}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  whenNextVisible() {}

  /**
   * Returns the time when the document has become visible for the first time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  getFirstVisibleTime() {}

  /**
   * Returns the time when the document has become visible for the last time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  getLastVisibleTime() {}

  /**
   * How much the viewer has requested the runtime to prerender the document.
   * The values are in number of screens.
   * @return {number}
   */
  getPrerenderSize() {}

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
   * Whether the viewer has been whitelisted for more sensitive operations
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
   * Adds a "visibilitychange" event listener for viewer events. The
   * callback can check {@link isVisible} and {@link getPrefetchCount}
   * methods for more info.
   * @param {function()} handler
   * @return {!UnlistenDef}
   * TODO(#22733): deprecate/remove when ampdoc-fie is launched.
   */
  onVisibilityChanged(handler) {}

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
   * @export
   */
  receiveMessage(eventType, data, unusedAwaitResponse) {}

  /**
   * Provides a message delivery mechanism by which AMP document can send
   * messages to the viewer.
   * @param {function(string, (?JsonObject|string|undefined), boolean):
   *     (!Promise<*>|undefined)} deliverer
   * @param {string} origin
   * @export
   */
  setMessageDeliverer(deliverer, origin) {}

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
/* eslint-enable no-unused-vars */
