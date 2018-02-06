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
import {Services} from '../services';
import {VisibilityState} from '../visibility-state';
import {dev, duplicateErrorIfNecessary} from '../log';
import {dict, map} from '../utils/object';
import {findIndex} from '../utils/array';
import {
  getSourceOrigin,
  isProxyOrigin,
  parseQueryString,
  parseUrl,
  removeFragment,
} from '../url';
import {isIframed} from '../dom';
import {registerServiceBuilderForDoc} from '../service';
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
 * These domains are trusted with more sensitive viewer operations such as
 * propagating the referrer. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
 *
 * @export {!Array<!RegExp>}
 */
const TRUSTED_VIEWER_HOSTS = [
  /**
   * Google domains, including country-codes and subdomains:
   * - google.com
   * - www.google.com
   * - google.co
   * - www.google.co
   * - google.az
   * - www.google.az
   * - google.com.az
   * - www.google.com.az
   * - google.co.az
   * - www.google.co.az
   * - google.cat
   * - www.google.cat
   */
  /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/,
];

/**
 * These domains are trusted with more sensitive viewer operations such as
 * sending impression requests. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
 *
 * @export {!Array<!RegExp>}
 */
const TRUSTED_REFERRER_HOSTS = [
  /**
   * Twitter's link wrapper domains:
   * - t.co
   */
  /^t.co$/,
];

/**
 * @typedef {function(*):(!Promise<*>|undefined)}
 */
export let RequestResponder;


/**
 * An AMP representation of the Viewer. This class doesn't do any work itself
 * but instead delegates everything to the actual viewer. This class and the
 * actual Viewer are connected via "AMP.viewer" using three methods:
 * {@link getParam}, {@link receiveMessage} and {@link setMessageDeliverer}.
 * @package Visible for type.
 */
