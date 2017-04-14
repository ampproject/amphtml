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

import '../../third_party/babel/custom-babel-helpers';
import {dev, initLogConstructor, setReportError} from '../../src/log';
import {reportError} from '../../src/error';
import {InaboxMessagingHost} from './inabox-messaging-host';

const TAG = 'inabox-host';
run(self);

/**
 * @param win {!Window}
 */
function run(win) {
  // Prevent double initialization
  if (win['ampInaboxInitialized']) {
    dev().info(TAG, 'Skip a 2nd attempt of initializing AMP inabox host.');
    return;
  }

  win['ampInaboxInitialized'] = true;
  initLogConstructor();
  setReportError(reportError);

  const host = new InaboxMessagingHost(win, win['ampInaboxIframes']);

  win['ampInaboxPendingMessages'].forEach(message => {
    host.processMessage(message);
  });

  win.addEventListener('message', host.processMessage.bind(host));
}
