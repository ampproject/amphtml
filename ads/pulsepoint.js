/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {doubleclick} from '../ads/google/doubleclick';
import {loadScript, validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pulsepoint(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['pid', 'tagid', 'tagtype', 'slot', 'timeout']);
  if (data.tagtype === 'hb') {
    headerBidding(global, data);
  } else {
    tag(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function tag(global, data) {
  writeScript(
    global,
    'https://tag.contextweb.com/getjs.aspx?action=VIEWAD' +
      '&cwpid=' +
      encodeURIComponent(data.pid) +
      '&cwtagid=' +
      encodeURIComponent(data.tagid) +
      '&cwadformat=' +
      encodeURIComponent(data.width + 'X' + data.height)
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function headerBidding(global, data) {
  loadScript(global, 'https://ads.contextweb.com/ht.js', () => {
    const hbConfig = {
      timeout: data.timeout || 1000,
      slots: [
        {
          cp: data.pid,
          ct: data.tagid,
          cf: data.width + 'x' + data.height,
          placement: data.slot,
          elementId: 'c',
        },
      ],
      done(targeting) {
        doubleclick(global, {
          width: data.width,
          height: data.height,
          slot: data.slot,
          targeting: targeting[data.slot],
        });
      },
    };
    new window.PulsePointHeaderTag(hbConfig).init();
  });
}
