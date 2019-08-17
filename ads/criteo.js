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

import {dev} from '../src/log';
import {loadScript} from '../3p/3p';

/* global Criteo: false */

/** @const {string} */
const TAG = 'CRITEO';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function criteo(global, data) {
  loadScript(global, 'https://static.criteo.net/js/ld/publishertag.js', () => {
    if (!data.tagtype || data.tagtype === 'passback') {
      Criteo.DisplayAd({
        zoneid: data.zone,
        containerid: 'c',
        integrationmode: 'amp',
      });
    } else if (data.tagtype === 'rta' || data.tagtype === 'standalone') {
      dev().error(
        TAG,
        'You are using a deprecated Criteo integration',
        data.tagtype
      );
    } else {
      dev().error(
        TAG,
        'You are using an unknown Criteo integration',
        data.tagtype
      );
    }
  });
}
