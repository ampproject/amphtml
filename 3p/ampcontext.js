/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {dev} from '../src/log';
import {IframeMessagingClient} from './iframe-messaging-client';
import {MessageType} from '../src/3p-frame-messaging';
import {nextTick} from './3p';
import {tryParseJson} from '../src/json';
import {isObject} from '../src/types';

export class AbstractAmpContext {

  /**
   *  @param {!Window} win The window that the instance is built inside.
   */
  constructor(win) {
    dev().assert(!this.isAbstractImplementation_(),
        'Should not construct AbstractAmpContext instances directly');

    /** @protected {!Window} */
    this.win_ = win;

    // This value is cached since it could be overwritten by the master frame
    // check using a value of a different type.
    /** @private {?string} */
    this.cachedFrameName_ = this.win_.name || null;

    /** @type {?string} */
    this.embedType_ = null;

    /** @type {?string} */
    this.clientId = null;

    /** @type {?Location} */
    this.location = null;

    /** @type {?string} */
    this.canonicalUrl = null;

    /** @type {?string} */
    this.pageViewId = null;

    /** @type {?string} */
    this.sentinel = null;

    /** @type {?number} */
    this.startTime = null;

    /** @type {?string} */
    this.referrer = null;

    /** @type {?boolean} */
    this.hidden = null;

    /** @type {?Object} */
    this.mode = null;

    /** @type {?Object} */
    this.initialIntersection = null;

    /** @type {?string} */
    this.sourceUrl = null;

    this.findAndSetMetadata_();

    /** @protected {!IframeMessagingClient} */
    this.client_ = new IframeMessagingClient(win);
    this.client_.setHostWindow(this.getHostWindow_());
    this.client_.setSentinel(dev().assertString(this.sentinel));

    this.listenForPageVisibility_();
  }

  /**
   * @return {boolean}
   * @protected
   */
  isAbstractImplementation_() {
    return true;
  }

  /** Registers an general handler for page visibility. */
  listenForPageVisibility_() {
    this.client_.makeRequest(
        MessageType.SEND_EMBED_STATE,
        MessageType.EMBED_STATE,
        data => {
          this.hidden = data.pageHidden;
          this.dispatchVisibilityChangeEvent_();
        });
  }

  /**
   * TODO(alanorozco): Deprecate native event mechanism.
   * @private
   */
  dispatchVisibilityChangeEvent_() {
    const event = this.win_.document.createEvent('Event');
    event.data = {hidden: this.hidden};
    event.initEvent('amp:visibilitychange', true, true);
    this.win_.dispatchEvent(event);
  }

  /**
   *  Listen to page visibility changes.
   *  @param {function({hidden: boolean})} callback Function to call every time
   *    we receive a page visibility message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive a page visibility message.
   */
  onPageVisibilityChange(callback) {
    return this.client_.registerCallback(MessageType.EMBED_STATE, data => {
      callback({hidden: data.pageHidden});
    });
  }

  /**
   *  Send message to runtime to start sending intersection messages.
   *  @param {function(Array<Object>)} callback Function to call every time we
   *    receive an intersection message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive an intersection message.
   */
  observeIntersection(callback) {
    const unlisten = this.client_.makeRequest(
        MessageType.SEND_INTERSECTIONS,
        MessageType.INTERSECTION,
        intersection => {
          callback(intersection.changes);
        });

    // Call the callback with the value that was transmitted when the
    // iframe was drawn. Called in nextTick, so that callers don't
    // have to specially handle the sync case.
    // TODO(#8562): Deprecate this behavior
    nextTick(this.win_, () => {
      callback([this.initialIntersection]);
    });

    return unlisten;
  };

  /**
   *  Send message to runtime to start sending position messages.
   *  @param {function(Object)} callback Function to call every time we
   *    receive a position info message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive a position info message.
   */
  observePosition(callback) {
    const unlisten = this.client_.makeRequest(
        MessageType.SEND_POSITIONS,
        MessageType.POSITION,
        data => {
          callback(data);
        });

    return unlisten;
  };

