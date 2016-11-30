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
import './polyfills';
import {dev, user} from '../src/log';
import {IframeMessagingClient} from './iframe-messaging-client';

/**
   Enum for the different postmessage types for the window.context
   postmess api.
*/
export const MessageType_ = {
  SEND_EMBED_STATE: 'send-embed-state',
  EMBED_STATE: 'embed-state',
  SEND_EMBED_CONTEXT: 'send-embed-context',
  EMBED_CONTEXT: 'embed-context',
  SEND_INTERSECTIONS: 'send-intersections',
  INTERSECTION: 'intersection',
  EMBED_SIZE: 'embed-size',
  EMBED_SIZE_CHANGED: 'embed-size-changed',
  EMBED_SIZE_DENIED: 'embed-size-denied',
};

export class AmpContext extends IframeMessagingClient {

  /**
   *  @param {Window} win The window that the instance is built inside.
   */
  constructor(win) {
    super(win);
    this.setupMetadata_();

    /** Calculate the hostWindow / ampWindow_ */
    const sentinelMatch = this.sentinel.match(/((\d+)-\d+)/);
    dev().assert(sentinelMatch, 'Incorrect sentinel format');
    this.depth = Number(sentinelMatch[2]);
    const ancestors = [];
    for (let win = this.win_; win && win != win.parent; win = win.parent) {
      // Add window keeping the top-most one at the front.
      ancestors.push(win.parent);
    }
    ancestors.reverse();

    /** @private */
    this.ampWindow_ = ancestors[this.depth];
  }

  /** @override */
  getHostWindow() {
    return this.ampWindow_;
  }

  /** @override */
  getSentinel() {
    return this.sentinel;
  }

  /** @override */
  registerCallback_(messageType, callback) {
    user().assertEnumValue(MessageType_, messageType);
    this.callbackFor_[messageType] = callback;
    return () => { delete this.callbackFor_[messageType]; };
  }

  /**
   *  Send message to runtime to start sending page visibility messages.
   *  @param {function(Object)} callback Function to call every time we receive a
   *    page visibility message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive a page visibility message.
   */
  observePageVisibility(callback) {
    const stopObserveFunc = this.registerCallback_(
        MessageType_.EMBED_STATE, callback);
    this.ampWindow_.postMessage/*REVIEW*/({
      sentinel: this.sentinel,
      type: MessageType_.SEND_EMBED_STATE,
    }, '*');

    return stopObserveFunc;
  };

  /**
   *  Send message to runtime to start sending intersection messages.
   *  @param {function(Object)} callback Function to call every time we receive an
   *    intersection message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive an intersection message.

   */
  observeIntersection(callback) {
    const stopObserveFunc = this.registerCallback_(
        MessageType_.INTERSECTION, callback);
    this.ampWindow_.postMessage/*REVIEW*/({
      sentinel: this.sentinel,
      type: MessageType_.SEND_INTERSECTIONS,
    }, '*');

    return stopObserveFunc;
  };

  /**
   *  Send message to runtime requesting to resize ad to height and width.
   *    This is not guaranteed to succeed. All this does is make the request.
   *  @param {int} height The new height for the ad we are requesting.
   *  @param {int} width The new width for the ad we are requesting.
   */
  requestResize(height, width) {
    this.ampWindow_.postMessage/*REVIEW*/({
      sentinel: this.sentinel,
      type: MessageType_.EMBED_SIZE,
      width,
      height,
    }, '*');
  };

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request returns a success. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(requestedHeight, requestedWidth)} callback Function
   *    to call if the resize request succeeds.
   */
  onResizeSuccess(callback) {
    this.registerCallback_(MessageType_.EMBED_SIZE_CHANGED, function(obj) {
      callback(obj.requestedHeight, obj.requestedWidth); });
  };

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request is denied. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(requestedHeight, requestedWidth)} callback Function
   *    to call if the resize request is denied.
   */
  onResizeDenied(callback) {
    this.registerCallback_(MessageType_.EMBED_SIZE_DENIED, function(obj) {
      callback(obj.requestedHeight, obj.requestedWidth); });
  };

  /**
   *  Takes the current name on the window, and attaches it to
   *  the name of the iframe.
   *  @param {HTMLIframeElement} iframe The iframe we are adding the context to.
   */
  addContextToIframe(iframe) {
    iframe.name = this.win_.name;
  }

  /**
   *  Parse the metadata attributes from the name and add them to
   *  the class instance.
   *  @private
   */
  setupMetadata_() {
    try {
      const data = JSON.parse(decodeURI(this.win_.name));
      const context = data._context;
      this.location = context.location;
      this.canonicalUrl = context.canonicalUrl;
      this.pageViewId = context.pageViewId;
      this.sentinel = context.sentinel;
      this.startTime = context.startTime;
      this.referrer = context.referrer;
    } catch (err) {
      user().error('AMPCONTEXT', '- Could not parse metadata.');
      throw new Error('Could not parse metadata.');
    }
  }
};
