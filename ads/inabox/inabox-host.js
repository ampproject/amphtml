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

import {dev, initLogConstructor, setReportError} from '../../src/log';
import {reportError} from '../../src/error';
import {isArray} from '../../src/types';
import {InaboxMessagingHost} from './inabox-messaging-host';

const TAG = 'inabox-host';
const INITIALIZED_WIN_VAR_NAME = 'ampInaboxInitialized';
const PENDING_MESSAGES_WIN_VAR_NAME = 'ampInaboxPendingMessages';
const INABOX_AD_IFRAMES_IN_VAR_NAME= 'ampInaboxIframes';

/**
 * Class for initializing host script and consuming queued messages.
 * @visibleForTesting
 */
export class InaboxHost {
  /** @param win {!Window}  */
  constructor(win) {
    // Prevent double initialization
    if (win[INITIALIZED_WIN_VAR_NAME]) {
      dev().info(TAG, 'Skip a 2nd attempt of initializing AMP inabox host.');
      return;
    }

    // Assume we cannot recover from state initialization errors.
    win[INITIALIZED_WIN_VAR_NAME] = true;
    initLogConstructor();
    setReportError(reportError);

    const host = new InaboxMessagingHost(
      win, win[INABOX_AD_IFRAMES_IN_VAR_NAME]);

    const queuedMsgs = win[PENDING_MESSAGES_WIN_VAR_NAME];
    if (queuedMsgs) {
      if (isArray(queuedMsgs)) {
        queuedMsgs.forEach(message => {
          try {
            host.processMessage(message);
          } catch (err) {
            dev().info('Error processing inabox message', message, err);
          }
        });
      } else {
        dev().info(TAG, `Invalid ${PENDING_MESSAGES_WIN_VAR_NAME}`, queuedMsgs);
      }
    }
    // Empty and ensure that future messages are no longer stored in the array.
    win[PENDING_MESSAGES_WIN_VAR_NAME] = [];
    win[PENDING_MESSAGES_WIN_VAR_NAME]['push'] = () => {};
    win.addEventListener('message', host.processMessage.bind(host));
  }
}

new InaboxHost(self);
