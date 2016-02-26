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

import {Observable} from '../observable';
import {assert} from '../asserts';
import {documentStateFor} from '../document-state';
import {getMode} from '../mode';
import {getService} from '../service';
import {log} from '../log';
import {parseQueryString, parseUrl, removeFragment} from '../url';
import {platform} from '../platform';
import {timer} from '../timer';
import {reportError} from '../error';


const TAG_ = 'Viewer';
const SENTINEL_ = '__AMP__';

/**
 * Duration in milliseconds to wait for viewerOrigin to be set before an empty
 * string is returned.
 * @const
 * @private {number}
 */
const VIEWER_ORIGIN_TIMEOUT_ = 1000;

/**
 * The type of the viewport.
 * @enum {string}
 */
export const ViewportType = {

  /**
   * Viewer leaves sizing and scrolling up to the AMP document's window.
   */
  NATURAL: 'natural',

  /**
   * Viewer sets and updates sizing and scrolling.
   */
  VIRTUAL: 'virtual',

  /**
   * This is AMP-specific type and doesn't come from viewer. This is the type
   * that AMP sets when Viewer has requested "natural" viewport on a iOS
   * device.
   * See:
   * https://github.com/ampproject/amphtml/blob/master/spec/amp-html-layout.md
   * and {@link ViewportBindingNaturalIosEmbed_} for more details.
   */
  NATURAL_IOS_EMBED: 'natural-ios-embed'
};


/**
 * Visibility state of the AMP document.
 * @enum {string}
 * @private
 */
export const VisibilityState = {

  /**
   * Viewer has shown the AMP document.
   */
  VISIBLE: 'visible',

  /**
   * Viewer has indicated that AMP document is hidden.
   */
  HIDDEN: 'hidden'
};


/**
 * These domains are trusted with more sensitive viewer operations such as
 * propagating the referrer. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
 *
 * @export {!Array<!RegExp>}
 */
export const TRUSTED_VIEWER_HOSTS = [
  /^(.*\.)?(google)(\.com?)?(\.[a-z]{2})?$/
];


/**
 * An AMP representation of the Viewer. This class doesn't do any work itself
 * but instead delegates everything to the actual viewer. This class and the
 * actual Viewer are connected via "AMP.viewer" using three methods:
 * {@link getParam}, {@link receiveMessage} and {@link setMessageDeliverer}.
 */
export class Viewer {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {boolean} */
    this.isEmbedded_ = (this.win.parent && this.win.parent != this.win);

    /** @const {!DocumentState} */
    this.docState_ = documentStateFor(this.win);

    /** @private {boolean} */
    this.isRuntimeOn_ = true;

    /** @private {boolean} */
    this.overtakeHistory_ = false;

    /** @private {string} */
    this.visibilityState_ = VisibilityState.VISIBLE;

    /** @private {number} */
    this.prerenderSize_ = 1;

    /** @private {string} */
    this.viewportType_ = ViewportType.NATURAL;

    /** @private {number} */
    this.viewportWidth_ = 0;

    /** @private {number} */
    this.viewportHeight_ = 0;

    /** @private {number} */
    this./*OK*/scrollTop_ = 0;

    /** @private {number} */
    this.paddingTop_ = 0;

    /** @private {!Observable<boolean>} */
    this.runtimeOnObservable_ = new Observable();

    /** @private {!Observable} */
    this.visibilityObservable_ = new Observable();

    /** @private {!Observable} */
    this.viewportObservable_ = new Observable();

    /** @private {!Observable<!ViewerHistoryPoppedEventDef>} */
    this.historyPoppedObservable_ = new Observable();

    /** @private {!Observable<!JSONObject>} */
    this.broadcastObservable_ = new Observable();

    /** @private {?function(string, *, boolean):(Promise<*>|undefined)} */
    this.messageDeliverer_ = null;

    /** @private {?string} */
    this.messagingOrigin_ = null;

    /** @private {!Array<!{eventType: string, data: *}>} */
    this.messageQueue_ = [];

    /** @const @private {!Object<string, string>} */
    this.params_ = {};

    /** @private {?function()} */
    this.whenFirstVisibleResolve_ = null;

    /**
     * This promise might be resolved right away if the current
     * document is already visible. See end of this constructor where we call
     * `this.onVisibilityChange_()`.
     * @private @const {!Promise}
     */
    this.whenFirstVisiblePromise_ = new Promise(resolve => {
      this.whenFirstVisibleResolve_ = resolve;
    });

