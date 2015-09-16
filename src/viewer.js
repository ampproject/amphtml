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
import {getService} from './service';
import {installStyles} from './styles';
import {log} from './log';
import {onDocumentReady} from './event-helper';
import {parseQueryString} from './url';
import {platform} from './platform';
import * as st from './style';


let TAG_ = 'Viewer';
let SENTINEL_ = '__AMP__';


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

    /** @const {boolean} */
    this.overtakeHistory_ = false;

    /** @private {string} */
    this.viewportType_ = 'natural';

    /** @private {number} */
    this.viewportWidth_ = 0;

    /** @private {number} */
    this.viewportHeight_ = 0;

    /** @private {number} */
    this.scrollTop_ = 0;

    /** @private {number} */
    this.paddingTop_ = 0;

    /** @private {!Observable<!ViewerViewportEvent>} */
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
      let hash = this.win.location.hash;
      if (hash.substring(0, 1) == '#') {
        hash = hash.substring(1);
      }
      if (hash) {
        parseParams_(hash, this.params_);
      }
    }

    log.fine(TAG_, 'Viewer params:', this.params_);

    this.overtakeHistory_ = parseInt(this.params_['history']) ||
        this.overtakeHistory_;
    log.fine(TAG_, '- history:', this.overtakeHistory_);

    this.viewportType_ = this.params_['viewportType'] || this.viewportType_;
    log.fine(TAG_, '- viewportType:', this.viewportType_);

    this.viewportWidth_ = parseInt(this.params_['width']) ||
        this.viewportWidth_;
    log.fine(TAG_, '- viewportWidth:', this.viewportWidth_);

    this.viewportHeight_ = parseInt(this.params_['height']) ||
        this.viewportHeight_;
    log.fine(TAG_, '- viewportHeight:', this.viewportHeight_);

    this.scrollTop_ = parseInt(this.params_['scrollTop']) || this.scrollTop_;
    log.fine(TAG_, '- scrollTop:', this.scrollTop_);

    let paddingTop = parseInt(this.params_['paddingTop']) || this.paddingTop_;
    log.fine(TAG_, '- padding-top:', paddingTop);
    this.updatePaddingTop_(paddingTop);

    // Configure scrolling parameters when AMP is embeded in a viewer on iOS.
    if (this.viewportType_ == 'natural' && this.win.parent &&
            platform.isIos()) {
      onDocumentReady(this.win.document,
          () => this.setupEmbeddedScrollingIos_());
    }

    // Remove hash - no reason to keep it around.
    var newUrl = this.win.location.href;
    if (newUrl.indexOf('#') != -1) {
      newUrl = newUrl.substring(0, newUrl.indexOf('#'));
      if (this.win.history.replaceState) {
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
   * @expose
   */
  getParam(name) {
    return this.params_[name];
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
   * There are two types of viewports: "natural" and "virtual". "Natural" is
   * the viewport of the AMP document's window. "Virtual" is the viewport
   * provided by the viewer.
   * See {@link Viewport} and {@link ViewportBinding} for more details.
   * @return {string}
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
    return this.scrollTop_;
  }

  /**
   * Returns the top padding requested by the viewer.
   * @return {number}
   */
  getPaddingTop() {
    return this.paddingTop_;
  }

  /**
   * Adds a "viewport" event listener for viewer events.
   * @param {function(!ViewerViewportEvent)} handler
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
   * @expose
   */
  receiveMessage(eventType, data, awaitResponse) {
    if (eventType == 'viewport') {
      this.viewportObservable_.fire({
        scrollTop: data['scrollTop'],
        scrollLeft: data['scrollLeft'],
        width: data['width'],
        height: data['height']
      });
      let paddingTop = data['paddingTop'];
      if (paddingTop !== undefined) {
        this.updatePaddingTop_(paddingTop);
      }
      return Promise.resolve();
    } else if (eventType == 'historyPopped') {
      this.historyPoppedObservable_.fire({
        newStackIndex: data['newStackIndex']
      });
      return Promise.resolve();
    }
    return Promise.reject('unknown message: ' + eventType);
  }

  /**
   * Provides a message delivery mechanism by which AMP document can send
   * messages to the viewer.
   * @param {function(string, *, boolean):(!Promise<*>|undefined)} deliverer
   * @package
   * @expose
   */
  setMessageDeliverer(deliverer) {
    assert(!this.messageDeliverer_, 'message deliverer can only be set once');
    this.messageDeliverer_ = deliverer;
    if (this.messageQueue_.length > 0) {
      let queue = this.messageQueue_.slice(0);
      this.messageQueue_ = [];
      queue.forEach((message) => {
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

  /**
   * @private
   */
  setupEmbeddedScrollingIos_() {
    // Embedded scrolling on iOS is rather complicated. IFrames cannot be sized
    // and be scrollable. Sizing iframe by scrolling height has a big negative
    // that "fixed" position is essentially impossible. The only option we
    // found is to reset scrolling on the AMP doc, which overrides natural BODY
    // scrolling with overflow:auto. We need the following styling:
    // html {
    //   overflow: auto;
    //   -webkit-overflow-scrolling: touch;
    // }
    // body {
    //   position: absolute;
    //   overflow: auto;
    //   -webkit-overflow-scrolling: touch;
    // }
    st.setStyles(this.win.document.documentElement, {
      overflowX: 'hidden',
      overflowY: 'auto',
      webkitOverflowScrolling: 'touch'
    });
    st.setStyles(this.win.document.body, {
      overflowX: 'hidden',
      overflowY: 'auto',
      webkitOverflowScrolling: 'touch',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    });

    // TODO(dvoytenko): These styles are a lot more controversial. If we do
    // go ahead with these styles, we'll have to define them in amp.css as
    // "!important". This will have some authoring implications, although
    // should not be a major issue. Overall, if we embed content, we want
    // to have stronger control over margins.
    st.setStyles(this.win.document.body, {
      margin: 0,
      overflowX: 'hidden'
    });
  }

  /**
   * @param {number} paddingTop
   */
  updatePaddingTop_(paddingTop) {
    if (paddingTop != this.paddingTop_) {
      this.paddingTop_ = paddingTop;
      onDocumentReady(this.win.document, () => {
        this.win.document.body.style.paddingTop = st.px(this.paddingTop_);
      });
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
export function parseParams_(str, allParams) {
  let params = parseQueryString(str);
  for (let k in params) {
    allParams[k] = params[k];
  }
}


/**
 * @typedef {{
 *   scrollTop: (number|undefined),
 *   scrollLeft: (number|undefined),
 *   width: (number|undefined),
 *   height: (number|undefined)
 * }}
 */
var ViewerViewportEvent;


/**
 * @typedef {{
 *   newStackIndex: number
 * }}
 */
var ViewerHistoryPoppedEvent;


/**
 * @param {!Window} window
 * @return {!Viewer}
 */
export function viewerFor(window) {
  return getService(window, 'viewer', () => {
    return new Viewer(window);
  });
};

export const viewer = viewerFor(window);
