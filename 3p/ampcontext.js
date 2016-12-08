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
import {MessageType} from '../src/3p-frame';

export class AmpContext {

  /**
   *  @param {Window} win The window that the instance is built inside.
   */
  constructor(win) {
    this.setupMetadata_();
    this.client_ = new IframeMessagingClient(win);
    this.client_.setHostWindow(this.getHostWindow_());
    this.client_.setSentinel(this.sentinel);
  }

  /**
   *  Send message to runtime to start sending page visibility messages.
   *  @param {function(Object)} callback Function to call every time we receive
   *    a page visibility message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive a page visibility message.
   */
  observePageVisibility(callback) {
    return this.client_.makeRequest(
        MessageType.SEND_EMBED_STATE,
        MessageType.EMBED_STATE,
        callback);
  };

  /**
   *  Send message to runtime to start sending intersection messages.
   *  @param {function(Object)} callback Function to call every time we receive
   *  an intersection message.
   *  @returns {function()} that when called stops triggering the callback
   *    every time we receive an intersection message.
   */
  observeIntersection(callback) {
    return this.client_.makeRequest(
        MessageType.SEND_INTERSECTIONS,
        MessageType.INTERSECTION,
        callback);
  };

  /**
   *  Send message to runtime requesting to resize ad to height and width.
   *    This is not guaranteed to succeed. All this does is make the request.
   *  @param {int} height The new height for the ad we are requesting.
   *  @param {int} width The new width for the ad we are requesting.
   */
  requestResize(height, width) {
    this.client_.sendMessage(MessageType.EMBED_SIZE, {width, height});
  };

  /**
   *  Allows a creative to set the callback function for when the resize
   *    request returns a success. The callback should be set before resizeAd
   *    is ever called.
   *  @param {function(requestedHeight, requestedWidth)} callback Function
   *    to call if the resize request succeeds.
   */
  onResizeSuccess(callback) {
    this.client_.registerCallback(MessageType.EMBED_SIZE_CHANGED, obj => {
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
    this.client_.registerCallback(MessageType.EMBED_SIZE_DENIED, obj => {
      callback(obj.requestedHeight, obj.requestedWidth);
    });
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
}
