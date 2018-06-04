/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {validateData, writeScript} from '../3p/3p';

export function pixels(global, data) {
  validateData(data,
      ['origin', 'sid', 'tag'],
      ['clickTracker', 'viewability']
  );
  data.tag = data.tag.toString().toLowerCase();
  global._pixelsParam = data;
  if (data.tag === 'sync') {
    writeScript(global, 'https://cdn.adsfactor.net/amp/pixels-amp.min.js', () => {
      const pixelsAMPAd = global.pixelsAd;
      const pixelsAMPTag = new pixelsAMPAd(data);
      pixelsAMPTag.renderAmp(global.context);
      global.context.renderStart();
    });
  } else {
    global.context.noContentAvailable();
  }
}
