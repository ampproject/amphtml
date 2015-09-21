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

// This must load before all other tests.
import '../src/polyfills';
import {adopt} from '../src/runtime';

adopt(global);

// Hack for skipping tests on Travis that don't work there.
// Get permission before use!
/**
 * @param {string} desc
 * @param {function()} fn
 */
it.skipOnTravis = function(desc, fn) {
  if (navigator.userAgent.match(/Chromium/)) {
    it.skip(desc, fn);
    return;
  }
  it(desc, fn);
};

// Hack for skipping tests on Travis that don't work there.
// Get permission before use!
/**
 * @param {string} desc
 * @param {function()} fn
 */
it.skipOnFirefox = function(desc, fn) {
  if (navigator.userAgent.match(/Firefox/)) {
    it.skip(desc, fn);
    return;
  }
  it(desc, fn);
};
