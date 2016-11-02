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

export class InaboxHost {

  constructor(win) {
    this.win_ = win;
  }

  init() {
    this.processPendingMessages_();
  }

  processPendingMessages_() {
    // TODO: do something
    console.log('ampInaboxPendingMessages:');
    console.log(this.win_['ampInaboxPendingMessages']);
    console.log('ampInaboxIframes:');
    console.log(this.win_['ampInaboxIframes']);

    const listener = event => {
      if (this.isInaboxMessage_(event.data)) {
        console.log(event.data);
      }
    };
    this.win_.addEventListener('message', listener);
  }

  isInaboxMessage_(message) {
    return typeof message === 'string' && message.indexOf('amp-inabox:') == 0;
  }
}

new InaboxHost(self).init();
