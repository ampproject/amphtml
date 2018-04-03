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
import {deprecatedDoubleclick} from './deprecated_doubleclick';
import {dev} from '../../src/log';
import {parseJson} from '../../src/json';

const TAG = 'DOUBLECLICK - DEPRECATED';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function doubleclick(global, data) {
  try {
    const context = parseJson(global['context']['cachedFrameName_']
    )['attributes']['_context'];
    // Make this easy to rollback in case of emergency.
    if (context['experimentToggles'][`rollback-dfd-${data.type}`]) {
      if (data['type'] == 'doubleclick' ||
          !/(^|,)21061862(,|$)/.test(data['experimentId'])) {
        return deprecatedDoubleclick(global, data);
      }
    }
  } catch (unused) {}
  dev().error(TAG, 'The use of doubleclick.js has been deprecated. Please ' +
              'switch to Fast Fetch. See documentation here: ' +
              'https://github.com/ampproject/amphtml/issues/11834');

}
