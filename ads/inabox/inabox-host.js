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

/**
 * Inabox host script is installed on a non-AMP host page to provide APIs for
 * its embed AMP content (such as an ad created in AMP).
 */

import {InaboxMessagingHost} from './inabox-messaging-host';
import {dev, initLogConstructor, setReportError, user} from '../../src/log';
import {getData} from '../../src/event-helper';
import {reportError} from '../../src/error';

/** @const {string} */
const TAG = 'inabox-host';
/** @const {string} */
const AMP_INABOX_INITIALIZED = 'ampInaboxInitialized';
/** @const {string} */
const PENDING_MESSAGES = 'ampInaboxPendingMessages';
/** @const {string} */
const INABOX_IFRAMES = 'ampInaboxIframes';
/** @const {string} */
const INABOX_UNREGISTER_IFRAME = 'inaboxUnregisterIframe';

/**
 * Class for initializing host script and consuming queued messages.
 * @visibleForTesting
 */
export class InaboxHost {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    // Prevent double initialization
    if (win[AMP_INABOX_INITIALIZED]) {
      dev().info(TAG, 'Skip a 2nd attempt of initializing AMP inabox host.');
      return;
    }

    // Assume we cannot recover from state initialization errors.
    win[AMP_INABOX_INITIALIZED] = true;
    initLogConstructor();
    setReportError(reportError);

    if (win[INABOX_IFRAMES] && !Array.isArray(win[INABOX_IFRAMES])) {
      dev().info(TAG, 'Invalid %s. %s', INABOX_IFRAMES, win[INABOX_IFRAMES]);
      win[INABOX_IFRAMES] = [];
    }
    const host = new InaboxMessagingHost(win, win[INABOX_IFRAMES]);
    win.AMP = win.AMP || {};
    if (win.AMP[INABOX_UNREGISTER_IFRAME]) {
      // It's already defined; log a debug message and assume the existing
      // implmentation is good.
      dev().info(TAG, `win.AMP[${INABOX_UNREGISTER_IFRAME}] already defined}`);
    } else {
      win.AMP[INABOX_UNREGISTER_IFRAME] = host.unregisterIframe.bind(host);
    }
    const queuedMsgs = win[PENDING_MESSAGES];
    const processMessageFn = /** @type {function(Event)} */ (evt => {
      try {
        host.processMessage(evt);
      } catch (err) {
        dev().error(TAG, 'Error processing inabox message', evt, err);
      }
    });
    if (queuedMsgs) {
      if (Array.isArray(queuedMsgs)) {
        queuedMsgs.forEach(message => {
          // Pending messages are added by external scripts.
          // Validate their data types to avoid client errors.
          if (!validateMessage(message)) {
            return;
          }
          processMessageFn(message);
        });
      } else {
        dev().info(TAG, 'Invalid %s %s', PENDING_MESSAGES, queuedMsgs);
      }
    }
    // Empty and ensure that future messages are no longer stored in the array.
    win[PENDING_MESSAGES] = [];
    win[PENDING_MESSAGES]['push'] = () => {};
    win.addEventListener('message', processMessageFn.bind(host));
  }
}

/**
 * Validates a message event and print errors if it does not contain expected
 * fields.
 *
 * @param {!Event} message
 * @return {boolean} if the message is valid or not
 */
function validateMessage(message) {
  const valid = !!(message.source && message.source.postMessage);
  if (!valid) {
    user().error(
      TAG,
      'Missing message.source. message.data=' + JSON.stringify(getData(message))
    );
  }
  return valid;
}

new InaboxHost(self);
