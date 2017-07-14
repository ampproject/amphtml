/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {tryParseJson} from '../src/json';
import {dev, initLogConstructor, setReportError} from '../src/log';
import {AMP_ANALYTICS_3P_MESSAGE_TYPE} from '../src/3p-analytics-common';

initLogConstructor();
// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

/** @private @const {string} */
const TAG_ = 'ampanalytics-lib';

/**
 * Receives messages bound for this cross-domain iframe, from all creatives
 */
export class AmpAnalytics3pMessageRouter {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    // The sentinel is required by iframe-messaging-client, and is used to
    // uniquely identify the frame as part of message routing
    /** @const {string} */
    this.sentinel_ = dev().assertString(
        tryParseJson(this.win_.name).sentinel,
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name);
    if (!this.sentinel_) {
      return;
    }

    /**
     * Multiple creatives on a page may wish to use the same type of
     * amp-analytics tag. This object provides a mapping between the
     * IDs which identify which amp-analytics tag a message is to/from,
     * with each ID's corresponding AmpAnalytics3pCreativeMessageRouter,
     * which is an object that handles messages to/from a particular creative.
     * @private {!Object<string, !AmpAnalytics3pCreativeMessageRouter>}
     */
    this.creativeMessageRouters_ = {};

    /**
     * Handles communication between frames
     * @private {!IframeMessagingClient}
     */
    /*
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    this.iframeMessagingClient_.setSentinel(this.sentinel_);
    this.iframeMessagingClient_.registerCallback(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.CREATIVE,
        messageContainer => {
          let entries;
          dev().assert(messageContainer.data &&
              (entries = Object.entries(messageContainer.data)).length,
              'Received empty list that should have contained new creative' +
              ' message(s) in ' + this.win_.location.href);
          dev().assert(window.onNewAmpAnalyticsInstance,
              'Must implement onNewAmpAnalyticsInstance in ' +
              this.win_.location.href);
          entries.forEach(entry => {
            const creativeId = entry[0];
            const extraData = entry[1];
            dev().assert(!this.creativeMessageRouters_[creativeId],
                'Duplicate new creative message for ' + creativeId);
            this.creativeMessageRouters_[creativeId] =
              new AmpAnalytics3pCreativeMessageRouter(
                this.win_, creativeId, extraData);
            try {
              window.onNewAmpAnalyticsInstance(
                  this.creativeMessageRouters_[creativeId]);
            } catch (e) {
              dev().error(TAG_, 'Exception thrown by' +
                  ' onNewAmpAnalyticsInstance() in ' + this.win_.location.href +
                  ': ' + e.message);
            }
          });
        });
    this.iframeMessagingClient_.registerCallback(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.EVENT,
        messageContainer => {
          let entries;
          dev().assert(messageContainer.data &&
              (entries = Object.entries(messageContainer.data)).length,
              'Received empty events message');
          entries.forEach(entry => {
            const creativeId = entry[0];
            const messages = entry[1];
            try {
              dev().assert(messages && messages.length,
                  'Received empty events list for ' + creativeId);
              dev().assert(this.creativeMessageRouters_[creativeId],
                  'Discarding event message received prior to new creative' +
                  ' message for ' + creativeId);
              this.creativeMessageRouters_[creativeId]
                  .sendMessagesToListener(messages);
            } catch (e) {
              dev().error(TAG_, 'Failed to pass message to event listener: ' +
                  e.message);
            }
          });
        });
    this.iframeMessagingClient_.sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.READY);
    */
    const readyMessage = {
      sentinel: 'null',
      type: this.sentinel_ + AMP_ANALYTICS_3P_MESSAGE_TYPE.READY,
    };
    // Sentinel field above must be null because in iframe-helper.js a
    // mapping is keyed on parent window's
    // getAttribute('data-amp-3p-sentinel') which is not set. The "real"
    // sentinel is rolled into type.
    window.parent.postMessage(readyMessage, '*');
    window.addEventListener('message', incomingMessage => {
      console.log('Got message:');
      console.dir(incomingMessage);
      debugger;
    }, false);
  }

  /**
   * Test method to ensure sentinel set correctly
   * @returns {string}
   * @VisibleForTesting
   */
  getSentinel() {
    return this.sentinel_;
  }

  /**
   * Gets the mapping of creative senderId to
   * AmpAnalytics3pCreativeMessageRouter
   * @returns {!Object.<string, !AmpAnalytics3pCreativeMessageRouter>}
   * @VisibleForTesting
   */
  getCreativeMethodRouters() {
    return this.creativeMessageRouters_;
  }

  /**
   * Gets rid of the mapping to AmpAnalytics3pMessageRouter
   * @VisibleForTesting
   */
  reset() {
    this.creativeMessageRouters_ = {};
  }
}

