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
import {dev} from '../../src/log';

const TAG = 'DOUBLECLICK - DEPRECATED';
/**
 * @param {!Window} opt_global
 * @param {!Object} opt_data
 */
export function doubleclick(opt_global, opt_data) {
  dev().error(TAG, 'The use of doubleclick.js has been deprecated. Please ' +
              'switch to Fast Fetch. See documentation here: ' +
              'https://github.com/ampproject/amphtml/issues/11834');

}
