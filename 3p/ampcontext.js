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
import {AmpEvents} from '../src/amp-events';
import {IframeMessagingClient} from './iframe-messaging-client';
import {MessageType} from '../src/3p-frame-messaging';
import {dev, devAssert} from '../src/log';
import {dict} from '../src/utils/object';
import {isExperimentOn, nextTick} from './3p';
import {isObject} from '../src/types';
import {parseUrlDeprecated} from '../src/url';
import {tryParseJson} from '../src/json';

export class AbstractAmpContext {
  /**
   *  @param {!Window} win The window that the instance is built inside.
   */
  constructor(win) {
    devAssert(
      !this.isAbstractImplementation_(),
      'Should not construct AbstractAmpContext instances directly'
    );

    /** @protected {!Window} */
    this.win_ = win;

    // This value is cached since it could be overwritten by the master frame
    // check using a value of a different type.
    /** @private {?string} */
    this.cachedFrameName_ = this.win_.name || null;

    /** @protected {?string} */
    this.embedType_ = null;

    // ----------------------------------------------------
    // Please keep public attributes alphabetically sorted.
    // ----------------------------------------------------

    /** @public {?string|undefined} */
    this.canary = null;

    /** @type {?string} */
    this.canonicalUrl = null;

    /** @type {?string} */
    this.clientId = null;

    /** @type {?string|undefined} */
    this.container = null;

    /** @type {?Object} */
    this.consentSharedData = null;

    /** @type {?Object<string, *>} */
    this.data = null;

    /** @type {?string} */
    this.domFingerprint = null;

    /** @type {?boolean} */
    this.hidden = null;

    /** @type {?number} */
    this.initialConsentState = null;

    /** @type {?string} */
    this.initialConsentValue = null;

    /** @type {?Object} */
    this.initialLayoutRect = null;

    /** @type {?Object} */
    this.initialIntersection = null;

    /** @type {?Location} */
    this.location = null;

    /** @type {?Object} */
    this.mode = null;

    /** @type {?string} */
    this.pageViewId = null;

    /** @type {?string} */
    this.referrer = null;

    /** @type {?string} */
    this.sentinel = null;

    /** @type {?string} */
    this.sourceUrl = null;

    /** @type {?number} */
    this.startTime = null;

    /** @type {?string} */
    this.tagName = null;

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
        this.hidden = data['pageHidden'];
        this.dispatchVisibilityChangeEvent_();
      }
    );
  }

  /**
   * TODO(alanorozco): Deprecate native event mechanism.
   * @private
   */
  dispatchVisibilityChangeEvent_() {
    const event = this.win_.document.createEvent('Event');
    event.data = {hidden: this.hidden};
    event.initEvent(AmpEvents.VISIBILITY_CHANGE, true, true);
    this.win_.dispatchEvent(event);
  }

  /**
   *  Listen to page visibility changes.
   *  @param {function({hidden: boolean})} callback Function to call every time
   *    we receive a page visibility message.
   *  @return {function()} that when called stops triggering the callback
   *    every time we receive a page visibility message.
   */
  onPageVisibilityChange(callback) {
    return this.client_.registerCallback(MessageType.EMBED_STATE, data => {
      callback({hidden: data['pageHidden']});
    });
  }

  /**
   *  Send message to runtime to start sending intersection messages.
   *  @param {function(Array<Object>)} callback Function to call every time we
   *    receive an intersection message.
   *  @return {function()} that when called stops triggering the callback
   *    every time we receive an intersection message.
   */
  observeIntersection(callback) {
    const unlisten = this.client_.makeRequest(
      MessageType.SEND_INTERSECTIONS,
      MessageType.INTERSECTION,
      intersection => {
        callback(intersection['changes']);
      }
    );

    if (!isExperimentOn('no-initial-intersection')) { // eslint-disable-line
      // Call the callback with the value that was transmitted when the
      // iframe was drawn. Called in nextTick, so that callers don't
      // have to specially handle the sync case.
      // TODO(lannka, #8562): Deprecate this behavior
      nextTick(this.win_, () => {
        callback([this.initialIntersection]);
      });
    }

    return unlisten;
  }

  /**
   *  Requests HTML snippet from the parent window.
   *  @param {string} selector CSS selector
   *  @param {!Array<string>} attributes whitelisted attributes to be kept
   *    in the returned HTML string
   *  @param {function(*)} callback to be invoked with the HTML string
   */
  getHtml(selector, attributes, callback) {
    this.client_.getData(
      MessageType.GET_HTML,
      dict({
        'selector': selector,
        'attributes': attributes,
      }),
      callback
    );
  }

  /**
   * Requests consent state from the parent window.
   *
   * @param {function(*)} callback
   */
  getConsentState(callback) {
    this.client_.getData(MessageType.GET_CONSENT_STATE, null, callback);
  }

  /**
   *  Send message to runtime requesting to resize ad to height and width.
   *    This is not guaranteed to succeed. All this does is make the request.
   *  @param {number} width The new width for the ad we are requesting.
   *  @param {number} height The new height for the ad we are requesting.
   *  @param {boolean=} hasOverflow Whether the ad handles its own overflow ele
   */
  requestResize(width, height, hasOverflow) {
    this.client_.sendMessage(
      MessageType.EMBED_SIZE,
      dict({
        'width': width,
        'height': height,
        'hasOverflow': hasOverflow,
      })
    );
  }

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request returns a success. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(number, number)} callback Function to call if the resize
   *    request succeeds.
   */
  onResizeSuccess(callback) {
    this.client_.registerCallback(MessageType.EMBED_SIZE_CHANGED, obj => {
      callback(obj['requestedHeight'], obj['requestedWidth']);
    });
  }

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request is denied. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(number, number)} callback Function to call if the resize
   *    request is denied.
   */
  onResizeDenied(callback) {
    this.client_.registerCallback(MessageType.EMBED_SIZE_DENIED, obj => {
      callback(obj['requestedHeight'], obj['requestedWidth']);
    });
  }

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
   *  Notifies the parent document of no content available inside embed.
   */
  noContentAvailable() {
    this.client_.sendMessage(MessageType.NO_CONTENT);
  }

  /**
   *  Parse the metadata attributes from the name and add them to
   *  the class instance.
   *  @param {!Object|string} data
   *  @private
   */
  setupMetadata_(data) {
    // TODO(alanorozco): Use metadata utils in 3p/frame-metadata
    const dataObject = devAssert(
      typeof data === 'string' ? tryParseJson(data) : data,
      'Could not setup metadata.'
    );

    const context = dataObject._context || dataObject.attributes._context;

    this.data = dataObject.attributes || dataObject;

    // TODO(alanorozco, #10576): This is really ugly. Find a better structure
    // than passing context values via data.
    if ('_context' in this.data) {
      delete this.data['_context'];
    }

    this.canary = context.canary;
    this.canonicalUrl = context.canonicalUrl;
    this.clientId = context.clientId;
    this.consentSharedData = context.consentSharedData;
    this.container = context.container;
    this.domFingerprint = context.domFingerprint;
    this.hidden = context.hidden;
    this.initialConsentState = context.initialConsentState;
    this.initialConsentValue = context.initialConsentValue;
    this.initialLayoutRect = context.initialLayoutRect;
    this.initialIntersection = context.initialIntersection;
    this.location = parseUrlDeprecated(context.location.href);
    this.mode = context.mode;
    this.pageViewId = context.pageViewId;
    this.referrer = context.referrer;
    this.sentinel = context.sentinel;
    this.sourceUrl = context.sourceUrl;
    this.startTime = context.startTime;
    this.tagName = context.tagName;

    this.embedType_ = dataObject.type || null;
  }

  /**
   *  Calculate the hostWindow
   *  @private
   */
  getHostWindow_() {
    const sentinelMatch = this.sentinel.match(/((\d+)-\d+)/);
    devAssert(sentinelMatch, 'Incorrect sentinel format');
    const depth = Number(sentinelMatch[2]);
    const ancestors = [];
    for (let win = this.win_; win && win != win.parent; win = win.parent) {
      // Add window keeping the top-most one at the front.
      ancestors.push(win.parent);
    }
    return ancestors[ancestors.length - 1 - depth];
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
      this.setupMetadata_(/** @type {string}*/ (this.win_.sf_.cfg));
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

  /**
   * Send 3p error to parent iframe
   * @param {!Error} e
   */
  report3pError(e) {
    if (!e.message) {
      return;
    }
    this.client_.sendMessage(
      MessageType.USER_ERROR_IN_IFRAME,
      dict({
        'message': e.message,
      })
    );
  }
}

export class AmpContext extends AbstractAmpContext {
  /** @override */
  isAbstractImplementation_() {
    return false;
  }
}