  /**
   *  Send message to runtime requesting to resize ad to height and width.
   *    This is not guaranteed to succeed. All this does is make the request.
   *  @param {number} width The new width for the ad we are requesting.
   *  @param {number} height The new height for the ad we are requesting.
   */
  requestResize(width, height) {
    this.client_.sendMessage(MessageType.EMBED_SIZE, {width, height});
  };

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request returns a success. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(number, number)} callback Function to call if the resize
   *    request succeeds.
   */
  onResizeSuccess(callback) {
    this.client_.registerCallback(MessageType.EMBED_SIZE_CHANGED, obj => {
      callback(obj.requestedHeight, obj.requestedWidth); });
  };

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request is denied. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(number, number)} callback Function to call if the resize
   *    request is denied.
   */
  onResizeDenied(callback) {
    this.client_.registerCallback(MessageType.EMBED_SIZE_DENIED, obj => {
      callback(obj.requestedHeight, obj.requestedWidth);
    });
  };

  /**
   *  Takes the current name on the window, and attaches it to
   *  the name of the iframe.
   *  @param {HTMLIFrameElement} iframe The iframe we are adding the context to.
   */
  addContextToIframe(iframe) {
    // TODO(alanorozco): consider the AMP_CONTEXT_DATA case
    iframe.name = dev().assertString(this.cachedFrameName_);
  }

  /**
   *  Parse the metadata attributes from the name and add them to
   *  the class instance.
   *  @param {!Object|string} data
   *  @private
   */
  setupMetadata_(data) {
    const dataObject = typeof data === 'string' ? tryParseJson(data) : data;
    if (!dataObject) {
      throw new Error('Could not setup metadata.');
    }
    const context = dataObject._context || dataObject.attributes._context;
    this.location = context.location;
    this.canonicalUrl = context.canonicalUrl;
    this.clientId = context.clientId;
    this.pageViewId = context.pageViewId;
    this.sentinel = context.sentinel;
    this.startTime = context.startTime;
    this.referrer = context.referrer;
    this.mode = context.mode;
    this.initialIntersection = context.initialIntersection;
    this.hidden = context.hidden;
    this.sourceUrl = context.sourceUrl;

    this.embedType_ = dataObject.type || null;
  }

  /**
   *  Calculate the hostWindow
   *  @private
   */
  getHostWindow_() {
    const sentinelMatch = this.sentinel.match(/((\d+)-\d+)/);
    dev().assert(sentinelMatch, 'Incorrect sentinel format');
    const depth = Number(sentinelMatch[2]);
    const ancestors = [];
    for (let win = this.win_; win && win != win.parent; win = win.parent) {
      // Add window keeping the top-most one at the front.
      ancestors.push(win.parent);
    }
    return ancestors[(ancestors.length - 1) - depth];
  }

  /**
   *  Checks to see if there is a window variable assigned with the
   *  sentinel value, sets it, and returns true if so.
   *  @private
   */
  findAndSetMetadata_() {
    // If the context data is set on window, that means we don't need
    // to check the name attribute as it has been bypassed.
    // TODO(alanorozco): why the heck could AMP_CONTEXT_DATA be two different
    // types? FIX THIS.
    if (isObject(this.win_.sf_) && this.win_.sf_.cfg) {
      this.setupMetadata_(/** @type {!string}*/(this.win_.sf_.cfg));
    } else if (this.win_.AMP_CONTEXT_DATA) {
      if (typeof this.win_.AMP_CONTEXT_DATA == 'string') {
        this.sentinel = this.win_.AMP_CONTEXT_DATA;
      } else if (isObject(this.win_.AMP_CONTEXT_DATA)) {
        this.setupMetadata_(this.win_.AMP_CONTEXT_DATA);
      }
    } else {
      this.setupMetadata_(this.win_.name);
    }
  }
}


export class AmpContext extends AbstractAmpContext {
  /** @return {boolean} */
  isAbstractImplementation_() {
    return false;
  }
}
