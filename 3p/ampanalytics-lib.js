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
import {map} from '../src/utils/object';
import {dev} from '../src/log';
import {initLogConstructor, setReportError} from '../src/log';
import {reportError} from '../src/error';
import {IframeMessagingClient} from './iframe-messaging-client';
import {MessageTypes} from '../src/3p-analytics-common';
initLogConstructor();
setReportError(reportError);

/** @private @const {string} */
const TAG_ = 'ampanalytics-lib';

/**
 * This provides the "glue" between the AMP Analytics tag and the third-party
 * vendor's metrics-collection page.
 *
 * The vendor's page must implement onNewAmpAnalyticsInstance().
 */
class AmpAnalytics3pRemoteFrameHelper {
  /** @Param {!Window} win */
  constructor(win) {
    /**
     * @type {!Array<!function(Array)>}
     * @private
     */
    this.eventsListeners_ = [];

    /**
     * @type {!Array<Object<string,*>>}
     * @private
     */
    this.receivedMessagesQueue_ = [];

    /**
     * Holds a mapping between sender ID and extra data
     * @private {!Map<string,string>}
     */
    this.senderIdToExtraData_ = map();

    /**
     * Simple requestIdleCallback polyfill
     * @type {!function(!function(), number)}
     * @private
     */
    this.requestIdleCallback_ =
      win.requestIdleCallback.bind(win) || (cb => setTimeout(cb, 1));

    /**
     * Handles communication between frames
     * @private {!IframeMessagingClient}
     */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    try {
      const frameNameData = JSON.parse(window.name);
      if (frameNameData.sentinel) {
        this.iframeMessagingClient_.setSentinel(frameNameData.sentinel);
      }
    } catch (e) {
      dev().warn(TAG_, 'Unable to set sentinel');
    }
    this.iframeMessagingClient_.registerCallback(
      MessageTypes.ampAnalytics3pMessages,
      received => this.onReceivedMessagesFromCreative_(received));

    this.sendReadyMessageToCreative_();
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur
   * @param {!function(!Array)} listener A function that takes an array of event
   * strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    this.eventsListeners_.push(listener);
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!string} message The message to send.
   */
  sendMessageToCreative(message) {
    const envelope = {senderId: this.id_};
    envelope[MessageTypes.ampAnalytics3pResponse] = message;
    this.iframeMessagingClient_.sendMessage(
      MessageTypes.ampAnalytics3pResponse, envelope);
  }

  /**
   * Gets any optional extra data that should be made available to the
   * cross-domain frame, in the context of a particular creative.
   * @param {number} senderId The ID of the creative that sent the extra data
   * @returns {?string}
   */
  getExtraData(senderId) {
    return this.senderIdToExtraData_[senderId];
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @private
   */
  sendReadyMessageToCreative_() {
    this.iframeMessagingClient_.sendMessage(MessageTypes.ampAnalytics3pReady,
      {senderId: this.id_});
  }

  /**
   * Handles messages received from the creative, by enqueueing them to
   * be sent to the third-party vendor's metrics-collection page
   * @param {!Array<!Object<string,*>>} received The messages that were received
   * from the creative
   * @private
   */
  onReceivedMessagesFromCreative_(received) {
    if (!received || !received[MessageTypes.ampAnalytics3pMessages]) {
      return;
    }
    received[MessageTypes.ampAnalytics3pMessages].forEach(submessage => {
      this.receivedMessagesQueue_.push(submessage);
      if (submessage[MessageTypes.ampAnalytics3pExtraData]) {
        this.senderIdToExtraData_[submessage.senderId] =
          submessage[MessageTypes.ampAnalytics3pExtraData];
      }
    });
    this.sendQueuedMessagesToListeners_();
  }

  /**
   * Sends enqueued messages to the third-party vendor's metrics-collection page
   * If there are no event listeners on the page, event messages will remain
   * in the queue. But if there is at least one event listener, messages will be
   * sent to those listener(s) and the queue will be emptied. This means
   * that the first event listener will receive messages that predate its
   * creation, but if there are additional event listeners, they may not.
   * @private
   */
  sendQueuedMessagesToListeners_() {
    if (this.receivedMessagesQueue_.length == 0 ||
      this.eventsListeners_.length == 0) {
      return;
    }
    this.eventsListeners_.forEach(listener => {
      this.dispatch_(this.receivedMessagesQueue_, listener);
    });
    this.receivedMessagesQueue_ = [];
  }

  /**
   * Sends an array of messages to a single listener, using
   * requestIdleCallback()
   * @param {!Array<Object<string,*>>} dataToSend The array of messages
   * @param {!function(!Array)} listener The listener
   * @private
   */
  dispatch_(dataToSend, listener) {
    this.requestIdleCallback_(() => {
      try {
        listener(dataToSend);
      } catch (e) {
        dev.warn(TAG_, 'Caught exception dispatching messages: ' + e.message);
      }
    });
  }
};

/**
 * @private @const {!AmpAnalytics3pRemoteFrameHelper}
 */
const remoteFrameHelper_ = new AmpAnalytics3pRemoteFrameHelper(window);

if (window.onNewAmpAnalyticsInstance) {
  window.onNewAmpAnalyticsInstance(remoteFrameHelper_);
} else {
  dev().error(TAG_, 'Vendor page must implement onNewAmpAnalyticsInstance' +
    ' prior to loading library script.');
}