export class Viewer {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Object<string, string>=} opt_initParams
   */
  constructor(ampdoc, opt_initParams) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {boolean} */
    this.isIframed_ = isIframed(this.win);

    /** @const {!./document-state.DocumentState} */
    this.docState_ = Services.documentStateFor(this.win);

    /** @private {boolean} */
    this.isRuntimeOn_ = true;

    /** @private {boolean} */
    this.overtakeHistory_ = false;

    /** @private {!VisibilityState} */
    this.visibilityState_ = VisibilityState.VISIBLE;

    /** @private {string} */
    this.viewerVisibilityState_ = this.visibilityState_;

    /** @private {number} */
    this.prerenderSize_ = 1;

    /** @private {!Object<string, !Observable<!JsonObject>>} */
    this.messageObservables_ = map();

    /** @private {!Object<string, !RequestResponder>} */
    this.messageResponders_ = map();

    /** @private {!Observable<boolean>} */
    this.runtimeOnObservable_ = new Observable();

    /** @private {!Observable} */
    this.visibilityObservable_ = new Observable();

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

    /** @const @private {!Object<string, string>} */
    this.params_ = {};

    /** @private {?function()} */
    this.whenFirstVisibleResolve_ = null;

    /** @private {?Promise} */
    this.nextVisiblePromise_ = null;

    /** @private {?function()} */
    this.nextVisibleResolve_ = null;

    /** @private {?time} */
    this.firstVisibleTime_ = null;

    /** @private {?time} */
    this.lastVisibleTime_ = null;

    /** @private {?Function} */
    this.messagingReadyResolver_ = null;

    /** @private {?Function} */
    this.viewerOriginResolver_ = null;

    /** @private {?Function} */
    this.trustedViewerResolver_ = null;

    /**
     * This promise might be resolved right away if the current
     * document is already visible. See end of this constructor where we call
     * `this.onVisibilityChange_()`.
     * @private @const {!Promise}
     */
    this.whenFirstVisiblePromise_ = new Promise(resolve => {
      this.whenFirstVisibleResolve_ = resolve;
    });

    // Params can be passed either directly in multi-doc environment or via
    // iframe hash/name with hash taking precedence.
    if (opt_initParams) {
      Object.assign(this.params_, opt_initParams);
    } else {
      if (this.win.name && this.win.name.indexOf(SENTINEL_) == 0) {
        parseParams_(this.win.name.substring(SENTINEL_.length), this.params_);
      }
      if (this.win.location.hash) {
        parseParams_(this.win.location.hash, this.params_);
      }
    }

    dev().fine(TAG_, 'Viewer params:', this.params_);

    this.isRuntimeOn_ = !parseInt(this.params_['off'], 10);
    dev().fine(TAG_, '- runtimeOn:', this.isRuntimeOn_);

    this.overtakeHistory_ = !!(parseInt(this.params_['history'], 10) ||
        this.overtakeHistory_);
    dev().fine(TAG_, '- history:', this.overtakeHistory_);

    this.setVisibilityState_(this.params_['visibilityState']);
    dev().fine(TAG_, '- visibilityState:', this.getVisibilityState());

    this.prerenderSize_ = parseInt(this.params_['prerenderSize'], 10) ||
        this.prerenderSize_;
    dev().fine(TAG_, '- prerenderSize:', this.prerenderSize_);

    /**
     * Whether the AMP document is embedded in a webview.
     * @private @const {boolean}
     */
    this.isWebviewEmbedded_ = !this.isIframed_ &&
        this.params_['webview'] == '1';

    /**
     * Whether the AMP document is embedded in a viewer, such as an iframe, or
     * a web view, or a shadow doc in PWA.
     * @private @const {boolean}
     */
    this.isEmbedded_ = !!(
      this.isIframed_ && !this.win.AMP_TEST_IFRAME
        // Checking param "origin", as we expect all viewers to provide it.
        // See https://github.com/ampproject/amphtml/issues/4183
        // There appears to be a bug under investigation where the
        // origin is sometimes failed to be detected. Since failure mode
        // if we fail to initialize communication is very bad, we also check
        // for visibilityState.
        // After https://github.com/ampproject/amphtml/issues/6070
        // is fixed we should probably only keep the amp_js_v check here.
        && (this.params_['origin']
            || this.params_['visibilityState']
            // Parent asked for viewer JS. We must be embedded.
            || (this.win.location.search.indexOf('amp_js_v') != -1))
        || this.isWebviewEmbedded_
        || !ampdoc.isSingleDoc());

    /** @private {boolean} */
    this.hasBeenVisible_ = this.isVisible();

    // Wait for document to become visible.
    this.docState_.onVisibilityChanged(this.recheckVisibilityState_.bind(this));

    /**
     * This promise will resolve when communications channel has been
     * established or timeout in 20 seconds. The timeout is needed to avoid
     * this promise becoming a memory leak with accumulating undelivered
     * messages. The promise is only available when the document is embedded.
     * @private @const {?Promise}
     */
    this.messagingReadyPromise_ = this.isEmbedded_ ?
      Services.timerFor(this.win).timeoutPromise(
          20000,
          new Promise(resolve => {
            this.messagingReadyResolver_ = resolve;
          })).catch(reason => {
        throw getChannelError(/** @type {!Error|string|undefined} */ (
          reason));
      }) : null;

    /**
     * A promise for non-essential messages. These messages should not fail
     * if there's no messaging channel set up. But ideally viewer would try to
     * deliver if at all possible. This promise is only available when the
     * document is embedded.
     * @private @const {?Promise}
     */
    this.messagingMaybePromise_ = this.isEmbedded_ ?
      this.messagingReadyPromise_
          .catch(reason => {
            // Don't fail promise, but still report.
            reportError(getChannelError(
                /** @type {!Error|string|undefined} */ (reason)));
          }) : null;

    // Trusted viewer and referrer.
    let trustedViewerResolved;
    let trustedViewerPromise;
    if (!this.isEmbedded_) {
      // Not embedded in IFrame - can't trust the viewer.
      trustedViewerResolved = false;
      trustedViewerPromise = Promise.resolve(false);
    } else if (this.win.location.ancestorOrigins && !this.isWebviewEmbedded_) {
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
        Services.timerFor(this.win).delay(
            () => resolve(''), VIEWER_ORIGIN_TIMEOUT_);
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
              dev().expectedError(TAG_, 'Untrusted viewer referrer override: ' +
                  this.unconfirmedReferrerUrl_ + ' at ' +
                  this.messagingOrigin_);
              this.unconfirmedReferrerUrl_ = this.win.document.referrer;
            }
          }
        });
      } else {
        resolve(this.win.document.referrer);
      }
    });

    /** @private {string} */
    this.resolvedViewerUrl_ = removeFragment(this.win.location.href || '');

    /** @const @private {!Promise<string>} */
    this.viewerUrl_ = new Promise(resolve => {
      /** @const {string} */
      const viewerUrlOverride = this.params_['viewerUrl'];
      if (this.isEmbedded() && viewerUrlOverride) {
        // Viewer override, but only for whitelisted viewers. Only allowed for
        // iframed documents.
        this.isTrustedViewer_.then(isTrusted => {
          if (isTrusted) {
            this.resolvedViewerUrl_ = viewerUrlOverride;
          } else {
            dev().error(TAG_, 'Untrusted viewer url override: ' +
                viewerUrlOverride + ' at ' +
                this.messagingOrigin_);
          }
          resolve(this.resolvedViewerUrl_);
        });
      } else {
        resolve(this.resolvedViewerUrl_);
      }
    });

    // Remove hash when we have an incoming click tracking string
    // (see impression.js).
    if (this.params_['click']) {
      const newUrl = removeFragment(this.win.location.href);
      if (newUrl != this.win.location.href && this.win.history.replaceState) {
        // Persist the hash that we removed has location.originalHash.
        // This is currently used my mode.js to infer development mode.
        if (!this.win.location.originalHash) {
          this.win.location.originalHash = this.win.location.hash;
        }
        this.win.history.replaceState({}, '', newUrl);
        dev().fine(TAG_, 'replace fragment:' + this.win.location.href);
      }
    }

    // Check if by the time the `Viewer`
    // instance is constructed, the document is already `visible`.
    this.recheckVisibilityState_();
    this.onVisibilityChange_();
  }

  /**
   * Handler for visibility change.
   * @private
   */
  onVisibilityChange_() {
    if (this.isVisible()) {
      const now = Date.now();
      if (!this.firstVisibleTime_) {
        this.firstVisibleTime_ = now;
      }
      this.lastVisibleTime_ = now;
      this.hasBeenVisible_ = true;
      this.whenFirstVisibleResolve_();
      this.whenNextVisibleResolve_();
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
   * Viewers can communicate their "capabilities" and this method allows
   * checking them.
   * @param {string} name Of the capability.
   * @return {boolean}
   */
  hasCapability(name) {
    const capabilities = this.params_['cap'];
    if (!capabilities) {
      return false;
    }
    // TODO(@cramforce): Consider caching the split.
    return capabilities.split(',').indexOf(name) != -1;
  }

  /**
   * Requests A2A navigation to the given destination. If the viewer does
   * not support this operation, does nothing.
   * The URL is assumed to be in AMP Cache format already.
   * @param {string} url An AMP article URL.
   * @param {string} requestedBy Informational string about the entity that
   *     requested the navigation.
   * @return {boolean} Returns true if navigation message was sent to viewer.
   *     Otherwise, returns false.
   */
  navigateToAmpUrl(url, requestedBy) {
    if (this.hasCapability('a2a')) {
      this.sendMessage('a2a', dict({
        'url': url,
        'requestedBy': requestedBy,
      }));
      return true;
    }
    return false;
  }

  /**
   * Whether the document is embedded in a viewer.
   * @return {boolean}
   */
  isEmbedded() {
    return this.isEmbedded_;
  }

  /**
   * Whether the document is embedded in a webview.
   * @return {boolean}
   */
  isWebviewEmbedded() {
    return this.isWebviewEmbedded_;
  }

  /**
   * @return {boolean}
   */
  isRuntimeOn() {
    return this.isRuntimeOn_;
  }

  /**
   */
  toggleRuntime() {
    this.isRuntimeOn_ = !this.isRuntimeOn_;
    dev().fine(TAG_, 'Runtime state:', this.isRuntimeOn_);
    this.runtimeOnObservable_.fire(this.isRuntimeOn_);
  }

  /**
   * @param {function(boolean)} handler
   * @return {!UnlistenDef}
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
   * TODO(dvoytenko, #5285): Move public API to AmpDoc.
   */
  getVisibilityState() {
    return this.visibilityState_;
  }

  /** @private */
  recheckVisibilityState_() {
    this.setVisibilityState_(this.viewerVisibilityState_);
  }

  /**
   * Sets the viewer defined visibility state.
   * @param {string|undefined} state
   * @private
   */
  setVisibilityState_(state) {
    if (!state) {
      return;
    }
    const oldState = this.visibilityState_;
    state = dev().assertEnumValue(VisibilityState, state, 'VisibilityState');

    // The viewer is informing us we are not currently active because we are
    // being pre-rendered, or the user swiped to another doc (or closed the
    // viewer). Unfortunately, the viewer sends HIDDEN instead of PRERENDER or
    // INACTIVE, though we know better.
    if (state === VisibilityState.HIDDEN) {
      state = this.hasBeenVisible_ ?
        VisibilityState.INACTIVE :
        VisibilityState.PRERENDER;
    }

    this.viewerVisibilityState_ = state;

    if (this.docState_.isHidden() &&
        (state === VisibilityState.VISIBLE ||
         state === VisibilityState.PAUSED)) {
      state = VisibilityState.HIDDEN;
    }

    this.visibilityState_ = state;

    dev().fine(TAG_, 'visibilitychange event:', this.getVisibilityState());

    if (oldState !== state) {
      this.onVisibilityChange_();
    }
  }

  /**
   * Whether the AMP document currently visible. The reasons why it might not
   * be visible include user switching to another tab, browser running the
   * document in the prerender mode or viewer running the document in the
   * prerender mode.
   * @return {boolean}
   */
  isVisible() {
    return this.getVisibilityState() == VisibilityState.VISIBLE;
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
   * AMP document first becomes visible.
   * @return {!Promise}
   */
  whenFirstVisible() {
    return this.whenFirstVisiblePromise_;
  }

  /**
   * Returns a Promise that resolve when current doc becomes visible.
   * The promise resolves immediately if doc is already visible.
   * @return {!Promise}
   */
  whenNextVisible() {
    if (this.isVisible()) {
      return Promise.resolve();
    }

    if (this.nextVisiblePromise_) {
      return this.nextVisiblePromise_;
    }

    return this.nextVisiblePromise_ = new Promise(resolve => {
      this.nextVisibleResolve_ = resolve;
    });
  }

  /**
   * Helper method to be called on visiblity change
   * @private
   */
  whenNextVisibleResolve_() {
    if (this.nextVisibleResolve_) {
      this.nextVisibleResolve_();
      this.nextVisibleResolve_ = null;
      this.nextVisiblePromise_ = null;
    }
  }

  /**
   * Returns the time when the document has become visible for the first time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   */
  getFirstVisibleTime() {
    return this.firstVisibleTime_;
  }

  /**
   * Returns the time when the document has become visible for the last time.
   * If document has not yet become visible, the returned value is `null`.
   * @return {?time}
   */
  getLastVisibleTime() {
    return this.lastVisibleTime_;
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
   * Returns the resolved viewer URL value. It's by default the current page's
   * URL. The trusted viewers are allowed to override this value.
   * @return {string}
   */
  getResolvedViewerUrl() {
    return this.resolvedViewerUrl_;
  }

  /**
   * Returns the promise that will yield the viewer URL value. It's by default
   * the current page's URL. The trusted viewers are allowed to override this
   * value.
   * @return {!Promise<string>}
   */
  getViewerUrl() {
    return this.viewerUrl_;
  }

  /**
   * Possibly return the messaging origin if set. This would be the origin
   * of the parent viewer.
   * @return {?string}
   */
  maybeGetMessagingOrigin() {
    return this.messagingOrigin_;
  }

  /**
   * @param {string} referrer
   * @return {boolean}
   * @private
   */
  isTrustedReferrer_(referrer) {
    const url = parseUrl(referrer);
    if (url.protocol != 'https:') {
      return false;
    }
    return TRUSTED_REFERRER_HOSTS.some(th => th.test(url.hostname));
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
   * @return {!Promise<boolean>}
   */
  isTrustedViewer() {
    return this.isTrustedViewer_;
  }

  /**
   * Whether the referrer has been whitelisted for CORS impression
   * @return {!Promise<boolean>}
   */
  isTrustedReferrer() {
    return this.referrerUrl_.then(referrer => {
      return this.isTrustedReferrer_(referrer);
    });
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
    // TEMPORARY HACK due to a misbehaving native app. See b/32626673
    // In native apps all security bets are off anyway, and in browser
    // origins never take the form that is matched here.
    if (this.isWebviewEmbedded_ && /^www\.[.a-z]+$/.test(urlString)) {
      return TRUSTED_VIEWER_HOSTS.some(th => th.test(urlString));
    }
    /** @const {!Location} */
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
   * @return {!UnlistenDef}
   */
  onVisibilityChanged(handler) {
    return this.visibilityObservable_.add(handler);
  }

  /**
   * Adds a eventType listener for viewer events.
   * @param {string} eventType
   * @param {function(!JsonObject)} handler
   * @return {!UnlistenDef}
   */
  onMessage(eventType, handler) {
    let observable = this.messageObservables_[eventType];
    if (!observable) {
      observable = new Observable();
      this.messageObservables_[eventType] = observable;
    }
    return observable.add(handler);
  }

  /**
   * Adds a eventType listener for viewer events.
   * @param {string} eventType
   * @param {!RequestResponder} responder
   * @return {!UnlistenDef}
   */
  onMessageRespond(eventType, responder) {
    this.messageResponders_[eventType] = responder;
    return () => {
      if (this.messageResponders_[eventType] === responder) {
        delete this.messageResponders_[eventType];
      }
    };
  }

  /**
   * Requests AMP document to receive a message from Viewer.
   * @param {string} eventType
   * @param {!JsonObject} data
   * @param {boolean} unusedAwaitResponse
   * @return {(!Promise<*>|undefined)}
   * @export
   */
  receiveMessage(eventType, data, unusedAwaitResponse) {
    if (eventType == 'visibilitychange') {
      if (data['prerenderSize'] !== undefined) {
        this.prerenderSize_ = data['prerenderSize'];
        dev().fine(TAG_, '- prerenderSize change:', this.prerenderSize_);
      }
      this.setVisibilityState_(data['state']);
      return Promise.resolve();
    }
    if (eventType == 'broadcast') {
      this.broadcastObservable_.fire(
          /** @type {!JsonObject|undefined} */ (data));
      return Promise.resolve();
    }
    const observable = this.messageObservables_[eventType];
    if (observable) {
      observable.fire(data);
    }
    const responder = this.messageResponders_[eventType];
    if (responder) {
      return responder(data);
    } else if (observable) {
      return Promise.resolve();
    }
    dev().fine(TAG_, 'unknown message:', eventType);
    return undefined;
  }

  /**
   * Provides a message delivery mechanism by which AMP document can send
   * messages to the viewer.
   * @param {function(string, (?JsonObject|string|undefined), boolean):
   *     (!Promise<*>|undefined)} deliverer
   * @param {string} origin
   * @export
   */
  setMessageDeliverer(deliverer, origin) {
    if (this.messageDeliverer_) {
      throw new Error('message channel can only be initialized once');
    }
    if (origin == null) {
      throw new Error('message channel must have an origin');
    }
    dev().fine(TAG_, 'message channel established with origin: ', origin);
    this.messageDeliverer_ = deliverer;
    this.messagingOrigin_ = origin;
    if (this.messagingReadyResolver_) {
      this.messagingReadyResolver_();
    }
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
        const responsePromise = this.messageDeliverer_(
            message.eventType,
            message.data,
            message.awaitResponse);

        if (message.awaitResponse) {
          message.responseResolver(responsePromise);
        }
      });
    }
  }

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
  sendMessage(eventType, data, cancelUnsent = false) {
    this.sendMessageInternal_(eventType, data, cancelUnsent, false);
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
  sendMessageAwaitResponse(eventType, data, cancelUnsent = false) {
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
  sendMessageInternal_(eventType, data, cancelUnsent, awaitResponse) {
    if (this.messageDeliverer_) {
      // Certain message deliverers return fake "Promise" instances called
      // "Thenables". Convert from these values into trusted Promise instances,
      // assimilating with the resolved (or rejected) internal value.
      return /** @type {!Promise<?JsonObject|string|undefined>} */ (
        Promise.resolve(this.messageDeliverer_(
            eventType,
            /** @type {?JsonObject|string|undefined} */ (data),
            awaitResponse)));
    }

    if (!this.messagingReadyPromise_) {
      if (awaitResponse) {
        return Promise.reject(getChannelError());
      } else {
        return Promise.resolve();
      }
    }

    if (!cancelUnsent) {
      return this.messagingReadyPromise_.then(() => {
        return this.messageDeliverer_(eventType, data, awaitResponse);
      });
    }

    const found = findIndex(this.messageQueue_,
        m => m.eventType == eventType);

    let message;
    if (found != -1) {
      message = this.messageQueue_.splice(found, 1)[0];
      message.data = data;
      message.awaitResponse = message.awaitResponse || awaitResponse;
    } else {
      let responseResolver;
      const responsePromise = new Promise(r => {
        responseResolver = r;
      });
      message = {
        eventType,
        data,
        awaitResponse,
        responsePromise,
        responseResolver,
      };
    }
    this.messageQueue_.push(message);
    return message.responsePromise;
  }

  /**
   * Broadcasts a message to all other AMP documents under the same viewer. It
   * will attempt to deliver messages when the messaging channel has been
   * established, but it will not fail if the channel is timed out.
   *
   * @param {!JsonObject} message
   */
  broadcast(message) {
    if (!this.messagingMaybePromise_) {
      // Messaging is not expected.
      return;
    }

    this.sendMessage('broadcast', message);
  }

  /**
   * Registers receiver for the broadcast events.
   * @param {function(!JsonObject)} handler
   * @return {!UnlistenDef}
   */
  onBroadcast(handler) {
    return this.broadcastObservable_.add(handler);
  }

  /**
   * Resolves when there is a messaging channel established with the viewer.
   * Will be null if no messaging is needed like in an non-embedded document.
   * @return {?Promise}
   */
  whenMessagingReady() {
    return this.messagingMaybePromise_;
  }

  /**
   * Replace the document url with the viewer provided new replaceUrl.
   * @param {?string} newUrl
   */
  replaceUrl(newUrl) {
    if (!newUrl ||
        !this.ampdoc.isSingleDoc() ||
        !this.win.history.replaceState) {
      return;
    }

    try {
      // The origin and source origin must match.
      const url = parseUrl(this.win.location.href);
      const replaceUrl = parseUrl(
          removeFragment(newUrl) + this.win.location.hash);
      if (url.origin == replaceUrl.origin &&
          getSourceOrigin(url) == getSourceOrigin(replaceUrl)) {
        this.win.history.replaceState({}, '', replaceUrl.href);
        this.win.location.originalHref = url.href;
        dev().fine(TAG_, 'replace url:' + replaceUrl.href);
      }
    } catch (e) {
      dev().error(TAG_, 'replaceUrl failed', e);
    }
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
function parseParams_(str, allParams) {
  const params = parseQueryString(str);
  for (const k in params) {
    allParams[k] = params[k];
  }
}


/**
 * Creates an error for the case where a channel cannot be established.
 * @param {*=} opt_reason
 * @return {!Error}
 */
function getChannelError(opt_reason) {
  if (opt_reason instanceof Error) {
    opt_reason = duplicateErrorIfNecessary(opt_reason);
    opt_reason.message = 'No messaging channel: ' + opt_reason.message;
    return opt_reason;
  }
  return new Error('No messaging channel: ' + opt_reason);
}


/**
 * Sets the viewer visibility state. This calls is restricted to runtime only.
 * @param {!VisibilityState} state
 * @restricted
 */
export function setViewerVisibilityState(viewer, state) {
  viewer.setVisibilityState_(state);
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Object<string, string>=} opt_initParams
 */
export function installViewerServiceForDoc(ampdoc, opt_initParams) {
  registerServiceBuilderForDoc(ampdoc,
      'viewer',
      function() {
        return new Viewer(ampdoc, opt_initParams);
      },
      /* opt_instantiate */ true);
}
