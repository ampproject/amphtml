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
import {dev, initLogConstructor} from '../../src/log';

initLogConstructor();

const TAG = 'inabox-host';

run(self);

function run(win) {
  win['ampInaboxPendingMessages'].forEach(message => {
    processMessage(win, message);
  });

  win.addEventListener('message', processMessage.bind(null, win));
}

function processMessage(win, message) {
  if (!isInaboxMessage(message.data)) {
    return;
  }
  const iframeElement =
      getFrameElement(win, win['ampInaboxIframes'], message.source);
  // TODO: build a map from source to iframeElement.
  dev().info(TAG, '[' + iframeElement.id + '] ' + message.data);
}

function getFrameElement(win, iframes, source) {
  while (source.parent !== win && source !== win.top) {
    source = source.parent;
  }

  for (let i = 0; i < iframes.length; i++) {
    if (iframes[i].contentWindow === source) {
      return iframes[i];
    }
  }
}

function isInaboxMessage(message) {
  return typeof message === 'string' && message.indexOf('amp-inabox:') == 0;
}
