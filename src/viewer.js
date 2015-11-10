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

import {Observable} from './observable';
import {assert} from './asserts';
import {documentStateFor} from './document-state';
import {getService} from './service';
import {log} from './log';
import {parseQueryString, removeFragment} from './url';
import {platform} from './platform';


const TAG_ = 'Viewer';
const SENTINEL_ = '__AMP__';


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
    this.docState_ = documentStateFor(window);

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

    /** @private {!Observable<!ViewerHistoryPoppedEvent>} */
    this.historyPoppedObservable_ = new Observable();

    /** @private {?function(string, *, boolean):(Promise<*>|undefined)} */
    this.messageDeliverer_ = null;

    /** @private {!Array<!{eventType: string, data: *}>} */
    this.messageQueue_ = [];

    /** @const @private {!Object<string, string>} */
    this.params_ = {};

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

    // Wait for document to become visible.
    this.docState_.onVisibilityChanged(() => {
      this.visibilityObservable_.fire();
    });

    // Remove hash - no reason to keep it around, but only when embedded.
    if (this.isEmbedded_) {
      const newUrl = removeFragment(this.win.location.href);
      if (newUrl != this.win.location.href && this.win.history.replaceState) {
        this.win.history.replaceState({}, '', newUrl);
        log.fine(TAG_, 'replace url:' + this.win.location.href);
      }
    }
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
   * @param {function(ViewerHistoryPoppedEvent)} handler
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
    this.sendMessage_('documentLoaded', {width: width, height: height}, false);
  }

  /**
   * Triggers "documentResized" event for the viewer.
   * @param {number} width
   * @param {number} height
   */
  postDocumentResized(width, height) {
    this.sendMessage_('documentResized', {width: width, height: height}, false);
  }

  /**
   * Requests full overlay mode from the viewer. Returns a promise that yields
   * when the viewer has switched to full overlay mode.
   * @return {!Promise}
   */
  requestFullOverlay() {
    return this.sendMessage_('requestFullOverlay', {}, true);
  }

  /**
   * Requests to cancel full overlay mode from the viewer. Returns a promise
   * that yields when the viewer has switched off full overlay mode.
   * @return {!Promise}
   */
  cancelFullOverlay() {
    return this.sendMessage_('cancelFullOverlay', {}, true);
  }

  /**
   * Triggers "pushHistory" event for the viewer.
   * @param {number} stackIndex
   * @return {!Promise}
   */
  postPushHistory(stackIndex) {
    return this.sendMessage_('pushHistory', {stackIndex: stackIndex}, true);
  }

  /**
   * Triggers "popHistory" event for the viewer.
   * @param {number} stackIndex
   * @return {!Promise}
   */
  postPopHistory(stackIndex) {
    return this.sendMessage_('popHistory', {stackIndex: stackIndex}, true);
  }

  /**
   * Requests AMP document to receive a message from Viewer.
   * @param {string} eventType
   * @param {*} data
   * @param {boolean} awaitResponse
   * @return {(!Promise<*>|undefined)}
   * @package
   * @export
   */
  receiveMessage(eventType, data, awaitResponse) {
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
      this.visibilityObservable_.fire();
      return Promise.resolve();
    }
    log.fine(TAG_, 'unknown message:', eventType);
    return undefined;
  }

  /**
   * Provides a message delivery mechanism by which AMP document can send
   * messages to the viewer.
   * @param {function(string, *, boolean):(!Promise<*>|undefined)} deliverer
   * @package
   * @export
   */
  setMessageDeliverer(deliverer) {
    assert(!this.messageDeliverer_, 'message deliverer can only be set once');
    this.messageDeliverer_ = deliverer;
    if (this.messageQueue_.length > 0) {
      const queue = this.messageQueue_.slice(0);
      this.messageQueue_ = [];
      queue.forEach(message => {
        this.messageDeliverer_(message.eventType, message.data, false);
      });
    }
  }

  /**
   * @param {string} eventType
   * @param {*} data
   * @param {boolean} awaitResponse
   * @return {!Promise<*>|undefined}
   * @private
   */
  sendMessage_(eventType, data, awaitResponse) {
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
let ViewerHistoryPoppedEvent;


/**
 * @param {!Window} window
 * @return {!Viewer}
 */
export function viewerFor(window) {
  return getService(window, 'viewer', () => {
    return new Viewer(window);
  });
};