    // Params can be passed either via iframe name or via hash. Hash currently
    // has precedence.
    if (this.win.name && this.win.name.indexOf(SENTINEL_) == 0) {
      parseParams_(this.win.name.substring(SENTINEL_.length), this.params_);
    }
    if (this.win.location.hash) {
      parseParams_(this.win.location.hash, this.params_);
    }

    log.fine(TAG_, 'Viewer params:', this.params_);

    this.isRuntimeOn_ = !parseInt(this.params_['off'], 10);
    log.fine(TAG_, '- runtimeOn:', this.isRuntimeOn_);

    this.overtakeHistory_ = parseInt(this.params_['history'], 10) ||
        this.overtakeHistory_;
    log.fine(TAG_, '- history:', this.overtakeHistory_);

    this.visibilityState_ = this.params_['visibilityState'] ||
        this.visibilityState_;
    log.fine(TAG_, '- visibilityState:', this.visibilityState_);

    this.prerenderSize_ = parseInt(this.params_['prerenderSize'], 10) ||
        this.prerenderSize_;
    log.fine(TAG_, '- prerenderSize:', this.prerenderSize_);

    this.viewportType_ = this.params_['viewportType'] || this.viewportType_;
    // Configure scrolling parameters when AMP is embeded in a viewer on iOS.
    if (this.viewportType_ == ViewportType.NATURAL && this.isEmbedded_ &&
            platform.isIos()) {
      this.viewportType_ = ViewportType.NATURAL_IOS_EMBED;
    }
    // Enable iOS Embedded mode so that it's easy to test against a more
    // realistic iOS environment.
    if (platform.isIos() &&
            this.viewportType_ != ViewportType.NATURAL_IOS_EMBED &&
            (getMode().localDev || getMode().development)) {
      this.viewportType_ = ViewportType.NATURAL_IOS_EMBED;
    }
    log.fine(TAG_, '- viewportType:', this.viewportType_);

    this.viewportWidth_ = parseInt(this.params_['width'], 10) ||
        this.viewportWidth_;
    log.fine(TAG_, '- viewportWidth:', this.viewportWidth_);

    this.viewportHeight_ = parseInt(this.params_['height'], 10) ||
        this.viewportHeight_;
    log.fine(TAG_, '- viewportHeight:', this.viewportHeight_);

    this./*OK*/scrollTop_ = parseInt(this.params_['scrollTop'], 10) ||
        this./*OK*/scrollTop_;
    log.fine(TAG_, '- scrollTop:', this./*OK*/scrollTop_);

    this.paddingTop_ = parseInt(this.params_['paddingTop'], 10) ||
        this.paddingTop_;
    log.fine(TAG_, '- padding-top:', this.paddingTop_);

    /** @private @const {boolean} */
    this.performanceTracking_ = this.params_['csi'] === '1';
    log.fine(TAG_, '- performanceTracking:', this.performanceTracking_);

    /** @private {boolean} */
    this.hasBeenVisible_ = this.isVisible();

    // Wait for document to become visible.
    this.docState_.onVisibilityChanged(this.onVisibilityChange_.bind(this));


    /**
     * Creates an error for the case where a channel cannot be established.
     * @param {!Error|undefined} reason
     * @return {!Error}
     */
    function getChannelError(reason) {
      if (reason instanceof Error) {
        reason.message = 'No messaging channel: ' + reason.message;
        return reason;
      }
      return new Error('No messaging channel: ' + reason);
    }

    /**
     * This promise will resolve when communications channel has been
     * established or timeout in 5 seconds. The timeout is needed to avoid
     * this promise becoming a memory leak with accumulating undelivered
     * messages.
     * @private @const {!Promise<!Viewer>}
     */
    this.messagingReadyPromise_ = timer.timeoutPromise(
        20000,
        new Promise(resolve => {
          /** @private @const {function(!Viewer)} */
          this.messagingReadyResolver_ = resolve;
        })).catch(reason => {
          throw getChannelError(reason);
        });

    /**
     * A promise for non-essential messages. These messages should not fail
     * if there's no messaging channel set up. But ideally viewer would try to
     * deliver if at all possible.
     * @private @const {!Promise<!Viewer>}
     */
    this.messagingMaybePromise_ = this.messagingReadyPromise_.catch(reason => {
      if (this.isEmbedded_) {
        // Don't fail promise, but still report.
        reportError(getChannelError(reason));
      }
    });