if (!window.AMP_TEST) {
  try {
    new AmpAnalytics3pMessageRouter(window);
  } catch (e) {
    dev().error(TAG_, 'Failed to construct AmpAnalytics3pMessageRouter: ' +
      e.message);
  }
}

/**
 * Receives messages bound for this cross-domain iframe, from a particular
 * creative. Also sends response messages from the iframe meant for this
 * particular creative.
 */
export class AmpAnalytics3pCreativeMessageRouter {
  /**
   * @param {!Window} win The enclosing window object
   * @param {!string} creativeId The ID of the creative to route messages
   * to/from
   * @param {string=} opt_extraData Extra data to be passed to the frame
   */
  constructor(win, creativeId, opt_extraData) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!string} */
    this.creativeId_ = creativeId;

    /** @private {?string} */
    this.extraData_ = opt_extraData;

    /** @private {?function(!Array<!AmpAnalytics3pEvent>)} */
    this.eventListener_ = null;
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur.
   * There may only be one listener. If another function has previously been
   * registered as a listener, it will no longer receive events.
   * @param {!function(!Array<AmpAnalytics3pEvent>)} listener A function
   * that takes an array of event strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    if (this.eventListener_) {
      dev().warn(TAG_, 'Replacing existing eventListener for ' +
        this.creativeId_);
    }
    this.eventListener_ = listener;
  }

  /**
   * Receives message(s) from a creative for the cross-domain iframe
   * and passes them to that iframe's listener, if a listener has been
   * registered
   * @param {!Array<AmpAnalytics3pEvent>} messages The message that was received
   */
  sendMessagesToListener(messages) {
    if (!messages.length) {
      dev().warn(TAG_, 'Attempted to send zero messages in ' +
          this.creativeId_ + '. Ignoring.');
      return;
    }
    if (!this.eventListener_) {
      dev().warn(TAG_, 'Attempted to send messages when no listener' +
        ' configured in ' + this.creativeId_ + '. Be sure to' +
        ' first call registerAmpAnalytics3pEventsListener()');
    }
    try {
      this.eventListener_(messages);
    } catch (e) {
      dev().error(TAG_, 'Caught exception executing listener for ' +
        this.creativeId_ + ': ' + e.message);
    }
  }

  /**
   * Gets any optional extra data that should be made available to the
   * cross-domain frame, in the context of a particular creative.
   * @returns {?string}
   */
  getExtraData() {
    return this.extraData_;
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!Object} response The response to send.
   */
  sendMessageToCreative(response) {
    /**
    this.iframeMessagingClient_.sendMessage(
        AMP_ANALYTICS_3P_MESSAGE_TYPE.RESPONSE,
        this.buildAmpAnalytics3pResponse_(response));
     */
    console.log('TODO: send response: ' + response);
  }

  /**
   * Builds an instance of AmpAnalytics3pResponse
   * @param {!Object} response The response from the iframe, which can be
   * any object
   * @returns {AmpAnalytics3pResponse}
   */
  buildAmpAnalytics3pResponse_(response) {
    const messageObject = /** @type {AmpAnalytics3pResponse} */ ({
      destination: this.creativeId_,
      data: response,
    });
    return messageObject;
  }

  /**
   * @returns {!string}
   * @VisibleForTesting
   */
  getCreativeId() {
    return this.creativeId_;
  }

  /**
   * @returns {?string}
   * @VisibleForTesting
   */
  getExtraData() {
    return this.extraData_;
  }
}

