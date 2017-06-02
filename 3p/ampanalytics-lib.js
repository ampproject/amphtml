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
import {IframeMessagingClient} from './iframe-messaging-client';
import {map} from '../src/utils/object';
import {dev} from '../src/log';
import {initLogConstructor, setReportError} from '../src/log';
import {reportError} from '../src/error';
initLogConstructor();
setReportError(reportError);

/**
 * This provides the "glue" between the AMP Analytics tag and the third-party
 * vendor's metrics-collection page.
 *
 * The vendor's page must implement onNewAmpAnalyticsInstance().
 */
class AmpAnalytics3pRemoteFrameHelper {
  constructor(win) {
    /**
     * @type {!Array<function<string>>}
     * @private
     */
    this.eventListeners_ = [];

    /**
     * @type {!Array<function<string,string>>}
     * @private
     */
    this.extraDataListeners_ = [];

    /**
     * Holds a mapping between sender ID and extra data
     * @type {Map}
     * @private
     */
    this.senderIdToExtraData_ = map();

    /**
     * Handles communication between frames
     * @type {IframeMessagingClient}
     * @private
     */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    this.iframeMessagingClient_.setHostWindow(win.parent);
    this.iframeMessagingClient_.setSentinel(JSON.parse(window.name).sentinel);
    this.iframeMessagingClient_.registerCallback(
      'ampAnalytics3pMessages', received => {
        if (!received || !received.ampAnalytics3pMessages) {
          return;
        }
        for (submessage of received.ampAnalytics3pMessages) {
          if (submessage.ampAnalytics3pEvent) {
            for (eventsListener of this.eventListeners_) {
              this.dispatch_(eventsListener, submessage);
            }
          } else if (submessage.ampAnalytics3pExtraData) {
            this.senderIdToExtraData_[submessage.senderId] =
              submessage.ampAnalytics3pExtraData;
            for (extraDataListener of this.extraDataListeners_) {
              this.dispatch_(extraDataListener, submessage);
            }
          }
        }
      });
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur
   * @param {!Function} listener A function that takes an array of event
   * strings, and does something with them.
   */
  registerAmpAnalytics3pEventsListener(listener) {
    this.eventListeners_.push(listener);
  }

  /**
   * Registers a callback function to be called when extra setup data is
   * recevied from an AMP Analytics tag.
   * @param {!Function} listener A function to receive any extra
   * setup data sent by the creative
   */
  registerAmpAnalytics3pExtraDataListener(listener) {
    this.extraDataListeners_.push(listener);
  }

  /**
   * Sends a message from the third-party vendor's metrics-collection page back
   * to the creative.
   * @param {!string} message The message to send.
   * @private
   */
  sendMessageToCreative(message) {
    this.iframeMessagingClient_.sendMessage('ampAnalytics3pResponse',
      {senderId: this.id_, ampAnalytics3pResponse: message});
  }

  /**
   * Gets any optional extra data that should be made available to the
   * cross-domain frame, in the context of a particular creative.
   * @param {number} senderId The ID of the creative that sent the extra data
   * @returns {string=}
   */
  getExtraData(senderId) {
    return this.senderIdToExtraData_[senderId];
  }

  /**
   * Sends a message that was received from the parent frame to the
   * registered listener function.
   * This is not inside of the iteration in registerCallback because we want
   * message to be on the stack. If not, the loop could iterate another time
   * before requestIdleCallback() fires, by which time message may have been
   * overwritten by the next one in the array.
   * @param {!Function<Object>} listener The listener to dispatch the message to
   * @param {!Object} message The content to dispatch to the listener
   * @private
   */
  dispatch_(listener, message) {
    requestIdleCallback(() => {
      listener(message);
    });
  }
};

// Simple requestIdleCallback polyfill
// TODO: Combine this with the onReady() change
requestIdleCallback =
  window.requestIdleCallback || (cb => setTimeout(cb, 1));

/**
 * @private @const {!AmpAnalytics3pRemoteFrameHelper}
 */
const remoteFrameHelper_ = new AmpAnalytics3pRemoteFrameHelper(window);

if (window.onNewAmpAnalyticsInstance) {
  window.onNewAmpAnalyticsInstance(remoteFrameHelper_);
} else {
  dev().error('Vendor page must implement onNewAmpAnalyticsInstance.');
}