    // Trusted viewer and referrer.
    let trustedViewerResolved;
    let trustedViewerPromise;
    if (!this.isEmbedded_) {
      // Not embedded in IFrame - can't trust the viewer.
      trustedViewerResolved = false;
      trustedViewerPromise = Promise.resolve(false);
    } else if (this.win.location.ancestorOrigins) {
      // Ancestors when available take precedence. This is the main API used
      // for this determination. Fallback is only done when this API is not
      // supported by the browser.
      trustedViewerResolved = (this.win.location.ancestorOrigins.length > 0 &&
          this.isTrustedViewerOrigin_(this.win.location.ancestorOrigins[0]));
      trustedViewerPromise = Promise.resolve(trustedViewerResolved);
    } else {
      // Wait for comms channel to confirm the origin.
      trustedViewerResolved = undefined;
      trustedViewerPromise = new Promise(resolve => {
        /** @const @private {!function(boolean)|undefined} */
        this.trustedViewerResolver_ = resolve;
      });
    }

    /** @const @private {!Promise<boolean>} */
    this.isTrustedViewer_ = trustedViewerPromise;

    /** @const @private {!Promise<string>} */
    this.viewerOrigin_ = new Promise(resolve => {
      if (!this.isEmbedded()) {
        // Viewer is only determined for iframed documents at this time.
        resolve('');
      } else if (this.win.location.ancestorOrigins &&
          this.win.location.ancestorOrigins.length > 0) {
        resolve(this.win.location.ancestorOrigins[0]);
      } else {
        // Race to resolve with a timer.
        timer.delay(() => resolve(''), VIEWER_ORIGIN_TIMEOUT_);
        /** @private @const {!function(string)|undefined} */
        this.viewerOriginResolver_ = resolve;
      }
    });

    /** @private {string} */
    this.unconfirmedReferrerUrl_ =
        this.isEmbedded() && 'referrer' in this.params_ &&
            trustedViewerResolved !== false ?
        this.params_['referrer'] :
        this.win.document.referrer;

    /** @const @private {!Promise<string>} */
    this.referrerUrl_ = new Promise(resolve => {
      if (this.isEmbedded() && 'referrer' in this.params_) {
        // Viewer override, but only for whitelisted viewers. Only allowed for
        // iframed documents.
        this.isTrustedViewer_.then(isTrusted => {
          if (isTrusted) {
            resolve(this.params_['referrer']);
          } else {
            resolve(this.win.document.referrer);
            if (this.unconfirmedReferrerUrl_ != this.win.document.referrer) {
              this.win.setTimeout(() => {
                throw new Error('Untrusted viewer referrer override: ' +
                    this.unconfirmedReferrerUrl_ + ' at ' +
                    this.messagingOrigin_);
              });
              this.unconfirmedReferrerUrl_ = this.win.document.referrer;
            }
          }
        });
      } else {
        resolve(this.win.document.referrer);
      }
    });

    // Remove hash - no reason to keep it around, but only when embedded.
    if (this.isEmbedded_) {
      const newUrl = removeFragment(this.win.location.href);
      if (newUrl != this.win.location.href && this.win.history.replaceState) {
        // Persist the hash that we removed has location.originalHash.
        // This is currently used my mode.js to infer development mode.
        this.win.location.originalHash = this.win.location.hash;
        this.win.history.replaceState({}, '', newUrl);
        log.fine(TAG_, 'replace url:' + this.win.location.href);
      }
    }

    // Check if by the time the `Viewer`
    // instance is constructed, the document is already `visible`.
    this.onVisibilityChange_();
  }

  /**
   * Handler for visibility change.
   * @private
   */
  onVisibilityChange_() {
    if (this.isVisible()) {
      this.hasBeenVisible_ = true;
      this.whenFirstVisibleResolve_();
    }
    this.visibilityObservable_.fire();
  }

  /**
   * Returns the value of a viewer's startup parameter with the specified
   * name or "undefined" if the parameter wasn't defined at startup time.
   * @param {string} name
   * @return {string|undefined}
   * @export
   */
  getParam(name) {
    return this.params_[name];
  }

  /**
   * Whether the document is embedded in a iframe.
   * @return {boolean}
   */
  isEmbedded() {
    return this.isEmbedded_;
  }

  /**
   * @return {boolean}
   */
  isRuntimeOn() {
    return this.isRuntimeOn_;
  }

  /**
   * Identifies if the viewer is recording instrumentation.
   * @return {boolean}
   */
  isPerformanceTrackingOn() {
    return this.performanceTracking_;
  }

  /**
   */
  toggleRuntime() {
    this.isRuntimeOn_ = !this.isRuntimeOn_;
    log.fine(TAG_, 'Runtime state:', this.isRuntimeOn_);
    this.runtimeOnObservable_.fire(this.isRuntimeOn_);
  }

  /**
   * @param {function(boolean)} handler
   * @return {!Unlisten}
   */
  onRuntimeState(handler) {
    return this.runtimeOnObservable_.add(handler);
  }

  /**
   * Whether the viewer overtakes the history for AMP document. If yes,
   * the viewer must implement history messages "pushHistory" and "popHistory"
   * and emit message "historyPopped"
   * @return {boolean}
   */
  isOvertakeHistory() {
    return this.overtakeHistory_;
  }

  /**
   * Returns visibility state configured by the viewer.
   * See {@link isVisible}.
   * @return {!VisibilityState}
   */
  getVisibilityState() {
    return this.visibilityState_;
  }

  /**
   * Whether the AMP document currently visible. The reasons why it might not
   * be visible include user switching to another tab, browser running the
   * document in the prerender mode or viewer running the document in the
   * prerender mode.
   * @return {boolean}
   */
  isVisible() {
    return this.visibilityState_ == VisibilityState.VISIBLE &&
        !this.docState_.isHidden();
  }

  /**
   * Whether the AMP document has been ever visible before. Since the visiblity
   * state of a document can be flipped back and forth we sometimes want to know
   * if a document has ever been visible.
   * @return {boolean}
   */
  hasBeenVisible() {
    return this.hasBeenVisible_;
  }

 /**
  * Returns a Promise that only ever resolved when the current
  * AMP document becomes visible.
  * @return {!Promise}
  */
  whenFirstVisible() {
    return this.whenFirstVisiblePromise_;
  }

  /**
   * How much the viewer has requested the runtime to prerender the document.
   * The values are in number of screens.
   * @return {number}
   */
  getPrerenderSize() {
    return this.prerenderSize_;
  }

  /**
   * There are two types of viewports: "natural" and "virtual". "Natural" is
   * the viewport of the AMP document's window. "Virtual" is the viewport
   * provided by the viewer.
   * See {@link Viewport} and {@link ViewportBinding} for more details.
   * @return {!ViewportType}
   */
  getViewportType() {
    return this.viewportType_;
  }

  /**
   * Returns the width of the viewport provided by the viewer. This value only
   * used when viewport type is "virtual."
   * @return {number}
   */
  getViewportWidth() {
    return this.viewportWidth_;
  }

  /**
   * Returns the height of the viewport provided by the viewer. This value only
   * used when viewport type is "virtual."
   * @return {number}
   */
  getViewportHeight() {
    return this.viewportHeight_;
  }

  /**
   * Returns the scroll position of the viewport provided by the viewer. This
   * value only used when viewport type is "virtual."
   * @return {number}
   */
  getScrollTop() {
    return this./*OK*/scrollTop_;
  }

  /**
   * Returns the top padding requested by the viewer.
   * @return {number}
   */
  getPaddingTop() {
    return this.paddingTop_;
  }

  /**
   * Returns an unconfirmed "referrer" URL that can be optionally customized by
   * the viewer. Consider using `getReferrerUrl()` instead, which returns the
   * promise that will yield the confirmed "referrer" URL.
   * @return {string}
   */
  getUnconfirmedReferrerUrl() {
    return this.unconfirmedReferrerUrl_;
  }

  /**
   * Returns the promise that will yield the confirmed "referrer" URL. This
   * URL can be optionally customized by the viewer, but viewer is required
   * to be a trusted viewer.
   * @return {!Promise<string>}
   */
  getReferrerUrl() {
    return this.referrerUrl_;
  }

  /**
   * Whether the viewer has been whitelisted for more sensitive operations
   * such as customizing referrer.
   * @return {boolean}
   */
  isTrustedViewer() {
    return this.isTrustedViewer_;
  }

  /**
   * Returns the promise that resolves to URL representing the origin of the
   * viewer. If the document is not embedded or if a viewer origin can't be
   * found, empty string is returned.
   * @return {!Promise<string>}
   */
  getViewerOrigin() {
    return this.viewerOrigin_;
  }

  /**
   * @param {string} urlString
   * @return {boolean}
   * @private
   */
  isTrustedViewerOrigin_(urlString) {
    const url = parseUrl(urlString);
    if (url.protocol != 'https:') {
      // Non-https origins are never trusted.
      return false;
    }
    return TRUSTED_VIEWER_HOSTS.some(th => th.test(url.hostname));
  }

  /**
   * Adds a "visibilitychange" event listener for viewer events. The
   * callback can check {@link isVisible} and {@link getPrefetchCount}
   * methods for more info.
   * @param {function()} handler
   * @return {!Unlisten}
   */
  onVisibilityChanged(handler) {
    return this.visibilityObservable_.add(handler);
  }

  /**
   * Adds a "viewport" event listener for viewer events.
   * @param {function()} handler
   * @return {!Unlisten}
   */
  onViewportEvent(handler) {
    return this.viewportObservable_.add(handler);
  }

  /**
   * Adds a "history popped" event listener for viewer events.
   * @param {function(ViewerHistoryPoppedEventDef)} handler
   * @return {!Unlisten}
   */
  onHistoryPoppedEvent(handler) {
    return this.historyPoppedObservable_.add(handler);
  }

  /**
   * Triggers "documentLoaded" event for the viewer.
   * @param {number} width
   * @param {number} height
   */
  postDocumentReady(width, height) {
    this.sendMessageUnreliable_('documentLoaded', {
      width: width,
      height: height,
      title: this.win.document.title,
    }, false);
  }

  /**
   * Triggers "documentResized" event for the viewer.
   * @param {number} width
   * @param {number} height
   */
  postDocumentResized(width, height) {
    this.sendMessageUnreliable_(
        'documentResized', {width: width, height: height}, false);
  }

  /**
   * Requests full overlay mode from the viewer. Returns a promise that yields
   * when the viewer has switched to full overlay mode.
   * @return {!Promise}
   */
  requestFullOverlay() {
    return this.sendMessageUnreliable_('requestFullOverlay', {}, true);
  }

  /**
   * Requests to cancel full overlay mode from the viewer. Returns a promise
   * that yields when the viewer has switched off full overlay mode.
   * @return {!Promise}
   */
  cancelFullOverlay() {
    return this.sendMessageUnreliable_('cancelFullOverlay', {}, true);
  }

  /**
   * Triggers "pushHistory" event for the viewer.
   * @param {number} stackIndex
   * @return {!Promise}
   */
  postPushHistory(stackIndex) {
    return this.sendMessageUnreliable_(
        'pushHistory', {stackIndex: stackIndex}, true);
  }

  /**
   * Triggers "popHistory" event for the viewer.
   * @param {number} stackIndex
   * @return {!Promise}
   */
  postPopHistory(stackIndex) {
    return this.sendMessageUnreliable_(
        'popHistory', {stackIndex: stackIndex}, true);
  }

  /**
   * Retrieves the Base CID from the viewer
   * @return {!Promise<string>}
   */
  getBaseCid() {
    return this.sendMessage('cid', undefined, true);
  }

  /**
   * Triggers "tick" event for the viewer.
   * @param {!JSONObject} message
   */
  tick(message) {
    this.sendMessageUnreliable_('tick', message, false);
  }

  /**
   * Triggers "sendCsi" event for the viewer.
   */
  flushTicks() {
    this.sendMessageUnreliable_('sendCsi', undefined, false);
  }

  /**
   * Triggers "setFlushParams" event for the viewer.
   * @param {!JSONObject} message
   */
  setFlushParams(message) {
    this.sendMessageUnreliable_('setFlushParams', message, false);
  }

  /**
   * Requests AMP document to receive a message from Viewer.
   * @param {string} eventType
   * @param {*} data
   * @param {boolean} unusedAwaitResponse
   * @return {(!Promise<*>|undefined)}
   * @export
   */
  receiveMessage(eventType, data, unusedAwaitResponse) {
    if (eventType == 'viewport') {
      if (data['width'] !== undefined) {
        this.viewportWidth_ = data['width'];
      }
      if (data['height'] !== undefined) {
        this.viewportHeight_ = data['height'];
      }
      if (data['paddingTop'] !== undefined) {
        this.paddingTop_ = data['paddingTop'];
      }
      if (data['scrollTop'] !== undefined) {
        this./*OK*/scrollTop_ = data['scrollTop'];
      }
      this.viewportObservable_.fire();
      return undefined;
    }
    if (eventType == 'historyPopped') {
      this.historyPoppedObservable_.fire({
        newStackIndex: data['newStackIndex']
      });
      return Promise.resolve();
    }
    if (eventType == 'visibilitychange') {
      if (data['state'] !== undefined) {
        this.visibilityState_ = data['state'];
      }
      if (data['prerenderSize'] !== undefined) {
        this.prerenderSize_ = data['prerenderSize'];
      }
      log.fine(TAG_, 'visibilitychange event:', this.visibilityState_,
          this.prerenderSize_);
      this.onVisibilityChange_();
      return Promise.resolve();
    }
    if (eventType == 'broadcast') {
      this.broadcastObservable_.fire(data);
      return Promise.resolve();
    }
    log.fine(TAG_, 'unknown message:', eventType);
    return undefined;
  }

  /**
   * Provides a message delivery mechanism by which AMP document can send
   * messages to the viewer.
   * @param {function(string, *, boolean):(!Promise<*>|undefined)} deliverer
   * @param {string} origin
   * @export
   */
  setMessageDeliverer(deliverer, origin) {
    assert(!this.messageDeliverer_, 'message deliverer can only be set once');
    log.fine(TAG_, 'message channel established with origin: ', origin);
    this.messageDeliverer_ = deliverer;
    this.messagingReadyResolver_(this);
    // TODO(dvoytenko, #1764): Make `origin` required when viewers catch up.
    this.messagingOrigin_ = origin;
    if (this.trustedViewerResolver_) {
      this.trustedViewerResolver_(
          origin ? this.isTrustedViewerOrigin_(origin) : false);
    }
    if (this.viewerOriginResolver_) {
      this.viewerOriginResolver_(origin || '');
    }

    if (this.messageQueue_.length > 0) {
      const queue = this.messageQueue_.slice(0);
      this.messageQueue_ = [];
      queue.forEach(message => {
        this.messageDeliverer_(message.eventType, message.data, false);
      });
    }
  }

  /**
   * Sends the message to the viewer. This method will wait for the messaging
   * channel to be established. If the messaging channel times out, the
   * promise will fail.
   *
   * This is a restricted API.
   *
   * @param {string} eventType
   * @param {*} data
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   */
  sendMessage(eventType, data, awaitResponse) {
    return this.messagingReadyPromise_.then(() => {
      return this.sendMessageUnreliable_(eventType, data, awaitResponse);
    });
  }

  /**
   * Broadcasts a message to all other AMP documents under the same viewer. It
   * will attempt to deliver messages when the messaging channel has been
   * established, but it will not fail if the channel is timed out.
   *
   * @param {!JSONObject} message
   */
  broadcast(message) {
    this.maybeSendMessage_('broadcast', message);
  }

  /**
   * Registers receiver for the broadcast events.
   * @param {function(!JSONObject)} handler
   * @return {!Unlisten}
   */
  onBroadcast(handler) {
    return this.broadcastObservable_.add(handler);
  }

  /**
   * This message queues up the message to be sent when communication channel
   * is established. If the communication channel is not established at
   * this time, this method responds immediately with a Promise that yields
   * `undefined` value.
   * @param {string} eventType
   * @param {*} data
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   * @private
   */
  sendMessageUnreliable_(eventType, data, awaitResponse) {
    if (this.messageDeliverer_) {
      return this.messageDeliverer_(eventType, data, awaitResponse);
    }

    // Store only a last version for an event type.
    let found = null;
    for (let i = 0; i < this.messageQueue_.length; i++) {
      if (this.messageQueue_[i].eventType == eventType) {
        found = this.messageQueue_[i];
        break;
      }
    }
    if (found) {
      found.data = data;
    } else {
      this.messageQueue_.push({eventType: eventType, data: data});
    }
    if (awaitResponse) {
      // TODO(dvoytenko): This is somewhat questionable. What do we return
      // when no one is listening?
      return Promise.resolve();
    }
    return undefined;
  }

  /**
   * @param {string} eventType
   * @param {*} data
   * @private
   */
  maybeSendMessage_(eventType, data) {
    this.messagingMaybePromise_.then(() => {
      if (this.messageDeliverer_) {
        this.sendMessageUnreliable_(eventType, data, false);
      }
    });
  }
}


/**
 * Parses the viewer parameters as a string.
 *
 * Visible for testing only.
 *
 * @param {string} str
 * @param {!Object<string, string>} allParams
 * @private
 */
export function parseParams_(str, allParams) {
  const params = parseQueryString(str);
  for (const k in params) {
    allParams[k] = params[k];
  }
}


/**
 * @typedef {{
 *   newStackIndex: number
 * }}
 */
let ViewerHistoryPoppedEventDef;


/**
 * @param {!Window} window
 * @return {!Viewer}
 */
export function installViewerService(window) {
  return getService(window, 'viewer', () => {
    return new Viewer(window);
  });
};
